export type AuditEventType =
  | 'decision_actioned'
  | 'claim_approved'
  | 'claim_removed'
  | 'report_loaded'
  | 'report_deleted'
  | 'analysis_started'
  | 'analysis_complete'
  | 'rescan_complete';

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
  try {
    const existing = readAuditEvents();
    const entry: AuditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const next = [entry, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
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
