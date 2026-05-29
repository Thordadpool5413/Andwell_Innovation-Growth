import { NextRequest } from 'next/server';
import { crawlSite } from '../../../lib/crawler';
import { analyzeCompetitor, buildReport } from '../../../lib/analysis';
import { extractCompetitorIntelligence, isAIExtractionConfigured } from '../../../lib/ai-extractor';
import { saveReport } from '../../../lib/store';
import { normalizeCompetitorInput } from '../../../lib/provider-identity';
import { buildReportTrustMetadata } from '../../../lib/trust-metadata';
import { applyAIEnhancement } from '../../../lib/analysis-enhancement';
import { ANDWELL_BASELINE_SOURCES, FULL_SCAN_MAX_PAGES_PER_SITE, SOURCE_LIBRARY_GEOGRAPHY, SOURCE_LIBRARY_MODE } from '../../../lib/preloaded-competitors';
import type { CompetitorAnalysis, CompetitorInput, CrawledPage } from '../../../lib/types';

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

// ── Concurrency helpers ──────────────────────────────────────────────────────

function analyzeConcurrency(ai: boolean) {
  const fallback = ai ? 5 : 8;
  const v = Number(process.env.ANALYZE_CONCURRENCY || fallback);
  return Math.max(1, Math.min(ai ? 5 : 8, Number.isFinite(v) ? Math.floor(v) : fallback));
}

function crawlMaxPagesLimit() {
  const v = Number(process.env.CRAWL_MAX_PAGES_PER_SITE || FULL_SCAN_MAX_PAGES_PER_SITE);
  return Math.max(4, Math.min(60, Number.isFinite(v) ? Math.floor(v) : FULL_SCAN_MAX_PAGES_PER_SITE));
}

function perCompetitorTimeoutMs() {
  const v = Number(process.env.PER_COMPETITOR_TIMEOUT_MS || 45000);
  return Math.max(15000, Math.min(120000, Number.isFinite(v) ? Math.floor(v) : 45000));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// Lightweight one-shot retry for transient network/timeout errors (big win for flaky sites)
async function withRetry<T>(fn: () => Promise<T>, shouldRetry: (err: unknown) => boolean, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (shouldRetry(err)) {
      try {
        return await fn();
      } catch (retryErr) {
        throw retryErr; // surface the retry failure
      }
    }
    throw err;
  }
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), items.length);
  const timeoutMs = perCompetitorTimeoutMs();
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      const item = items[i];
      try {
        results[i] = await withTimeout(worker(item, i), timeoutMs, `Competitor ${i + 1}`);
      } catch (err) {
        // Surface timeout/other errors as a crawl-style error so the stream continues
        const message = err instanceof Error ? err.message : 'Operation timed out';
        // We still need to produce a result shape the caller expects; the worker itself will have emitted progress
        // For safety, rethrow so the outer per-competitor catch in the caller handles it uniformly
        throw new Error(message);
      }
    }
  }));
  return results;
}

// ── Custom instructions ──────────────────────────────────────────────────────

function buildCustomInstructions(overrides?: Record<string, { instructions?: string; purpose?: string }>): string | undefined {
  if (!overrides) return undefined;
  const lines: string[] = [];
  for (const [id, patch] of Object.entries(overrides)) {
    if (patch.instructions?.trim()) lines.push(`[${id}] ${patch.instructions.trim()}`);
    else if (patch.purpose?.trim()) lines.push(`[${id}] Purpose override: ${patch.purpose.trim()}`);
  }
  return lines.length > 0 ? lines.join('\n') : undefined;
}

// ── Error classification for better surfacing ────────────────────────────────

function classifyError(message: string, phase: 'crawl' | 'ai'): { type: string; message: string } {
  const lower = message.toLowerCase();

  // Timeouts (most common transient failure)
  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('etimedout')) {
    return { type: 'timeout', message };
  }

  // Explicit HTTP / fetch status and connection errors
  if (lower.includes('403') || lower.includes('forbidden') || lower.includes('blocked') || lower.includes('not allowed') || lower.includes('denied') || lower.includes('access denied')) {
    return { type: 'blocked', message };
  }
  if (lower.includes('429') || lower.includes('too many requests') || lower.includes('rate limit')) {
    return { type: phase === 'ai' ? 'ai' : 'network', message };
  }
  if (lower.includes('5') && (lower.includes('5xx') || lower.includes('500') || lower.includes('502') || lower.includes('503') || lower.includes('504'))) {
    return { type: 'network', message };
  }
  if (lower.includes('404') || lower.includes('not found')) {
    return { type: 'parse', message }; // treat as "nothing useful to parse"
  }

  if (lower.includes('network') || lower.includes('econn') || lower.includes('fetch failed') || lower.includes('unreachable') || lower.includes('enotfound') || lower.includes('econnreset') || lower.includes('socket hang up')) {
    return { type: 'network', message };
  }

  // Parsing / content issues
  if (lower.includes('pdf') || lower.includes('parse') || lower.includes('invalid html') || lower.includes('no content') || lower.includes('empty response')) {
    return { type: 'parse', message };
  }

  // AI / OpenAI specific
  if (phase === 'ai' && (lower.includes('openai') || lower.includes('rate') || lower.includes('quota') || lower.includes('model') || lower.includes('context') || lower.includes('token') || lower.includes('authentication') || lower.includes('api key'))) {
    return { type: 'ai', message };
  }

  return { type: phase === 'ai' ? 'ai' : 'crawl', message };
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
        const body = await req.json() as { competitors?: CompetitorInput[]; maxPagesPerSite?: number; save?: boolean; useAI?: boolean; promptOverrides?: Record<string, { instructions?: string; purpose?: string }> };
        const customInstructions = buildCustomInstructions(body.promptOverrides);
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

        // Running progress counters for live summary during long scans (big trust win)
        let processed = 0;
        let successes = 0;
        let errors = 0;

        function emitProgressSummary() {
          emit({ type: 'progress_summary', processed, total, successes, errors });
        }

        type AnalyzeResult = { analysis: CompetitorAnalysis; crawlError?: { url: string; error: string; errorType?: string }; aiError?: { url: string; error: string; errorType?: string } };

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
                const aiExtraction = await extractCompetitorIntelligence(resolved, pages, customInstructions);
                if (aiExtraction) analysis = applyAIEnhancement(analysis, aiExtraction);
                emit({ type: 'ai_done', index, name });
              } catch (err) {
                const raw = err instanceof Error ? err.message : 'AI extraction failed';
                const classified = classifyError(raw, 'ai');
                aiError = { url: competitor.url, error: classified.message, errorType: classified.type };
                emit({ type: 'ai_error', index, name, error: aiError?.error || 'AI extraction failed', errorType: classified.type });
                errors++;
                processed++;
                emitProgressSummary();
              }
            }

            if (!aiError) {
              successes++;
              processed++;
              emitProgressSummary();
            }

            return { analysis, aiError };
          } catch (err) {
            const raw = err instanceof Error ? err.message : 'Crawl failed';
            const classified = classifyError(raw, 'crawl');
            emit({ type: 'crawl_error', index, name, error: classified.message, errorType: classified.type });
            processed++;
            errors++;
            emitProgressSummary();
            const fallbackPage: CrawledPage = { url: competitor.url, title: 'Crawl limitation', text: '', excerpt: 'No readable public content could be extracted.' };
            return { analysis: analyzeCompetitor(normalizeCompetitorInput(competitor), [fallbackPage], index), crawlError: { url: competitor.url, error: classified.message, errorType: classified.type } };
          }
        });

        emit({ type: 'building', message: 'Building intelligence report' });

        const analyses = results.map(r => r.analysis);
        const crawlErrors = results.flatMap(r => r.crawlError ? [r.crawlError] : []);
        const aiErrors = results.flatMap(r => r.aiError ? [r.aiError] : []);

        // Rich scan summary for UI + downstream board/sales outputs (trust + transparency)
        const scanSummary = {
          total: competitors.length,
          successes,
          errors,
          crawlFailures: crawlErrors.length,
          aiFailures: aiErrors.length,
          errorBreakdown: [
            ...crawlErrors.map(e => ({ url: e.url, type: e.errorType || 'crawl', message: e.error })),
            ...aiErrors.map(e => ({ url: e.url, type: e.errorType || 'ai', message: e.error }))
          ]
        };

        const report = buildReport(analyses, [...crawlErrors, ...aiErrors.map(e => ({ url: e.url, error: `AI extraction: ${e.error}` }))]);
        const aiSummaries = analyses.map(a => a.aiExtraction?.leadershipSummary).filter(Boolean);
        const enhancedReport = {
          ...report,
          aiEnabled: shouldUseAI,
          aiModel: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
          sourceLibraryMode: SOURCE_LIBRARY_MODE,
          geography: SOURCE_LIBRARY_GEOGRAPHY,
          andwellBaselineSources: ANDWELL_BASELINE_SOURCES,
          analysisConcurrency: concurrency,
          crawlMaxPagesPerSite: maxPages,
          aiLeadershipSummary: aiSummaries.length ? aiSummaries.join('\n\n') : undefined,
          executiveSummary: aiSummaries.length ? `${report.executiveSummary}\n\nAI leadership summary: ${aiSummaries.join(' ')}` : report.executiveSummary,
          scanSummary
        };
        enhancedReport.trustMetadata = buildReportTrustMetadata(enhancedReport);

        if (body.save !== false) await saveReport(enhancedReport);

        // Final progress summary for complete visibility
        emit({ type: 'progress_summary', processed, total, successes, errors });
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
