'use client';

import React, { useMemo } from 'react';
import { Badge, TrustPanel, Panel, Stat } from '../Shared';
import { DollarSign, Rocket, ShieldCheck, AlertTriangle } from 'lucide-react';
import { generateDecisions, riskTone, urgencyOrder } from '../../../lib/decision-queue';
import { buildReportTrustMetadata } from '../../../lib/trust-metadata';
import { money, whole } from '../../../lib/command-center/utils';
import { SOURCE_LIBRARY_GEOGRAPHY, SOURCE_LIBRARY_MODE } from '../../../lib/preloaded-competitors';
import type { View, RoleView } from '../../../lib/command-center/types';
import type { CompetitorInput, IntelligenceReport } from '../../../lib/types';
import type { GrowthRow, GrowthTotals } from '../../../lib/growth-plan';

const roleLayouts: Record<RoleView, { title: string; focus: string; primary: View; secondary: View; measure: string }> = {
  Executive: {
    title: 'Executive command brief',
    focus: 'See the decision, financial impact, risk, confidence, and field readiness before the details.',
    primary: 'decisions',
    secondary: 'board-packet',
    measure: 'Decision clarity',
  },
  'Growth Leader': {
    title: 'Growth leader view',
    focus: 'Start with county opportunity, staffing constraints, launch readiness, and revenue sequence.',
    primary: 'heatmap',
    secondary: 'growth',
    measure: 'Launch readiness',
  },
  'Sales Leader': {
    title: 'Sales leader view',
    focus: 'Start with battlecards, referral source plays, manager coaching, and safe wording.',
    primary: 'battlecards',
    secondary: 'coaching',
    measure: 'Field readiness',
  },
  'Sales Rep': {
    title: 'Field rep view',
    focus: 'Use direct answers, referral questions, safe language, and do-not-say guardrails before a call.',
    primary: 'ask',
    secondary: 'referrals',
    measure: 'Call readiness',
  },
  Board: {
    title: 'Board packet view',
    focus: 'Review the leadership narrative, changed risk, growth case, and export-ready output.',
    primary: 'board-packet',
    secondary: 'reports',
    measure: 'Packet readiness',
  },
  Admin: {
    title: 'Admin control view',
    focus: 'Maintain source library, scans, audit history, diagnostics, and claim review controls.',
    primary: 'intake',
    secondary: 'diagnostics',
    measure: 'System confidence',
  },
};

const workflow = [
  { step: '1', title: 'Brief', body: 'Start with the answer: what leadership should do, why it matters, and what risk needs attention.', view: 'decisions' as View },
  { step: '2', title: 'Growth', body: 'Move into ranked Maine counties, revenue impact, staffing risk, and launch readiness.', view: 'heatmap' as View },
  { step: '3', title: 'Evidence', body: 'Inspect source-backed competitor findings without treating public silence as proof of absence.', view: 'matrix' as View },
  { step: '4', title: 'Field', body: 'Turn intelligence into referral plays, battlecards, coaching plans, and safe wording.', view: 'battlecards' as View },
];

export function Home({
  roleView = 'Executive',
  setView,
  currentReport,
  competitors = [],
  busy,
  onRefresh,
  growthRows = [],
  growthTotals,
  urgentDecisionCount = 0,
}: {
  roleView?: RoleView;
  setView?: (view: View) => void;
  currentReport?: IntelligenceReport | null;
  competitors?: CompetitorInput[];
  busy?: boolean;
  onRefresh?: () => void;
  growthRows?: GrowthRow[];
  growthTotals?: GrowthTotals;
  urgentDecisionCount?: number;
}) {
  const trustMetadata = currentReport ? (currentReport.trustMetadata || buildReportTrustMetadata(currentReport)) : null;
  const decisions = useMemo(() => generateDecisions(currentReport || null, growthRows), [currentReport, growthRows]);
  const rankedDecisions = useMemo(() => [...decisions].sort((a, b) => urgencyOrder(a.urgency) - urgencyOrder(b.urgency)).slice(0, 4), [decisions]);
  const leadDecision = rankedDecisions[0];
  const role = roleLayouts[roleView] || roleLayouts.Executive;
  const reviewItems = currentReport?.humanReviewItems || 0;
  const highRisk = decisions.filter((item) => item.risk === 'High').length;
  const preloadedSources = competitors.filter((competitor) => competitor.preloaded).length;
  const totalRevenue = growthTotals?.totalRevenue || growthRows.reduce((sum, row) => sum + row.totalRevenue, 0);
  const yearOneRevenue = growthTotals?.revenue?.[0] || growthRows.reduce((sum, row) => sum + row.revenue[0], 0);
  const yearOneStarts = growthTotals?.starts?.[0] || growthRows.reduce((sum, row) => sum + row.starts[0], 0);
  const topCounty = [...growthRows].sort((a, b) => b.revenue[0] - a.revenue[0])[0];

  return (
    <div className="guidedHome">
      <Panel variant="hero" title="">
        <div className="guidedHeroCopy">
          <div className="homeStatusLine">
            <Badge tone={currentReport ? 'green' : 'amber'}>{currentReport ? 'Competitive scan loaded' : 'No scan loaded'}</Badge>
            <Badge tone="green">{SOURCE_LIBRARY_MODE}</Badge>
            <Badge tone="blue">{SOURCE_LIBRARY_GEOGRAPHY}</Badge>
            {urgentDecisionCount > 0 ? <Badge tone="amber">{urgentDecisionCount} urgent decisions</Badge> : null}
          </div>
          <h1 style={{
            fontSize: '46px',
            lineHeight: 1.02,
            letterSpacing: '-0.055em',
            margin: 0,
            maxWidth: '900px',
            background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {role.title}
          </h1>
          <p style={{ fontSize: '17px', lineHeight: 1.5, color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '16px 0 24px' }}>{role.focus}</p>
          <div className="guidedHeroActions">
            <button className="btn primary" onClick={() => setView?.(role.primary)}>Open primary view</button>
            <button className="btn" onClick={() => setView?.(role.secondary)}>Open supporting view</button>
            <button className="btn" disabled={busy} onClick={onRefresh}>{busy ? 'Refreshing...' : 'Refresh data'}</button>
          </div>
        </div>

        <aside className="guidedReadinessPanel">
          <span className="text-overline">System readiness</span>
          <div className="readinessMeter">
            <strong>{trustMetadata?.confidence || 'Model ready'}</strong>
            <p>{currentReport ? `${trustMetadata?.sourceCount || 0} sources reviewed. ${trustMetadata?.reviewStatus || 'Evidence needs review'}.` : `${preloadedSources || competitors.length} Maine sources are preloaded. Run a full scan to attach evidence.`}</p>
          </div>
          <div className="readinessFacts">
            <div><span>Sources</span><strong>{preloadedSources || competitors.length}</strong></div>
            <div><span>Measure</span><strong>{role.measure}</strong></div>
            <div><span>Review</span><strong>{reviewItems || 'Clear'}</strong></div>
          </div>
        </aside>
      </Panel>

      <div className="metric-grid-4" style={{ marginTop: '24px' }}>
        <Stat label="Recommended action" value={leadDecision?.title || 'Run Maine scan'} hint={leadDecision?.recommendedAction || 'Use preloaded sources to build first report'} icon={Rocket} tone="blue" />
        <Stat label="Growth impact" value={money(totalRevenue)} hint={`Year 1: ${money(yearOneRevenue)} across ${whole(yearOneStarts)} starts${topCounty ? `, led by ${topCounty.county}` : ''}`} icon={DollarSign} tone="green" />
        <Stat label="Evidence confidence" value={trustMetadata?.confidence || 'Pending scan'} hint={trustMetadata ? `${trustMetadata.publicEvidenceCount} public sources, ${trustMetadata.aiInterpretationCount} AI interpretations` : 'Source library ready, no scan yet'} icon={ShieldCheck} tone="purple" />
        <Stat label="Risk / review" value={highRisk ? `${highRisk} high risk` : reviewItems ? `${reviewItems} items` : 'Ready'} hint={reviewItems ? 'Items need review before field use' : 'No review burden active'} icon={AlertTriangle} tone={highRisk ? 'red' : reviewItems ? 'amber' : 'green'} />
      </div>

      <section className="homeEducationBand">
        <div>
          <span className="text-overline">How to use the app</span>
          <h2>Read it in layers. Do not start in the raw data.</h2>
          <p>The app is designed to move from leadership answer to growth opportunity, then public evidence, then safe field action. Each layer keeps the AI interpretation tied back to the source trail.</p>
        </div>
        <div className="homeWorkflowCards">
          {workflow.map((item) => (
            <button className="homeWorkflowCard card-interactive" key={item.title} onClick={() => setView?.(item.view)} style={{ transition: 'all 200ms ease', cursor: 'pointer' }}>
              <span>{item.step}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="homeDecisionLayout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginTop: '32px' }}>
        <Panel variant="elevated" title="">
          <div className="section-group-header">
            <h3>What needs attention now</h3>
            <button className="btn btn-sm" onClick={() => setView?.('decisions')}>Open board</button>
          </div>
          {rankedDecisions.map((item, index) => (
            <article className="decisionStackItem homeDecisionItem" key={item.id} style={{ marginTop: index === 0 ? '16px' : '12px' }}>
              <div className="decisionRank">{index + 1}</div>
              <div>
                <div className="row" style={{ gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <Badge tone={item.urgency === 'Immediate' ? 'red' : item.urgency === 'Today' ? 'amber' : 'blue'}>{item.urgency}</Badge>
                  <Badge tone={riskTone(item.risk)}>{item.risk} risk</Badge>
                  <Badge>{item.owner}</Badge>
                </div>
                <h3>{item.title}</h3>
                <p><strong>Evidence:</strong> {item.evidence}</p>
                <p><strong>Next step:</strong> {item.recommendedAction}</p>
              </div>
            </article>
          ))}
        </Panel>
        <TrustPanel metadata={trustMetadata} />
      </section>
    </div>
  );
}
