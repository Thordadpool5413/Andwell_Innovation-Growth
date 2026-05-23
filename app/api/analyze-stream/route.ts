import { NextRequest } from 'next/server';
import { crawlSite } from '../../../lib/crawler';
import { analyzeCompetitor, buildReport, buildScore } from '../../../lib/analysis';
import { extractCompetitorIntelligence, isAIExtractionConfigured } from '../../../lib/ai-extractor';
import { saveReport } from '../../../lib/store';
import { normalizeCompetitorInput } from '../../../lib/provider-identity';
import type { CompetitorAnalysis, CompetitorInput, Confidence, CrawledPage, ReviewStatus, Status, SubserviceFinding } from '../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── URL safety (mirrors analyze route) ──────────────────────────────────────

function cleanHost(h: string) {
  return h.toLowerCase().trim().replace(/^\[/, '').replace(/\]$/, '').replace(/\.$/, '');
}

function blockedIPv4(host: string) {
  const parts = cleanHost(host).split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => !Number.isInteger(p) || p < 0 || p > 255)) return false;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function blockedIPv6(host: string) {
  const v = cleanHost(host);
  if (!v.includes(':')) return false;
  if (v.includes('%') || v === '::' || v === '::1' || v === '0:0:0:0:0:0:0:1') return true;
  if (/^fe[89ab]/i.test(v) || /^f[cd]/i.test(v)) return true;
  const mapped = v.match(/(?:^|:)ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)?.[1];
  return mapped ? blockedIPv4(mapped) : false;
}

function toSafePublicHttpUrl(rawUrl: string): string | null {
  try {
    const candidate = rawUrl.trim();
    if (!candidate) return null;
    const parsed = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;
    const host = cleanHost(parsed.hostname);
    if (!host || host === 'localhost') return null;
    if (['local', 'localhost', 'internal', 'lan', 'home', 'corp', 'test'].some(s => host.endsWith(`.${s}`))) return null;
    if (blockedIPv4(host) || blockedIPv6(host)) return null;
    parsed.hash = '';
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch { return null; }
}

function sanitizeCompetitorInput(item: CompetitorInput): CompetitorInput | null {
  const safeUrl = toSafePublicHttpUrl(item.url || '');
  if (!safeUrl) return null;
  return { ...normalizeCompetitorInput(item), url: safeUrl };
}

// ── AI enhancement (mirrors analyze route) ──────────────────────────────────

function confidenceFromEvidence(value?: string): Confidence {
  if (value === 'Strong') return 'High';
  if (value === 'Moderate') return 'Moderate';
  if (value === 'Weak') return 'Low';
  if (value === 'Not found') return 'Not found';
  return 'Needs review';
}

function computeReviewStatus(st: Status, conf: Confidence): ReviewStatus {
  if (st === 'Clearly offered' && conf === 'High') return 'Sales usable with evidence';
  if (st === 'Not found publicly' || st === 'Unclear' || st === 'Needs human review') return 'Needs human review';
  return 'Manager review suggested';
}

function statusFromDepth(depthScore: number, fallback: Status): Status {
  if (depthScore >= 60) return 'Clearly offered';
  if (depthScore >= 35) return 'Mentioned only';
  if (depthScore >= 15) return 'Related but not equivalent';
  return fallback;
}

function matrixWithAI<T extends { matrixScore?: NonNullable<SubserviceFinding['matrixScore']> }>(item: T, params: { sourceCount?: number; rationale?: string; evidenceStrength?: string; status?: Status; confidence?: Confidence; matchStrength?: number }) {
  if (!item.matrixScore) return item.matrixScore;
  const sourceCount = Math.max(item.matrixScore.sourceCount, params.sourceCount || 0);
  const evidenceStrength = params.evidenceStrength === 'Strong' ? 92 : params.evidenceStrength === 'Moderate' ? 68 : params.evidenceStrength === 'Weak' ? 38 : params.evidenceStrength === 'Not found' ? 8 : item.matrixScore.evidenceStrength;
  const matchStrength = params.matchStrength ?? item.matrixScore.matchStrength;
  const reviewRisk = params.status === 'Clearly offered' && params.confidence === 'High' ? 10 : params.status === 'Not found publicly' ? 72 : item.matrixScore.reviewRisk;
  const andwellDifferentiation = params.status === 'Clearly offered' ? Math.max(0, 100 - matchStrength) : params.status === 'Not found publicly' ? 94 : item.matrixScore.andwellDifferentiation;
  const overall = Math.round((evidenceStrength * 0.34) + (item.matrixScore.sourceQuality * 0.14) + (matchStrength * 0.22) + (andwellDifferentiation * 0.18) + ((100 - reviewRisk) * 0.12));
  return { ...item.matrixScore, overall: Math.max(0, Math.min(100, overall)), evidenceStrength, sourceCount, matchStrength, andwellDifferentiation, reviewRisk, rationale: [...new Set([...(item.matrixScore.rationale || []), params.rationale || 'AI reviewed website evidence against Andwell taxonomy.'].filter(Boolean))].slice(0, 6) };
}

function applyAIEnhancement(analysis: CompetitorAnalysis, aiExtraction: NonNullable<CompetitorAnalysis['aiExtraction']>): CompetitorAnalysis {
  const enhanceSub = (f: SubserviceFinding): SubserviceFinding => {
    const aiSub = aiExtraction.subserviceDepth.find(s => s.serviceLine.toLowerCase() === f.serviceLine.toLowerCase() && s.subservice.toLowerCase() === f.subservice.toLowerCase());
    if (!aiSub) return f;
    const confidence = aiSub.confidence || confidenceFromEvidence(aiSub.evidenceStrength);
    return { ...f, competitorStatus: aiSub.status, confidence, evidenceExcerpt: aiSub.evidenceExcerpt || f.evidenceExcerpt, sourceUrl: aiSub.sourceUrl || f.sourceUrl, aiInterpretation: `${f.aiInterpretation} AI: ${aiSub.matchRationale || `classified as ${aiSub.status}`}.`, safeSalesWording: aiSub.safeSalesLanguage || f.safeSalesWording, avoidSaying: aiSub.doNotSayLanguage || f.avoidSaying, reviewStatus: computeReviewStatus(aiSub.status, confidence), matrixScore: matrixWithAI(f, { sourceCount: aiSub.sourceCount, rationale: aiSub.matchRationale, evidenceStrength: aiSub.evidenceStrength, status: aiSub.status, confidence, matchStrength: aiSub.status === 'Clearly offered' ? 100 : aiSub.status === 'Not found publicly' ? 0 : f.matrixScore?.matchStrength }) };
  };
  const findings = analysis.findings.map(f => {
    const aiService = aiExtraction.serviceLineDepth.find(s => s.serviceLine.toLowerCase() === f.serviceLine.toLowerCase());
    const subserviceFindings = f.subserviceFindings.map(enhanceSub);
    if (!aiService) return { ...f, subserviceFindings };
    const competitorStatus = aiService.status || statusFromDepth(aiService.depthScore, f.competitorStatus);
    const confidence = confidenceFromEvidence(aiService.evidenceStrength) === 'Needs review' ? f.confidence : confidenceFromEvidence(aiService.evidenceStrength);
    const clearlyMatchedSubservices = subserviceFindings.filter(s => s.competitorStatus === 'Clearly offered').length;
    const subserviceDepthScore = Math.max(f.subserviceDepthScore, aiService.depthScore, Math.round((clearlyMatchedSubservices / Math.max(subserviceFindings.length, 1)) * 100));
    return { ...f, competitorStatus, confidence, aiInterpretation: `${f.aiInterpretation} AI: ${aiService.matchRationale || aiService.summary}`, andwellAdvantage: aiService.andwellAdvantages.length ? aiService.andwellAdvantages.join(' ') : f.andwellAdvantage, competitorAdvantage: aiService.competitorAdvantages.length ? aiService.competitorAdvantages.join(' ') : f.competitorAdvantage, safeSalesWording: aiExtraction.safeSalesLanguage[0] || f.safeSalesWording, avoidSaying: aiExtraction.doNotSayLanguage[0] || f.avoidSaying, reviewStatus: computeReviewStatus(competitorStatus, confidence), subserviceFindings, clearlyMatchedSubservices, subserviceDepthScore, matrixScore: matrixWithAI(f, { sourceCount: aiService.sourceCount, rationale: aiService.matchRationale, evidenceStrength: aiService.evidenceStrength, status: competitorStatus, confidence, matchStrength: subserviceDepthScore }) };
  });
  const subserviceFindings = findings.flatMap(f => f.subserviceFindings);
  const next = { ...analysis, findings, subserviceFindings, aiExtraction, aiEnhanced: true };
  return { ...next, score: buildScore(next) };
}

// ── Concurrency helpers ──────────────────────────────────────────────────────

function analyzeConcurrency(ai: boolean) {
  const fallback = ai ? 5 : 8;
  const v = Number(process.env.ANALYZE_CONCURRENCY || fallback);
  return Math.max(1, Math.min(ai ? 5 : 8, Number.isFinite(v) ? Math.floor(v) : fallback));
}

function crawlMaxPagesLimit() {
  const v = Number(process.env.CRAWL_MAX_PAGES_PER_SITE || 8);
  return Math.max(4, Math.min(35, Number.isFinite(v) ? Math.floor(v) : 8));
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), items.length);
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await worker(items[i], i);
    }
  }));
  return results;
}

// ── Stream route ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function emit(data: object) {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      }

      try {
        const body = await req.json() as { competitors?: CompetitorInput[]; maxPagesPerSite?: number; save?: boolean; useAI?: boolean };
        const rawCompetitors = (body.competitors || []).filter(c => c.url?.trim()).slice(0, 25);
        const competitors = rawCompetitors.map(sanitizeCompetitorInput).filter((c): c is CompetitorInput => Boolean(c));

        if (!competitors.length) {
          emit({ type: 'error', message: 'No valid public competitor URLs provided.' });
          controller.close();
          return;
        }

        const maxPagesLimit = crawlMaxPagesLimit();
        const requestedMax = Number(body.maxPagesPerSite || maxPagesLimit);
        const maxPages = Math.min(Math.max(Number.isFinite(requestedMax) ? requestedMax : maxPagesLimit, 4), maxPagesLimit);
        const shouldUseAI = body.useAI !== false && isAIExtractionConfigured();
        const concurrency = analyzeConcurrency(shouldUseAI);
        const total = competitors.length;

        emit({ type: 'start', total, ai: shouldUseAI });

        type AnalyzeResult = { analysis: CompetitorAnalysis; crawlError?: { url: string; error: string }; aiError?: { url: string; error: string } };

        const results = await mapWithConcurrency<CompetitorInput, AnalyzeResult>(competitors, concurrency, async (competitor, index) => {
          const name = competitor.name || (() => { try { return new URL(competitor.url).hostname; } catch { return competitor.url; } })();

          emit({ type: 'crawl_start', index, name, total });

          try {
            const pages = await crawlSite(competitor.url, maxPages);
            emit({ type: 'crawl_done', index, name, pages: pages.length });

            const resolved = normalizeCompetitorInput(competitor, pages);
            let analysis = analyzeCompetitor(resolved, pages, index);
            let aiError: AnalyzeResult['aiError'];

            if (shouldUseAI) {
              emit({ type: 'ai_start', index, name });
              try {
                const aiExtraction = await extractCompetitorIntelligence(resolved, pages);
                if (aiExtraction) analysis = applyAIEnhancement(analysis, aiExtraction);
                emit({ type: 'ai_done', index, name });
              } catch (err) {
                aiError = { url: competitor.url, error: err instanceof Error ? err.message : 'AI extraction failed' };
                emit({ type: 'ai_error', index, name, error: aiError.error });
              }
            }

            return { analysis, aiError };
          } catch (err) {
            const error = err instanceof Error ? err.message : 'Crawl failed';
            emit({ type: 'crawl_error', index, name, error });
            const fallbackPage: CrawledPage = { url: competitor.url, title: 'Crawl limitation', text: '', excerpt: 'No readable public content could be extracted.' };
            return { analysis: analyzeCompetitor(normalizeCompetitorInput(competitor), [fallbackPage], index), crawlError: { url: competitor.url, error } };
          }
        });

        emit({ type: 'building', message: 'Building intelligence report' });

        const analyses = results.map(r => r.analysis);
        const crawlErrors = results.flatMap(r => r.crawlError ? [r.crawlError] : []);
        const aiErrors = results.flatMap(r => r.aiError ? [r.aiError] : []);
        const report = buildReport(analyses, [...crawlErrors, ...aiErrors.map(e => ({ url: e.url, error: `AI extraction: ${e.error}` }))]);
        const aiSummaries = analyses.map(a => a.aiExtraction?.leadershipSummary).filter(Boolean);
        const enhancedReport = {
          ...report,
          aiEnabled: shouldUseAI,
          aiModel: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
          analysisConcurrency: concurrency,
          crawlMaxPagesPerSite: maxPages,
          aiLeadershipSummary: aiSummaries.length ? aiSummaries.join('\n\n') : undefined,
          executiveSummary: aiSummaries.length ? `${report.executiveSummary}\n\nAI leadership summary: ${aiSummaries.join(' ')}` : report.executiveSummary
        };

        if (body.save !== false) await saveReport(enhancedReport);

        emit({ type: 'complete', report: enhancedReport });
      } catch (err) {
        emit({ type: 'error', message: err instanceof Error ? err.message : 'Analysis failed' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  });
}
