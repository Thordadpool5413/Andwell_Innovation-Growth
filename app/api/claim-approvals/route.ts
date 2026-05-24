import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { getSupabaseClient, isSupabaseConfigured } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const dataDir = process.env.CIH_DATA_DIR || path.join(process.cwd(), '.data');
const approvalFile = path.join(dataDir, 'claim-approvals.json');

async function readJsonApprovals(): Promise<string[]> {
  try {
    const raw = await readFile(approvalFile, 'utf8');
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function writeJsonApprovals(approvals: string[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(approvalFile, JSON.stringify(approvals, null, 2), 'utf8');
}

async function readApprovals(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('cih_claim_approvals')
        .select('claim_id')
        .limit(10000);
      if (error) throw error;
      return (data ?? []).map((row: { claim_id: string }) => row.claim_id);
    } catch {
      // fall through to JSON
    }
  }
  return readJsonApprovals();
}

async function writeApprovals(approvals: string[]) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      // Clear all then upsert current set
      await supabase.from('cih_claim_approvals').delete().neq('claim_id', '__none__');
      if (approvals.length > 0) {
        const rows = approvals.map((claim_id) => ({ claim_id, updated_at: new Date().toISOString() }));
        const { error } = await supabase.from('cih_claim_approvals').insert(rows);
        if (error) throw error;
      }
      return;
    } catch {
      // fall through to JSON
    }
  }
  await writeJsonApprovals(approvals);
}

export async function GET() {
  try {
    const approvals = await readApprovals();
    return NextResponse.json({ approvals });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to read approvals.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { approvals } = await req.json() as { approvals: string[] };
    if (!Array.isArray(approvals)) {
      return NextResponse.json({ error: 'approvals array required.' }, { status: 400 });
    }
    await writeApprovals(approvals);
    return NextResponse.json({ saved: approvals.length });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save approvals.' }, { status: 500 });
  }
}
