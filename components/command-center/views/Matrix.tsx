'use client';

import React, { useMemo, useState } from 'react';
import { Badge, ConfidenceBadge, Panel, Stat } from '../Shared';
import { computeConfidenceDetails } from '../../../lib/smart-ranking';
import type { MatrixFilter } from '../../../lib/command-center/types';
import type { Finding, IntelligenceReport, MatrixScore } from '../../../lib/types';

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
  return <div className="matrixScoreBlock">
    {metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
  </div>;
}

function ExpandedFinding({ finding }: { finding: Finding }) {
  const sources = safeSources(finding);
  return <tr className="matrixDetailRow"><td colSpan={8}>
    <div className="matrixDetailGrid">
      <div>
        <h3>Expert Rationale</h3>
        <p>{finding.aiInterpretation}</p>
        <div className="matrixRationaleList">
          {(finding.matrixScore?.rationale || []).map((item) => <span key={item}>{item}</span>)}
        </div>
        <MatrixScoreBlock score={finding.matrixScore} />
      </div>
      <div>
        <h3>Andwell Comparison</h3>
        <p><strong>Andwell advantage:</strong> {finding.andwellAdvantage}</p>
        <p><strong>Competitor advantage:</strong> {finding.competitorAdvantage}</p>
        <p><strong>Avoid saying:</strong> {finding.avoidSaying}</p>
      </div>
    </div>
    <div className="matrixSources">
      <h3>Reviewed Evidence Sources</h3>
      {sources.length ? sources.map((source) => <a key={`${source.url}:${source.title}`} href={source.url} target="_blank" rel="noreferrer" className="matrixSourceCard">
        <div><strong>{source.title}</strong><span>{source.pageType || 'Source page'} · score {source.score}</span></div>
        <p>{source.excerpt}</p>
        {source.matchedTerms.length ? <small>Matched: {source.matchedTerms.join(', ')}</small> : null}
      </a>) : <p className="muted">No specific source was captured. Treat this finding as review-required until refreshed.</p>}
    </div>
    {finding.subserviceFindings.length ? <div className="matrixSubservices">
      <h3>Subservice Evidence</h3>
      {finding.subserviceFindings.slice(0, 12).map((sub) => <div key={sub.id}>
        <strong>{sub.subservice}</strong>
        <Badge tone={sub.competitorStatus === 'Clearly offered' ? 'green' : sub.competitorStatus === 'Not found publicly' ? 'blue' : 'amber'}>{sub.competitorStatus}</Badge>
        <span>{sub.matrixScore ? `Score ${sub.matrixScore.overall}` : sub.confidence}</span>
      </div>)}
    </div> : null}
  </td></tr>;
}

export function Matrix({ currentReport, matrixFilter, setMatrixFilter, matrixSearch, setMatrixSearch }: { currentReport: IntelligenceReport | null; matrixFilter: MatrixFilter; setMatrixFilter: (filter: MatrixFilter) => void; matrixSearch: string; setMatrixSearch: (value: string) => void }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const findings = currentReport?.allFindings || [];
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

  return <>
    <section className="section"><div><h1>Evidence Matrix</h1><p className="text-body">Scrubs competitor websites, compares each finding to Andwell's service taxonomy, scores evidence quality, and keeps field language tied to citations.</p></div><Badge>{filtered.length} visible</Badge></section>
    {!currentReport ? <Panel title="No report loaded"><p className="text-body">Run or load a report to populate the matrix.</p></Panel> : <>
      <div className="grid cols4">
        <Stat label="Matrix score" value={stats.averageScore || 'N/A'} hint="Average scored finding" />
        <Stat label="Sourced rows" value={`${stats.sourced}/${findings.length}`} hint="Rows with captured evidence" />
        <Stat label="AI enhanced" value={stats.aiEnhanced} hint="Competitor sites with AI extraction" />
        <Stat label="Pages reviewed" value={currentReport.pagesReviewed} hint="Website pages scrubbed" />
      </div>
      <Panel title="Matrix controls">
        <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
          <input className="input searchInput" value={matrixSearch} onChange={(event) => setMatrixSearch(event.target.value)} placeholder="Search competitor, service, evidence, rationale, or safe wording" />
          {(['all', 'salesReady', 'review', 'advantage', 'matched'] as MatrixFilter[]).map((filter) => <button key={filter} className={`btn ${matrixFilter === filter ? 'primary' : ''}`} onClick={() => setMatrixFilter(filter)}>{filter === 'all' ? 'All' : filter === 'salesReady' ? 'Sales ready' : filter === 'review' ? 'Needs review' : filter === 'advantage' ? 'Potential advantage' : 'Public matches'}</button>)}
        </div>
      </Panel>
      <div className="tableWrap proTable evidenceMatrixTable"><table className="table-compact"><thead><tr><th>Competitor</th><th>Andwell service</th><th>Status</th><th>Matrix score</th><th>Sources</th><th>Depth</th><th>Review</th><th>Safe field wording</th></tr></thead><tbody>{filtered.map((finding) => {
        const details = computeConfidenceDetails({ status: finding.competitorStatus, sourceCount: sourceCount(finding), hasFreshSource: sourceCount(finding) > 0, hasCmsSupport: false, hasInternalValidation: finding.reviewStatus === 'Approved for sales use', competitorOverlap: finding.competitorStatus === 'Clearly offered' ? 'High' : finding.competitorStatus === 'Not found publicly' ? 'Low' : 'Moderate', humanReviewed: finding.reviewStatus === 'Approved for sales use' || finding.reviewStatus === 'Rejected' });
        const isExpanded = expandedRows.has(finding.id);
        return <React.Fragment key={finding.id}>
          <tr onClick={() => toggleRow(finding.id)} style={{ cursor: 'pointer' }}>
            <td><strong>{finding.competitorName}</strong><small>{isExpanded ? 'Hide evidence' : 'Open evidence'}</small></td>
            <td><strong>{finding.serviceLine}</strong><small>{finding.clearlyMatchedSubservices}/{finding.totalSubservices} subservices matched</small></td>
            <td><Badge tone={finding.competitorStatus === 'Clearly offered' ? 'green' : finding.competitorStatus === 'Not found publicly' ? 'blue' : 'amber'}>{finding.competitorStatus}</Badge></td>
            <td><Badge tone={scoreTone(finding.matrixScore?.overall || 0)}>{scoreLabel(finding.matrixScore)}</Badge><small>{finding.matrixScore ? `${finding.matrixScore.evidenceStrength} evidence` : 'Legacy row'}</small></td>
            <td><strong>{sourceCount(finding)}</strong><small>{safeSources(finding)[0]?.pageType || 'No page type'}</small></td>
            <td><strong>{finding.subserviceDepthScore}%</strong><small>subservice depth</small></td>
            <td><Badge tone={reviewTone(finding.reviewStatus)}>{finding.reviewStatus}</Badge><ConfidenceBadge confidence={details} details /></td>
            <td><p>{finding.safeSalesWording}</p></td>
          </tr>
          {isExpanded ? <ExpandedFinding finding={finding} /> : null}
        </React.Fragment>;
      })}</tbody></table></div>
    </>}
  </>;
}
