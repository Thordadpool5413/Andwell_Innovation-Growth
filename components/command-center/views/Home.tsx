'use client';

import React from 'react';
import { Badge, Panel } from '../Shared';
import type { View, RoleView as ViewRole } from '../../../lib/command-center/types';
import type { CompetitorInput, IntelligenceReport } from '../../../lib/types';

const rolePathways: Record<string, { headline: string; actions: { label: string; view: View; icon: string }[] }> = {
  Executive: {
    headline: 'Leadership Ready Intelligence',
    actions: [
      { label: 'Market Overview', view: 'dashboard', icon: '📊' },
      { label: 'Strategic Brief', view: 'expert', icon: '🎯' },
      { label: 'Executive Report', view: 'board-packet', icon: '📋' },
    ]
  },
  'Growth Leader': {
    headline: 'Growth Strategy Focus',
    actions: [
      { label: 'Growth Map', view: 'heatmap', icon: '🗺️' },
      { label: 'Growth Strategy', view: 'growth', icon: '📈' },
      { label: 'Territory Plans', view: 'county-plan', icon: '🎯' },
    ]
  },
  'Sales Leader': {
    headline: 'Field Guidance & Coaching',
    actions: [
      { label: 'Field Guidance', view: 'battlecards', icon: '💬' },
      { label: 'Advantage Matrix', view: 'matrix', icon: '🎯' },
      { label: 'Coaching Plans', view: 'coaching', icon: '📝' },
    ]
  },
  'Sales Rep': {
    headline: 'Call Preparation & Field Talk',
    actions: [
      { label: 'Referral Sources', view: 'referrals', icon: '📱' },
      { label: 'Field Guidance', view: 'battlecards', icon: '💬' },
      { label: 'Ask the Expert', view: 'ask', icon: '❓' },
    ]
  },
  Board: {
    headline: 'Leadership & Strategic Reporting',
    actions: [
      { label: 'Board Report', view: 'board-report', icon: '📊' },
      { label: 'Executive Narrative', view: 'narrative', icon: '📖' },
      { label: 'Decision Support', view: 'decisions', icon: '✅' },
    ]
  },
  Admin: {
    headline: 'Intelligence Management',
    actions: [
      { label: 'Source Library', view: 'intake', icon: '📚' },
      { label: 'Reports', view: 'reports', icon: '📁' },
      { label: 'System Health', view: 'diagnostics', icon: '🔧' },
    ]
  }
};

const roleGuidance: Record<string, { description: string; nextStep: string }> = {
  Executive: { description: 'Strategic oversight and board-ready analysis', nextStep: 'Start with a market overview' },
  'Growth Leader': { description: 'Growth strategy and expansion planning', nextStep: 'Build your growth map' },
  'Sales Leader': { description: 'Field enablement and sales coaching', nextStep: 'Create battle cards' },
  'Sales Rep': { description: 'Referral source intelligence and call prep', nextStep: 'Review referral sources' },
  Board: { description: 'Strategic reporting and decision support', nextStep: 'Review board report' },
  Admin: { description: 'Intelligence management and system operations', nextStep: 'Build competitor library' }
};

export function Home({ roleView = 'Executive', setView, currentReport, competitors, busy, onRefresh }: {
  roleView?: ViewRole;
  setView?: (view: View) => void;
  currentReport?: IntelligenceReport | null;
  competitors?: CompetitorInput[];
  busy?: boolean;
  onRefresh?: () => void;
}) {
  const pathway = rolePathways[roleView] || rolePathways.Executive;
  const guidance = roleGuidance[roleView] || roleGuidance.Executive;
  const expertBrief = currentReport?.expertBrief;
  const hasReport = Boolean(currentReport);

  return (
    <div style={{ maxWidth: '1180px', padding: '36px 32px 88px' }}>
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-info)' }}>
              Andwell Intelligence Platform
            </p>
            <h1 style={{ margin: 0, fontSize: '36px', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '8px' }}>
              {pathway.headline}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {guidance.description}
            </p>
          </div>
          {hasReport && <Badge tone="green">Intelligence Loaded</Badge>}
        </div>
      </section>

      <div style={{ marginBottom: '24px' }}>
        <Panel title="Primary Workflow">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', paddingBottom: '8px', fontSize: '13px' }}>
          <div style={{ flex: '0 0 auto', padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: '6px', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>1️⃣ Intake</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Add URLs</div>
          </div>
          <div style={{ flex: '0 0 auto', color: 'var(--color-text-tertiary)' }}>→</div>
          <div style={{ flex: '0 0 auto', padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: '6px', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>2️⃣ Scan</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Crawl & AI</div>
          </div>
          <div style={{ flex: '0 0 auto', color: 'var(--color-text-tertiary)' }}>→</div>
          <div style={{ flex: '0 0 auto', padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: '6px', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>3️⃣ Report</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Load Results</div>
          </div>
          <div style={{ flex: '0 0 auto', color: 'var(--color-text-tertiary)' }}>→</div>
          <div style={{ flex: '0 0 auto', padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: '6px', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>4️⃣ Brief</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Key Insights</div>
          </div>
          <div style={{ flex: '0 0 auto', color: 'var(--color-text-tertiary)' }}>→</div>
          <div style={{ flex: '0 0 auto', padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: '6px', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>5️⃣ Strategy</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Act on It</div>
          </div>
        </div>
        </Panel>
      </div>

      {!hasReport ? (
        <>
          <Panel title="🚀 Quick Start">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>📋</div>
                <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '13px' }}>1. Build Your Library</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Add 3–25 competitor websites to analyze</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔍</div>
                <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '13px' }}>2. Run the Scan</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>System crawls sites and applies AI analysis</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>💡</div>
                <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '13px' }}>3. Review Results</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Access intelligence through your role's views</p>
              </div>
            </div>
            <button className="btn primary" style={{ width: '100%' }} onClick={() => setView?.('intake')}>
              Start: Build Competitor Library →
            </button>
          </Panel>
          <Panel title="What You Can Do">
            <p style={{ margin: '0 0 12px', color: 'var(--color-text-secondary)' }}>
              Once you load competitive intelligence, you'll unlock:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Evidence Matrix:</strong> Scored competitive findings with source citations</li>
              <li><strong>Field Battlecards:</strong> Sales-ready talking points and competitive positioning</li>
              <li><strong>Expert Brief:</strong> AI-powered market analysis and strategic recommendations</li>
              <li><strong>Leadership Reports:</strong> Board-ready intelligence and decision support</li>
            </ul>
          </Panel>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <Panel title="Intelligence Coverage">
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                <div><strong>{currentReport?.competitorsAnalyzed || 0}</strong> competitors analyzed</div>
                <div><strong>{currentReport?.serviceLinesMapped || 0}</strong> service lines mapped</div>
                <div><strong>{currentReport?.potentialAndwellAdvantages || 0}</strong> advantage opportunities</div>
                <div><strong>{currentReport?.humanReviewItems || 0}</strong> review items pending</div>
              </div>
            </Panel>
            <Panel title="Intelligence Quality">
              <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                <div><strong>{currentReport?.pagesReviewed || 0}</strong> web pages crawled</div>
                <div><strong>{currentReport?.subservicesMapped || 0}</strong> subservices matched</div>
                <div><Badge tone={currentReport?.expertBrief ? 'green' : 'neutral'}>{currentReport?.expertBrief ? 'Expert analysis' : 'No expert brief'}</Badge></div>
              </div>
            </Panel>
          </div>

          {expertBrief && (
            <div style={{ marginBottom: '24px' }}>
              <Panel title="Strategic Brief">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Market Posture</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{expertBrief.marketPosture}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Fastest Move</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{expertBrief.fastestFieldMove}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Priority</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{expertBrief.salesCoachingPriority}</p>
                </div>
              </div>
              <p style={{ margin: '16px 0 0', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{expertBrief.expertSummary}</p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => setView?.('expert')} style={{ fontSize: '13px', padding: '8px 14px' }}>
                  Full Expert Brief →
                </button>
                <button className="btn" onClick={() => setView?.('matrix')} style={{ fontSize: '13px', padding: '8px 14px' }}>
                  Evidence Matrix →
                </button>
                <button className="btn" onClick={() => setView?.('battlecards')} style={{ fontSize: '13px', padding: '8px 14px' }}>
                  Battlecards →
                </button>
              </div>
              </Panel>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {expertBrief?.strongestThreats && expertBrief.strongestThreats.length > 0 && (
              <Panel title="⚠️ Key Threats">
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {expertBrief.strongestThreats.slice(0, 3).map((threat, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{threat}</li>
                  ))}
                </ul>
                <button className="btn btn-sm" style={{ marginTop: '12px', width: '100%' }} onClick={() => setView?.('expert')}>Review threats</button>
              </Panel>
            )}
            {expertBrief?.bestOpportunities && expertBrief.bestOpportunities.length > 0 && (
              <Panel title="💡 Growth Opportunities">
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {expertBrief.bestOpportunities.slice(0, 3).map((opp, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{opp}</li>
                  ))}
                </ul>
                <button className="btn btn-sm" style={{ marginTop: '12px', width: '100%' }} onClick={() => setView?.('battlecards')}>Build battlecards</button>
              </Panel>
            )}
          </div>
        </>
      )}

      <Panel title="Next Steps for Your Role">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {pathway.actions.map((action) => (
            <button
              key={action.view}
              onClick={() => setView?.(action.view)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                minHeight: '80px',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-info)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontSize: '20px', marginBottom: '6px' }}>{action.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
