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
        <h1>Referral Source & Competitor Profiles</h1>
        <p className="text-body">View positioning, pain points, and discovery questions for referral source types or specific Maine competitors.</p>
      </div>
    </section>

    <Panel title="Your Information">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <label>
          <span className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)' }}>Account name (optional)</span>
          <input
            type="text"
            className="input"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., Northern Light Health"
            style={{ width: '100%' }}
          />
        </label>
        <label>
          <span className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)' }}>Your name (optional)</span>
          <input
            type="text"
            className="input"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            placeholder="e.g., Sarah Johnson"
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '0 0 8px' }}>💡 Fill these to customize outputs with your account and rep name. Saved to your browser only.</p>
    </Panel>

    <Panel title="Choose Your View">
      <div style={{ marginBottom: '12px', padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        {viewMode === 'referral-source'
          ? '📋 Referral Source Templates are conversation frameworks for any healthcare provider type (Hospitals, SNFs, Primary Care, etc.)'
          : '🏥 Competitive Intelligence shows real Maine competitors preloaded in the system. See their strengths, gaps, and positioning.'}
      </div>
      <div className="row" style={{ gap: '8px', marginBottom: '16px' }}>
        <button
          className={`btn ${viewMode === 'referral-source' ? 'primary' : ''}`}
          onClick={() => { setViewMode('referral-source'); setSelectedCompetitor(''); }}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          Referral Source Templates
        </button>
        <button
          className={`btn ${viewMode === 'competitor' ? 'primary' : ''}`}
          onClick={() => setViewMode('competitor')}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          Maine Competitors (Preloaded)
        </button>
      </div>

      {viewMode === 'referral-source' ? (
        <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
          {sourceTypes.map((type) =>
            <button
              key={type}
              className={`btn ${selectedType === type ? 'primary' : ''}`}
              onClick={() => setSelectedType(type)}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              {type}
            </button>
          )}
        </div>
      ) : (
        <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
          {competitors.map((comp) =>
            <button
              key={comp.name}
              className={`btn ${selectedCompetitor === comp.name ? 'primary' : ''}`}
              onClick={() => setSelectedCompetitor(comp.name)}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              {comp.name}
            </button>
          )}
        </div>
      )}
    </Panel>

    {profile && <>
      <SectionGroup title={`${profile.sourceType} Strategy`} action={
        <button
          className="btn"
          onClick={() => copyToClipboard(`${profile.sourceType} Profile\n\nAccount: ${accountName || 'Unnamed'}\nRep: ${repName || 'Unnamed'}\n\nLead Service: ${profile.leadService}\n\n${profile.positioningLanguage}\n\n${profile.referralCta}`, 'profile')}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          {copied === 'profile' ? '✓ Copied' : 'Copy Profile'}
        </button>
      }>
        <div className="card">
          <div className="row spread" style={{ marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>{profile.sourceType}</h3>
            <Badge tone="green">Lead: {profile.leadService}</Badge>
          </div>
          <div className="notice" style={{ fontSize: '13px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              <strong className="text-small">Positioning Language</strong>
              <button
                className="btn btn-sm"
                onClick={() => copyToClipboard(profile.positioningLanguage, 'positioning')}
              >
                {copied === 'positioning' ? '✓' : 'Copy'}
              </button>
            </div>
            <p style={{ margin: '0 0 12px' }}>{profile.positioningLanguage}</p>
          </div>
          <div className="notice" style={{ fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              <strong className="text-small">Call to Action</strong>
              <button
                className="btn btn-sm"
                onClick={() => copyToClipboard(profile.referralCta, 'cta')}
              >
                {copied === 'cta' ? '✓' : 'Copy'}
              </button>
            </div>
            <p style={{ margin: 0 }}>{profile.referralCta}</p>
          </div>
        </div>
      </SectionGroup>

      <SectionGroup title="Pain Points" action={
        <button
          className="btn"
          onClick={() => copyToClipboard(profile.painPoints.join('\n• '), 'pain-points')}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          {copied === 'pain-points' ? '✓ Copied' : 'Copy All'}
        </button>
      }>
        <div className="grid cols2">{profile.painPoints.map((pp, i) =>
          <div key={i} className="list-card hover-card">
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{pp}</p>
          </div>
        )}</div>
      </SectionGroup>

      <SectionGroup title="Discovery Questions" action={
        <button
          className="btn"
          onClick={() => copyToClipboard(profile.discoveryQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n'), 'discovery-q')}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          {copied === 'discovery-q' ? '✓ Copied' : 'Copy All'}
        </button>
      }>
        <div className="list-grid">{profile.discoveryQuestions.map((q, i) =>
          <div key={i} className="list-card hover-card">
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{i + 1}. {q}</p>
          </div>
        )}</div>
      </SectionGroup>

      <SectionGroup title="Relevant Service Lines">
        <div className="grid cols2">{profile.serviceLines.map((sl, i) =>
          <div key={i} className="list-card hover-card">
            <div className="row spread" style={{ marginBottom: '4px' }}>
              <span className="text-small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{sl.name}</span>
              <Badge tone={sl.relevance === 'High' ? 'green' : sl.relevance === 'Medium' ? 'amber' : 'blue'}>{sl.relevance}</Badge>
            </div>
            <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>{sl.reason}</p>
          </div>
        )}</div>
      </SectionGroup>

      <Panel title="Next Steps">
        <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setView?.('coaching')} style={{ fontSize: '13px', padding: '8px 14px' }}>
            Create Coaching Plan →
          </button>
          <button className="btn" onClick={() => setView?.('battlecards')} style={{ fontSize: '13px', padding: '8px 14px' }}>
            View Field Guidance →
          </button>
          <button className="btn" onClick={() => setView?.('ask')} style={{ fontSize: '13px', padding: '8px 14px' }}>
            Ask the System →
          </button>
        </div>
      </Panel>
    </>}
  </>;
}
