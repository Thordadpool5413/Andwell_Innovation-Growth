'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { scenarioPresets, buildComparison } from '../../../lib/scenario-presets';
import { buildGrowthRows, summarizeGrowth } from '../../../lib/growth-plan';
import { money, whole } from '../../../lib/command-center/utils';
import type { GrowthScenario, GrowthRow, GrowthTotals } from '../../../lib/growth-plan';

export function ScenarioPresets({ scenario, setScenario, growthRows }: { scenario: GrowthScenario; setScenario: (value: GrowthScenario | ((current: GrowthScenario) => GrowthScenario)) => void; growthRows: GrowthRow[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(['base-case', 'aggressive', 'staffing-constrained']);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const currentTotals = useMemo(() => summarizeGrowth(growthRows), [growthRows]);
  const comparison = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return buildComparison(selectedIds);
  }, [selectedIds]);

  function toggleSelection(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  function applyPreset(id: string) {
    const preset = scenarioPresets.find((p) => p.id === id);
    if (preset) {
      setScenario(preset.scenario);
      setActivePreset(id);
    }
  }

  return <>
    <section className="section">
      <div>
        <h1>Scenario Presets</h1>
        <p className="text-body">Named scenario templates for rapid modeling. Select presets to compare side-by-side, or apply one to the current growth model.</p>
      </div>
      <Badge>{selectedIds.length} selected</Badge>
    </section>
    <SectionGroup title="Preset templates">
      <div className="grid cols2">{scenarioPresets.map((preset) => {
        const isSelected = selectedIds.includes(preset.id);
        const isActive = activePreset === preset.id;
        return <div key={preset.id} className="hover-card" style={{
          padding: '16px', borderRadius: 'var(--radius)',
          border: `1px solid ${isActive ? 'var(--color-success)' : isSelected ? 'var(--color-info)' : 'var(--color-border)'}`,
          background: isActive ? 'rgba(34,197,94,0.05)' : isSelected ? 'rgba(59,130,246,0.05)' : 'var(--color-bg-secondary)',
          cursor: 'pointer'
        }}>
          <div className="row spread" style={{ marginBottom: '8px' }}>
            <h4 style={{ margin: 0 }}>{preset.name}</h4>
            {isActive && <Badge tone="green">Active</Badge>}
          </div>
          <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{preset.description}</p>
          <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
            <span>Conversion: {preset.scenario.conversionRate * 100}% | </span>
            <span>HH: {preset.scenario.hhCapture.map((v) => (v * 100).toFixed(0) + '%').join('/')} | </span>
            <span>Wound: {preset.scenario.woundCapture.map((v) => (v * 100).toFixed(0) + '%').join('/')}</span>
          </div>
          <div className="row" style={{ gap: '6px' }}>
            <button className={`btn btn-sm ${isSelected ? 'primary' : ''}`} onClick={() => toggleSelection(preset.id)}>
              {isSelected ? 'Selected' : 'Compare'}
            </button>
            <button className="btn btn-sm" onClick={() => applyPreset(preset.id)}>Apply</button>
          </div>
        </div>;
      })}</div>
    </SectionGroup>

    <SectionGroup title="Current scenario (active)" action={<Badge>{activePreset ? scenarioPresets.find((p) => p.id === activePreset)?.name || 'Custom' : 'Custom'}</Badge>}>
      <div className="grid cols4">
        <Panel title="Y1 revenue"><strong style={{ fontSize: '24px' }}>{money(currentTotals.revenue[0])}</strong><p className="text-xs">{whole(currentTotals.starts[0])} starts</p></Panel>
        <Panel title="Y3 revenue"><strong style={{ fontSize: '24px' }}>{money(currentTotals.revenue[2])}</strong><p className="text-xs">{whole(currentTotals.referrals[2])} referrals</p></Panel>
        <Panel title="Total contribution"><strong style={{ fontSize: '24px' }}>{money(currentTotals.totalContribution)}</strong></Panel>
        <Panel title="Total referrals"><strong style={{ fontSize: '24px' }}>{whole(currentTotals.totalReferrals)}</strong></Panel>
      </div>
    </SectionGroup>

    {comparison && comparison.presets.length >= 2 &&
      <SectionGroup title="Side-by-side comparison">
        <div className="tableWrap proTable">
          <table className="table-compact">
            <thead>
              <tr>
                <th>Metric</th>
                {comparison.presets.map((p) => <th key={p.id}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {(['Y1 Revenue', 'Y3 Revenue', 'Total Revenue', 'Y1 Starts', 'Y3 Starts', 'Y1 Referrals', 'Y3 Referrals', 'Total Contribution'] as const).map((metric) =>
                <tr key={metric}>
                  <td><span className="text-small" style={{ fontWeight: 600 }}>{metric}</span></td>
                  {comparison.presets.map((p) => {
                    const t = comparison.totals[p.id];
                    let value = '';
                    if (metric === 'Y1 Revenue') value = money(t.revenue[0]);
                    else if (metric === 'Y3 Revenue') value = money(t.revenue[2]);
                    else if (metric === 'Total Revenue') value = money(t.totalRevenue);
                    else if (metric === 'Y1 Starts') value = whole(t.starts[0]);
                    else if (metric === 'Y3 Starts') value = whole(t.starts[2]);
                    else if (metric === 'Y1 Referrals') value = whole(t.referrals[0]);
                    else if (metric === 'Y3 Referrals') value = whole(t.referrals[2]);
                    else if (metric === 'Total Contribution') value = money(t.totalContribution);
                    return <td key={p.id}><strong>{value}</strong></td>;
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionGroup>
    }
  </>;
}
