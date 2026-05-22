'use client';

import React from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import type { ReportSummary } from '../../../lib/command-center/types';
import type { IntelligenceReport } from '../../../lib/types';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function Reports({
  reports,
  currentReport,
  loadReport,
  exportJson,
  refreshServerState,
  busy,
}: {
  reports: ReportSummary[];
  currentReport: IntelligenceReport | null;
  loadReport: (id: string) => void;
  exportJson: () => void;
  refreshServerState: () => void;
  busy: boolean;
}) {
  return (
    <>
      <section className="section">
        <div>
          <h1>Reports</h1>
          <p className="text-body">Stored intelligence reports. Load a report to activate all workspaces, or export the current report as JSON.</p>
        </div>
        <div className="row" style={{ gap: '8px', flexShrink: 0 }}>
          <button className="btn" disabled={busy} onClick={refreshServerState}>
            {busy ? 'Loading…' : 'Refresh'}
          </button>
          <button className="btn" disabled={!currentReport || busy} onClick={exportJson}>
            Export JSON
          </button>
        </div>
      </section>

      {currentReport && (
        <div className="notice" style={{ marginBottom: '20px', marginTop: 0 }}>
          <strong>Active report:</strong> {currentReport.competitorsAnalyzed} competitors analyzed · {currentReport.pagesReviewed} pages reviewed
        </div>
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
                    borderColor: isActive ? 'var(--color-accent)' : undefined,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {isActive && <Badge tone="green">Active</Badge>}
                      <strong className="text-subhead" style={{ display: 'block' }}>
                        {report.competitors?.join(', ') || 'Stored report'}
                      </strong>
                    </div>
                    <p className="text-small" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>
                      {formatDate(report.generatedAt)} · {report.pagesReviewed} pages · {report.humanReviewItems} review items
                    </p>
                    <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)', maxWidth: '60ch' }}>
                      {report.executiveSummary}
                    </p>
                  </div>
                  <button
                    className={`btn ${isActive ? '' : 'primary'}`}
                    disabled={busy || isActive}
                    onClick={() => loadReport(report.id)}
                    style={{ flexShrink: 0 }}
                  >
                    {isActive ? 'Loaded' : 'Load'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </SectionGroup>
    </>
  );
}
