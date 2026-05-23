'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { scenarioPresets, buildComparison } from '../../../lib/scenario-presets';
import { buildGrowthRows, summarizeGrowth } from '../../../lib/growth-plan';
import { money, whole } from '../../../lib/command-center/utils';
import type { GrowthScenario, GrowthRow, GrowthTotals } from '../../../lib/growth-plan';

type SavedScenario = { id: string; name: string; savedAt: string; scenario: GrowthScenario };

function loadSavedScenarios(): SavedScenario[] {
  try { const v = localStorage.getItem('andwell:savedScenarios'); return v ? (JSON.parse(v) as SavedScenario[]) : []; } catch { return []; }
}

function persistSaved(items: SavedScenario[]) {
  try { localStorage.setItem('andwell:savedScenarios', JSON.stringify(items)); } catch {}
}

export function ScenarioPresets({ scenario, setScenario, growthRows }: { scenario: GrowthScenario; setScenario: (value: GrowthScenario | ((current: GrowthScenario) => GrowthScenario)) => void; growthRows: GrowthRow[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(['base-case', 'aggressive', 'staffing-constrained']);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => loadSavedScenarios());
  const [saveName, setSaveName] = useState('');

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

  function saveCurrentScenario() {
    const name = saveName.trim();
    if (!name) return;
    const item: SavedScenario = { id: `custom-${Date.now()}`, name, savedAt: new Date().toLocaleString(), scenario };
    const next = [item, ...savedScenarios].slice(0, 12);
    setSavedScenarios(next);
    persistSaved(next);
    setSaveName('');
  }

  function applySaved(item: SavedScenario) {
    setScenario(item.scenario);
    setActivePreset(null);
  }

  function deleteSaved(id: string) {
    const next = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(next);
    persistSaved(next);
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
        const presetClass = isActive ? 'status-card--success' : isSelected ? 'status-card--info' : 'list-card';
        return <div key={preset.id} className={`hover-card status-card ${presetClass}`} style={{ padding: '16px', cursor: 'pointer' }}>
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

    <SectionGroup title="Save current scenario">
      <Panel title="Name and save">
        <p className="muted" style={{ marginBottom: '10px', fontSize: '13px' }}>Save the current slider configuration as a named scenario to load later.</p>
        <div className="row" style={{ gap: '8px' }}>
          <input
            className="input"
            type="text"
            placeholder="e.g. Conservative launch, Q3 target…"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && saveName.trim()) saveCurrentScenario(); }}
            style={{ flex: 1 }}
          />
          <button className="btn primary" disabled={!saveName.trim()} onClick={saveCurrentScenario}>Save</button>
        </div>
      </Panel>
    </SectionGroup>

    {savedScenarios.length > 0 && (
      <SectionGroup title={`Saved scenarios (${savedScenarios.length})`}>
        <div className="grid cols2">
          {savedScenarios.map((item) => (
            <div key={item.id} className="list-card hover-card" style={{ padding: '14px' }}>
              <div className="row spread" style={{ marginBottom: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '14px' }}>{item.name}</h4>
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.savedAt}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '10px' }}>
                <span>Conv: {Math.round(item.scenario.conversionRate * 100)}% | </span>
                <span>HH: {item.scenario.hhCapture.map(v => Math.round(v * 100) + '%').join('/')} | </span>
                <span>Wound: {item.scenario.woundCapture.map(v => Math.round(v * 100) + '%').join('/')}</span>
              </div>
              <div className="row" style={{ gap: '6px' }}>
                <button className="btn btn-sm primary" onClick={() => applySaved(item)}>Apply</button>
                <button className="btn btn-sm" onClick={() => deleteSaved(item.id)} style={{ color: 'var(--color-danger)' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </SectionGroup>
    )}
  </>;
}
