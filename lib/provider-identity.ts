import type { CompetitorInput, CrawledPage } from './types';

function createUrlPattern() {
  return /(?:https?:\/\/|www\.)[^\s,|;<>]+|\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?:\/[^\s,|;<>]*)?/gi;
}

const genericPageNames = new Set([
  'about', 'admissions', 'augusta', 'bangor', 'careers', 'contact', 'find care near you', 'home', 'jobs', 'locations', 'maine', 'patients', 'services', 'south portland', 'visit us'
]);

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value.replace(/%20/g, ' ');
  }
}

function titleCase(value: string) {
  const preserved = new Set(['LLC', 'LHC', 'VNA', 'CHANS', 'Amedisys', 'Gentiva', 'MaineHealth', 'InterMed']);
  return value.split(/\s+/).map((word) => {
    const clean = word.replace(/[^a-z0-9]/gi, '');
    const known = [...preserved].find((item) => item.toLowerCase() === clean.toLowerCase());
    if (known) return known;
    if (/^st$/i.test(word)) return 'St.';
    if (/^[A-Z]{2,}$/.test(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

function cleanSeparators(value: string) {
  return value
    .replace(createUrlPattern(), ' ')
    .replace(/[_|]+/g, ' ')
    .replace(/\s+-\s+/g, ' ')
    .replace(/[“”"'`]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;:()\[\]-]+|[\s,;:()\[\]-]+$/g, '')
    .trim();
}

export function normalizeCompetitorUrl(raw: string): string | null {
  const token = (raw.match(createUrlPattern())?.[0] || raw).trim().replace(/[).,;]+$/g, '');
  if (!token) return null;
  try {
    const parsed = new URL(token.startsWith('http://') || token.startsWith('https://') ? token : `https://${token}`);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (!parsed.hostname.includes('.') || parsed.hostname.includes(' ')) return null;
    parsed.hash = '';
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

export function cleanProviderName(raw?: string | null) {
  if (!raw) return '';
  const decoded = safeDecode(raw);
  const noUrl = cleanSeparators(decoded)
    .replace(/\bhttps?\b/gi, ' ')
    .replace(/\bwww\b/gi, ' ')
    .replace(/\.(org|com|net|health|care)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!noUrl) return '';
  const lower = noUrl.toLowerCase();
  if (genericPageNames.has(lower)) return '';
  return /[a-z]/.test(noUrl) && /[A-Z]/.test(noUrl) && !/%\d/i.test(noUrl) ? noUrl : titleCase(noUrl);
}

export function nameFromUrl(url: string) {
  const normalized = normalizeCompetitorUrl(url);
  if (!normalized) return 'Competitor';
  const parsed = new URL(normalized);
  const host = parsed.hostname.replace(/^www\./, '');
  const parts = host.split('.');
  const first = cleanProviderName((parts[0] || '').replace(/-/g, ' '));
  if (first) return first;
  const second = cleanProviderName((parts.length > 2 ? parts[1] : parts[0] || '').replace(/-/g, ' '));
  return second || 'Competitor';
}

export function parseCompetitorEntries(input: string): CompetitorInput[] {
  const entries: CompetitorInput[] = [];
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const matches = [...line.matchAll(createUrlPattern())];
    if (!matches.length) continue;
    if (matches.length === 1) {
      const rawUrl = matches[0][0];
      const url = normalizeCompetitorUrl(rawUrl);
      if (!url) continue;
      const suppliedName = cleanProviderName(line.replace(rawUrl, ' '));
      entries.push({ name: suppliedName || nameFromUrl(url), url, market: 'Needs review' });
      continue;
    }
    matches.forEach((match) => {
      const url = normalizeCompetitorUrl(match[0]);
      if (url) entries.push({ name: nameFromUrl(url), url, market: 'Needs review' });
    });
  }
  return entries;
}

export function providerNameFromPages(pages: CrawledPage[]) {
  const titleCandidates = pages.flatMap((page) => {
    if (!page.title) return [];
    const parts = page.title.split(/\s+[|–—-]\s+/).map((part) => part.trim()).filter(Boolean);
    return parts.length > 1 ? [...parts].reverse() : [page.title];
  });
  const candidates = pages.flatMap((page) => [page.siteName, page.organizationName]).filter(Boolean) as string[];
  candidates.push(...titleCandidates);
  for (const candidate of candidates) {
    const cleaned = cleanProviderName(candidate.replace(/\s+[-|].*$/, ''));
    if (cleaned) return cleaned;
  }
  return '';
}

export function normalizeCompetitorInput(input: CompetitorInput, pages?: CrawledPage[]): CompetitorInput {
  const url = normalizeCompetitorUrl(input.url || '');
  const supplied = cleanProviderName(input.name);
  const websiteName = pages ? providerNameFromPages(pages) : '';
  const fallback = url ? nameFromUrl(url) : 'Competitor';
  return {
    ...input,
    name: supplied || websiteName || fallback,
    url: url || input.url,
    market: input.market || 'Needs review'
  };
}
