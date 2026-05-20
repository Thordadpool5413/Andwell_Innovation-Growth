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
    <div className="card" style={{ marginBottom: '16px' }}>
      <h3 className="text-subhead">Executive Readout</h3>
      <p className="text-body" style={{ margin: '8px 0 0' }}>{narrative.executiveReadout}</p>
    </div>
    <div className="card" style={{ marginBottom: '16px' }}>
      <h3 className="text-subhead">Board Narrative</h3>
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
      <div style={{ display: 'grid', gap: '8px' }}>{narrative.strategicPriorities.map((p, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <div className="row" style={{ gap: '8px' }}>
            <Badge>{i + 1}</Badge>
            <span className="text-small">{p}</span>
          </div>
        </div>
      )}</div>
    </SectionGroup>
  </>;
}
