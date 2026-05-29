'use client';

import React, { useState, useMemo } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { getReferralProfile, getReferralSourceTypes, getCompetitorIntelligence, getAllCompetitorIntelligence } from '../../../lib/referral-sources';
import type { IntelligenceReport, ReferralSourceType } from '../../../lib/types';
import type { View } from '../../../lib/command-center/types';

export function ReferralSources({ currentReport, setView }: {
  currentReport: IntelligenceReport | null;
  setView?: (view: View) => void;
}) {
  const [selectedType, setSelectedType] = useState<ReferralSourceType>('Hospital');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [repName, setRepName] = useState<string>('');
  const [copied, setCopied] = useState<string>('');
  const [viewMode, setViewMode] = useState<'referral-source' | 'competitor'>('referral-source');

  const sourceTypes = useMemo(() => getReferralSourceTypes(), []);
  const competitors = useMemo(() => getAllCompetitorIntelligence(), []);
  const profile = useMemo(() => {
    if (viewMode === 'competitor' && selectedCompetitor) {
      const competitorProfile = getCompetitorIntelligence(selectedCompetitor);
      if (competitorProfile) {
        return {
          sourceType: selectedCompetitor,
          leadService: competitorProfile.leadService,
          positioningLanguage: competitorProfile.positioningLanguage,
          painPoints: competitorProfile.painPoints,
          referralCta: competitorProfile.referralCta,
          discoveryQuestions: [
            `What is ${selectedCompetitor}'s market strategy in Maine?`,
            `Which counties does ${selectedCompetitor} prioritize?`,
            `What are ${selectedCompetitor}'s service strengths?`,
            `Where are ${selectedCompetitor}'s vulnerabilities?`,
            `How can Andwell differentiate against ${selectedCompetitor}?`,
            `What partnership opportunities exist?`
          ],
          serviceLines: competitorProfile.services.map(s => ({
            name: s.serviceName,
            relevance: s.strength === 'strong' ? 'High' as const : s.strength === 'moderate' ? 'Medium' as const : 'Low' as const,
            reason: `${s.serviceName}: ${s.positioning}`
          }))
        };
      }
    }
    return getReferralProfile(selectedType);
  }, [selectedType, selectedCompetitor, viewMode]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const saveProfile = () => {
    if (!accountName || !repName) {
      alert('Please enter account name and rep name');
      return;
    }
    const profileData = {
      accountName,
      repName,
      sourceType: selectedType,
      profile,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`referral-profile-${accountName}`, JSON.stringify(profileData));
    alert(`Profile saved for ${accountName}`);
  };

  return <>
    <section className="section">
      <div>
        <h1>Referral Source & Competitor Intelligence</h1>
        <p className="text-body">Build targeted conversations with referral sources and track competitive positioning across Maine.</p>
      </div>
    </section>

    <Panel title="Set Up Your Profile (Optional)">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <label>
          <span className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '6px' }}>Account name</span>
          <input
            type="text"
            className="input"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., Northern Light Health"
            style={{ width: '100%' }}
            aria-label="Account name"
          />
        </label>
        <label>
          <span className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '6px' }}>Your name</span>
          <input
            type="text"
            className="input"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            placeholder="e.g., Sarah Johnson"
            style={{ width: '100%' }}
            aria-label="Your name"
          />
        </label>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: 0 }}>Your info customizes all outputs and is saved locally.</p>
    </Panel>

    <Panel title="Select Your Context">
      <div className="row" style={{ gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${viewMode === 'referral-source' ? 'primary' : ''}`}
          onClick={() => { setViewMode('referral-source'); setSelectedCompetitor(''); }}
        >
          📋 Referral Source Types
        </button>
        <button
          className={`btn ${viewMode === 'competitor' ? 'primary' : ''}`}
          onClick={() => setViewMode('competitor')}
        >
          🏥 Maine Competitors
        </button>
      </div>

      {viewMode === 'referral-source' ? (
        <>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '0 0 12px' }}>Select a healthcare provider type to see Andwell's positioning framework:</p>
          <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
            {sourceTypes.map((type) =>
              <button
                key={type}
                className={`btn btn-sm ${selectedType === type ? 'primary' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '0 0 12px' }}>Select a competitor to analyze their positioning and gaps:</p>
          <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
            {competitors.map((comp) =>
              <button
                key={comp.name}
                className={`btn btn-sm ${selectedCompetitor === comp.name ? 'primary' : ''}`}
                onClick={() => setSelectedCompetitor(comp.name)}
              >
                {comp.name}
              </button>
            )}
          </div>
        </>
      )}
    </Panel>

    {!profile ? (
      <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', marginTop: '24px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Select a referral source type or competitor to view strategy details</p>
      </div>
    ) : <>
      <div className="card" style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="row spread" style={{ marginBottom: '16px', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '24px' }}>{profile.sourceType}</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Positioning & outreach strategy</p>
          </div>
          <Badge tone="green">Lead: {profile.leadService}</Badge>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Positioning Language</p>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--color-text-primary)' }}>{profile.positioningLanguage}</p>
            <button
              className="btn btn-sm"
              onClick={() => copyToClipboard(profile.positioningLanguage, 'positioning')}
              style={{ marginTop: '12px', fontSize: '12px' }}
              aria-label={`Copy ${profile.sourceType} positioning language to clipboard`}
            >
              {copied === 'positioning' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Call to Action</p>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--color-text-primary)' }}>{profile.referralCta}</p>
            <button
              className="btn btn-sm"
              onClick={() => copyToClipboard(profile.referralCta, 'cta')}
              style={{ marginTop: '12px', fontSize: '12px' }}
              aria-label={`Copy ${profile.sourceType} call-to-action to clipboard`}
            >
              {copied === 'cta' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <button
          className="btn"
          onClick={() => copyToClipboard(`${profile.sourceType} Profile\n\nAccount: ${accountName || 'Unnamed'}\nRep: ${repName || 'Unnamed'}\n\nLead Service: ${profile.leadService}\n\n${profile.positioningLanguage}\n\n${profile.referralCta}`, 'profile')}
          style={{ fontSize: '13px', padding: '8px 14px', marginTop: '16px', width: '100%' }}
        >
          {copied === 'profile' ? '✓ Full Profile Copied' : 'Copy Full Profile'}
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Key Pain Points</h3>
          <button
            className="btn btn-sm"
            onClick={() => copyToClipboard(profile.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n'), 'pain-points')}
            style={{ fontSize: '12px' }}
          >
            {copied === 'pain-points' ? '✓ Copied' : 'Copy All'}
          </button>
        </div>
        <div className="grid cols2" style={{ gap: '12px' }}>{profile.painPoints.map((pp, i) =>
          <div key={i} className="list-card hover-card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', minWidth: '20px' }}>{i + 1}.</span>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>{pp}</p>
            </div>
          </div>
        )}</div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Discovery Questions</h3>
          <button
            className="btn btn-sm"
            onClick={() => copyToClipboard(profile.discoveryQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n'), 'discovery-q')}
            style={{ fontSize: '12px' }}
          >
            {copied === 'discovery-q' ? '✓ Copied' : 'Copy All'}
          </button>
        </div>
        <div className="list-grid">{profile.discoveryQuestions.map((q, i) =>
          <div key={i} className="list-card hover-card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', minWidth: '20px' }}>{i + 1}.</span>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>{q}</p>
            </div>
          </div>
        )}</div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>Relevant Service Lines</h3>
        <div className="grid cols2" style={{ gap: '12px' }}>{profile.serviceLines.map((sl, i) =>
          <div key={i} className="list-card hover-card" style={{ padding: '12px' }}>
            <div className="row spread" style={{ marginBottom: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '13px' }}>{sl.name}</span>
              <Badge tone={sl.relevance === 'High' ? 'green' : sl.relevance === 'Medium' ? 'amber' : 'blue'}>{sl.relevance}</Badge>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: '1.4' }}>{sl.reason}</p>
          </div>
        )}</div>
      </div>

      <div style={{ marginTop: '32px', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--color-bg-secondary)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>Next Steps</h3>
        <div className="row" style={{ gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={() => setView?.('coaching')} style={{ fontSize: '13px', padding: '10px 16px', flex: '1', minWidth: '160px' }}>
            📋 Create Coaching Plan
          </button>
          <button className="btn" onClick={() => setView?.('battlecards')} style={{ fontSize: '13px', padding: '10px 16px', flex: '1', minWidth: '160px' }}>
            ⚔️ View Field Guidance
          </button>
          <button className="btn" onClick={() => setView?.('ask')} style={{ fontSize: '13px', padding: '10px 16px', flex: '1', minWidth: '160px' }}>
            💬 Ask the System
          </button>
        </div>
      </div>
    </>}
  </>;
}
