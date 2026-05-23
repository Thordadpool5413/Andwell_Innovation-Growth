'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { generateCoachingPlan } from '../../../lib/strategy-brief';
import type { IntelligenceReport } from '../../../lib/types';

export function CoachingMode({ currentReport, onRunScan }: { currentReport: IntelligenceReport | null; onRunScan?: () => void }) {
  const competitors = useMemo(() => {
    if (!currentReport) return [];
    return currentReport.analyses.map((a) => a.name);
  }, [currentReport]);

  const [selectedCompetitor, setSelectedCompetitor] = useState(competitors[0] || '');

  useEffect(() => {
    if (competitors.length > 0 && !selectedCompetitor) {
      setSelectedCompetitor(competitors[0]);
    }
  }, [competitors, selectedCompetitor]);

  const plan = useMemo(() => {
    if (!selectedCompetitor) return null;
    return generateCoachingPlan(selectedCompetitor, currentReport);
  }, [selectedCompetitor, currentReport]);

  if (!currentReport || competitors.length === 0) {
    return <Panel title="No report loaded"><p className="text-body">Run a competitive scan to generate pre-call coaching plans, discovery questions, competitor warnings, and post-call templates for each competitor.</p>{onRunScan && <button className="btn primary" style={{ marginTop: '12px' }} onClick={onRunScan}>Run Competitive Scan →</button>}</Panel>;
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
          <div className="list-grid">{plan.competitorWarnings.map((w, i) =>
            <div key={i} className="status-card status-card--warning">
              <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{w}</p>
            </div>
          )}</div>
        </SectionGroup>
      </div>
      <SectionGroup title="Discovery Questions">
        <div className="list-grid">{plan.discoveryQuestions.map((q, i) =>
          <div key={i} className="list-card hover-card">
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
