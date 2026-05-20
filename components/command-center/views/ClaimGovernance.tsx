'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup, ExpandableSection } from '../Shared';
import { categorizeAllClaims, filterApprovedClaims, claimStatusTone } from '../../../lib/claim-governance';
import type { IntelligenceReport, ClaimStatus } from '../../../lib/types';

const statusFilters: ClaimStatus[] = ['Safe', 'Needs review', 'Do not use', 'Internal only', 'High risk'];

export function ClaimGovernance({ currentReport }: { currentReport: IntelligenceReport | null }) {
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);

  const allClaims = useMemo(() => {
    if (!currentReport) return [];
    return categorizeAllClaims(currentReport);
  }, [currentReport]);

  const filtered = useMemo(() => {
    let result = allClaims;
    if (showApprovedOnly) result = filterApprovedClaims(result);
    if (statusFilter !== 'all') result = result.filter((c) => c.category === statusFilter);
    return result;
  }, [allClaims, statusFilter, showApprovedOnly]);

  const counts = useMemo(() => {
    const c = { Safe: 0, 'Needs review': 0, 'Do not use': 0, 'Internal only': 0, 'High risk': 0 };
    allClaims.forEach((cl) => { c[cl.category]++; });
    return c;
  }, [allClaims]);

  if (!currentReport) {
    return <Panel title="No report loaded"><p className="text-body">Run or load a report to review and govern competitive claims.</p></Panel>;
  }

  return <>
    <section className="section">
      <div>
        <h1>Claim Governance</h1>
        <p className="text-body">Review and categorize all competitive claims by safety level. Filter by status or show only approved claims for field use.</p>
      </div>
      <Badge>{filtered.length} of {allClaims.length} claims</Badge>
    </section>
    <SectionGroup title="Claim safety overview">
      <div className="grid cols2" style={{ marginBottom: '16px' }}>
        {(Object.entries(counts) as [ClaimStatus, number][]).map(([status, count]) =>
          <div key={status} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <p className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>{status}</p>
            <strong style={{ color: status === 'High risk' ? 'var(--color-danger)' : status === 'Do not use' ? 'var(--color-danger)' : status === 'Internal only' ? 'var(--color-info)' : status === 'Needs review' ? 'var(--color-warning)' : 'var(--color-success)', fontSize: '22px' }}>{count}</strong>
          </div>
        )}
      </div>
    </SectionGroup>
    <Panel title="Filters">
      <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
        <button className={`btn ${statusFilter === 'all' ? 'primary' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
        {statusFilters.map((s) =>
          <button key={s} className={`btn ${statusFilter === s ? 'primary' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <label className="row" style={{ gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showApprovedOnly} onChange={(e) => setShowApprovedOnly(e.target.checked)} />
            <span className="text-small">Approved only</span>
          </label>
        </div>
      </div>
    </Panel>
    {filtered.length === 0
      ? <Panel title="No claims match"><p className="text-body">No claims match the current filter. Try adjusting the filter criteria.</p></Panel>
      : <div className="grid cols2">{filtered.map((claim, i) =>
        <div key={i} className="hover-card" style={{ padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <div className="row spread" style={{ marginBottom: '8px' }}>
            <Badge tone={claimStatusTone(claim.category)}>{claim.category}</Badge>
            <span className="text-small" style={{ color: 'var(--color-text-tertiary)' }}>{claim.competitorName}</span>
          </div>
          <p className="text-small" style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>{claim.claim}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{claim.reason}</p>
          {claim.serviceLine ? <Badge>{claim.serviceLine}</Badge> : null}
        </div>
      )}</div>
    }
  </>;
}
