'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Badge, MetricGrid, Panel, SectionGroup, Stat } from '../Shared';
import { generateDecisions, applyDecisionAction, urgencyOrder, riskTone } from '../../../lib/decision-queue';
import { downloadCsv } from '../../../lib/command-center/csv';
import { useToast } from '../../../components/Toast';
import { appendAuditEvent } from '../../../lib/audit-log';
import type { IntelligenceReport } from '../../../lib/types';
import type { GrowthRow, GrowthTotals } from '../../../lib/growth-plan';
import type { DecisionType, DecisionStatus, DecisionUrgency } from '../../../lib/decision-queue';

const STORAGE_KEY = 'andwell:decisionQueue';

const typeFilters: DecisionType[] = ['Leadership', 'Governance', 'Staffing', 'Growth', 'Competitive', 'Compliance', 'Field enablement', 'Referral'];
const urgencyFilters: DecisionUrgency[] = ['Immediate', 'Today', 'This week', 'This month', 'This quarter'];
const boardColumns = [
  { key: 'new', title: 'New', desc: 'Ready to triage' },
  { key: 'review', title: 'Needs review', desc: 'Urgent, high risk, or governance sensitive' },
  { key: 'approved', title: 'Approved', desc: 'Ready for execution' },
  { key: 'deferred', title: 'Deferred', desc: 'Later or paused' },
  { key: 'escalated', title: 'Escalated', desc: 'Assigned or leadership escalation' },
] as const;

type BoardColumnKey = typeof boardColumns[number]['key'];

function boardColumnFor(item: ReturnType<typeof generateDecisions>[number]): BoardColumnKey {
  if (item.status === 'Approved') return 'approved';
  if (item.status === 'Deferred' || item.status === 'Snoozed') return 'deferred';
  if (item.status === 'Assigned' || item.status === 'Escalated') return 'escalated';
  if (item.risk === 'High' || item.urgency === 'Immediate' || item.urgency === 'Today' || item.type === 'Governance' || item.type === 'Compliance') return 'review';
  return 'new';
}

export function DecisionQueue({ currentReport, growthRows }: { currentReport: IntelligenceReport | null; growthRows?: GrowthRow[] }) {
  const [items, setItems] = useState<ReturnType<typeof generateDecisions> | null>(null);
  const { showToast } = useToast();
  const [typeFilter, setTypeFilter] = useState<DecisionType | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<DecisionUrgency | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | 'all'>('all');

  // Restore persisted statuses on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const statuses: Record<string, DecisionStatus> = JSON.parse(saved);
        const fresh = generateDecisions(currentReport, growthRows);
        const restored = fresh.map((d) => statuses[d.id] ? { ...d, status: statuses[d.id] } : d);
        setItems(restored);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist status changes
  useEffect(() => {
    if (!items) return;
    try {
      const statuses: Record<string, DecisionStatus> = {};
      for (const d of items) { if (d.status !== 'Pending') statuses[d.id] = d.status; }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch {}
  }, [items]);

  const allItems = useMemo(() => {
    if (!items) {
      return generateDecisions(currentReport, growthRows);
    }
    return items;
  }, [items, currentReport, growthRows]);

  const filtered = useMemo(() => {
    let result = allItems;
    if (typeFilter !== 'all') result = result.filter((d) => d.type === typeFilter);
    if (urgencyFilter !== 'all') result = result.filter((d) => d.urgency === urgencyFilter);
    if (statusFilter !== 'all') result = result.filter((d) => d.status === statusFilter);
    return result.sort((a, b) => urgencyOrder(a.urgency) - urgencyOrder(b.urgency));
  }, [allItems, typeFilter, urgencyFilter, statusFilter]);

  function handleAction(id: string, action: DecisionStatus) {
    const item = (items || allItems).find((d) => d.id === id);
    setItems((prev) => applyDecisionAction(prev || allItems, id, action));
    const labels: Record<DecisionStatus, string> = { Pending: 'Re-opened', Approved: 'Approved', Deferred: 'Deferred', Assigned: 'Assigned', Escalated: 'Escalated', Snoozed: 'Snoozed' };
    const types: Record<DecisionStatus, 'success' | 'warning' | 'info'> = { Pending: 'info', Approved: 'success', Deferred: 'info', Assigned: 'info', Escalated: 'warning', Snoozed: 'info' };
    if (item) {
      appendAuditEvent({ type: 'decision_actioned', actor: item.owner, description: `Decision ${labels[action].toLowerCase()}: ${item.title}`, detail: action });
    }
    showToast(`Decision ${labels[action].toLowerCase()}.`, types[action]);
  }

  function resetQueue() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setItems(generateDecisions(currentReport, growthRows));
    showToast('Queue reset to defaults.', 'info');
  }

  function exportCsv() {
    downloadCsv('andwell-decision-queue.csv',
      ['Title', 'Type', 'Urgency', 'Risk', 'Status', 'Owner', 'Evidence', 'Recommended Action'],
      filtered.map(d => [d.title, d.type, d.urgency, d.risk, d.status, d.owner, d.evidence, d.recommendedAction])
    );
    showToast(`Exported ${filtered.length} decisions to CSV.`, 'success');
  }

  const counts = useMemo(() => ({
    total: allItems.length,
    pending: allItems.filter((d) => d.status === 'Pending').length,
    immediate: allItems.filter((d) => d.urgency === 'Immediate').length,
    highRisk: allItems.filter((d) => d.risk === 'High').length
  }), [allItems]);

  const grouped = useMemo(() => boardColumns.map((column) => ({
    ...column,
    items: filtered.filter((item) => boardColumnFor(item) === column.key)
  })), [filtered]);

  return <>
    <section className="section">
      <div>
        <h1>Decision Queue</h1>
        <p className="text-body">Actionable decision items from competitive intelligence, growth modeling, governance, and field readiness. Approve, defer, assign, or escalate each item.</p>
      </div>
      <span className="expert-badge governed">Andwell Expert Layer</span>
    </section>
    <MetricGrid cols={4}>
      <Stat label="Total decisions" value={counts.total} hint="In queue" />
      <Stat label="Pending" value={counts.pending} hint="Need action" />
      <Stat label="Immediate" value={counts.immediate} hint="Act now" />
      <Stat label="High risk" value={counts.highRisk} hint="Needs review" />
    </MetricGrid>
    <Panel title="Filters">
      <div style={{ display: 'grid', gap: '8px' }}>
        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
          <span className="text-small" style={{ fontWeight: 600, minWidth: '80px' }}>Type</span>
          <button className={`btn ${typeFilter === 'all' ? 'primary' : ''} btn-sm`} onClick={() => setTypeFilter('all')}>All</button>
          {typeFilters.map((t) => <button key={t} className={`btn ${typeFilter === t ? 'primary' : ''} btn-sm`} onClick={() => setTypeFilter(t)}>{t}</button>)}
        </div>
        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
          <span className="text-small" style={{ fontWeight: 600, minWidth: '80px' }}>Urgency</span>
          <button className={`btn ${urgencyFilter === 'all' ? 'primary' : ''} btn-sm`} onClick={() => setUrgencyFilter('all')}>All</button>
          {urgencyFilters.map((u) => <button key={u} className={`btn ${urgencyFilter === u ? 'primary' : ''} btn-sm`} onClick={() => setUrgencyFilter(u)}>{u}</button>)}
        </div>
        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
          <span className="text-small" style={{ fontWeight: 600, minWidth: '80px' }}>Status</span>
          <button className={`btn ${statusFilter === 'all' ? 'primary' : ''} btn-sm`} onClick={() => setStatusFilter('all')}>All</button>
          {(['Pending', 'Approved', 'Deferred', 'Assigned', 'Escalated', 'Snoozed'] as DecisionStatus[]).map((s) => <button key={s} className={`btn ${statusFilter === s ? 'primary' : ''} btn-sm`} onClick={() => setStatusFilter(s)}>{s}</button>)}
        </div>
        <div className="row" style={{ gap: '8px' }}>
          <button className="btn" onClick={resetQueue}>Reset queue</button>
          <button className="btn" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
    </Panel>
    {filtered.length === 0 ? (
      <Panel title="No decisions match">
        <p className="text-body">No decision items match the current filters.</p>
        <button className="btn" style={{ marginTop: '12px' }} onClick={() => { setTypeFilter('all'); setUrgencyFilter('all'); setStatusFilter('all'); }}>
          Clear filters
        </button>
      </Panel>
    ) : (
      <div className="decisionBoard">
        {grouped.map((column) => (
          <section className="decisionColumn" key={column.key}>
            <div className="decisionColumnHeader">
              <div>
                <h3>{column.title}</h3>
                <p>{column.desc}</p>
              </div>
              <Badge tone={column.key === 'approved' ? 'green' : column.key === 'review' ? 'amber' : column.key === 'escalated' ? 'red' : 'blue'}>{column.items.length}</Badge>
            </div>
            <div className="decisionColumnList">
              {column.items.length === 0 ? <p className="muted">No items.</p> : column.items.map((item) => {
                const statusClass =
                  item.status === 'Approved' ? 'status-card--success' :
                  item.status === 'Escalated' ? 'status-card--danger' :
                  item.status === 'Assigned' ? 'status-card--info' :
                  item.status === 'Deferred' ? '' : '';
                return (
                  <article key={item.id} className={`decisionCard hover-card${item.status === 'Pending' && item.urgency === 'Immediate' ? ' decision-urgent' : ''}${statusClass ? ` ${statusClass}` : ''}`}>
                    <div className="row" style={{ gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <Badge tone={riskTone(item.risk)}>{item.risk}</Badge>
                      <Badge tone={item.urgency === 'Immediate' ? 'red' : item.urgency === 'Today' ? 'amber' : 'neutral'}>{item.urgency}</Badge>
                      <Badge>{item.type}</Badge>
                    </div>
                    <h4>{item.title}</h4>
                    <p><strong>Evidence:</strong> {item.evidence}</p>
                    <p><strong>Next step:</strong> {item.recommendedAction}</p>
                    <div className="row spread" style={{ gap: '8px', marginTop: '10px' }}>
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.owner}</span>
                      {item.status !== 'Pending' && <Badge tone={item.status === 'Approved' ? 'green' : item.status === 'Escalated' ? 'red' : 'blue'}>{item.status}</Badge>}
                    </div>
                    {item.status === 'Pending' ? (
                      <div className="decisionActions">
                        <button className="btn primary btn-sm" onClick={() => handleAction(item.id, 'Approved')}>Approve</button>
                        <button className="btn btn-sm" onClick={() => handleAction(item.id, 'Deferred')}>Defer</button>
                        <button className="btn btn-sm" onClick={() => handleAction(item.id, 'Assigned')}>Assign</button>
                        <button className="btn btn-sm" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => handleAction(item.id, 'Escalated')}>Escalate</button>
                      </div>
                    ) : (
                      <button className="btn btn-sm" style={{ marginTop: '10px', color: 'var(--color-text-tertiary)' }} onClick={() => handleAction(item.id, 'Pending')}>Re-open</button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    )}
  </>;
}
