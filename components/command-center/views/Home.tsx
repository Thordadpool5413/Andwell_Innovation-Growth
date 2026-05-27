'use client';

import React, { useMemo } from 'react';
import { Badge, TrustPanel } from '../Shared';
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

function reviewTone(count: number) {
  if (count === 0) return 'green';
  if (count < 10) return 'amber';
  return 'red';
}

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
      <section className="guidedHero">
        <div className="guidedHeroCopy">
          <div className="homeStatusLine">
            <Badge tone={currentReport ? 'green' : 'amber'}>{currentReport ? 'Competitive scan loaded' : 'No scan loaded'}</Badge>
            <Badge tone="green">{SOURCE_LIBRARY_MODE}</Badge>
            <Badge tone="blue">{SOURCE_LIBRARY_GEOGRAPHY}</Badge>
            {urgentDecisionCount > 0 ? <Badge tone="amber">{urgentDecisionCount} urgent decisions</Badge> : null}
          </div>
          <h1>{role.title}</h1>
          <p>{role.focus}</p>
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
      </section>

      <section className="homeExecutiveDashboard">
        <article className="homeExecutiveCard action">
          <span>Recommended action</span>
          <h2>{leadDecision?.title || 'Run the Maine competitor scan'}</h2>
          <p>{leadDecision?.recommendedAction || 'Use the preloaded source library to build the first evidence-backed competitor report, then review the decision board.'}</p>
          <button className="btn btn-sm" onClick={() => setView?.(leadDecision ? 'decisions' : 'intake')}>{leadDecision ? 'Open decision' : 'Open source library'}</button>
        </article>
        <article className="homeExecutiveCard">
          <span>Growth impact</span>
          <h2>{money(totalRevenue)}</h2>
          <p>Three-year modeled revenue. Year 1 is {money(yearOneRevenue)} across {whole(yearOneStarts)} starts{topCounty ? `, led by ${topCounty.county} ${topCounty.service}` : ''}.</p>
        </article>
        <article className="homeExecutiveCard">
          <span>Evidence confidence</span>
          <h2>{trustMetadata?.confidence || 'Pending scan'}</h2>
          <p>{trustMetadata ? `${trustMetadata.publicEvidenceCount} public evidence sources and ${trustMetadata.aiInterpretationCount} AI interpretations.` : 'The source library is ready, but evidence has not been scanned into a report yet.'}</p>
        </article>
        <article className="homeExecutiveCard">
          <span>Risk / review</span>
          <h2>{highRisk} high risk</h2>
          <p>{reviewItems ? `${reviewItems} items need review or manager attention before broad field use.` : 'No report-level review burden is active.'}</p>
          <Badge tone={highRisk ? 'red' : reviewTone(reviewItems)}>{highRisk ? 'Review now' : reviewItems ? 'Review needed' : 'Ready'}</Badge>
        </article>
      </section>

      <section className="homeEducationBand">
        <div>
          <span className="text-overline">How to use the app</span>
          <h2>Read it in layers. Do not start in the raw data.</h2>
          <p>The app is designed to move from leadership answer to growth opportunity, then public evidence, then safe field action. Each layer keeps the AI interpretation tied back to the source trail.</p>
        </div>
        <div className="homeWorkflowCards">
          {workflow.map((item) => (
            <button className="homeWorkflowCard" key={item.title} onClick={() => setView?.(item.view)}>
              <span>{item.step}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="homeDecisionLayout">
        <div className="homeDecisionStack">
          <div className="section-group-header">
            <h3>What needs attention now</h3>
            <button className="btn btn-sm" onClick={() => setView?.('decisions')}>Open board</button>
          </div>
          {rankedDecisions.map((item, index) => (
            <article className="decisionStackItem homeDecisionItem" key={item.id}>
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
        </div>
        <TrustPanel metadata={trustMetadata} />
      </section>
    </div>
  );
}
