'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { generateCoachingPlan, type CoachingPlan } from '../../../lib/strategy-brief';
import { generateCompetitorCoachingPlan } from '../../../lib/coaching-plans';
import { getAllCompetitors } from '../../../lib/command-center/competitor-intelligence';
import type { IntelligenceReport } from '../../../lib/types';

interface CoachingSession {
  repName: string;
  accountName: string;
  competitor: string;
  preCallPlan: string;
  postCallNotes: string;
  followUpDraft: string;
  savedAt?: string;
}

export function CoachingMode({ currentReport, onRunScan, preselectedCompetitor }: { currentReport: IntelligenceReport | null; onRunScan?: () => void; preselectedCompetitor?: string }) {
  const scannedCompetitors = useMemo(() => {
    if (!currentReport) return [];
    return currentReport.analyses.map((a) => a.name);
  }, [currentReport]);

  const maineCompetitors = useMemo(() => {
    return getAllCompetitors().map(c => c.name);
  }, []);

  const allCompetitors = useMemo(() => {
    const combined = [...new Set([...scannedCompetitors, ...maineCompetitors])];
    return combined.sort();
  }, [scannedCompetitors, maineCompetitors]);

  const [selectedCompetitor, setSelectedCompetitor] = useState(preselectedCompetitor || allCompetitors[0] || '');
  const [repName, setRepName] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [preCallPlan, setPreCallPlan] = useState<string>('');
  const [postCallNotes, setPostCallNotes] = useState<string>('');
  const [followUpDraft, setFollowUpDraft] = useState<string>('');
  const [copied, setCopied] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedCompetitor && preselectedCompetitor !== selectedCompetitor) {
      setSelectedCompetitor(preselectedCompetitor);
    }
  }, [preselectedCompetitor]);

  useEffect(() => {
    if (allCompetitors.length > 0 && !selectedCompetitor) {
      setSelectedCompetitor(allCompetitors[0]);
    }
  }, [allCompetitors, selectedCompetitor]);

  const plan: CoachingPlan | null = useMemo(() => {
    if (!selectedCompetitor || !currentReport) return null;
    return generateCoachingPlan(selectedCompetitor, currentReport);
  }, [selectedCompetitor, currentReport]);

  useEffect(() => {
    if (plan && !preCallPlan) {
      setPreCallPlan(plan.preCallPlan);
      setPostCallNotes(plan.postCallNotes);
      setFollowUpDraft(plan.followUpDraft);
      setSaved(false);
    }
  }, [plan, preCallPlan]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const saveCoachingSession = () => {
    if (!repName || !accountName) {
      alert('Please enter rep name and account name');
      return;
    }
    const session: CoachingSession = {
      repName,
      accountName,
      competitor: selectedCompetitor,
      preCallPlan,
      postCallNotes,
      followUpDraft,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`coaching-${accountName}-${selectedCompetitor}`, JSON.stringify(session));
    setSaved(true);
    alert(`Coaching plan saved for ${accountName} - ${selectedCompetitor}`);
  };

  const exportCoachingPlan = () => {
    if (!repName || !accountName) {
      alert('Please enter rep name and account name');
      return;
    }
    const content = `COACHING PLAN
=====================================
Rep: ${repName}
Account: ${accountName}
Competitor: ${selectedCompetitor}
Generated: ${new Date().toLocaleString()}

PRE-CALL PLAN
${preCallPlan}

DISCOVERY QUESTIONS
${plan?.discoveryQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

COMPETITOR WARNINGS
${plan?.competitorWarnings.map((w: string) => `• ${w}`).join('\n')}

POST-CALL NOTES
${postCallNotes}

FOLLOW-UP DRAFT
${followUpDraft}

DO NOT SAY
${plan?.doNotSay.map((d: string) => `• ${d}`).join('\n') || 'None'}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coaching-${accountName}-${selectedCompetitor}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (allCompetitors.length === 0) {
    return <Panel title="No competitors available"><p className="text-body">Run a competitive scan to generate pre-call coaching plans, or select from preloaded Maine competitors.</p>{onRunScan && <button className="btn primary" style={{ marginTop: '12px' }} onClick={onRunScan}>Run Competitive Scan →</button>}</Panel>;
  }

  return <>
    <section className="section">
      <div>
        <h1>Pre-Call Coaching Plans</h1>
        <p className="text-body">Create personalized coaching for sales calls. Choose a competitor and account, then customize your strategy.</p>
      </div>
      <div className="row" style={{ gap: '8px', flexShrink: 0 }}>
        {saved && <Badge tone="green">Plan saved</Badge>}
        {maineCompetitors.includes(selectedCompetitor) && <Badge tone="blue">Maine Competitor</Badge>}
      </div>
    </section>

    <Panel title="Session Details">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <label>
          <span className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)' }}>Your name</span>
          <input
            type="text"
            className="input"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            placeholder="e.g., Sarah Johnson"
            style={{ width: '100%' }}
          />
        </label>
        <label>
          <span className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)' }}>Account name</span>
          <input
            type="text"
            className="input"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., Northern Light Health"
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div className="row" style={{ gap: '8px' }}>
        <button className="btn primary" onClick={saveCoachingSession} disabled={!repName || !accountName} style={{ fontSize: '13px', padding: '8px 14px' }}>
          Save Plan
        </button>
        <button className="btn" onClick={exportCoachingPlan} disabled={!repName || !accountName} style={{ fontSize: '13px', padding: '8px 14px' }}>
          Export as Text
        </button>
      </div>
    </Panel>

    <Panel title="Choose Competitor">
      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>
        {scannedCompetitors.length > 0 && `${scannedCompetitors.length} scanned + ${maineCompetitors.length} Maine competitors`}
        {scannedCompetitors.length === 0 && `${maineCompetitors.length} Maine competitors preloaded`}
      </p>
      <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
        {allCompetitors.map((c) => (
          <button key={c} className={`btn ${selectedCompetitor === c ? 'primary' : ''}`} onClick={() => setSelectedCompetitor(c)} style={{ fontSize: '13px', padding: '8px 14px' }}>
            {c} {maineCompetitors.includes(c) && '🏥'}
          </button>
        ))}
      </div>
    </Panel>

    {plan && <>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="row spread" style={{ marginBottom: '8px' }}>
          <h3 style={{ margin: 0 }}>{plan.competitor}</h3>
          <Badge>{plan.serviceLine}</Badge>
        </div>
        <div className="notice" style={{ fontSize: '13px' }}>
          <strong className="text-small">Safe Language</strong><br />{plan.safeLanguage}
        </div>
      </div>

      <SectionGroup title="Pre-Call Plan" action={
        <button
          className="btn"
          onClick={() => copyToClipboard(preCallPlan, 'pre-call')}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          {copied === 'pre-call' ? '✓ Copied' : 'Copy'}
        </button>
      }>
        <label>
          <textarea
            className="textarea"
            value={preCallPlan}
            onChange={(e) => setPreCallPlan(e.target.value)}
            style={{ minHeight: '120px', width: '100%' }}
          />
        </label>
      </SectionGroup>

      <div style={{ marginBottom: '16px' }}>
        <SectionGroup title="Competitor Warnings">
          <div className="list-grid">{plan.competitorWarnings.map((w: string, i: number) =>
            <div key={i} className="status-card status-card--warning">
              <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{w}</p>
            </div>
          )}</div>
        </SectionGroup>
      </div>

      <SectionGroup title="Discovery Questions" action={
        <button
          className="btn"
          onClick={() => copyToClipboard(plan.discoveryQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n'), 'discovery')}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          {copied === 'discovery' ? '✓ Copied' : 'Copy All'}
        </button>
      }>
        <div className="list-grid">{plan.discoveryQuestions.map((q: string, i: number) =>
          <div key={i} className="list-card hover-card">
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{i + 1}. {q}</p>
          </div>
        )}</div>
      </SectionGroup>

      <div className="grid cols2" style={{ marginTop: '16px' }}>
        <SectionGroup title="Post-Call Notes" action={
          <button
            className="btn"
            onClick={() => copyToClipboard(postCallNotes, 'post-call')}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            {copied === 'post-call' ? '✓ Copied' : 'Copy'}
          </button>
        }>
          <label>
            <textarea
              className="textarea"
              value={postCallNotes}
              onChange={(e) => setPostCallNotes(e.target.value)}
              style={{ minHeight: '120px', width: '100%' }}
            />
          </label>
        </SectionGroup>

        <SectionGroup title="Follow-Up Draft" action={
          <button
            className="btn"
            onClick={() => copyToClipboard(followUpDraft, 'followup')}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            {copied === 'followup' ? '✓ Copied' : 'Copy'}
          </button>
        }>
          <label>
            <textarea
              className="textarea"
              value={followUpDraft}
              onChange={(e) => setFollowUpDraft(e.target.value)}
              style={{ minHeight: '120px', width: '100%' }}
            />
          </label>
        </SectionGroup>
      </div>

      {plan.doNotSay.length > 0 && <SectionGroup title="Do Not Say">
        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>{plan.doNotSay.map((d: string, i: number) =>
          <Badge key={i} tone="red">{d}</Badge>
        )}</div>
      </SectionGroup>}
    </>}
  </>;
}
