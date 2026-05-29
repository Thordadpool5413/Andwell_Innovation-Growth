import { NextRequest, NextResponse } from 'next/server';
import { appendStoredAuditEvent, clearStoredAuditEvents, listAuditEvents } from '../../../lib/store';
import type { AuditEvent } from '../../../lib/audit-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuditEvent(value: Partial<AuditEvent>): value is AuditEvent {
  return Boolean(value.id && value.type && value.timestamp && value.actor && value.description);
}

export async function GET() {
  try {
    return NextResponse.json({ events: await listAuditEvents() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load audit events', events: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<AuditEvent>;
    if (!isAuditEvent(body)) return NextResponse.json({ error: 'Valid audit event required.' }, { status: 400 });
    const event = await appendStoredAuditEvent(body);
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save audit event' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearStoredAuditEvents();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to clear audit events' }, { status: 500 });
  }
}
