'use client';

import React from 'react';
import { Badge, Panel, SectionGroup, ExpandableSection } from '../Shared';
import type { ReportSummary } from '../../../lib/command-center/types';
import type { IntelligenceReport } from '../../../lib/types';

export function Reports({ reports, currentReport, loadReport, exportJson, refreshServerState, busy }: { reports: ReportSummary[]; currentReport: IntelligenceReport | null; loadReport: (id: string) => void; exportJson: () => void; refreshServerState: () => void; busy: boolean }) {
  return <><section className="section"><div><h1>Reports</h1><p className="text-body">Stored server side reports and exportable intelligence summaries.</p></div><div className="row" style={{ gap: '8px' }}><button className="btn" disabled={busy} onClick={refreshServerState}>Load reports</button><button className="btn" disabled={!currentReport} onClick={exportJson}>Export current JSON</button></div></section><div className="grid" style={{ gap: '12px' }}>{reports.length === 0 ? <Panel title="No reports found"><p className="text-body">Run a competitive scan from the Intake view to generate your first intelligence report.</p></Panel> : reports.map((report) => <div className="briefItem hover-card" key={report.id} style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}><div style={{ flex: 1 }}><strong className="text-subhead" style={{ display: 'block', marginBottom: '4px' }}>{report.competitors?.join(', ') || 'Stored report'}</strong><p className="text-small" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>{new Date(report.generatedAt).toLocaleString()} | {report.pagesReviewed} pages | {report.humanReviewItems} review items</p><p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>{report.executiveSummary}</p></div><button className="btn primary" disabled={busy} onClick={() => loadReport(report.id)}>Load</button></div>)}</div></>;
}
