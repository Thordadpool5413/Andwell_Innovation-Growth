'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Panel, Stat } from '../Shared';
import { useToast } from '../../../components/Toast';
import { money, whole, percent } from '../../../lib/command-center/utils';
import type { View } from '../../../lib/command-center/types';
import { buildGrowthRows, growthDefaultScenario, summarizeGrowth } from '../../../lib/growth-plan';
import type { GrowthRow, GrowthTotals, GrowthScenario, GrowthServiceName } from '../../../lib/growth-plan';
import type { IntelligenceReport } from '../../../lib/types';

const serviceToAndwellLines: Record<GrowthServiceName, string[]> = {
  'Home Healthcare': ['home healthcare', 'in home care', 'dementia care'],
  'Mobile Wound': ['mobile wound'],
  'Therapy Care': ['pediatric therapy', 'adult therapy', 'audiology', 'behavioral health'],
};

function ScenarioControl({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return <label className="scenarioControl"><span>{label}</span><strong>{percent(value)}</strong><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><input className="input" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export function GrowthCommand({ rows, totals, serviceRollup, scenario, setScenario, setView, currentReport }: { rows: GrowthRow[]; totals: GrowthTotals; serviceRollup: { service: string; role: string; color: string; y1Revenue: number; y3Starts: number }[]; scenario: GrowthScenario; setScenario: (value: GrowthScenario | ((current: GrowthScenario) => GrowthScenario)) => void; setView: (view: View) => void; currentReport?: IntelligenceReport | null }) {
  const topRows = [...rows].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 8);
  const priorityOneCount = rows.filter((row) => row.launchGroup === 'Priority 1').length;
  const updateCapture = (key: 'hhCapture' | 'woundCapture' | 'therapyCapture', value: number) => {
    setScenario((current) => ({ ...current, [key]: [value, Math.min(value * 1.5, 0.75), Math.min(value * 2, 0.9)] as [number, number, number] }));
  };

  const { showToast } = useToast();
  const [quickSaveName, setQuickSaveName] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareScenario, setCompareScenario] = useState<GrowthScenario>(growthDefaultScenario);
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [narrativeSource, setNarrativeSource] = useState<'ai' | 'template' | null>(null);
  const [narrativeBusy, setNarrativeBusy] = useState(false);

  function quickSave() {
    const name = quickSaveName.trim();
    if (!name) return;
    try {
      const saved = localStorage.getItem('andwell:savedScenarios');
      const existing = saved ? JSON.parse(saved) as { id: string; name: string; savedAt: string; scenario: GrowthScenario }[] : [];
      const item = { id: `custom-${Date.now()}`, name, savedAt: new Date().toLocaleString(), scenario };
      localStorage.setItem('andwell:savedScenarios', JSON.stringify([item, ...existing].slice(0, 12)));
      setQuickSaveName('');
      showToast(`Scenario "${name}" saved.`, 'success');
    } catch { showToast('Failed to save scenario.', 'error'); }
  }

  async function generateNarrative() {
    setNarrativeBusy(true);
    try {
      const res = await fetch('/api/growth-narrative', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ totals, rows, scenario })
      });
      const data = await res.json() as { narrative?: string; source?: 'ai' | 'template' };
      if (data.narrative) { setAiNarrative(data.narrative); setNarrativeSource(data.source || null); }
    } catch { /* silent */ } finally { setNarrativeBusy(false); }
  }
  const baseTotals = useMemo(() => summarizeGrowth(buildGrowthRows(growthDefaultScenario)), []);
  const compareRows = useMemo(() => compareMode ? buildGrowthRows(compareScenario) : [], [compareMode, compareScenario]);
  const compareTotals = useMemo(() => compareMode ? summarizeGrowth(compareRows) : null, [compareMode, compareRows]);
  const updateCompareCapture = (key: 'hhCapture' | 'woundCapture' | 'therapyCapture', value: number) => {
    setCompareScenario((current) => ({ ...current, [key]: [value, Math.min(value * 1.5, 0.75), Math.min(value * 2, 0.9)] as [number, number, number] }));
  };

  const y1Delta = totals.revenue[0] - baseTotals.revenue[0];
  const y3Delta = totals.revenue[2] - baseTotals.revenue[2];
  const contribDelta = totals.totalContribution - baseTotals.totalContribution;
  const deltaSpan = (d: number, fmt: (n: number) => string) => d !== 0
    ? <span style={{ color: d > 0 ? 'var(--color-success)' : 'var(--color-danger)', marginLeft: '4px', fontWeight: 700 }}>{d > 0 ? '+' : ''}{fmt(d)}</span>
    : null;

  return <>
    <section className="hero growthHero">
      <div className="row spread"><Badge tone="dark">Merged app intelligence</Badge><Badge tone="green">{priorityOneCount} priority launches</Badge></div>
      <h1>Turn competitive evidence into a smarter growth plan before the field makes the first call.</h1>
      <p>The scenario engine from the growth-planning app is now fused with the competitive intelligence engine, so leadership can see county demand, service-line economics, referral volume, and execution priorities in the same place as competitor evidence.</p>
      <div className="row">
        <button className="btn primary" onClick={() => setView('board')}>Create Board View</button>
        <button className="btn" onClick={() => setView('launch')}>View Launch Plan</button>
        <button className="btn" onClick={() => setView('intake')}>Run Competitor Scan</button>
        <button className={`btn${compareMode ? ' primary' : ''}`} onClick={() => setCompareMode(v => !v)}>{compareMode ? 'Exit Compare' : 'Compare Scenarios'}</button>
      </div>
    </section>
    <div className="grid cols4">
      <Stat label="Year 1 revenue" value={money(totals.revenue[0])} hint={<>{whole(totals.starts[0])} starts{deltaSpan(y1Delta, money)}</>} />
      <Stat label="Year 3 revenue" value={money(totals.revenue[2])} hint={<>{whole(totals.referrals[2])} referrals{deltaSpan(y3Delta, money)}</>} />
      <Stat label="3 year contribution" value={money(totals.totalContribution)} hint={<>Margin adjusted{deltaSpan(contribDelta, money)}</>} />
      <Stat label="Priority counties" value={rows.length} hint="CMS modeled markets" />
    </div>
    {currentReport && currentReport.competitorScores.length > 0 ? (() => {
      const topThreat = [...currentReport.competitorScores].sort((a, b) =>
        (b.serviceLineMatchScore + b.subserviceDepthScore) - (a.serviceLineMatchScore + a.subserviceDepthScore)
      )[0];
      const serviceThreatMap = new Map<string, { competitor: string; level: string }>();
      for (const [growthService, keywords] of Object.entries(serviceToAndwellLines)) {
        const topForService = [...currentReport.competitorScores].sort((a, b) => {
          const aMatch = a.strongestMatches.filter(m => keywords.some(k => m.toLowerCase().includes(k))).length;
          const bMatch = b.strongestMatches.filter(m => keywords.some(k => m.toLowerCase().includes(k))).length;
          return bMatch - aMatch;
        })[0];
        if (topForService && topForService.strongestMatches.some(m => keywords.some(k => m.toLowerCase().includes(k)))) {
          serviceThreatMap.set(growthService, { competitor: topForService.competitorName, level: topForService.threatLevel });
        }
      }
      return (
        <div className="notice" style={{ marginBottom: '16px' }}>
          <div className="row spread" style={{ marginBottom: serviceThreatMap.size > 0 ? '10px' : '0' }}>
            <div>
              <strong>Competitive context:</strong> {topThreat.competitorName} is the highest-overlap competitor — {topThreat.serviceLineMatchScore}% service line match, {topThreat.andwellDifferentiationScore}% Andwell differentiation opportunity.
              {topThreat.strongestMatches.length > 0 && <> Shared: {topThreat.strongestMatches.slice(0, 3).join(', ')}.</>}
            </div>
            <button className="btn btn-sm" style={{ flexShrink: 0, marginLeft: '12px' }} onClick={() => setView('matrix')}>View evidence</button>
          </div>
          {serviceThreatMap.size > 0 && (
            <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
              {[...serviceThreatMap.entries()].map(([service, info]) => (
                <span key={service} className="text-xs" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '2px 8px' }}>
                  <strong>{service}</strong> — {info.competitor} ({info.level})
                </span>
              ))}
            </div>
          )}
        </div>
      );
    })() : currentReport === null ? (
      <div className="notice" style={{ marginBottom: '16px' }}>
        <strong>No competitive data loaded.</strong> Run a competitor scan to surface market threats alongside this financial model.
        <button className="btn btn-sm" style={{ marginLeft: '12px' }} onClick={() => setView('intake')}>Run scan</button>
      </div>
    ) : null}
    <div className="card" style={{ marginBottom: '4px' }}>
      <div className="row spread" style={{ marginBottom: aiNarrative ? '12px' : '0' }}>
        <div>
          <strong className="text-overline" style={{ color: 'var(--color-text-tertiary)' }}>AI Growth Narrative</strong>
          {narrativeSource === 'ai' && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--color-success)' }}>AI generated</span>}
          {narrativeSource === 'template' && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Template (add OpenAI key for AI)</span>}
        </div>
        <button className="btn" onClick={generateNarrative} disabled={narrativeBusy} style={{ flexShrink: 0 }}>
          {narrativeBusy ? 'Generating…' : aiNarrative ? 'Regenerate' : 'Generate Narrative'}
        </button>
      </div>
      {aiNarrative
        ? <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--color-text-secondary)', fontSize: '14px' }}>{aiNarrative}</p>
        : !narrativeBusy && <p className="muted" style={{ margin: 0, fontSize: '13px' }}>Generate a board-ready summary of this growth scenario. Updates when you change the sliders.</p>
      }
    </div>
    {compareMode ? (
      <div className="grid cols2">
        <Panel title="Scenario A — Current" className="scenarioPanel">
          <p className="muted">Active scenario. Adjust sliders to pressure-test against Scenario B.</p>
          <ScenarioControl label="Referral conversion" value={scenario.conversionRate} min={0.45} max={0.95} step={0.01} onChange={(value) => setScenario((current) => ({ ...current, conversionRate: value }))} />
          <ScenarioControl label="Home health Y1 capture" value={scenario.hhCapture[0]} min={0.03} max={0.25} step={0.01} onChange={(value) => updateCapture('hhCapture', value)} />
          <ScenarioControl label="Wound Y1 capture" value={scenario.woundCapture[0]} min={0.08} max={0.45} step={0.01} onChange={(value) => updateCapture('woundCapture', value)} />
          <ScenarioControl label="Therapy Y1 capture" value={scenario.therapyCapture[0]} min={0.08} max={0.45} step={0.01} onChange={(value) => updateCapture('therapyCapture', value)} />
        </Panel>
        <Panel title="Scenario B — Compare" className="scenarioPanel">
          <p className="muted">Alternate scenario. Difference column shows B minus A.</p>
          <ScenarioControl label="Referral conversion" value={compareScenario.conversionRate} min={0.45} max={0.95} step={0.01} onChange={(value) => setCompareScenario(s => ({ ...s, conversionRate: value }))} />
          <ScenarioControl label="Home health Y1 capture" value={compareScenario.hhCapture[0]} min={0.03} max={0.25} step={0.01} onChange={(value) => updateCompareCapture('hhCapture', value)} />
          <ScenarioControl label="Wound Y1 capture" value={compareScenario.woundCapture[0]} min={0.08} max={0.45} step={0.01} onChange={(value) => updateCompareCapture('woundCapture', value)} />
          <ScenarioControl label="Therapy Y1 capture" value={compareScenario.therapyCapture[0]} min={0.08} max={0.45} step={0.01} onChange={(value) => updateCompareCapture('therapyCapture', value)} />
        </Panel>
      </div>
    ) : (
      <div className="grid cols3 commandGrid">
        <Panel title="Scenario Builder" className="scenarioPanel">
          <p className="muted">Change conversion and capture rates to pressure-test revenue, referrals, starts, and staffing demand.</p>
          <ScenarioControl label="Referral conversion" value={scenario.conversionRate} min={0.45} max={0.95} step={0.01} onChange={(value) => setScenario((current) => ({ ...current, conversionRate: value }))} />
          <ScenarioControl label="Home health Y1 capture" value={scenario.hhCapture[0]} min={0.03} max={0.25} step={0.01} onChange={(value) => updateCapture('hhCapture', value)} />
          <ScenarioControl label="Wound Y1 capture" value={scenario.woundCapture[0]} min={0.08} max={0.45} step={0.01} onChange={(value) => updateCapture('woundCapture', value)} />
          <ScenarioControl label="Therapy Y1 capture" value={scenario.therapyCapture[0]} min={0.08} max={0.45} step={0.01} onChange={(value) => updateCapture('therapyCapture', value)} />
          <div className="row" style={{ gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <input
              className="input"
              type="text"
              placeholder="Name and save this scenario…"
              value={quickSaveName}
              onChange={(e) => setQuickSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && quickSaveName.trim()) quickSave(); }}
              style={{ flex: 1, fontSize: '13px', padding: '6px 10px' }}
            />
            <button className="btn btn-sm" disabled={!quickSaveName.trim()} onClick={quickSave}>Save</button>
          </div>
        </Panel>
        <Panel title="Service Line Mix" className="span2">
          <div className="serviceMix">{serviceRollup.map((item) => <div className="serviceTile" key={item.service}><div className="serviceColor" style={{ backgroundColor: item.color }} /><div><strong>{item.service}</strong><span>{item.role}</span></div><div className="serviceNumbers"><b>{money(item.y1Revenue)}</b><small>Y1 revenue</small><b>{whole(item.y3Starts)}</b><small>Y3 starts</small></div></div>)}</div>
        </Panel>
      </div>
    )}
    {compareMode && compareTotals && (
      <Panel title="Side-by-Side Comparison">
        <div className="tableWrap">
          <table className="table-compact">
            <thead>
              <tr><th>Metric</th><th>Scenario A</th><th>Scenario B</th><th>Difference (B − A)</th></tr>
            </thead>
            <tbody>
              {([
                { label: 'Y1 Revenue', a: totals.revenue[0], b: compareTotals.revenue[0], fmt: money },
                { label: 'Y3 Revenue', a: totals.revenue[2], b: compareTotals.revenue[2], fmt: money },
                { label: '3Y Contribution', a: totals.totalContribution, b: compareTotals.totalContribution, fmt: money },
                { label: 'Y1 Starts', a: totals.starts[0], b: compareTotals.starts[0], fmt: whole },
                { label: 'Y3 Starts', a: totals.starts[2], b: compareTotals.starts[2], fmt: whole },
                { label: 'Y1 Referrals', a: totals.referrals[0], b: compareTotals.referrals[0], fmt: whole },
                { label: 'Y3 Referrals', a: totals.referrals[2], b: compareTotals.referrals[2], fmt: whole },
              ] as const).map(({ label, a, b, fmt }) => {
                const diff = b - a;
                return (
                  <tr key={label}>
                    <td><span style={{ fontWeight: 600 }}>{label}</span></td>
                    <td>{fmt(a)}</td>
                    <td>{fmt(b)}</td>
                    <td style={{ color: diff >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                      {diff >= 0 ? '+' : ''}{fmt(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    )}
    <Panel title="County Opportunity Board" className="featurePanel">
      <div className="countyBoard">{topRows.map((row) => <div className="countyRow" key={`${row.county}-${row.service}`}><div><div className="row"><Badge tone={row.launchGroup === 'Priority 1' ? 'red' : row.launchGroup === 'Priority 2' ? 'amber' : 'blue'}>{row.launchGroup}</Badge><Badge>{row.service}</Badge></div><h3>{row.county}</h3><p>{row.reason}</p></div><div className="countyMetrics"><span>Opportunity</span><strong>{row.opportunityScore}</strong><div className="meter"><i style={{ width: `${Math.min(row.opportunityScore, 100)}%` }} /></div><small>{whole(row.demandPool)} demand pool | {money(row.revenue[0])} Y1 revenue | {whole(row.referrals[0])} referrals</small></div></div>)}</div>
    </Panel>
  </>;
}
