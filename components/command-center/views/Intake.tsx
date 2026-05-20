'use client';

import React from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import type { CompetitorInput } from '../../../lib/types';

export function Intake({ competitors, setCompetitors, urlInput, setUrlInput, addUrls, saveCompetitors, runAnalysis, busy }: { competitors: CompetitorInput[]; setCompetitors: (items: CompetitorInput[]) => void; urlInput: string; setUrlInput: (value: string) => void; addUrls: () => void; saveCompetitors: () => void; runAnalysis: () => void; busy: boolean }) {
  function updateCompetitor(index: number, patch: Partial<CompetitorInput>) {
    setCompetitors((current: CompetitorInput[]) => Array.isArray(current) ? current.map((competitor, itemIndex) => itemIndex === index ? { ...competitor, ...patch } : competitor) : []);
  }

  return <>
    <section className="section"><div><h1>Competitor Intake</h1><p className="text-body">Paste provider names with websites. The backend preserves supplied provider names, validates public URLs, crawls high value pages, resolves website identity, and applies AI extraction when configured.</p></div><Badge>{competitors.length} of 25 selected</Badge></section>
    <Panel title="Add Competitor Websites">
      <textarea className="textarea largeInput" value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder={'Northern Light Health | https://northernlighthealth.org\nMaineHealth Home Health and Hospice - https://www.mainehealth.org/mainehealth-home-health-and-hospice\nAmedisys | https://locations.amedisys.com/me/bangor/hospice-4804/\nhttps://www.gentivahs.com/find-care-near-you/'} />
      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', margin: '8px 0 0' }}>Accepted formats: Provider Name | URL, Provider Name - URL, Provider Name, URL, or URL only.</p>
      <div className="row" style={{ gap: '8px', marginTop: '8px' }}><button className="btn" onClick={addUrls}>Add URLs</button><button className="btn" disabled={busy} onClick={saveCompetitors}>Save library</button><button className="btn primary" disabled={busy} onClick={runAnalysis}>{busy ? 'Running competitive scan' : 'Run Competitive Scan'}</button></div>
    </Panel>
    {competitors.length > 0 ? <SectionGroup title="Competitor list"><div className="grid cols2">{competitors.map((competitor, index) => <div className="briefItem hover-card competitorIntakeCard" key={`${competitor.url}${index}`}>
      <div className="competitorIntakeFields">
        <label><span>Provider name</span><input className="input" value={competitor.name || ''} onChange={(event) => updateCompetitor(index, { name: event.target.value })} placeholder="Provider name" /></label>
        <label><span>Website</span><input className="input" value={competitor.url || ''} onChange={(event) => updateCompetitor(index, { url: event.target.value })} placeholder="https://provider.org" /></label>
        <label><span>Market / note</span><input className="input" value={competitor.market || ''} onChange={(event) => updateCompetitor(index, { market: event.target.value })} placeholder="Needs review" /></label>
      </div>
      <button className="btn danger" onClick={() => setCompetitors((current: CompetitorInput[]) => Array.isArray(current) ? current.filter((_, i) => i !== index) : [])}>Remove</button>
    </div>)}</div></SectionGroup> : null}
  </>;
}
