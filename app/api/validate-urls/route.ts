import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ValidationResult = { url: string; ok: boolean; status?: number; error?: string };

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return null;
    const parts = host.split('.');
    if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
      const [a, b] = parts.map(Number);
      if (a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return null;
    }
    return withProtocol;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: { urls?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const rawUrls = Array.isArray(body.urls) ? body.urls.filter((u): u is string => typeof u === 'string') : [];
  if (!rawUrls.length) return NextResponse.json({ results: [] });

  const results: ValidationResult[] = await Promise.all(
    rawUrls.slice(0, 25).map(async (raw): Promise<ValidationResult> => {
      const url = normalizeUrl(raw);
      if (!url) return { url: raw, ok: false, error: 'Invalid or private URL' };
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AndwellBot/1.0)' }
        });
        clearTimeout(timeout);
        return { url, ok: response.status < 400, status: response.status };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Request failed';
        return { url, ok: false, error: msg.toLowerCase().includes('abort') ? 'Timed out' : msg };
      }
    })
  );

  return NextResponse.json({ results });
}
