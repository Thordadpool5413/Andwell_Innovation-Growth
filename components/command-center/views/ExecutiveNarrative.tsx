'use client';

import React, { useMemo } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { generateExecutiveNarrative } from '../../../lib/strategy-brief';
import type { IntelligenceReport } from '../../../lib/types';
import type { GrowthRow, GrowthTotals } from '../../../lib/growth-plan';

export function ExecutiveNarrative({ currentReport, growthRows, totals }: { currentReport: IntelligenceReport | null; growthRows: GrowthRow[]; totals: GrowthTotals }) {
  const narrative = useMemo(() => generateExecutiveNarrative(currentReport, growthRows, totals), [currentReport, growthRows, totals]);

  return <>
    <section className="section">
      <div>
        <h1>Executive Narrative Engine</h1>
        <p className="text-body">Auto-generated leadership narrative including executive readout, board narrative, risk summary, and launch recommendations.</p>
      </div>
      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{narrative.generatedAt}</span>
    </section>
    {!currentReport && (
      <div className="notice" style={{ marginBottom: '16px', marginTop: 0 }}>
        <strong>No competitive data loaded.</strong> This narrative is based on your growth model only. Run a competitive scan in Competitor Intake to add live market intelligence.
      </div>
    )}
    <div className="card expert-surface" style={{ marginBottom: '16px' }}>
      <div className="row spread" style={{marginBottom:6}}>
        <h3 className="text-subhead">Executive Readout</h3>
        <span className="expert-badge governed">Andwell Expert Layer</span>
      </div>
      <p className="text-body" style={{ margin: '8px 0 0' }}>{narrative.executiveReadout}</p>
      <div className="provenance" style={{marginTop:8}}>Derived from governed competitive intelligence and Andwell catalog.</div>
    </div>
    <div className="card expert-surface" style={{ marginBottom: '16px' }}>
      <div className="row spread" style={{marginBottom:6}}>
        <h3 className="text-subhead">Board Narrative</h3>
        <span className="governance-pill">Governed</span>
      </div>
      <p className="text-body" style={{ margin: '8px 0 0' }}>{narrative.boardNarrative}</p>
    </div>
    <div className="grid cols2" style={{ marginBottom: '16px' }}>
      <div className="card">
        <h3 className="text-subhead" style={{ color: 'var(--color-danger)' }}>Risk Summary</h3>
        <p className="text-small" style={{ margin: '8px 0 0', color: 'var(--color-text-secondary)' }}>{narrative.riskSummary}</p>
      </div>
      <div className="card">
        <h3 className="text-subhead" style={{ color: 'var(--color-success)' }}>Launch Recommendation</h3>
        <p className="text-small" style={{ margin: '8px 0 0', color: 'var(--color-text-secondary)' }}>{narrative.launchRecommendation}</p>
      </div>
    </div>
    <SectionGroup title="Strategic Priorities">
      <div className="list-grid">{narrative.strategicPriorities.map((p, i) =>
        <div key={i} className="list-card hover-card">
          <div className="row" style={{ gap: '8px' }}>
            <Badge>{i + 1}</Badge>
            <span className="text-small">{p}</span>
          </div>
        </div>
      )}</div>
    </SectionGroup>
  </>;
}
