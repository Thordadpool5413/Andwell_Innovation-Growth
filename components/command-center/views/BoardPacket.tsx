'use client';

import React, { useMemo } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { generateBoardPacket } from '../../../lib/strategy-brief';
import { money } from '../../../lib/command-center/utils';
import type { IntelligenceReport } from '../../../lib/types';
import type { GrowthRow, GrowthTotals, StaffingPlanItem } from '../../../lib/growth-plan';

export function BoardPacket({ currentReport, growthRows, totals, staffingPlan }: { currentReport: IntelligenceReport | null; growthRows: GrowthRow[]; totals: GrowthTotals; staffingPlan: StaffingPlanItem[] }) {
  const packet = useMemo(() => generateBoardPacket(currentReport, growthRows, totals, staffingPlan), [currentReport, growthRows, totals, staffingPlan]);

  function handleExport() {
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'andwell-board-packet.json'; link.click(); URL.revokeObjectURL(url);
  }

  return <>
    <section className="section">
      <div>
        <h1>Board Packet Mode</h1>
        <p className="text-body">Full export layout: executive summary, market opportunity, financial model, priority counties, staffing, risks, and appendix.</p>
      </div>
      <button className="btn primary" onClick={handleExport}>Export Board Packet (JSON)</button>
    </section>
    <div className="card" style={{ marginBottom: '16px' }}>
      <h3 className="text-subhead">{packet.title}</h3>
      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Generated {packet.generatedAt}</span>
    </div>
    <div className="card" style={{ marginBottom: '16px' }}>
      <h3 className="text-subhead">Executive Summary</h3>
      <p className="text-body" style={{ margin: '8px 0 0' }}>{packet.executiveSummary}</p>
    </div>
    <div className="card" style={{ marginBottom: '16px' }}>
      <h3 className="text-subhead">Market Opportunity</h3>
      <p className="text-body" style={{ margin: '8px 0 0' }}>{packet.marketOpportunity}</p>
    </div>
    <SectionGroup title="Financial Model">
      <div className="grid cols4">{packet.financialModel.map((m, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <p className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>{m.label}</p>
          <strong style={{ fontSize: '20px' }}>{m.value}</strong>
        </div>
      )}</div>
    </SectionGroup>
    <SectionGroup title="Priority Counties">
      <div className="grid cols2">{packet.priorityCounties.map((pc, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <div className="row spread" style={{ marginBottom: '4px' }}>
            <h4 style={{ margin: 0 }}>{pc.county}</h4>
            <Badge>{pc.service}</Badge>
          </div>
          <p className="text-small" style={{ margin: '0 0 4px', color: 'var(--color-text-secondary)' }}>{pc.rationale}</p>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Y1 revenue: {pc.revenue}</span>
        </div>
      )}</div>
    </SectionGroup>
    <SectionGroup title="Staffing Summary">
      <div className="grid cols3">{packet.staffingSummary.map((s, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <h4 style={{ margin: '0 0 4px' }}>{s.role}</h4>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <span>Y1: {s.y1Fte} FTE | Y3: {s.y3Fte} FTE</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Y1 cost: {s.costY1}</span>
        </div>
      )}</div>
    </SectionGroup>
    <SectionGroup title="Risks & Mitigations">
      <div style={{ display: 'grid', gap: '8px' }}>{packet.risks.map((r, i) =>
        <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <div className="row spread" style={{ marginBottom: '4px' }}>
            <span className="text-small" style={{ fontWeight: 600 }}>{r.risk}</span>
            <Badge tone={r.severity === 'High' ? 'red' : r.severity === 'Medium' ? 'amber' : 'green'}>{r.severity}</Badge>
          </div>
          <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>Mitigation: {r.mitigation}</p>
        </div>
      )}</div>
    </SectionGroup>
    <SectionGroup title="Appendix">
      <div style={{ display: 'grid', gap: '6px' }}>{packet.appendix.map((a, i) =>
        <div key={i} style={{ padding: '8px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <span className="text-small">{a}</span>
        </div>
      )}</div>
    </SectionGroup>
  </>;
}
