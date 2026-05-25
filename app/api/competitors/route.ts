import { NextRequest, NextResponse } from 'next/server';
import { readStore, saveCompetitors } from '../../../lib/store';
import { normalizeCompetitorInput } from '../../../lib/provider-identity';
import type { CompetitorInput } from '../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({ competitors: store.competitors.map((competitor) => normalizeCompetitorInput(competitor)) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to load competitors', competitors: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { competitors?: CompetitorInput[] };
    const competitors = (body.competitors || [])
      .filter((competitor) => competitor.url?.trim())
      .map((competitor) => normalizeCompetitorInput({ ...competitor, url: competitor.url.trim() }))
      .filter((competitor) => competitor.url?.startsWith('http'));
    const store = await saveCompetitors(competitors);
    return NextResponse.json({ competitors: store.competitors });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save competitors', competitors: [] }, { status: 500 });
  }
}
