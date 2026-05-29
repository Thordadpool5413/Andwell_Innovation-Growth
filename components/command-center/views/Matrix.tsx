'use client';

import React, { useMemo, useState } from 'react';
import { Badge, ConfidenceBadge, Panel, Stat, TrustPanel } from '../Shared';
import { Target, FileCheck, Sparkles, FileText } from 'lucide-react';
import { buildReportTrustMetadata } from '../../../lib/trust-metadata';
import { Database } from 'lucide-react';
import { Badge, ConfidenceBadge, Panel, Stat, SkeletonLoader, SkeletonTable, EmptyState } from '../Shared';
import { computeConfidenceDetails } from '../../../lib/smart-ranking';
import type { MatrixFilter } from '../../../lib/command-center/types';
import type { Finding, IntelligenceReport, MatrixScore } from '../../../lib/types';
import { downloadCsv } from '../../../lib/command-center/csv';
import { useToast } from '../../../components/Toast';

function scoreTone(score: number): 'green' | 'amber' | 'red' | 'blue' {
  if (score >= 75) return 'green';
  if (score >= 55) return 'amber';
  if (score >= 35) return 'blue';
  return 'red';
}

function reviewTone(reviewStatus: string): 'green' | 'amber' | 'red' | 'blue' {
  if (reviewStatus === 'Sales usable with evidence' || reviewStatus === 'Approved for sales use') return 'green';
  if (reviewStatus === 'Manager review suggested') return 'amber';
  if (reviewStatus === 'Rejected') return 'red';
  return 'blue';
}

function scoreLabel(score?: MatrixScore) {
  if (!score) return 'Unscored';
  return `${score.overall}`;
}

function sourceCount(finding: Finding) {
  return Math.max(finding.matrixScore?.sourceCount || 0, finding.evidenceSources?.length || 0, finding.sourceUrl ? 1 : 0);
}

function safeSources(finding: Finding) {
  if (finding.evidenceSources?.length) return finding.evidenceSources;
  if (!finding.sourceUrl) return [];
  return [{ url: finding.sourceUrl, title: finding.sourceTitle || finding.sourceUrl, excerpt: finding.evidenceExcerpt, matchedTerms: [], score: finding.matrixScore?.sourceQuality || 0 }];
}

function MatrixScoreBlock({ score }: { score?: MatrixScore }) {
  if (!score) return <p className="muted">No matrix score available for this legacy finding.</p>;
  const metrics = [
    ['Evidence', score.evidenceStrength],
    ['Source quality', score.sourceQuality],
    ['Match', score.matchStrength],
    ['Andwell diff.', score.andwellDifferentiation],
    ['Review risk', score.reviewRisk]
  ] as const;
  return <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    marginTop: '14px',
  }}>
    {metrics.map(([label, value]) => {
      const tone = value >= 75 ? 'green' : value >= 55 ? 'amber' : 'blue';
      return <div key={label} style={{
        padding: '12px',
        borderRadius: '12px',
        background: 'rgba(2,6,23,0.36)',
        border: '1px solid rgba(148,163,184,0.16)',
      }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong style={{ fontSize: '20px', fontWeight: 900 }}>{value}</strong>
          <div className="progress-bar-container" style={{ flex: 1, height: '4px' }}>
            <div className={`progress-bar-fill progress-bar-${tone}`} style={{ width: `${value}%` }} />
          </div>
        </div>
      </div>;
    })}
  </div>;
}

function ExpandedFinding({ finding }: { finding: Finding }) {
  const sources = safeSources(finding);
  const hasAndwellAdvantage = finding.andwellAdvantage && finding.andwellAdvantage !== 'No specific advantage documented';
  const hasCompetitorAdvantage = finding.competitorAdvantage && finding.competitorAdvantage !== 'No documented advantage';
  const hasAvoidSaying = finding.avoidSaying && finding.avoidSaying !== 'No specific avoid-saying documented';

  return <tr className="matrixDetailRow"><td colSpan={8}>
  return <tr className="matrixDetailRow" style={{ animation: 'slideDown 0.3s ease-out' }}><td colSpan={8}>
    <div className="matrixDetailGrid">
      <article>
        <h3>Expert Rationale</h3>
        <p>{finding.aiInterpretation}</p>
        <div className="matrixRationaleList" role="list">
          {(finding.matrixScore?.rationale || []).map((item) => <span key={item} role="listitem">{item}</span>)}
        </div>
        <MatrixScoreBlock score={finding.matrixScore} />
      </article>
      <article>
        <h3>Andwell Comparison</h3>
        {hasAndwellAdvantage && (
          <div className="notice-success" style={{ marginBottom: '10px' }}>
            <strong>Andwell advantage</strong><br />{finding.andwellAdvantage}
          </div>
        )}
        {hasCompetitorAdvantage && (
          <div className="notice-warning" style={{ marginBottom: '10px' }}>
            <strong>Competitor advantage</strong><br />{finding.competitorAdvantage}
          </div>
        )}
        {hasAvoidSaying && (
          <div className="notice-danger" style={{ marginBottom: '10px' }}>
            <strong>Avoid saying</strong><br />{finding.avoidSaying}
          </div>
        )}
        {!hasAndwellAdvantage && !hasCompetitorAdvantage && !hasAvoidSaying && (
          <p className="muted">No specific comparison points documented.</p>
        )}
        <div className="provenance" style={{marginTop:8}}>Safe language &amp; advantages derived from Andwell catalog + claim governance review.</div>
      </div>
        <p><strong>Andwell advantage:</strong> {finding.andwellAdvantage}</p>
        <p><strong>Competitor advantage:</strong> {finding.competitorAdvantage}</p>
        <p><strong>Avoid saying:</strong> {finding.avoidSaying}</p>
        <div className="provenance" style={{marginTop:8}} aria-label="Data source">Safe language &amp; advantages derived from Andwell catalog + claim governance review.</div>
      </article>
    </div>
    <section className="matrixSources" aria-label="Reviewed evidence sources">
      <h3>Reviewed Evidence Sources</h3>
      {sources.length ? <div role="list">{sources.map((source) => <a key={`${source.url}:${source.title}`} href={source.url} target="_blank" rel="noreferrer" className="matrixSourceCard" role="listitem" aria-label={`${source.title}, opens in new window`}>
        <div><strong>{source.title}</strong><span aria-hidden="true">{source.pageType || 'Source page'} · score {source.score}</span></div>
        <p>{source.excerpt}</p>
        {source.matchedTerms.length ? <small>Matched: {source.matchedTerms.join(', ')}</small> : null}
      </a>)}</div> : <p className="muted">No specific source was captured. Treat this finding as review-required until refreshed.</p>}
    </section>
    {finding.subserviceFindings.length ? <section className="matrixSubservices" aria-label="Subservice evidence">
      <h3>Subservice Evidence</h3>
      <div role="list">
        {finding.subserviceFindings.slice(0, 12).map((sub) => <div key={sub.id} role="listitem">
          <strong>{sub.subservice}</strong>
          <Badge tone={sub.competitorStatus === 'Clearly offered' ? 'green' : sub.competitorStatus === 'Not found publicly' ? 'blue' : 'amber'}>{sub.competitorStatus}</Badge>
          <span>{sub.matrixScore ? `Score ${sub.matrixScore.overall}` : sub.confidence}</span>
        </div>)}
      </div>
    </section> : null}
  </td></tr>;
}

function extractLocationFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const location = pathParts[1];
      return location.charAt(0).toUpperCase() + location.slice(1);
    }
  } catch {
    return '';
  }
  return '';
}

export function Matrix({ currentReport, matrixFilter, setMatrixFilter, matrixSearch, setMatrixSearch, matrixSearchDebouncing, onRunScan }: { currentReport: IntelligenceReport | null; matrixFilter: MatrixFilter; setMatrixFilter: (filter: MatrixFilter) => void; matrixSearch: string; setMatrixSearch: (value: string) => void; matrixSearchDebouncing?: boolean; onRunScan?: () => void }) {
  const { showToast } = useToast();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const findings = currentReport?.allFindings || [];
  const competitorLocationMap = useMemo(() => {
    const map: Record<string, string> = {};
    currentReport?.analyses.forEach((analysis) => {
      const location = extractLocationFromUrl(analysis.url);
      map[analysis.name] = location ? `${analysis.name} - ${location}` : analysis.name;
    });
    return map;
  }, [currentReport?.analyses]);
  const stats = useMemo(() => {
    const scored = findings.filter((finding) => finding.matrixScore);
    const averageScore = scored.length ? Math.round(scored.reduce((sum, finding) => sum + (finding.matrixScore?.overall || 0), 0) / scored.length) : 0;
    const sourced = findings.filter((finding) => sourceCount(finding) > 0).length;
    const aiEnhanced = currentReport?.analyses.filter((analysis) => analysis.aiEnhanced).length || 0;
    return { averageScore, sourced, aiEnhanced };
  }, [findings, currentReport]);

  const filtered = findings.filter((finding) => {
    const search = matrixSearch.trim().toLowerCase();
    const matchesSearch = !search || [
      finding.competitorName,
      finding.serviceLine,
      finding.safeSalesWording,
      finding.evidenceExcerpt,
      finding.matrixScore?.rationale.join(' ') || '',
      finding.evidenceSources?.map((source) => `${source.title} ${source.excerpt}`).join(' ') || ''
    ].join(' ').toLowerCase().includes(search);
    if (!matchesSearch) return false;
    if (matrixFilter === 'salesReady') return finding.reviewStatus === 'Sales usable with evidence' || finding.reviewStatus === 'Approved for sales use';
    if (matrixFilter === 'review') return finding.reviewStatus !== 'Sales usable with evidence' && finding.reviewStatus !== 'Approved for sales use';
    if (matrixFilter === 'advantage') return finding.competitorStatus !== 'Clearly offered';
    if (matrixFilter === 'matched') return finding.competitorStatus === 'Clearly offered';
    return true;
  }).sort((a, b) => (b.matrixScore?.overall || 0) - (a.matrixScore?.overall || 0));

  function toggleRow(id: string) {
    setExpandedRows((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  function exportCsv() {
    setExporting(true);
    try {
      downloadCsv('andwell-evidence-matrix.csv',
        ['Competitor', 'Service Line', 'Status', 'Matrix Score', 'Sources', 'Review Status', 'Safe Field Wording'],
        filtered.map(f => [f.competitorName, f.serviceLine, f.competitorStatus, f.matrixScore?.overall ?? '', sourceCount(f), f.reviewStatus, f.safeSalesWording])
      );
      showToast(`Exported ${filtered.length} findings to CSV.`, 'success');
    } finally {
      setExporting(false);
    }
  }

  return <>
    <section className="section"><div><h1>Evidence Matrix</h1><p className="text-body">Scrubs competitor websites, compares each finding to Andwell's service taxonomy, scores evidence quality, and keeps field language tied to citations. Each row links to original sources and reviewed evidence.</p></div><Badge>{filtered.length} visible</Badge></section>
    {!currentReport ? <Panel title="No report loaded"><p className="text-body">Run a competitive scan to populate the evidence matrix with scored, sourced competitive findings across every service line.</p>{onRunScan && <button className="btn primary" style={{ marginTop: '12px' }} onClick={onRunScan}>Run Competitive Scan →</button>}</Panel> : <>
      <div className="metric-grid-4">
        <Stat label="Matrix score" value={stats.averageScore || 'N/A'} hint="Average scored finding" icon={Target} tone="purple" />
        <Stat label="Sourced rows" value={`${stats.sourced}/${findings.length}`} hint="Rows with captured evidence" icon={FileCheck} tone="green" />
        <Stat label="AI enhanced" value={stats.aiEnhanced} hint="Competitor sites with AI extraction" icon={Sparkles} tone="blue" />
        <Stat label="Pages reviewed" value={currentReport.pagesReviewed} hint="Website pages scrubbed" icon={FileText} tone="amber" />
    {!currentReport ? (
      <EmptyState
        icon="📊"
        title="No competitive data yet"
        description="The Evidence Matrix appears after running a competitive scan. It scores and sources each finding across every Andwell service line."
        action={onRunScan && <button className="btn primary" onClick={onRunScan}>Run Competitive Scan →</button>}
      />
    ) : <>
      <div className="grid cols4">
        {findings.length === 0 ? (
          <>
            <SkeletonLoader height="80px" />
            <SkeletonLoader height="80px" />
            <SkeletonLoader height="80px" />
            <SkeletonLoader height="80px" />
          </>
        ) : (
          <>
            <Stat label="Matrix score" value={stats.averageScore || 'N/A'} hint="Average scored finding" />
            <Stat label="Sourced rows" value={`${stats.sourced}/${findings.length}`} hint="Rows with captured evidence" />
            <Stat label="AI enhanced" value={stats.aiEnhanced} hint="Competitor sites with AI extraction" />
            <Stat label="Pages reviewed" value={currentReport.pagesReviewed} hint="Website pages scrubbed" />
          </>
        )}
      </div>
      <div className="matrixTrustLayout">
        <Panel title="Comparison language" variant="elevated">
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <Badge tone="green">Clearly offered</Badge>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Competitor public evidence supports a visible capability.</p>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Badge tone="blue">Not found publicly</Badge>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Visibility gap only. This is not the same as saying the competitor does not offer it.</p>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <Badge tone="amber">Needs review</Badge>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>Use only after a manager confirms wording, source quality, and field context.</p>
            </div>
          </div>
        </Panel>
        <TrustPanel metadata={currentReport.trustMetadata || buildReportTrustMetadata(currentReport)} />
      </div>
      <Panel title="Matrix controls" action={<button className="btn btn-sm" onClick={exportCsv}>Export CSV</button>}>
      <Panel title="Matrix controls" action={<button className={`btn btn-sm ${exporting ? 'btn-loading' : ''}`} onClick={exportCsv} disabled={exporting} aria-label="Export evidence matrix to CSV file">{exporting ? 'Exporting...' : 'Export CSV'}</button>}>
        <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
          <input
            className={`input searchInput ${matrixSearchDebouncing ? 'search-debouncing' : ''}`}
            value={matrixSearch}
            onChange={(event) => setMatrixSearch(event.target.value)}
            placeholder="Search competitor, service, evidence, rationale, or safe wording"
            aria-label="Search evidence matrix by competitor, service line, evidence, rationale, or safe wording"
          />
          <div role="group" aria-label="Filter evidence matrix by status">
            {(['all', 'salesReady', 'review', 'advantage', 'matched'] as MatrixFilter[]).map((filter) => <button key={filter} className={`btn ${matrixFilter === filter ? 'primary' : ''}`} onClick={() => setMatrixFilter(filter)} aria-pressed={matrixFilter === filter}>{filter === 'all' ? 'All' : filter === 'salesReady' ? 'Sales ready' : filter === 'review' ? 'Needs review' : filter === 'advantage' ? 'Potential advantage' : 'Public matches'}</button>)}
          </div>
        </div>
      </Panel>
      {findings.length > 0 && filtered.length === 0 && (
        <Panel title="No findings match">
          <p className="text-body">No findings match the current filter or search term.</p>
          <div className="row" style={{ gap: '8px', marginTop: '12px' }}>
            {matrixSearch && <button className="btn btn-sm" onClick={() => setMatrixSearch('')}>Clear search</button>}
            {matrixFilter !== 'all' && <button className="btn btn-sm" onClick={() => setMatrixFilter('all')}>Show all findings</button>}
          </div>
        </Panel>
      )}
      {findings.length === 0 && currentReport && (
        <Panel title="Loading evidence matrix">
          <SkeletonTable rows={5} />
        </Panel>
      )}
      {filtered.length > 0 && <div className="tableWrap proTable evidenceMatrixTable" role="region" aria-label="Evidence matrix findings"><table className="table-compact" role="grid" aria-label="Competitive findings scored and sourced across Andwell service lines"><thead><tr><th>Competitor</th><th>Andwell service</th><th>Status</th><th>Matrix score</th><th>Sources</th><th>Depth</th><th>Review</th><th>Safe field wording</th></tr></thead><tbody>{filtered.map((finding) => {
        const details = computeConfidenceDetails({ status: finding.competitorStatus, sourceCount: sourceCount(finding), hasFreshSource: sourceCount(finding) > 0, hasCmsSupport: false, hasInternalValidation: finding.reviewStatus === 'Approved for sales use', competitorOverlap: finding.competitorStatus === 'Clearly offered' ? 'High' : finding.competitorStatus === 'Not found publicly' ? 'Low' : 'Moderate', humanReviewed: finding.reviewStatus === 'Approved for sales use' || finding.reviewStatus === 'Rejected' });
        const isExpanded = expandedRows.has(finding.id);
        const isNotFound = finding.competitorStatus === 'Not found publicly';
        return <React.Fragment key={finding.id}>
          <tr onClick={() => toggleRow(finding.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleRow(finding.id)} role="button" tabIndex={0} aria-expanded={isExpanded} aria-label={`${competitorLocationMap[finding.competitorName] || finding.competitorName} - ${finding.serviceLine} - ${finding.competitorStatus}, matrix score ${finding.matrixScore?.overall || 'unscored'}`} style={{ cursor: 'pointer' }}>
            <td><strong>{competitorLocationMap[finding.competitorName] || finding.competitorName}</strong><small aria-hidden="true">{isExpanded ? 'Hide evidence' : 'Open evidence'}</small></td>
            <td><strong>{finding.serviceLine}</strong><small>{finding.clearlyMatchedSubservices}/{finding.totalSubservices} subservices matched</small></td>
            <td className={isNotFound ? 'notFoundStatusCell' : ''}><Badge tone={finding.competitorStatus === 'Clearly offered' ? 'green' : isNotFound ? 'blue' : 'amber'}>{finding.competitorStatus}</Badge>{isNotFound ? <small>Public visibility gap, not proof of absence</small> : null}</td>
            <td><Badge tone={scoreTone(finding.matrixScore?.overall || 0)}>{scoreLabel(finding.matrixScore)}</Badge><small>{finding.matrixScore ? `${finding.matrixScore.evidenceStrength} evidence` : 'Legacy row'}</small></td>
            <td><strong>{sourceCount(finding)}</strong><small>{safeSources(finding)[0]?.pageType || 'No page type'}</small></td>
            <td><strong>{finding.subserviceDepthScore}%</strong><small>subservice depth</small></td>
            <td><Badge tone={reviewTone(finding.reviewStatus)}>{finding.reviewStatus}</Badge><ConfidenceBadge confidence={details} details /></td>
            <td>
              <p>{finding.safeSalesWording}</p>
              <div style={{marginTop: 4}}><span className="expert-badge governed">Governed</span></div>
            </td>
          </tr>
          {isExpanded ? <ExpandedFinding finding={finding} /> : null}
        </React.Fragment>;
      })}</tbody></table></div>}
    </>}
  </>;
}
