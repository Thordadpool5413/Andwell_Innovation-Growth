'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { generateCoachingPlan } from '../../../lib/strategy-brief';
import { appendAuditEvent } from '../../../lib/audit-log';
import { useToast } from '../../../components/Toast';
import type { IntelligenceReport } from '../../../lib/types';

const STORAGE_KEY = 'andwell:managerCoachingSessions';

type CoachingStatus = 'Draft' | 'Ready' | 'Completed';

type SavedCoachingSession = {
  id: string;
  competitor: string;
  repName: string;
  accountName: string;
  objective: string;
  status: CoachingStatus;
  updatedAt: string;
  summary: string;
};

function readSessions(): SavedCoachingSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as SavedCoachingSession[] : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: SavedCoachingSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 100)));
  } catch {}
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CoachingMode({ currentReport, onRunScan }: { currentReport: IntelligenceReport | null; onRunScan?: () => void }) {
  const { showToast } = useToast();
  const competitors = useMemo(() => currentReport?.analyses.map((analysis) => analysis.name) || [], [currentReport]);
  const [selectedCompetitor, setSelectedCompetitor] = useState(competitors[0] || '');
  const [repName, setRepName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [objective, setObjective] = useState('Prepare for a referral source conversation and identify the safest next step.');
  const [callTiming, setCallTiming] = useState('This week');
  const [managerNotes, setManagerNotes] = useState('');
  const [preCallPlan, setPreCallPlan] = useState('');
  const [postCallNotes, setPostCallNotes] = useState('');
  const [followUpDraft, setFollowUpDraft] = useState('');
  const [sessions, setSessions] = useState<SavedCoachingSession[]>([]);

  useEffect(() => {
    setSessions(readSessions());
  }, []);

  useEffect(() => {
    if (competitors.length > 0 && !selectedCompetitor) setSelectedCompetitor(competitors[0]);
  }, [competitors, selectedCompetitor]);
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
    if (!plan) return;
    setPreCallPlan(plan.preCallPlan);
    setPostCallNotes(plan.postCallNotes);
    setFollowUpDraft(plan.followUpDraft);
  }, [plan?.competitor, plan?.serviceLine]);

  const exportText = useMemo(() => {
    if (!plan) return '';
    return [
      'Andwell Manager Coaching Plan',
      `Competitor: ${plan.competitor}`,
      `Rep: ${repName || 'Not assigned'}`,
      `Account: ${accountName || 'Not specified'}`,
      `Call timing: ${callTiming}`,
      `Objective: ${objective}`,
      '',
      `Safe language: ${plan.safeLanguage}`,
      '',
      'Pre-call plan:',
      preCallPlan,
      '',
      'Discovery questions:',
      ...plan.discoveryQuestions.map((question, index) => `${index + 1}. ${question}`),
      '',
      'Competitor warnings:',
      ...plan.competitorWarnings.map((warning) => `- ${warning}`),
      '',
      'Post-call notes:',
      postCallNotes,
      '',
      'Follow-up draft:',
      followUpDraft,
      '',
      'Do not say:',
      ...plan.doNotSay.map((item) => `- ${item}`),
      '',
      `Manager notes: ${managerNotes || 'None'}`,
    ].join('\n');
  }, [plan, repName, accountName, callTiming, objective, preCallPlan, postCallNotes, followUpDraft, managerNotes]);

  function saveSession(status: CoachingStatus) {
    if (!plan) return;
    const session: SavedCoachingSession = {
      id: `coaching-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      competitor: plan.competitor,
      repName: repName || 'Unassigned rep',
      accountName: accountName || 'Unspecified account',
      objective,
      status,
      updatedAt: new Date().toISOString(),
      summary: preCallPlan,
    };
    const next = [session, ...sessions].slice(0, 100);
    setSessions(next);
    writeSessions(next);
    appendAuditEvent({
      type: 'coaching_session_saved',
      actor: 'Sales Leader',
      description: `${status} coaching plan: ${session.competitor}`,
      detail: `${session.repName} | ${session.accountName}`,
    });
    showToast(status === 'Completed' ? 'Coaching session completed.' : status === 'Ready' ? 'Coaching plan marked ready.' : 'Coaching draft saved.', 'success');
  }

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(exportText);
      showToast('Coaching plan copied.', 'success');
    } catch {
      showToast('Copy failed. Export the plan instead.', 'error');
    }
  }

  if (!currentReport || competitors.length === 0) {
    return (
      <Panel title="No competitor report loaded">
        <p className="text-body">Manager Coaching Mode needs the Maine competitor intelligence report so plans can include competitor warnings, source-backed safe language, and do-not-say guardrails.</p>
        {onRunScan && <button className="btn primary" style={{ marginTop: '12px' }} onClick={onRunScan}>Open Source Library</button>}
      </Panel>
    );
  }

  return (
    <>
      <section className="section">
        <div>
          <h1>Manager Coaching Mode</h1>
          <p className="text-body">Build, edit, save, copy, export, and complete pre-call coaching plans with competitor warnings and safe field language.</p>
        </div>
        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
          <Badge tone="green">Report connected</Badge>
          <Badge tone={sessions.length ? 'blue' : 'neutral'}>{sessions.length} saved sessions</Badge>
        </div>
      </section>

      <Panel title="Coaching setup">
        <div className="coachingFormGrid">
          <label>
            <span>Competitor</span>
            <select className="select" value={selectedCompetitor} onChange={(event) => setSelectedCompetitor(event.target.value)}>
              {competitors.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label>
            <span>Rep</span>
            <input className="input" value={repName} onChange={(event) => setRepName(event.target.value)} placeholder="Rep name" />
          </label>
          <label>
            <span>Account / referral source</span>
            <input className="input" value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Hospital, SNF, practice, contact" />
          </label>
          <label>
            <span>Call timing</span>
            <select className="select" value={callTiming} onChange={(event) => setCallTiming(event.target.value)}>
              <option>Today</option>
              <option>This week</option>
              <option>This month</option>
              <option>Follow-up needed</option>
            </select>
          </label>
        </div>
        <label className="fullWidthLabel">
          <span>Call objective</span>
          <input className="input" value={objective} onChange={(event) => setObjective(event.target.value)} />
        </label>
      </Panel>

      {plan && (
        <>
          <div className="coachingCommandBar">
            <div>
              <h2>{plan.competitor}</h2>
              <p>{plan.serviceLine} | {repName || 'Unassigned rep'} | {accountName || 'No account selected'}</p>
            </div>
            <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn primary" onClick={() => saveSession('Ready')}>Mark ready</button>
              <button className="btn" onClick={() => saveSession('Draft')}>Save draft</button>
              <button className="btn" onClick={() => saveSession('Completed')}>Complete</button>
              <button className="btn" onClick={copyPlan}>Copy</button>
              <button className="btn" onClick={() => downloadText('andwell-coaching-plan.txt', exportText)}>Export</button>
            </div>
          </div>

          <div className="coachingLayout">
            <div className="coachingMain">
              <SectionGroup title="Editable pre-call plan">
                <textarea className="textarea" value={preCallPlan} onChange={(event) => setPreCallPlan(event.target.value)} />
              </SectionGroup>

              <SectionGroup title="Discovery and role-play prompts">
                <div className="list-grid">
                  {plan.discoveryQuestions.map((question, index) => (
                    <div key={question} className="list-card hover-card">
                      <p className="text-small" style={{ margin: 0 }}>{index + 1}. {question}</p>
                    </div>
                  ))}
                </div>
              </SectionGroup>

              <div className="grid cols2">
                <SectionGroup title="Post-call notes">
                  <textarea className="textarea" value={postCallNotes} onChange={(event) => setPostCallNotes(event.target.value)} />
                </SectionGroup>
                <SectionGroup title="Follow-up draft">
                  <textarea className="textarea" value={followUpDraft} onChange={(event) => setFollowUpDraft(event.target.value)} />
                </SectionGroup>
              </div>

              <SectionGroup title="Manager notes">
                <textarea className="textarea" value={managerNotes} onChange={(event) => setManagerNotes(event.target.value)} placeholder="Coaching observations, commitments, objections, and follow-up assignments..." />
              </SectionGroup>
            </div>

            <aside className="coachingSide">
              <div className="notice">
                <strong>Safe language</strong><br />{plan.safeLanguage}
              </div>
              <div className="list-grid">
                {plan.competitorWarnings.map((warning) => (
                  <div key={warning} className="status-card status-card--warning">
                    <p className="text-small" style={{ margin: 0 }}>{warning}</p>
                  </div>
                ))}
              </div>
              <div className="notice danger-soft">
                <strong>Do not say</strong><br />{plan.doNotSay.join(' ')}
              </div>
            </aside>
          </div>
        </>
      )}

      {sessions.length > 0 ? (
        <SectionGroup title="Saved coaching sessions">
          <div className="sourceLibraryList compact">
            {sessions.slice(0, 6).map((session) => (
              <article className="sourceLibraryRow savedActionRow" key={session.id}>
                <div>
                  <Badge tone={session.status === 'Ready' ? 'green' : session.status === 'Completed' ? 'blue' : 'neutral'}>{session.status}</Badge>
                  <h3>{session.competitor}</h3>
                  <p>{session.repName} | {session.accountName}</p>
                </div>
                <p>{session.objective}</p>
                <small>{new Date(session.updatedAt).toLocaleString()}</small>
              </article>
            ))}
          </div>
        </SectionGroup>
      ) : null}
    </>
  );
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
