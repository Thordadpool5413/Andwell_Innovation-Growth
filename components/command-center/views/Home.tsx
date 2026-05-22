'use client';

import React from 'react';
import type { View } from '../../../lib/command-center/types';
import type { CompetitorInput, IntelligenceReport } from '../../../lib/types';

type RoleView = string;

const quickLinks: { title: string; desc: string; view: View; accent: string }[] = [
  { title: 'Expert Brief', desc: 'Recommendations, field plays, and watchlist', view: 'expert', accent: 'var(--color-accent)' },
  { title: 'Battlecards', desc: 'Talk tracks and objection responses', view: 'battlecards', accent: 'var(--color-success)' },
  { title: 'Evidence Matrix', desc: 'Scored findings across every service line', view: 'matrix', accent: 'var(--color-info)' },
  { title: 'Growth Strategy', desc: 'Scenario engine and county plan', view: 'growth', accent: 'var(--color-warning)' },
];

const steps = [
  { n: '01', title: 'Add competitor URLs', body: 'Paste any provider website. The system validates and queues them for crawling.', view: 'intake' as View },
  { n: '02', title: 'Run the AI scan', body: 'The engine crawls each site, runs AI extraction, and scores service overlap and differentiation.', view: 'intake' as View },
  { n: '03', title: 'Use the intelligence', body: 'Expert brief, battlecards, evidence matrix, growth scenarios, and board-ready exports — all updated.', view: 'expert' as View },
];

export function Home({ setView, currentReport, competitors, busy, onRefresh }: {
  roleView?: RoleView;
  setView?: (view: View) => void;
  currentReport?: IntelligenceReport | null;
  competitors?: CompetitorInput[];
  busy?: boolean;
  onRefresh?: () => void;
}) {
  const hasReport = Boolean(currentReport);
  const competitorCount = competitors?.length ?? 0;

  return (
    <div style={{ maxWidth: '820px', padding: '32px 32px 80px' }}>

      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--color-info)' }}>Andwell Innovation &amp; Growth</p>
        <h1 style={{ margin: 0, fontSize: '32px', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
          {hasReport ? 'Your intelligence is ready.' : 'Start with a competitive scan.'}
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '560px' }}>
          {hasReport
            ? `${currentReport?.competitorsAnalyzed ?? 0} competitors analyzed. Use the views below to brief leadership, coach the field, plan growth, or prepare board materials.`
            : 'Add competitor websites, run the AI scan, and get expert intelligence, battlecards, and growth guidance in minutes.'}
        </p>
      </div>

      {/* Primary action — state-aware */}
      {hasReport ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '40px' }}>
          {quickLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => setView?.(link.view)}
              style={{
                background: 'var(--color-bg-secondary)', border: `1px solid var(--color-border)`,
                borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'left', cursor: 'pointer',
                transition: 'border-color 150ms ease, transform 150ms ease', display: 'block', width: '100%'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = link.accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{link.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>{link.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {competitorCount > 0
                  ? `${competitorCount} competitor${competitorCount !== 1 ? 's' : ''} in library — ready to scan`
                  : 'No competitors added yet'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                {competitorCount > 0
                  ? 'Go to Competitor Intake to run the scan and generate your intelligence report.'
                  : 'Go to Competitor Intake to add provider websites and run your first scan.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {onRefresh && <button className="btn btn-sm" disabled={busy} onClick={onRefresh}>Refresh</button>}
              {setView && <button className="btn primary" onClick={() => setView('intake')}>
                {competitorCount > 0 ? 'Run Competitive Scan →' : 'Add Competitors →'}
              </button>}
            </div>
          </div>
        </div>
      )}

      {/* Status row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {[
          { dot: hasReport ? 'var(--color-success)' : 'var(--color-border)', label: hasReport ? `Report loaded · ${currentReport?.competitorsAnalyzed ?? 0} competitors analyzed` : 'No report loaded' },
          { dot: competitorCount > 0 ? 'var(--color-info)' : 'var(--color-border)', label: competitorCount > 0 ? `${competitorCount} competitor${competitorCount !== 1 ? 's' : ''} in library` : 'No competitors added' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* How it works — only show when no report */}
      {!hasReport && (
        <div>
          <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>How it works</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {steps.map((step) => (
              <div key={step.n} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                <span style={{ display: 'block', fontSize: '22px', fontWeight: 800, color: 'var(--color-text-tertiary)', letterSpacing: '-0.04em', marginBottom: '10px' }}>{step.n}</span>
                <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{step.title}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* After-report workspace links */}
      {hasReport && (
        <div>
          <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>All workspaces</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['heatmap', 'growth', 'battlecards', 'board-packet', 'intake', 'reports'] as View[]).map((v) => (
              <button key={v} className="btn btn-sm" onClick={() => setView?.(v)} style={{ textTransform: 'capitalize' }}>
                {({ heatmap: 'Intelligence', growth: 'Growth', battlecards: 'Field', 'board-packet': 'Board', intake: 'Run New Scan', reports: 'Reports' } as Record<string, string>)[v]}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
