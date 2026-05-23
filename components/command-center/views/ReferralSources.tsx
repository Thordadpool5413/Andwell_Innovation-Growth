'use client';

import React, { useState, useMemo } from 'react';
import { Badge, Panel, SectionGroup, ExpandableSection } from '../Shared';
import { getReferralProfile, getReferralSourceTypes } from '../../../lib/referral-sources';
import type { IntelligenceReport, ReferralSourceType, ReferralSourceProfile } from '../../../lib/types';

export function ReferralSources({ currentReport }: { currentReport: IntelligenceReport | null }) {
  const [selectedType, setSelectedType] = useState<ReferralSourceType>('Hospital');

  const sourceTypes = useMemo(() => getReferralSourceTypes(), []);
  const profile = useMemo(() => getReferralProfile(selectedType), [selectedType]);

  return <>
    <section className="section">
      <div>
        <h1>Referral Source Command View</h1>
        <p className="text-body">Account-type views with lead services, pain points, and discovery questions for each referral source type.</p>
      </div>
    </section>
    <Panel title="Select referral source type">
      <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
        {sourceTypes.map((type) =>
          <button key={type} className={`btn ${selectedType === type ? 'primary' : ''}`} onClick={() => setSelectedType(type)}>{type}</button>
        )}
      </div>
    </Panel>
    {profile && <>
      <SectionGroup title={profile.sourceType}>
        <div className="card">
          <div className="row spread" style={{ marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>{profile.sourceType}</h3>
            <Badge tone="green">Lead: {profile.leadService}</Badge>
          </div>
          <div className="notice" style={{ fontSize: '13px', marginBottom: '16px' }}>
            <strong className="text-small">Positioning language</strong><br />{profile.positioningLanguage}
          </div>
          <div className="notice" style={{ fontSize: '13px', marginBottom: '16px' }}>
            <strong className="text-small">Referral CTA</strong><br />{profile.referralCta}
          </div>
        </div>
      </SectionGroup>
      <SectionGroup title="Pain points">
        <div className="grid cols2">{profile.painPoints.map((pp, i) =>
          <div key={i} className="list-card hover-card">
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{pp}</p>
          </div>
        )}</div>
      </SectionGroup>
      <SectionGroup title="Discovery questions">
        <div className="list-grid">{profile.discoveryQuestions.map((q, i) =>
          <div key={i} className="list-card hover-card">
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{i + 1}. {q}</p>
          </div>
        )}</div>
      </SectionGroup>
      <SectionGroup title="Relevant service lines">
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
    </>}
  </>;
}
