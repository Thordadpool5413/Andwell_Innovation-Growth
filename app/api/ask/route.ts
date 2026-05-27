import { NextRequest, NextResponse } from 'next/server';
import { readStore } from '../../../lib/store';
import { fieldActionFromEvidence, questionTerms, rankEvidenceForQuestion, type EvidenceLike } from '../../../lib/smart-ranking';
import { buildAskTrustMetadata } from '../../../lib/trust-metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GrowthContext {
  y1Revenue?: number;
  y3Revenue?: number;
  totalRevenue?: number;
  totalContribution?: number;
  y1Starts?: number;
  counties?: string[];
  services?: string[];
  topCounties?: { county: string; service: string; y1Revenue: number }[];
}

function growthContextBlock(g: GrowthContext): string {
  if (!g || !g.y1Revenue) return '';
  const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1_000)}K`;
  const lines = [
    `Growth plan context: Y1 revenue ${fmt(g.y1Revenue ?? 0)}, Y3 revenue ${fmt(g.y3Revenue ?? 0)}, 3-year total ${fmt(g.totalRevenue ?? 0)}, contribution ${fmt(g.totalContribution ?? 0)}.`,
    g.topCounties?.length ? `Top counties by Y1 revenue: ${g.topCounties.map(c => `${c.county} (${c.service}, ${fmt(c.y1Revenue)})`).join(', ')}.` : '',
    g.services?.length ? `Active service lines: ${g.services.join(', ')}.` : '',
  ].filter(Boolean);
  return lines.join(' ');
}

async function callOpenAIForAnswer(apiKey: string, question: string, evidence: { competitorName: string; serviceLine: string; subservice?: string | null; competitorStatus: string; evidenceExcerpt: string; safeSalesWording: string; confidence: string }[], growthContext?: GrowthContext): Promise<string> {
  const evidenceBlock = evidence.slice(0, 6).map((e, i) =>
    `${i + 1}. ${e.competitorName} | ${e.serviceLine}${e.subservice ? ` | ${e.subservice}` : ''} — Status: ${e.competitorStatus} (${e.confidence})\n   Evidence: ${e.evidenceExcerpt}\n   Safe language: ${e.safeSalesWording}`
  ).join('\n\n');

  const growthSection = growthContext ? growthContextBlock(growthContext) : '';

  const prompt = `You are the expert intelligence layer for Andwell Health Partners in Maine. You know the Andwell service catalog, the stored public competitor evidence, and the growth model. Your job is to give a direct, practical answer while separating public evidence from AI interpretation.

A sales or strategy leader asked: "${question}"
${growthSection ? `\n${growthSection}\n` : ''}
Here is the ranked evidence from the competitive intelligence database:

${evidenceBlock || '(No competitive evidence available — answer using the growth plan context above if relevant.)'}

Write a direct, actionable answer in 2–3 sentences. Use specific county names, competitor names, and service lines where available. State clearly what Andwell's differentiation opportunity or growth priority is. Do not use bullet points. Use confident, professional language. Do not state that a competitor lacks a service unless the evidence explicitly supports that; say "not found publicly in reviewed sources" when appropriate.`;

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-nano', input: prompt, temperature: 0.3, max_output_tokens: 200 }),
    signal: AbortSignal.timeout(15_000)
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json() as { output_text?: string; output?: { content?: { text?: string }[] }[] };
  return (data.output_text || data.output?.flatMap(o => o.content || []).map(c => c.text || '').join('') || '').trim();
}

type HubEvidenceItem = EvidenceLike & {
  type: 'service' | 'subservice';
};

function norm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function includesAny(text: string, terms: string[]) {
  const normalized = norm(text);
  return terms.some((term) => normalized.includes(norm(term)));
}

export async function POST(req: NextRequest) {
  try {
  const body = await req.json() as { question?: string; competitorName?: string; serviceLine?: string; reportId?: string; growthContext?: GrowthContext };
  const question = body.question?.trim() || '';
  if (!question) return NextResponse.json({ error: 'question is required.' }, { status: 400 });

  const growthContext = body.growthContext;
  const store = await readStore();
  const reports = body.reportId ? store.reports.filter((report) => report.id === body.reportId) : store.reports;
  const latest = reports[0];
  if (!latest) {
    // No report — answer from growth context if available
    if (growthContext?.y1Revenue && process.env.OPENAI_API_KEY) {
      try {
        const aiAnswer = await callOpenAIForAnswer(process.env.OPENAI_API_KEY, question, [], growthContext);
        if (aiAnswer) {
          const confidence = 'Growth plan only';
          return NextResponse.json({
            answer: aiAnswer,
            source: 'ai',
            confidence,
            questionTerms: questionTerms(question),
            nextBestActions: [],
            evidence: [],
            trustMetadata: buildAskTrustMetadata({ evidence: [], source: 'ai', confidence, growthOnly: true })
          });
        }
      } catch { /* fall through */ }
    }
    const confidence = growthContext?.y1Revenue ? 'Growth plan only' : 'Needs review';
    return NextResponse.json({
      answer: growthContext?.y1Revenue
        ? `Based on your growth plan, your top Y1 markets include ${growthContext.topCounties?.map(c => c.county).slice(0, 3).join(', ') || 'your modeled counties'}. Run a competitor analysis to add competitive intelligence to this answer.`
        : 'No stored intelligence report was found yet. Run a competitor analysis first, then ask again.',
      evidence: [],
      confidence,
      nextBestActions: [],
      trustMetadata: buildAskTrustMetadata({ evidence: [], source: 'template', confidence, growthOnly: true })
    });
  }

  const terms = questionTerms(question);
  const serviceItems: HubEvidenceItem[] = latest.allFindings.map((finding) => ({ type: 'service', ...finding }));
  const subserviceItems: HubEvidenceItem[] = latest.allSubserviceFindings.map((finding) => ({ type: 'subservice', ...finding }));
  const allItems: HubEvidenceItem[] = [...serviceItems, ...subserviceItems];

  const candidateItems = allItems
    .filter((item) => !body.competitorName || item.competitorName.toLowerCase().includes(body.competitorName.toLowerCase()))
    .filter((item) => !body.serviceLine || item.serviceLine.toLowerCase().includes(body.serviceLine.toLowerCase()))
    .filter((item) => {
      if (!terms.length) return true;
      return includesAny(`${item.competitorName} ${item.serviceLine} ${item.subservice || ''} ${item.safeSalesWording} ${item.evidenceExcerpt} ${item.sourceTitle || ''}`, terms);
    });

  const ranked = rankEvidenceForQuestion(candidateItems, question).slice(0, 12);
  const potentialAdvantages = ranked.filter((item) => item.competitorStatus !== 'Clearly offered').slice(0, 5);
  const matches = ranked.filter((item) => item.competitorStatus === 'Clearly offered').slice(0, 5);
  const reviewItems = ranked.filter((item) => item.reviewStatus !== 'Sales usable with evidence' && item.reviewStatus !== 'Approved for sales use').slice(0, 5);
  const topEvidence = ranked.slice(0, 3);
  const nextBestActions = topEvidence.map(fieldActionFromEvidence);

  const templateParts = [];
  templateParts.push(`Based on the latest stored report from ${new Date(latest.generatedAt).toLocaleString()}, I found ${ranked.length} relevant finding${ranked.length === 1 ? '' : 's'}.`);
  if (topEvidence.length) templateParts.push(`Top evidence: ${topEvidence.map((item) => `${item.competitorName} | ${item.serviceLine}${item.subservice ? ` | ${item.subservice}` : ''} | ${item.competitorStatus}`).join('; ')}.`);
  if (potentialAdvantages.length) templateParts.push(`Potential Andwell advantages: ${potentialAdvantages.map((item) => `${item.competitorName} | ${item.serviceLine}${item.subservice ? ` | ${item.subservice}` : ''}`).join('; ')}.`);
  if (matches.length) templateParts.push(`Public matches found: ${matches.map((item) => `${item.competitorName} | ${item.serviceLine}${item.subservice ? ` | ${item.subservice}` : ''}`).join('; ')}.`);
  if (nextBestActions.length) templateParts.push(`Recommended next move: ${nextBestActions[0]}`);
  const templateAnswer = templateParts.join(' ');

  const apiKey = process.env.OPENAI_API_KEY;
  let answer = templateAnswer;
  let source: 'ai' | 'template' = 'template';

  if (apiKey && (ranked.length > 0 || growthContext?.y1Revenue)) {
    try {
      const aiAnswer = await callOpenAIForAnswer(apiKey, question, ranked, growthContext);
      if (aiAnswer) { answer = aiAnswer; source = 'ai'; }
    } catch { /* fall through to template */ }
  }

  const responseConfidence = reviewItems.length ? 'Manager review suggested' : 'Evidence backed';
  const evidencePayload = ranked.map((item) => ({
    type: item.type,
    smartScore: item.smartScore,
    competitorName: item.competitorName,
    serviceLine: item.serviceLine,
    subservice: item.subservice || null,
    status: item.competitorStatus,
    confidence: item.confidence,
    sourceUrl: item.sourceUrl,
    sourceTitle: item.sourceTitle,
    evidenceExcerpt: item.evidenceExcerpt,
    safeSalesWording: item.safeSalesWording,
    avoidSaying: item.avoidSaying,
    reviewStatus: item.reviewStatus,
    recommendedAction: fieldActionFromEvidence(item)
  }));

  return NextResponse.json({
    answer,
    source,
    confidence: responseConfidence,
    reportId: latest.id,
    questionTerms: terms,
    nextBestActions,
    evidence: evidencePayload,
    trustMetadata: buildAskTrustMetadata({ evidence: ranked, report: latest, source, confidence: responseConfidence })
  });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Ask failed', answer: 'Ask failed. Please try again.', evidence: [], nextBestActions: [] }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/ask', message: 'Ask the Hub is active with smart evidence ranking. Use POST with a question.' });
}
