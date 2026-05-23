'use client';

import React from 'react';
import type { View } from '../../../lib/command-center/types';
import type { CompetitorInput, IntelligenceReport } from '../../../lib/types';

type RoleView = string;

const innovationStatement = 'Innovation and Growth is where Andwell Health Partners turns vision into infrastructure. We are building the future of high acuity community care, creating post acute partnerships that make us essential to Maine, connecting complex services through technology, and developing the value based contracting model that allows us to take risk, deliver better outcomes, save payers money, and grow because we are built for the complexity others cannot manage.';

const processSteps = [
  'Reading public sources',
  'Extracting service evidence',
  'Scrubbing unsupported claims',
  'Connecting evidence to Andwell capabilities',
  'Building capability comparison',
  'Mapping growth opportunities',
  'Building field safe language',
  'Creating growth strategy',
  'Preparing executive output',
];

const outputPreviews: { title: string; desc: string; view: View; accent: string }[] = [
  { title: 'Advantage Matrix', desc: 'Compare Andwell capabilities against public competitor evidence.', view: 'matrix', accent: 'var(--color-info)' },
  { title: 'Growth Map', desc: 'Identify market opportunity, saturation, field focus, and evidence confidence.', view: 'heatmap', accent: 'var(--color-success)' },
  { title: 'Field Guidance', desc: 'Use safe talk tracks, questions to ask, and what not to say.', view: 'battlecards', accent: 'var(--color-accent)' },
  { title: 'Executive Report', desc: 'Prepare leadership ready output from Matrix, Map, and strategy signals.', view: 'board-packet', accent: 'var(--color-warning)' },
];

const readiness = [
  'Ready for source intelligence',
  'Evidence guardrails active',
  'Capability matrix ready to build',
  'Growth map ready to build',
  'Strategy builder ready',
  'Executive output engine ready',
];

function ReadyPill({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 10px',
      borderRadius: '999px', border: '1px solid var(--color-border)',
      background: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)',
      fontSize: '12px', fontWeight: 700
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-success)' }} />
      {label}
    </span>
  );
}

export function Home({ setView, currentReport, competitors, busy }: {
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
    <div style={{ maxWidth: '1180px', padding: '32px 32px 80px' }}>

      <section style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
        gap: '20px', alignItems: 'stretch', marginBottom: '22px'
      }} className="homeHeroGrid">
        <div style={{
          background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '32px', boxShadow: 'var(--color-shadow)'
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--color-info)' }}>
            Andwell Innovation and Growth
          </p>
          <h1 style={{ margin: 0, fontSize: 'clamp(34px, 5vw, 58px)', letterSpacing: '-0.06em', lineHeight: 0.98 }}>
            Build the future of high acuity community care with source based intelligence.
          </h1>
          <p style={{ margin: '20px 0 0', fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.75, maxWidth: '780px' }}>
            {innovationStatement}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px' }}>
            {setView && <button className="btn primary" onClick={() => setView('intake')}>Build Andwell Intelligence</button>}
            {setView && <button className="btn" onClick={() => setView('reports')}>View Built Outputs</button>}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, var(--color-bg-secondary), var(--color-bg-primary))',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
          padding: '24px', boxShadow: 'var(--color-shadow)', display: 'flex', flexDirection: 'column', gap: '14px'
        }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
            Source to output workflow
          </p>
          <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.04em' }}>
            Enter sources. Receive intelligence.
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
            The system turns public source material into comparison, market geography, strategy, field guidance, and leadership output.
          </p>
          <div style={{ display: 'grid', gap: '8px', marginTop: '4px' }}>
            {readiness.map((item) => <ReadyPill key={item} label={item} />)}
          </div>
        </div>
      </section>

      <section style={{
        background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: '22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
              How intelligence is built
            </p>
            <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.04em' }}>
              The system handles the evidence work behind the scenes.
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <ReadyPill label={hasReport ? `${currentReport?.competitorsAnalyzed ?? 0} competitors analyzed` : 'Ready to build'} />
            <ReadyPill label={competitorCount > 0 ? `${competitorCount} sources prepared` : 'Awaiting public sources'} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
          {processSteps.map((step, index) => (
            <div key={step} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
              <span style={{ display: 'inline-flex', width: '28px', height: '28px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-bg-primary)', color: 'var(--color-info)', fontWeight: 900, fontSize: '12px', border: '1px solid var(--color-border)', marginBottom: '10px' }}>
                {index + 1}
              </span>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.35 }}>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        {outputPreviews.map((link) => (
          <button
            key={link.view}
            onClick={() => setView?.(link.view)}
            style={{
              background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: '22px', textAlign: 'left', cursor: 'pointer',
              transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease', display: 'block', width: '100%', minHeight: '150px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = link.accent; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--color-shadow)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ display: 'inline-block', width: '34px', height: '4px', borderRadius: '99px', background: link.accent, marginBottom: '18px' }} />
            <p style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>{link.title}</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{link.desc}</p>
          </button>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {[
          ['What', 'The system turns public market evidence into safe, usable Andwell growth intelligence.'],
          ['Why', 'Andwell needs repeatable intelligence for partnerships, payer value, service line positioning, field coaching, and high acuity community care growth.'],
          ['How', 'The system ingests public sources, scrubs unsupported claims, maps evidence to Andwell capabilities, compares competitors, identifies market opportunity, and creates leadership ready outputs.'],
        ].map(([title, body]) => (
          <div key={title} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 900, color: 'var(--color-text-primary)' }}>{title}</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>{body}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
