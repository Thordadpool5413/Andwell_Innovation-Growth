'use client';

import React, { useState, useMemo } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { buildBattlecard, getBuilderOptions } from '../../../lib/battlecard-builder';
import type { IntelligenceReport, BattlecardTemplate } from '../../../lib/types';

export function BattlecardBuilder({ currentReport }: { currentReport: IntelligenceReport | null }) {
  const options = useMemo(() => getBuilderOptions(currentReport), [currentReport]);
  const [competitor, setCompetitor] = useState(options.competitors[0] || 'Competitor');
  const [county, setCounty] = useState(options.counties[0]);
  const [serviceLine, setServiceLine] = useState(options.services[0]);
  const [audience, setAudience] = useState(options.audiences[0]);
  const [objection, setObjection] = useState(options.objections[0]);
  const [battlecard, setBattlecard] = useState<BattlecardTemplate | null>(null);

  function generate() {
    const card = buildBattlecard({
      competitor,
      county,
      serviceLine,
      audience,
      objection,
      report: currentReport || undefined
    });
    setBattlecard(card);
  }

  const hasCompetitors = options.competitors.length > 0;

  return <>
    <section className="section">
      <div>
        <h1>Battlecard Builder</h1>
        <p className="text-body">Generate a dynamic sales battlecard by selecting a competitor, county, service line, audience, and objection.</p>
      </div>
    </section>
    {!hasCompetitors
      ? <Panel title="No competitors loaded"><p className="text-body">Run or load a report first to populate competitor data for battlecard generation.</p></Panel>
      : <><Panel title="Battlecard parameters">
        <div style={{ display: 'grid', gap: '12px' }}>
          <label className="text-small" style={{ fontWeight: 600 }}>Competitor
            <select className="select w-full" value={competitor} onChange={(e) => setCompetitor(e.target.value)} style={{ marginTop: '4px' }}>
              {options.competitors.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <div className="grid cols2">
            <label className="text-small" style={{ fontWeight: 600 }}>County
              <select className="select w-full" value={county} onChange={(e) => setCounty(e.target.value)} style={{ marginTop: '4px' }}>
                {options.counties.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-small" style={{ fontWeight: 600 }}>Service line
              <select className="select w-full" value={serviceLine} onChange={(e) => setServiceLine(e.target.value)} style={{ marginTop: '4px' }}>
                {options.services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <div className="grid cols2">
            <label className="text-small" style={{ fontWeight: 600 }}>Audience
              <select className="select w-full" value={audience} onChange={(e) => setAudience(e.target.value)} style={{ marginTop: '4px' }}>
                {options.audiences.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
            <label className="text-small" style={{ fontWeight: 600 }}>Objection
              <select className="select w-full" value={objection} onChange={(e) => setObjection(e.target.value)} style={{ marginTop: '4px' }}>
                {options.objections.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>
          <button className="btn primary" onClick={generate} style={{ alignSelf: 'flex-start' }}>Generate battlecard</button>
        </div>
      </Panel>
      {battlecard &&
        <SectionGroup title="Generated battlecard">
          <div className="card">
            <div className="row spread" style={{ marginBottom: '8px' }}>
              <h3 style={{ margin: 0 }}>{battlecard.competitor} &mdash; {battlecard.serviceLine}</h3>
              <Badge>{battlecard.county}</Badge>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div><p className="text-small text-overline" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>Opening</p><p className="text-body" style={{ margin: 0 }}>{battlecard.opening}</p></div>
              <div><p className="text-small text-overline" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>Discovery questions</p><ul style={{ margin: 0, paddingLeft: '16px' }}>{battlecard.discoveryQuestions.map((q, i) => <li key={i} className="text-small" style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{q}</li>)}</ul></div>
              <div><p className="text-small text-overline" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>Positioning</p><p className="text-body" style={{ margin: 0 }}>{battlecard.positioning}</p></div>
              <div><p className="text-small text-overline" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>Objection response</p><p className="text-body" style={{ margin: 0 }}>{battlecard.objectionResponse}</p></div>
              <div><p className="text-small text-overline" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>Close</p><p className="text-body" style={{ margin: 0 }}>{battlecard.close}</p></div>
            </div>
          </div>
        </SectionGroup>
      }</>
    }
  </>;
}
