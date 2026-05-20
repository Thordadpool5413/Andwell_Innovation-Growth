'use client';

import React from 'react';
import { Badge, MetricGrid, Panel, SectionGroup, Stat } from '../Shared';
import { roleGuidance } from '../../../lib/command-center/data';
import { toneForStatus } from '../../../lib/command-center/utils';
import type { View, RoleView } from '../../../lib/command-center/types';
import type { AndwellExpertBrief, ExpertAction } from '../../../lib/andwell-expert';

function toneForPriority(priority: ExpertAction['priority']) {
  if (priority === 'Critical') return 'red';
  if (priority === 'High') return 'amber';
  if (priority === 'Medium') return 'blue';
  return 'green';
}

function ActionCard({ action, setView }: { action: ExpertAction; setView: (view: View) => void }) {
  const destination: View = action.owner === 'Growth' ? 'growth' : action.owner === 'Field' ? 'battlecards' : action.owner === 'Admin' ? 'governance' : action.owner === 'Clinical' ? 'launch' : 'decisions';
  return <div className="battleCard hover-card" style={{ display: 'grid', gap: '12px' }}>
    <div className="row spread" style={{ alignItems: 'flex-start' }}>
      <div>
        <div className="row" style={{ gap: '6px', marginBottom: '8px' }}>
          <Badge tone={toneForPriority(action.priority)}>{action.priority}</Badge>
          <Badge>{action.owner}</Badge>
          {action.reviewRequired ? <Badge tone="amber">Review required</Badge> : <Badge tone="green">Field safe</Badge>}
        </div>
        <h3 style={{ margin: 0 }}>{action.title}</h3>
      </div>
    </div>
    <p className="text-body" style={{ margin: 0 }}>{action.recommendation}</p>
    <div className="notice" style={{ margin: 0, fontSize: '13px' }}><strong>Why this matters</strong><br />{action.why}</div>
    {action.evidence.length ? <div className="briefList" style={{ margin: 0 }}>{action.evidence.map((item) => <div className="briefItem" key={item} style={{ padding: '10px' }}><span>{item}</span></div>)}</div> : null}
    <div className="promptBlock output" style={{ marginTop: 0 }}><strong>Safe language</strong><span>{action.safeLanguage}</span></div>
    <div className="row spread">
      <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}><strong>Next:</strong> {action.nextStep}</p>
      <button className="btn" onClick={() => setView(destination)}>Open workspace</button>
    </div>
  </div>;
}

function RiskMeter({ label, value, tone }: { label: string; value: number; tone: 'green' | 'amber' | 'red' | 'blue' }) {
  const color = tone === 'green' ? 'var(--color-success)' : tone === 'amber' ? 'var(--color-warning)' : tone === 'red' ? 'var(--color-danger)' : 'var(--color-info)';
  return <div className="scoreCard" style={{ padding: '14px' }}>
    <div className="row spread"><strong className="text-small">{label}</strong><Badge tone={tone}>{value}%</Badge></div>
    <div className="meter"><i style={{ width: `${Math.max(4, Math.min(100, value))}%`, background: color }} /></div>
  </div>;
}

function DecisionPath({ action }: { action: ExpertAction }) {
  const steps = [
    { label: 'Signal', value: action.evidence[0] || 'Expert signal available' },
    { label: 'Meaning', value: action.why },
    { label: 'Recommendation', value: action.recommendation },
    { label: 'Next step', value: action.nextStep }
  ];
  return <div className="grid cols4">
    {steps.map((step, index) => <div className="scoreCard hover-card" key={step.label} style={{ padding: '14px' }}>
      <Badge tone={index === 0 ? 'blue' : index === 1 ? 'amber' : index === 2 ? 'green' : 'dark'}>{index + 1}</Badge>
      <strong style={{ display: 'block', margin: '10px 0 6px' }}>{step.label}</strong>
      <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{step.value}</p>
    </div>)}
  </div>;
}

function OpportunityTile({ row }: { row: AndwellExpertBrief['priorityMarkets'][number] }) {
  return <div className="countyRow hover-card" style={{ gridTemplateColumns: '1fr auto' }}>
    <div>
      <Badge tone={row.launchGroup === 'Priority 1' ? 'green' : 'blue'}>{row.launchGroup}</Badge>
      <h3>{row.county}</h3>
      <p className="text-small"><strong>{row.service}</strong> | {row.reason}</p>
      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{row.action}</p>
    </div>
    <div className="countyMetrics">
      <span>Score</span>
      <strong>{row.opportunityScore}</strong>
      <small>{row.totalRevenue >= 1000000 ? `$${(row.totalRevenue / 1000000).toFixed(1)}M` : `$${Math.round(row.totalRevenue / 1000)}K`} 3-year revenue</small>
    </div>
  </div>;
}

function PlainEnglishBlock({ title, body, tone = 'blue' }: { title: string; body: string; tone?: 'blue' | 'green' | 'amber' }) {
  return <div className="notice" style={{ margin: 0, fontSize: '13px' }}>
    <Badge tone={tone}>{title}</Badge>
    <p className="text-body" style={{ margin: '10px 0 0' }}>{body}</p>
  </div>;
}

export function Dashboard({ expertBrief, roleView, setView, clearLegacyBrowserStorage }: { expertBrief: AndwellExpertBrief; roleView: RoleView; setView: (view: View) => void; clearLegacyBrowserStorage: () => void }) {
  return <>
    <section className="hero proHero">
      <Badge tone="dark">Andwell expert operating system</Badge>
      <h1>What should Andwell do next, why, with what evidence, and how do we execute it safely?</h1>
      <p className="text-body">{expertBrief.executiveSummary}</p>
      <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={() => setView('ask')}>Ask Andwell Expert</button>
        <button className="btn" onClick={() => setView('intake')}>Run Competitive Scan</button>
        <button className="btn" onClick={() => setView('growth')}>Review Growth Strategy</button>
        <button className="btn" onClick={() => setView('board-packet')}>Prepare Board Packet</button>
        <button className="btn" onClick={clearLegacyBrowserStorage}>Clear cache keys</button>
      </div>
    </section>

    <SectionGroup title="Expert posture">
      <div className="grid cols2 commandGrid">
        <Panel title="Current expert readout" className="featurePanel">
          <Badge tone="blue">{roleGuidance[roleView].headline}</Badge>
          <h2 style={{ margin: '12px 0 8px' }}>{expertBrief.posture}</h2>
          <p className="text-body">{roleGuidance[roleView].focus}</p>
          <div className="notice" style={{ fontSize: '13px' }}><strong>Board narrative</strong><br />{expertBrief.boardNarrative}</div>
        </Panel>
        <Panel title="Key metrics">
          <MetricGrid cols={2}>
            <Stat label="3-year revenue" value={expertBrief.metrics.threeYearRevenue} hint="Modeled growth" />
            <Stat label="3-year contribution" value={expertBrief.metrics.threeYearContribution} hint="Modeled margin" />
            <Stat label="Priority markets" value={expertBrief.metrics.priorityMarkets} hint="Launch group 1" />
            <Stat label="Review items" value={expertBrief.metrics.reviewItems} hint="Governance load" />
          </MetricGrid>
        </Panel>
      </div>
    </SectionGroup>

    <SectionGroup title="Top recommended actions">
      <div className="grid cols2">
        {expertBrief.topActions.map((action) => <ActionCard key={action.id} action={action} setView={setView} />)}
      </div>
    </SectionGroup>

    <SectionGroup title="Decision path">
      <PlainEnglishBlock title="How to read this" body="Each recommendation now follows the same path: signal, meaning, recommendation, and next step. This gives users a quick way to understand the expert logic before opening detailed evidence." />
      <div style={{ marginTop: '14px' }}>
        <DecisionPath action={expertBrief.topActions[0]} />
      </div>
    </SectionGroup>

    <SectionGroup title="Risk and readiness meters">
      <div className="grid cols4">
        <RiskMeter label="Competitive pressure" value={expertBrief.competitorThreats[0] ? Math.min(100, expertBrief.competitorThreats[0].serviceLineMatchScore + 20) : 35} tone={expertBrief.competitorThreats[0] ? 'amber' : 'blue'} />
        <RiskMeter label="Staffing constraint" value={expertBrief.staffingRisks.length ? 78 : 42} tone={expertBrief.staffingRisks.length ? 'amber' : 'green'} />
        <RiskMeter label="Claim risk" value={expertBrief.governedClaims.filter((claim) => claim.category !== 'Safe').length ? 72 : 24} tone={expertBrief.governedClaims.filter((claim) => claim.category !== 'Safe').length ? 'red' : 'green'} />
        <RiskMeter label="Launch readiness" value={expertBrief.priorityMarkets.length ? 68 : 40} tone="blue" />
      </div>
    </SectionGroup>

    <SectionGroup title="Evidence-backed focus areas">
      <div className="grid cols3">
        <Panel title="Priority markets">
          <div className="briefList">
            {expertBrief.priorityMarkets.slice(0, 4).map((row) => <div className="briefItem" key={`${row.county}-${row.service}`}>
              <Badge tone={row.launchGroup === 'Priority 1' ? 'green' : 'blue'}>{row.launchGroup}</Badge>
              <strong>{row.county} {row.service}</strong>
              <span>{row.reason}</span>
            </div>)}
          </div>
          <button className="btn" onClick={() => setView('growth')}>Open Growth</button>
        </Panel>
        <Panel title="Competitive pressure">
          <div className="briefList">
            {expertBrief.competitorThreats.length ? expertBrief.competitorThreats.slice(0, 4).map((threat) => <div className="briefItem" key={threat.competitorId}>
              <Badge tone={toneForStatus(threat.threatLevel)}>{threat.threatLevel}</Badge>
              <strong>{threat.competitorName}</strong>
              <span>{threat.executiveReadout}</span>
            </div>) : <p className="muted">Run or load a competitive scan to rank threats.</p>}
          </div>
          <button className="btn" onClick={() => setView('heatmap')}>Open Intelligence</button>
        </Panel>
        <Panel title="Field guidance">
          <div className="briefList">
            {expertBrief.fieldGuidance.map((item) => <div className="briefItem" key={item} style={{ padding: '12px' }}><span>{item}</span></div>)}
          </div>
          <button className="btn" onClick={() => setView('battlecards')}>Open Field</button>
        </Panel>
      </div>
    </SectionGroup>

    <SectionGroup title="Opportunity tiles">
      <div className="countyBoard">
        {expertBrief.priorityMarkets.slice(0, 3).map((row) => <OpportunityTile key={`${row.county}-${row.service}-tile`} row={row} />)}
      </div>
    </SectionGroup>
  </>;
}
