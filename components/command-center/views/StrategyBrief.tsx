'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { generateStrategyBrief } from '../../../lib/strategy-brief';
import type { IntelligenceReport } from '../../../lib/types';
import type { GrowthRow, GrowthTotals } from '../../../lib/growth-plan';
import type { BriefAudience } from '../../../lib/strategy-brief';

const audiences: BriefAudience[] = ['Executive', 'Sales Leader', 'Field Rep', 'Board', 'Compliance', 'Referral Partner'];

export function StrategyBrief({ currentReport, growthRows, totals }: { currentReport: IntelligenceReport | null; growthRows: GrowthRow[]; totals: GrowthTotals }) {
  const [audience, setAudience] = useState<BriefAudience>('Executive');

  const brief = useMemo(() => generateStrategyBrief(audience, currentReport, growthRows, totals), [audience, currentReport, growthRows, totals]);

  return <>
    <section className="section">
      <div>
        <h1>AI Strategy Brief</h1>
        <p className="text-body">Generate multi-audience strategy briefs from competitive intelligence and growth model data.</p>
      </div>
      <Badge>{brief.audience}</Badge>
    </section>
    <Panel title="Audience selector">
      <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
        {audiences.map((a) => <button key={a} className={`btn ${audience === a ? 'primary' : ''}`} onClick={() => setAudience(a)}>{a}</button>)}
      </div>
    </Panel>
    <SectionGroup title={brief.title} action={<span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{brief.generatedAt}</span>}>
      <div className="card">
        <p className="text-body">{brief.summary}</p>
        <div className="grid cols4" style={{ margin: '16px 0' }}>
          {brief.keyMetrics.map((m) => <div key={m.label} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <p className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>{m.label}</p>
            <strong style={{ fontSize: '20px' }}>{m.value}</strong>
          </div>)}
        </div>
        <div style={{ display: 'grid', gap: '16px' }}>
          {brief.sections.map((section, i) =>
            <div key={i}>
              <h4 className="text-subhead" style={{ marginBottom: '4px' }}>{section.heading}</h4>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{section.content}</p>
            </div>
          )}
        </div>
      </div>
    </SectionGroup>
  </>;
}
