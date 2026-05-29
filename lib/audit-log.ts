export type AuditEventType =
  | 'decision_actioned'
  | 'claim_approved'
  | 'claim_removed'
  | 'report_loaded'
  | 'report_deleted'
  | 'analysis_started'
  | 'analysis_complete'
  | 'rescan_complete'
  | 'source_library_saved'
  | 'referral_action_saved'
  | 'coaching_session_saved'
  | 'ask_question_run';

export type AuditEvent = {
  id: string;
  type: AuditEventType;
  timestamp: string;
  actor: string;
  description: string;
  detail?: string;
};

const KEY = 'andwell:auditLog';
const MAX = 500;

export function appendAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
  const entry: AuditEvent = {
    ...event,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  try {
    const existing = readAuditEvents();
    const next = [entry, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  try {
    if (typeof window !== 'undefined') {
      void fetch('/api/audit-events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(entry)
      });
    }
  } catch {}
}

export function readAuditEvents(): AuditEvent[] {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as AuditEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearAuditLog() {
  try { localStorage.removeItem(KEY); } catch {}
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  try {
    const response = await fetch('/api/audit-events', { cache: 'no-store' });
    if (!response.ok) throw new Error('Audit API failed');
    const data = await response.json() as { events?: AuditEvent[] };
    if (Array.isArray(data.events)) return data.events;
  } catch {}
  return readAuditEvents();
}

export async function clearAuditEvents() {
  try {
    await fetch('/api/audit-events', { method: 'DELETE' });
  } catch {}
  clearAuditLog();
}
