'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { generateDecisions, applyDecisionAction, urgencyOrder, riskTone } from '../../../lib/decision-queue';
import type { IntelligenceReport } from '../../../lib/types';
import type { GrowthRow, GrowthTotals } from '../../../lib/growth-plan';
import type { DecisionType, DecisionStatus, DecisionUrgency } from '../../../lib/decision-queue';

const typeFilters: DecisionType[] = ['Leadership', 'Governance', 'Staffing', 'Growth', 'Competitive', 'Compliance', 'Field enablement', 'Referral'];
const urgencyFilters: DecisionUrgency[] = ['Immediate', 'Today', 'This week', 'This month', 'This quarter'];

export function DecisionQueue({ currentReport, growthRows }: { currentReport: IntelligenceReport | null; growthRows?: GrowthRow[] }) {
  const [items, setItems] = useState<ReturnType<typeof generateDecisions> | null>(null);
  const [typeFilter, setTypeFilter] = useState<DecisionType | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<DecisionUrgency | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | 'all'>('all');

  const allItems = useMemo(() => {
    if (!items) {
      const generated = generateDecisions(currentReport, growthRows);
      return generated;
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
    setItems((prev) => applyDecisionAction(prev || allItems, id, action));
  }

  function resetQueue() {
    setItems(generateDecisions(currentReport, growthRows));
  }

  const counts = useMemo(() => ({
    total: allItems.length,
    pending: allItems.filter((d) => d.status === 'Pending').length,
    immediate: allItems.filter((d) => d.urgency === 'Immediate').length,
    highRisk: allItems.filter((d) => d.risk === 'High').length
  }), [allItems]);

  return <>
    <section className="section">
      <div>
        <h1>Decision Queue</h1>
        <p className="text-body">Actionable decision items from competitive intelligence, growth modeling, governance, and field readiness. Approve, defer, assign, or escalate each item.</p>
      </div>
      <Badge>{counts.pending} pending</Badge>
    </section>
    <div className="grid cols4">
      <Panel title="Total decisions"><strong style={{ fontSize: '28px' }}>{counts.total}</strong></Panel>
      <Panel title="Pending"><strong style={{ fontSize: '28px', color: 'var(--color-warning)' }}>{counts.pending}</strong></Panel>
      <Panel title="Immediate"><strong style={{ fontSize: '28px', color: 'var(--color-danger)' }}>{counts.immediate}</strong></Panel>
      <Panel title="High risk"><strong style={{ fontSize: '28px', color: 'var(--color-danger)' }}>{counts.highRisk}</strong></Panel>
    </div>
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
          {(['Pending', 'Approved', 'Deferred', 'Assigned', 'Escalated'] as DecisionStatus[]).map((s) => <button key={s} className={`btn ${statusFilter === s ? 'primary' : ''} btn-sm`} onClick={() => setStatusFilter(s)}>{s}</button>)}
        </div>
        <button className="btn" onClick={resetQueue} style={{ alignSelf: 'flex-start' }}>Reset queue</button>
      </div>
    </Panel>
    {filtered.length === 0
      ? <Panel title="No decisions match"><p className="text-body">No decision items match the current filter criteria.</p></Panel>
      : <div style={{ display: 'grid', gap: '8px' }}>{filtered.map((item) =>
        <div key={item.id} className="hover-card" style={{
          padding: '16px', borderRadius: 'var(--radius)',
          border: `1px solid ${item.urgency === 'Immediate' ? 'var(--color-danger)' : item.urgency === 'Today' ? 'var(--color-warning)' : 'var(--color-border)'}`,
          background: item.status === 'Approved' ? 'rgba(34,197,94,0.05)' : item.status === 'Deferred' ? 'rgba(100,116,139,0.05)' : item.status === 'Escalated' ? 'rgba(239,68,68,0.05)' : 'var(--color-bg-secondary)'
        }}>
          <div className="row spread" style={{ marginBottom: '8px' }}>
            <div className="row" style={{ gap: '6px' }}>
              <Badge tone={riskTone(item.risk)}>{item.risk} risk</Badge>
              <Badge tone={item.urgency === 'Immediate' ? 'red' : item.urgency === 'Today' ? 'amber' : 'neutral'}>{item.urgency}</Badge>
              <Badge>{item.type}</Badge>
              {item.status !== 'Pending' && <Badge tone={item.status === 'Approved' ? 'green' : item.status === 'Escalated' ? 'red' : 'blue'}>{item.status}</Badge>}
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.owner}</span>
          </div>
          <h4 style={{ margin: '0 0 4px' }}>{item.title}</h4>
          <p className="text-small" style={{ margin: '0 0 8px', color: 'var(--color-text-secondary)' }}>{item.evidence}</p>
          <div className="notice" style={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong className="text-small">Recommended action</strong><br />{item.recommendedAction}
          </div>
          {item.status === 'Pending' && <div className="row" style={{ gap: '6px' }}>
            <button className="btn primary btn-sm" onClick={() => handleAction(item.id, 'Approved')}>Approve</button>
            <button className="btn btn-sm" onClick={() => handleAction(item.id, 'Deferred')}>Defer</button>
            <button className="btn btn-sm" onClick={() => handleAction(item.id, 'Assigned')}>Assign</button>
            <button className="btn btn-sm" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => handleAction(item.id, 'Escalated')}>Escalate</button>
          </div>}
        </div>
      )}</div>
    }
  </>;
}
