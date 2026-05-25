import { NextRequest, NextResponse } from 'next/server';
import type { GrowthTotals, GrowthRow, GrowthScenario } from '../../../lib/growth-plan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fmtMoney(v: number) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtPct(v: number) {
  return `${Math.round(v * 100)}%`;
}

function templateNarrative(totals: GrowthTotals, rows: GrowthRow[], scenario: GrowthScenario): string {
  const top = [...rows].sort((a, b) => b.opportunityScore - a.opportunityScore)[0];
  const p1Count = rows.filter(r => r.launchGroup === 'Priority 1').length;
  return `At a ${fmtPct(scenario.conversionRate)} referral conversion rate, Andwell's growth model projects ${fmtMoney(totals.revenue[0])} in Year 1 revenue expanding to ${fmtMoney(totals.revenue[2])} by Year 3, with a ${fmtMoney(totals.totalContribution)} three-year contribution margin. ${top ? `The highest-priority launch is ${top.service} in ${top.county} County, where ${top.reason.toLowerCase()}` : `${p1Count} Priority 1 market${p1Count !== 1 ? 's' : ''} represent the near-term focus.`} Staffing capacity and referral source development are the primary rate-limiting variables at current capture assumptions. We recommend committing to the Priority 1 county list as the immediate next step before refining Year 2 capture targets.`;
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.4,
      max_output_tokens: 300
    }),
    signal: AbortSignal.timeout(20_000)
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
  const data = await response.json() as { output_text?: string; output?: { content?: { text?: string }[] }[] };
  return data.output_text || data.output?.flatMap(o => o.content || []).map(c => c.text || '').join('') || '';
}

export async function POST(req: NextRequest) {
  let body: { totals?: GrowthTotals; rows?: GrowthRow[]; scenario?: GrowthScenario };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { totals, rows, scenario } = body;
  if (!totals || !rows || !scenario) return NextResponse.json({ error: 'totals, rows, and scenario are required' }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ narrative: templateNarrative(totals, rows, scenario), source: 'template' });
  }

  const top3 = [...rows].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 3);
  const p1 = rows.filter(r => r.launchGroup === 'Priority 1');

  const prompt = `You are a senior healthcare strategy consultant writing for a C-suite audience at Andwell Health Partners.

Write a concise, board-ready growth narrative (3–4 sentences, under 130 words). Use specific numbers. No bullet points. Professional, confident tone.

Growth scenario data:
- Referral conversion: ${fmtPct(scenario.conversionRate)}
- Home Health Y1 capture: ${fmtPct(scenario.hhCapture[0])} → ${fmtPct(scenario.hhCapture[2])} by Y3
- Wound Care Y1 capture: ${fmtPct(scenario.woundCapture[0])} → ${fmtPct(scenario.woundCapture[2])} by Y3
- Therapy Y1 capture: ${fmtPct(scenario.therapyCapture[0])} → ${fmtPct(scenario.therapyCapture[2])} by Y3
- Year 1 Revenue: ${fmtMoney(totals.revenue[0])} (${totals.starts[0]} starts, ${totals.referrals[0]} referrals)
- Year 3 Revenue: ${fmtMoney(totals.revenue[2])} (${totals.starts[2]} starts, ${totals.referrals[2]} referrals)
- 3-Year Total Contribution: ${fmtMoney(totals.totalContribution)}
- Priority 1 markets (${p1.length}): ${p1.slice(0, 4).map(r => `${r.county} (${r.service})`).join(', ')}
- Top opportunities: ${top3.map(r => `${r.county} / ${r.service} — score ${r.opportunityScore}`).join('; ')}

Address: (1) the size of the opportunity, (2) the highest-priority launch, (3) key execution constraint, (4) recommended next action.`;

  try {
    const text = await callOpenAI(apiKey, prompt);
    if (!text.trim()) return NextResponse.json({ narrative: templateNarrative(totals, rows, scenario), source: 'template' });
    return NextResponse.json({ narrative: text.trim(), source: 'ai' });
  } catch {
    return NextResponse.json({ narrative: templateNarrative(totals, rows, scenario), source: 'template' });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/growth-narrative', ai: Boolean(process.env.OPENAI_API_KEY) });
}
