'use client';

import React from 'react';
import type { View } from '../../../lib/command-center/types';
import type { CompetitorInput, IntelligenceReport } from '../../../lib/types';

type RoleView = string;

const innovationStatement = 'Innovation and Growth is where Andwell Health Partners turns vision into infrastructure. We are building the future of high acuity community care, creating post acute partnerships that make us essential to Maine, connecting complex services through technology, and developing the value based contracting model that allows us to take risk, deliver better outcomes, save payers money, and grow because we are built for the complexity others cannot manage.';

const intelligenceCards: { title: string; desc: string; view: View; eyebrow: string }[] = [
  { title: 'Advantage Matrix', eyebrow: 'Capability Comparison', desc: 'Compare Andwell capabilities against public competitor evidence with safe positioning language.', view: 'matrix' },
  { title: 'Growth Map', eyebrow: 'Market Opportunity', desc: 'Understand where growth potential, saturation, partnership value, and field focus intersect.', view: 'heatmap' },
  { title: 'Strategy', eyebrow: 'Growth Plays', desc: 'Translate market evidence into referral source angles, payer value positioning, and next moves.', view: 'growth' },
  { title: 'Executive Report', eyebrow: 'Leadership Output', desc: 'Turn source based intelligence into a polished leadership ready report package.', view: 'board-packet' },
];

const focusAreas = [
  { title: 'Capability intelligence', body: 'The system organizes Andwell service strengths and compares them against public competitor evidence.' },
  { title: 'Market intelligence', body: 'The Growth Map connects capability differences to geography, saturation, and field focus priorities.' },
  { title: 'Field execution', body: 'Field Guidance turns intelligence into safe talk tracks, questions, and what not to say.' },
  { title: 'Leadership output', body: 'The Executive Report packages market signals, strategy, payer value, and recommended actions.' },
];

export function Home({ setView }: {
  roleView?: RoleView;
  setView?: (view: View) => void;
  currentReport?: IntelligenceReport | null;
  competitors?: CompetitorInput[];
  busy?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <div style={{ maxWidth: '1180px', padding: '36px 32px 88px' }}>
      <section style={{
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: '28px',
        padding: '44px',
        marginBottom: '22px',
        boxShadow: 'var(--color-shadow)'
      }}>
        <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-info)' }}>
          Andwell Innovation and Growth
        </p>
        <h1 style={{ margin: 0, maxWidth: '900px', fontSize: 'clamp(36px, 5.2vw, 64px)', letterSpacing: '-0.065em', lineHeight: 0.98 }}>
          Intelligence for capability, market, field, and leadership decisions.
        </h1>
        <p style={{ margin: '22px 0 0', maxWidth: '880px', fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.78 }}>
          {innovationStatement}
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        {intelligenceCards.map((card) => (
          <button
            key={card.view}
            onClick={() => setView?.(card.view)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '210px',
              width: '100%',
              padding: '24px',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '24px',
              transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-info)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--color-shadow)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ marginBottom: '18px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>{card.eyebrow}</span>
            <span style={{ display: 'block' }}>
              <strong style={{ display: 'block', fontSize: '22px', letterSpacing: '-0.04em', color: 'var(--color-text-primary)' }}>{card.title}</strong>
              <span style={{ display: 'block', marginTop: '12px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>{card.desc}</span>
            </span>
          </button>
        ))}
      </section>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 0.95fr) minmax(320px, 1.05fr)',
        gap: '18px',
        marginBottom: '22px'
      }} className="homeHeroGrid">
        <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '28px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
            Leadership view
          </p>
          <h2 style={{ margin: 0, fontSize: '28px', letterSpacing: '-0.05em', lineHeight: 1.08 }}>
            A clear view of market position, growth signals, and strategic next actions.
          </h2>
          <p style={{ margin: '16px 0 0', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.75 }}>
            Leadership can move from public market evidence to strategic implications without reading through raw findings, review queues, or operational diagnostics.
          </p>
        </div>
        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '28px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
            Current intelligence focus
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            {focusAreas.map((item) => (
              <div key={item.title} style={{ border: '1px solid var(--color-border)', borderRadius: '18px', padding: '16px', background: 'var(--color-bg-secondary)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 900, color: 'var(--color-text-primary)' }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '26px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Field use</p>
          <h3 style={{ margin: 0, fontSize: '22px', letterSpacing: '-0.04em' }}>Safe language for real referral conversations.</h3>
          <p style={{ margin: '14px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>Field teams get practical language, questions to ask, and boundaries that prevent unsupported competitor claims.</p>
        </div>
        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '26px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Market opportunity</p>
          <h3 style={{ margin: 0, fontSize: '22px', letterSpacing: '-0.04em' }}>Where capability advantage meets geography.</h3>
          <p style={{ margin: '14px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>The Growth Map turns source evidence into area based opportunity, saturation, partnership, and payer value signals.</p>
        </div>
        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '26px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Evidence discipline</p>
          <h3 style={{ margin: 0, fontSize: '22px', letterSpacing: '-0.04em' }}>Useful intelligence without overclaiming.</h3>
          <p style={{ margin: '14px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>Outputs stay tied to public source evidence, confidence, safe positioning, and what not to say.</p>
        </div>
      </section>
    </div>
  );
}
