'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { readAuditEvents, clearAuditLog } from '../../../lib/audit-log';
import type { AuditEvent, AuditEventType } from '../../../lib/audit-log';
import { useToast } from '../../../components/Toast';

const TYPE_LABELS: Record<AuditEventType, string> = {
  decision_actioned: 'Decision',
  claim_approved: 'Claim approved',
  claim_removed: 'Claim removed',
  report_loaded: 'Report loaded',
  report_deleted: 'Report deleted',
  analysis_started: 'Scan started',
  analysis_complete: 'Scan complete',
  rescan_complete: 'Re-scan complete',
};

const TYPE_TONES: Record<AuditEventType, 'green' | 'amber' | 'red' | 'blue' | 'neutral' | 'dark'> = {
  decision_actioned: 'blue',
  claim_approved: 'green',
  claim_removed: 'amber',
  report_loaded: 'blue',
  report_deleted: 'red',
  analysis_started: 'amber',
  analysis_complete: 'green',
  rescan_complete: 'green',
};

const ALL_TYPES: AuditEventType[] = [
  'decision_actioned', 'claim_approved', 'claim_removed',
  'report_loaded', 'report_deleted', 'analysis_started', 'analysis_complete', 'rescan_complete',
];

function formatTs(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return iso; }
}

export function AuditLog() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [typeFilter, setTypeFilter] = useState<AuditEventType | 'all'>('all');
  const [search, setSearch] = useState('');

  const reload = useCallback(() => setEvents(readAuditEvents()), []);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 5000);
    return () => clearInterval(interval);
  }, [reload]);

  function handleClear() {
    clearAuditLog();
    setEvents([]);
    showToast('Audit log cleared.', 'info');
  }

  const filtered = events.filter((e) => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.description.toLowerCase().includes(q) || (e.detail ?? '').toLowerCase().includes(q) || e.actor.toLowerCase().includes(q);
    }
    return true;
  });

  const counts: Partial<Record<AuditEventType, number>> = {};
  for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1;

  return <>
    <section className="section">
      <div>
        <h1>Audit Log</h1>
        <p className="text-body">A local record of every significant action taken in this session — decisions, claim approvals, report loads, and scans.</p>
      </div>
      <div className="row" style={{ gap: '8px' }}>
        <Badge>{events.length} events</Badge>
        {events.length > 0 && (
          <button className="btn btn-sm" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleClear}>
            Clear log
          </button>
        )}
      </div>
    </section>

    {events.length === 0 ? (
      <Panel title="No activity recorded">
        <p className="text-body">Actions like approving claims, actioning decisions, loading reports, and running scans will appear here automatically.</p>
      </Panel>
    ) : (
      <>
        <SectionGroup title="Activity summary">
          <div className="grid cols4">
            {ALL_TYPES.filter((t) => counts[t]).map((t) => (
              <div key={t} className="scoreCard hover-card" style={{ padding: '14px', cursor: 'pointer' }} onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}>
                <Badge tone={TYPE_TONES[t]}>{TYPE_LABELS[t]}</Badge>
                <strong style={{ display: 'block', fontSize: '22px', marginTop: '8px' }}>{counts[t]}</strong>
              </div>
            ))}
          </div>
        </SectionGroup>

        <Panel title="Filters">
          <div style={{ display: 'grid', gap: '10px' }}>
            <input
              className="input"
              placeholder="Search descriptions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '380px' }}
            />
            <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
              <button className={`btn btn-sm ${typeFilter === 'all' ? 'primary' : ''}`} onClick={() => setTypeFilter('all')}>All</button>
              {ALL_TYPES.filter((t) => counts[t]).map((t) => (
                <button key={t} className={`btn btn-sm ${typeFilter === t ? 'primary' : ''}`} onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <SectionGroup title={`${filtered.length} events`}>
          {filtered.length === 0 ? (
            <Panel title="No matches">
              <p className="text-body">No events match the current filter.</p>
            </Panel>
          ) : (
            <div style={{ display: 'grid', gap: '6px' }}>
              {filtered.map((event) => (
                <div
                  key={event.id}
                  className="briefItem"
                  style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '12px', alignItems: 'start' }}
                >
                  <Badge tone={TYPE_TONES[event.type]}>{TYPE_LABELS[event.type]}</Badge>
                  <div>
                    <p className="text-small" style={{ margin: '0 0 2px', fontWeight: 600 }}>{event.description}</p>
                    {event.detail && (
                      <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                        &ldquo;{event.detail}&rdquo;
                      </p>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                    {formatTs(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionGroup>
      </>
    )}
  </>;
}
