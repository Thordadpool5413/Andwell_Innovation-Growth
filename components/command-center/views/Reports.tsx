'use client';

import React, { useState } from 'react';
import { Badge, Panel, SectionGroup, TrustPanel } from '../Shared';
import { buildReportTrustMetadata } from '../../../lib/trust-metadata';
import type { ReportSummary } from '../../../lib/command-center/types';
import type { IntelligenceReport } from '../../../lib/types';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function threatColor(level: string) {
  if (level === 'Strategic threat') return 'var(--color-danger)';
  if (level === 'High overlap') return 'var(--color-warning)';
  if (level === 'Moderate overlap') return 'var(--color-info)';
  return 'var(--color-success)';
}

function scoreChange(a: number, b: number) {
  const diff = b - a;
  if (diff === 0) return <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>;
  return <span style={{ color: diff > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 700 }}>{diff > 0 ? '+' : ''}{diff}%</span>;
}

export function Reports({
  reports,
  currentReport,
  loadReport,
  exportJson,
  refreshServerState,
  deleteReports,
  busy,
}: {
  reports: ReportSummary[];
  currentReport: IntelligenceReport | null;
  loadReport: (id: string) => void;
  exportJson: () => void;
  refreshServerState: () => void;
  deleteReports?: (ids: string[]) => void;
  busy: boolean;
}) {
  const [compareReport, setCompareReport] = useState<IntelligenceReport | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(selectedIds.size === reports.length ? new Set() : new Set(reports.map((r) => r.id)));
  }

  function handleDeleteSelected() {
    if (!deleteReports || selectedIds.size === 0) return;
    deleteReports([...selectedIds]);
    setSelectedIds(new Set());
  }

  async function loadCompare(id: string) {
    setCompareLoading(true);
    setCompareId(id);
    try {
      const res = await fetch(`/api/reports?id=${encodeURIComponent(id)}`);
      const data = await res.json() as { report: IntelligenceReport };
      setCompareReport(data.report || null);
    } catch {
      setCompareReport(null);
    } finally {
      setCompareLoading(false);
    }
  }

  function clearCompare() {
    setCompareReport(null);
    setCompareId(null);
  }

  const thinDataCompetitors = currentReport?.analyses.filter((a) => a.pagesReviewed.length < 4) || [];
  const lowConfidenceCompetitors = currentReport?.analyses.filter((a) => a.aiExtraction?.rawConfidence === 'Low') || [];
  const activeTrust = currentReport ? (currentReport.trustMetadata || buildReportTrustMetadata(currentReport)) : null;

  const diff = (() => {
    if (!currentReport || !compareReport) return null;
    const aMap = new Map(compareReport.analyses.map((x) => [x.name.toLowerCase(), x]));
    const bMap = new Map(currentReport.analyses.map((x) => [x.name.toLowerCase(), x]));
    const shared = [...bMap.entries()].filter(([k]) => aMap.has(k)).map(([, cur]) => {
      const old = aMap.get(cur.name.toLowerCase())!;
      return {
        name: cur.name,
        oldThreat: old.score.threatLevel,
        newThreat: cur.score.threatLevel,
        oldMatch: old.score.serviceLineMatchScore,
        newMatch: cur.score.serviceLineMatchScore,
        oldDiff: old.score.andwellDifferentiationScore,
        newDiff: cur.score.andwellDifferentiationScore,
      };
    });
    const added = [...bMap.keys()].filter((k) => !aMap.has(k)).map((k) => bMap.get(k)!.name);
    const removed = [...aMap.keys()].filter((k) => !bMap.has(k)).map((k) => aMap.get(k)!.name);
    const oldRecommendations = new Set((compareReport.expertBrief?.recommendations || []).map((item) => item.title.toLowerCase()));
    const changedRecommendations = (currentReport.expertBrief?.recommendations || []).filter((item) => !oldRecommendations.has(item.title.toLowerCase())).slice(0, 5);
    const oldWatch = new Set((compareReport.expertBrief?.watchlist || []).map((item) => `${item.competitorName}:${item.signal}`.toLowerCase()));
    const newRisks = (currentReport.expertBrief?.watchlist || []).filter((item) => !oldWatch.has(`${item.competitorName}:${item.signal}`.toLowerCase())).slice(0, 5);
    return { shared, added, removed, changedRecommendations, newRisks };
  })();

  return (
    <>
      <section className="section">
        <div>
          <h1>Reports</h1>
          <p className="text-body">Stored intelligence reports. Load a report to activate all workspaces, or export the current report as JSON.</p>
        </div>
        <div className="row" style={{ gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          {deleteReports && reports.length > 0 && (
            <button className="btn btn-sm" onClick={toggleAll}>
              {selectedIds.size === reports.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
          {deleteReports && selectedIds.size > 0 && (
            <button
              className="btn btn-sm"
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
              disabled={busy}
              onClick={handleDeleteSelected}
            >
              Delete {selectedIds.size}
            </button>
          )}
          <button className="btn" disabled={busy} onClick={refreshServerState}>
            {busy ? 'Loading…' : 'Refresh'}
          </button>
          <button className="btn" disabled={!currentReport || busy} onClick={exportJson}>
            Export JSON
          </button>
        </div>
      </section>

      {currentReport && (
        <div className="notice" style={{ marginBottom: thinDataCompetitors.length > 0 || lowConfidenceCompetitors.length > 0 ? '8px' : '20px', marginTop: 0 }}>
          <strong>Active report:</strong> {currentReport.competitorsAnalyzed} competitors analyzed · {currentReport.pagesReviewed} pages reviewed
        </div>
      )}

      {currentReport && activeTrust && (
        <div className="reportSummaryLayout">
          <div className="reportSummaryCards">
            <article><span>Scan health</span><strong>{currentReport.scanSummary ? `${currentReport.scanSummary.successes}/${currentReport.scanSummary.total}` : `${currentReport.pagesReviewed} pages`}</strong><p>{currentReport.scanSummary ? `${currentReport.scanSummary.errors} scan errors` : 'Legacy report without live scan summary'}</p></article>
            <article><span>Competitors</span><strong>{currentReport.competitorsAnalyzed}</strong><p>{currentReport.analyses.map((analysis) => analysis.name).slice(0, 3).join(', ')}</p></article>
            <article><span>Review burden</span><strong>{currentReport.humanReviewItems}</strong><p>{activeTrust.reviewStatus}</p></article>
            <article><span>AI confidence</span><strong>{activeTrust.confidence}</strong><p>{activeTrust.aiInterpretationCount} AI-enhanced interpretations</p></article>
          </div>
          <TrustPanel metadata={activeTrust} title="Report Trust" />
        </div>
      )}

      {currentReport && (currentReport as any).scanSummary && (
        <div className="notice" style={{ marginBottom: '12px', marginTop: 0, background: 'rgba(16, 185, 129, 0.08)', borderColor: 'var(--color-success)' }}>
          <strong>Scan health:</strong> {(currentReport as any).scanSummary.successes} succeeded, {(currentReport as any).scanSummary.errors} errors
          {(currentReport as any).scanSummary.errorBreakdown?.length > 0 && (
            <span style={{ marginLeft: 8, color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
              (see details in raw report or re-run for fresh data)
            </span>
          )}
        </div>
      )}

      {thinDataCompetitors.length > 0 && (
        <div className="notice" style={{ marginBottom: '8px', marginTop: 0, borderColor: 'var(--color-warning)' }}>
          <strong>Data quality warning —</strong> {thinDataCompetitors.map((a) => a.name).join(', ')} had fewer than 4 pages crawled. Intelligence for {thinDataCompetitors.length === 1 ? 'this competitor' : 'these competitors'} may be incomplete. Consider re-running the scan with updated URLs.
        </div>
      )}

      {lowConfidenceCompetitors.length > 0 && (
        <div className="notice" style={{ marginBottom: '20px', marginTop: 0, borderColor: 'var(--color-warning)' }}>
          <strong>Low AI confidence —</strong> {lowConfidenceCompetitors.map((a) => a.name).join(', ')} returned low AI extraction confidence. Review findings manually before using in sales materials.
        </div>
      )}

      {diff && compareReport && (
        <SectionGroup title={`Comparing: ${compareReport.generatedAt ? formatDate(compareReport.generatedAt) : 'Baseline'} → Active report`} action={
          <button className="btn btn-sm" onClick={clearCompare}>Clear comparison</button>
        }>
          {diff.added.length > 0 && (
            <div className="notice" style={{ marginBottom: '8px' }}>
              <strong>New in active report:</strong> {diff.added.join(', ')}
            </div>
          )}
          {diff.removed.length > 0 && (
            <div className="notice" style={{ marginBottom: '8px' }}>
              <strong>No longer in active report:</strong> {diff.removed.join(', ')}
            </div>
          )}
          {diff.shared.length > 0 && (
            <div className="tableWrap">
              <table className="table-compact">
                <thead>
                  <tr>
                    <th>Competitor</th>
                    <th>Threat level</th>
                    <th>Service match</th>
                    <th>Match change</th>
                    <th>Differentiation</th>
                    <th>Diff change</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.shared.map((row) => (
                    <tr key={row.name}>
                      <td><strong>{row.name}</strong></td>
                      <td>
                        <span style={{ color: threatColor(row.newThreat), fontWeight: 600, fontSize: '12px' }}>{row.newThreat}</span>
                        {row.oldThreat !== row.newThreat && (
                          <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', marginLeft: '6px' }}>was: {row.oldThreat}</span>
                        )}
                      </td>
                      <td>{row.newMatch}%</td>
                      <td>{scoreChange(row.oldMatch, row.newMatch)}</td>
                      <td>{row.newDiff}%</td>
                      <td>{scoreChange(row.oldDiff, row.newDiff)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(diff.newRisks.length > 0 || diff.changedRecommendations.length > 0) && (
            <div className="reportDiffGrid">
              <div className="notice" style={{ margin: 0 }}>
                <strong>New risks</strong>
                {diff.newRisks.length ? diff.newRisks.map((item) => <p key={`${item.competitorName}:${item.signal}`} className="text-small">{item.competitorName}: {item.signal}</p>) : <p className="text-small">No new watchlist risks.</p>}
              </div>
              <div className="notice" style={{ margin: 0 }}>
                <strong>Changed recommendations</strong>
                {diff.changedRecommendations.length ? diff.changedRecommendations.map((item) => <p key={item.id} className="text-small">{item.title}: {item.action}</p>) : <p className="text-small">No new recommendation titles.</p>}
              </div>
            </div>
          )}
          {diff.shared.length === 0 && diff.added.length === 0 && diff.removed.length === 0 && (
            <p className="text-body">No differences found between the two reports.</p>
          )}
        </SectionGroup>
      )}

      <SectionGroup title={`Saved reports (${reports.length})`}>
        {reports.length === 0 ? (
          <Panel title="No reports found">
            <p className="text-body">Run a competitive scan from Competitor Intake to generate your first intelligence report. Reports are saved server-side and persist between sessions.</p>
          </Panel>
        ) : (
          <div className="list-grid">
            {reports.map((report) => {
              const isActive = currentReport?.id === report.id;
              const isCompare = compareId === report.id;
              return (
                <div
                  key={report.id}
                  className="briefItem hover-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    borderColor: selectedIds.has(report.id) ? 'var(--color-danger)' : isActive ? 'var(--color-accent)' : isCompare ? 'var(--color-info)' : undefined,
                  }}
                >
                  {deleteReports && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(report.id)}
                      onChange={() => toggleSelect(report.id)}
                      style={{ marginTop: '4px', flexShrink: 0, accentColor: 'var(--color-accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                      aria-label={`Select report from ${report.generatedAt}`}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {isActive && <Badge tone="green">Active</Badge>}
                      {isCompare && <Badge tone="blue">Comparing</Badge>}
                      <strong className="text-subhead" style={{ display: 'block' }}>
                        {report.competitors?.join(', ') || 'Stored report'}
                      </strong>
                    </div>
                    <p className="text-small" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>
                      {formatDate(report.generatedAt)} · {report.pagesReviewed} pages · {report.humanReviewItems} review items
                    </p>
                    <div className="row" style={{ gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <Badge tone={report.trustMetadata?.reviewStatus?.includes('Ready') ? 'green' : report.trustMetadata?.reviewStatus?.includes('review') ? 'amber' : 'blue'}>
                        {report.trustMetadata?.reviewStatus || 'Trust pending'}
                      </Badge>
                      <Badge tone="blue">{report.trustMetadata?.sourceCount ?? 0} sources</Badge>
                      <Badge tone={report.trustMetadata?.confidence === 'High' ? 'green' : 'amber'}>{report.trustMetadata?.confidence || 'No confidence'}</Badge>
                    </div>
                    <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)', maxWidth: '60ch' }}>
                      {report.executiveSummary}
                    </p>
                  </div>
                  <div className="row" style={{ gap: '8px', flexShrink: 0 }}>
                    {!isActive && currentReport && (
                      <button
                        className={`btn btn-sm ${isCompare ? 'primary' : ''}`}
                        disabled={compareLoading}
                        onClick={() => isCompare ? clearCompare() : loadCompare(report.id)}
                        title="Compare this report to the active report"
                      >
                        {compareLoading && isCompare ? 'Loading…' : isCompare ? 'Clear' : 'Compare'}
                      </button>
                    )}
                    <button
                      className={`btn ${isActive ? '' : 'primary'}`}
                      disabled={busy || isActive}
                      onClick={() => loadReport(report.id)}
                      style={{ flexShrink: 0 }}
                    >
                      {isActive ? 'Loaded' : 'Load'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionGroup>
    </>
  );
}
