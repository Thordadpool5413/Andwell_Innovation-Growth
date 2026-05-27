'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { getReferralProfile, getReferralSourceTypes } from '../../../lib/referral-sources';
import { appendAuditEvent } from '../../../lib/audit-log';
import { useToast } from '../../../components/Toast';
import type { IntelligenceReport, ReferralSourceType } from '../../../lib/types';

const STORAGE_KEY = 'andwell:referralSourceActions';

type ReferralAction = {
  id: string;
  accountName: string;
  sourceType: ReferralSourceType;
  competitorName: string;
  status: 'Draft' | 'Ready for field use' | 'Follow-up created';
  note: string;
  updatedAt: string;
};

function readActions(): ReferralAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as ReferralAction[] : [];
  } catch {
    return [];
  }
}

function writeActions(actions: ReferralAction[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions.slice(0, 100)));
  } catch {}
}

export function ReferralSources({ currentReport }: { currentReport: IntelligenceReport | null }) {
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<ReferralSourceType>('Hospital');
  const [accountName, setAccountName] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState('');
  const [note, setNote] = useState('');
  const [actions, setActions] = useState<ReferralAction[]>([]);

  const sourceTypes = useMemo(() => getReferralSourceTypes(), []);
  const profile = useMemo(() => getReferralProfile(selectedType), [selectedType]);
  const competitors = useMemo(() => currentReport?.analyses.map((analysis) => analysis.name) || [], [currentReport]);
  const score = useMemo(() => currentReport?.competitorScores.find((item) => item.competitorName === selectedCompetitor), [currentReport, selectedCompetitor]);
  const selectedAnalysis = useMemo(() => currentReport?.analyses.find((analysis) => analysis.name === selectedCompetitor), [currentReport, selectedCompetitor]);
  const safeLanguage = selectedAnalysis?.aiExtraction?.safeSalesLanguage?.[0] || profile.positioningLanguage;
  const doNotSay = selectedAnalysis?.aiExtraction?.doNotSayLanguage?.[0] || 'Do not say a competitor does not offer a service unless the evidence specifically proves that claim.';
  const accountLabel = accountName.trim() || `${selectedType} account`;

  useEffect(() => {
    setActions(readActions());
  }, []);

  useEffect(() => {
    if (!selectedCompetitor && competitors.length > 0) setSelectedCompetitor(competitors[0]);
  }, [competitors, selectedCompetitor]);

  const talkTrack = useMemo(() => {
    const competitorLine = selectedCompetitor
      ? `If ${selectedCompetitor} comes up, stay source-based: ${safeLanguage}`
      : safeLanguage;
    return [
      `Account: ${accountLabel}`,
      `Referral source type: ${selectedType}`,
      `Lead service: ${profile.leadService}`,
      `Positioning: ${profile.positioningLanguage}`,
      `Discovery question: ${profile.discoveryQuestions[0]}`,
      `Next step: ${profile.referralCta}`,
      competitorLine,
      `Guardrail: ${doNotSay}`,
    ].join('\n');
  }, [accountLabel, selectedType, profile, selectedCompetitor, safeLanguage, doNotSay]);

  function persistAction(status: ReferralAction['status']) {
    const action: ReferralAction = {
      id: `referral-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      accountName: accountLabel,
      sourceType: selectedType,
      competitorName: selectedCompetitor || 'No competitor selected',
      status,
      note: note.trim() || talkTrack,
      updatedAt: new Date().toISOString(),
    };
    const next = [action, ...actions].slice(0, 100);
    setActions(next);
    writeActions(next);
    appendAuditEvent({
      type: 'referral_action_saved',
      actor: 'Sales Leader',
      description: `${status}: ${action.accountName}`,
      detail: `${selectedType} | ${action.competitorName}`,
    });
    showToast(status === 'Ready for field use' ? 'Referral view marked ready.' : status === 'Follow-up created' ? 'Follow-up action created.' : 'Referral note saved.', 'success');
  }

  async function copyTalkTrack() {
    try {
      await navigator.clipboard.writeText(talkTrack);
      showToast('Talk track copied.', 'success');
    } catch {
      showToast('Copy failed. Select the text and copy manually.', 'error');
    }
  }

  return (
    <>
      <section className="section">
        <div>
          <h1>Referral Source Command View</h1>
          <p className="text-body">Working account views with lead services, pain points, discovery questions, competitor warnings, safe wording, and saved next steps.</p>
        </div>
        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
          <Badge tone={currentReport ? 'green' : 'amber'}>{currentReport ? 'Competitive report connected' : 'Growth model only'}</Badge>
          <Badge tone={actions.length ? 'blue' : 'neutral'}>{actions.length} saved actions</Badge>
        </div>
      </section>

      <div className="accountCommandLayout">
        <Panel title="Account setup">
          <div className="accountFormGrid">
            <label>
              <span>Referral source type</span>
              <select className="select" value={selectedType} onChange={(event) => setSelectedType(event.target.value as ReferralSourceType)}>
                {sourceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <span>Account or contact</span>
              <input className="input" value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Example: discharge planner, SNF, hospital unit" />
            </label>
            <label>
              <span>Relevant competitor</span>
              <select className="select" value={selectedCompetitor} onChange={(event) => setSelectedCompetitor(event.target.value)} disabled={!competitors.length}>
                {!competitors.length ? <option value="">No report loaded</option> : competitors.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
          </div>
          <div className="row" style={{ gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button className="btn primary" onClick={copyTalkTrack}>Copy talk track</button>
            <button className="btn" onClick={() => persistAction('Draft')}>Save note</button>
            <button className="btn" onClick={() => persistAction('Ready for field use')}>Mark ready</button>
            <button className="btn" onClick={() => persistAction('Follow-up created')}>Create follow-up</button>
          </div>
        </Panel>

        <Panel title="Trust and guardrails">
          <div className="list-grid">
            <div className="notice">
              <strong>Safe language</strong><br />{safeLanguage}
            </div>
            <div className="notice danger-soft">
              <strong>Do not say</strong><br />{doNotSay}
            </div>
            {score ? (
              <div className="notice">
                <strong>Competitor warning</strong><br />{selectedCompetitor} is rated {score.threatLevel} with {score.serviceLineMatchScore}% service-line match. Lead with {score.leadWith.slice(0, 3).join(', ')}.
              </div>
            ) : (
              <div className="notice">
                <strong>Competitor warning</strong><br />Load a scan to add competitor-specific warnings. Until then, use Andwell service depth and avoid unsupported comparisons.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <SectionGroup title={`${profile.sourceType} play`}>
        <div className="accountPlayGrid">
          <article className="accountPlayPrimary">
            <div className="row spread" style={{ gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <h3>{accountLabel}</h3>
              <Badge tone="green">Lead: {profile.leadService}</Badge>
            </div>
            <p><strong>Positioning:</strong> {profile.positioningLanguage}</p>
            <p><strong>Referral CTA:</strong> {profile.referralCta}</p>
            <textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Manager or rep note for this account..." />
          </article>
          <article>
            <h3>Talk track preview</h3>
            <pre className="talkTrackPreview">{talkTrack}</pre>
          </article>
        </div>
      </SectionGroup>

      <div className="grid cols2">
        <SectionGroup title="Pain points">
          <div className="list-grid">{profile.painPoints.map((painPoint) =>
            <div key={painPoint} className="list-card hover-card"><p className="text-small" style={{ margin: 0 }}>{painPoint}</p></div>
          )}</div>
        </SectionGroup>
        <SectionGroup title="Discovery questions">
          <div className="list-grid">{profile.discoveryQuestions.map((question, index) =>
            <div key={question} className="list-card hover-card"><p className="text-small" style={{ margin: 0 }}>{index + 1}. {question}</p></div>
          )}</div>
        </SectionGroup>
      </div>

      <SectionGroup title="Relevant service lines">
        <div className="grid cols2">{profile.serviceLines.map((serviceLine) =>
          <div key={serviceLine.name} className="list-card hover-card">
            <div className="row spread" style={{ marginBottom: '4px' }}>
              <span className="text-small" style={{ fontWeight: 700 }}>{serviceLine.name}</span>
              <Badge tone={serviceLine.relevance === 'High' ? 'green' : serviceLine.relevance === 'Medium' ? 'amber' : 'blue'}>{serviceLine.relevance}</Badge>
            </div>
            <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>{serviceLine.reason}</p>
          </div>
        )}</div>
      </SectionGroup>

      {actions.length > 0 ? (
        <SectionGroup title="Saved account actions">
          <div className="sourceLibraryList compact">
            {actions.slice(0, 6).map((action) => (
              <article className="sourceLibraryRow savedActionRow" key={action.id}>
                <div>
                  <Badge tone={action.status === 'Ready for field use' ? 'green' : action.status === 'Follow-up created' ? 'blue' : 'neutral'}>{action.status}</Badge>
                  <h3>{action.accountName}</h3>
                  <p>{action.sourceType} | {action.competitorName}</p>
                </div>
                <p>{action.note}</p>
                <small>{new Date(action.updatedAt).toLocaleString()}</small>
              </article>
            ))}
          </div>
        </SectionGroup>
      ) : null}
    </>
  );
}
