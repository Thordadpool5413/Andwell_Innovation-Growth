'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { generateCoachingPlan } from '../../../lib/strategy-brief';
import type { IntelligenceReport } from '../../../lib/types';

export function CoachingMode({ currentReport }: { currentReport: IntelligenceReport | null }) {
  const competitors = useMemo(() => {
    if (!currentReport) return [];
    return currentReport.analyses.map((a) => a.name);
  }, [currentReport]);

  const [selectedCompetitor, setSelectedCompetitor] = useState(competitors[0] || '');

  const plan = useMemo(() => {
    if (!selectedCompetitor) return null;
    return generateCoachingPlan(selectedCompetitor, currentReport);
  }, [selectedCompetitor, currentReport]);

  if (!currentReport || competitors.length === 0) {
    return <Panel title="No report loaded"><p className="text-body">Run or load a report to generate coaching plans for each competitor.</p></Panel>;
  }

  return <>
    <section className="section">
      <div>
        <h1>Manager Coaching Mode</h1>
        <p className="text-body">Generate sales coaching plans with pre-call preparation, discovery questions, competitor warnings, post-call notes, and follow-up drafts.</p>
      </div>
    </section>
    <Panel title="Select competitor">
      <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
        {competitors.map((c) => <button key={c} className={`btn ${selectedCompetitor === c ? 'primary' : ''}`} onClick={() => setSelectedCompetitor(c)}>{c}</button>)}
      </div>
    </Panel>
    {plan && <>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="row spread" style={{ marginBottom: '8px' }}>
          <h3 style={{ margin: 0 }}>{plan.competitor}</h3>
          <Badge>{plan.serviceLine}</Badge>
        </div>
        <div className="notice" style={{ fontSize: '13px' }}>
          <strong className="text-small">Safe language</strong><br />{plan.safeLanguage}
        </div>
      </div>
      <div className="grid cols2" style={{ marginBottom: '16px' }}>
        <SectionGroup title="Pre-Call Plan">
          <div className="card">
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{plan.preCallPlan}</p>
          </div>
        </SectionGroup>
        <SectionGroup title="Competitor Warnings">
          <div style={{ display: 'grid', gap: '6px' }}>{plan.competitorWarnings.map((w, i) =>
            <div key={i} className="hover-card" style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-warning)', background: 'rgba(245,158,11,0.05)' }}>
              <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{w}</p>
            </div>
          )}</div>
        </SectionGroup>
      </div>
      <SectionGroup title="Discovery Questions">
        <div style={{ display: 'grid', gap: '8px' }}>{plan.discoveryQuestions.map((q, i) =>
          <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{i + 1}. {q}</p>
          </div>
        )}</div>
      </SectionGroup>
      <div className="grid cols2" style={{ marginTop: '16px' }}>
        <SectionGroup title="Post-Call Notes Template">
          <div className="card">
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{plan.postCallNotes}</p>
          </div>
        </SectionGroup>
        <SectionGroup title="Follow-Up Draft">
          <div className="card">
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{plan.followUpDraft}</p>
          </div>
        </SectionGroup>
      </div>
      {plan.doNotSay.length > 0 && <SectionGroup title="Do Not Say">
        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>{plan.doNotSay.map((d, i) =>
          <Badge key={i} tone="red">{d}</Badge>
        )}</div>
      </SectionGroup>}
    </>}
  </>;
}
