'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Badge, Panel, SectionGroup, EmptyState } from '../Shared';
import { categorizeAllClaims, claimStatusTone, claimId } from '../../../lib/claim-governance';
import { appendAuditEvent } from '../../../lib/audit-log';
import type { IntelligenceReport, ClaimStatus } from '../../../lib/types';

const statusFilters: ClaimStatus[] = ['Safe', 'Needs review', 'Do not use', 'Internal only', 'High risk'];
const APPROVAL_KEY = 'andwell:claimApprovals';

async function fetchApprovals(): Promise<string[]> {
  try {
    const res = await fetch('/api/claim-approvals');
    if (!res.ok) return [];
    const data = await res.json() as { approvals: string[] };
    return data.approvals ?? [];
  } catch {
    return [];
  }
}

async function persistApprovals(approvals: string[]) {
  try {
    await fetch('/api/claim-approvals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ approvals }),
    });
  } catch {}
}

export function ClaimGovernance({ currentReport, onRunScan }: { currentReport: IntelligenceReport | null; onRunScan?: () => void }) {
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);
  const [approvals, setApprovals] = useState<Set<string>>(new Set());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'local'>('idle');
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load approvals: try API first, fall back to localStorage
  useEffect(() => {
    setSyncStatus('syncing');
    fetchApprovals().then((serverApprovals) => {
      if (serverApprovals.length > 0) {
        setApprovals(new Set(serverApprovals));
        try { localStorage.setItem(APPROVAL_KEY, JSON.stringify(serverApprovals)); } catch {}
        setSyncStatus('synced');
      } else {
        try {
          const stored = localStorage.getItem(APPROVAL_KEY);
          if (stored) setApprovals(new Set(JSON.parse(stored) as string[]));
        } catch {}
        setSyncStatus('local');
      }
    });
  }, []);

  // Debounced server persist whenever approvals change (after initial load)
  const approvalsRef = useRef(approvals);
  useEffect(() => { approvalsRef.current = approvals; }, [approvals]);

  const schedulePersist = useCallback((next: Set<string>) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      const arr = [...next];
      try { localStorage.setItem(APPROVAL_KEY, JSON.stringify(arr)); } catch {}
      persistApprovals(arr).then(() => setSyncStatus('synced'));
    }, 1200);
  }, []);

  const toggleApproval = useCallback((claim: string, competitorName: string) => {
    setApprovals((prev) => {
      const next = new Set(prev);
      const id = claimId(claim);
      const removing = next.has(id);
      if (removing) next.delete(id); else next.add(id);
      setSyncStatus('syncing');
      schedulePersist(next);
      appendAuditEvent({
        type: removing ? 'claim_removed' : 'claim_approved',
        actor: 'User',
        description: removing ? `Removed approval for claim from ${competitorName}` : `Approved claim for field use from ${competitorName}`,
        detail: claim.slice(0, 120),
      });
      return next;
    });
  }, [schedulePersist]);

  const allClaims = useMemo(() => {
    if (!currentReport) return [];
    return categorizeAllClaims(currentReport);
  }, [currentReport]);

  const filtered = useMemo(() => {
    let result = allClaims;
    if (showApprovedOnly) result = result.filter((c) => approvals.has(claimId(c.claim)));
    else if (statusFilter !== 'all') result = result.filter((c) => c.category === statusFilter);
    return result;
  }, [allClaims, statusFilter, showApprovedOnly, approvals]);

  const approvedCount = useMemo(() => allClaims.filter((c) => approvals.has(claimId(c.claim))).length, [allClaims, approvals]);

  const counts = useMemo(() => {
    const c: Record<ClaimStatus, number> = { Safe: 0, 'Needs review': 0, 'Do not use': 0, 'Internal only': 0, 'High risk': 0 };
    allClaims.forEach((cl) => { c[cl.category]++; });
    return c;
  }, [allClaims]);

  if (!currentReport) {
    return (
      <EmptyState
        icon="✅"
        title="No claims to review yet"
        description="Run a competitive scan to extract and review competitor claims. Each claim is categorized by safety level — Safe, Needs Review, Do Not Use, and High Risk — so your field team knows what's approved."
        action={onRunScan && <button className="btn primary" onClick={onRunScan}>Run Competitive Scan →</button>}
      />
    );
  }

  return <>
    <section className="section">
      <div>
        <h1>Claim Governance</h1>
        <p className="text-body">Review and categorize all competitive claims by safety level. Filter by status or show only approved claims for field use.</p>
      </div>
      <div className="row" style={{ gap: '8px' }}>
        <Badge>{filtered.length} of {allClaims.length} claims</Badge>
        {approvedCount > 0 && <Badge tone="green">{approvedCount} approved</Badge>}
        {syncStatus === 'syncing' && <Badge tone="amber">Saving…</Badge>}
        {syncStatus === 'synced' && <Badge tone="green">Synced</Badge>}
        {syncStatus === 'local' && <Badge tone="neutral">Local only</Badge>}
      </div>
    </section>
    <SectionGroup title="Claim safety overview">
      <div className="grid cols2" style={{ marginBottom: '16px' }}>
        {(Object.entries(counts) as [ClaimStatus, number][]).map(([status, count]) =>
          <div key={status} className="list-card hover-card">
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
            <span className="text-small">Approved only ({approvedCount})</span>
          </label>
        </div>
      </div>
    </Panel>
    {filtered.length === 0
      ? <Panel title="No claims match"><p className="text-body">No claims match the current filter. Try adjusting the filter criteria.</p></Panel>
      : <div className="grid cols2">{filtered.map((claim, i) => {
        const isApproved = approvals.has(claimId(claim.claim));
        return (
          <div key={i} className="list-card hover-card" style={{ padding: '16px', borderColor: isApproved ? 'var(--color-success)' : undefined }}>
            <div className="row spread" style={{ marginBottom: '8px' }}>
              <div className="row" style={{ gap: '6px' }}>
                <Badge tone={claimStatusTone(claim.category)}>{claim.category}</Badge>
                {isApproved && <Badge tone="green">Approved</Badge>}
              </div>
              <span className="text-small" style={{ color: 'var(--color-text-tertiary)' }}>{claim.competitorName}</span>
            </div>
            <p className="text-small" style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>{claim.claim}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', marginBottom: '10px' }}>{claim.reason}</p>
            <div className="row" style={{ gap: '8px' }}>
              {claim.serviceLine ? <Badge>{claim.serviceLine}</Badge> : null}
              <button
                className={`btn btn-sm ${isApproved ? 'danger' : ''}`}
                style={{ marginLeft: 'auto' }}
                onClick={() => toggleApproval(claim.claim, claim.competitorName)}
              >
                {isApproved ? 'Remove approval' : 'Approve for field use'}
              </button>
            </div>
          </div>
        );
      })}</div>
    }
  </>;
}
