'use client';

import React from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import type { CompetitorInput } from '../../../lib/types';

export function Intake({
  competitors,
  setCompetitors,
  urlInput,
  setUrlInput,
  addUrls,
  saveCompetitors,
  runAnalysis,
  runSingleAnalysis,
  busy,
}: {
  competitors: CompetitorInput[];
  setCompetitors: (items: CompetitorInput[] | ((current: CompetitorInput[]) => CompetitorInput[])) => void;
  urlInput: string;
  setUrlInput: (value: string) => void;
  addUrls: () => void;
  saveCompetitors: () => void;
  runAnalysis: () => void;
  runSingleAnalysis?: (competitor: CompetitorInput) => void;
  busy: boolean;
}) {
  function updateCompetitor(index: number, patch: Partial<CompetitorInput>) {
    setCompetitors((current: CompetitorInput[]) =>
      Array.isArray(current)
        ? current.map((competitor, i) => (i === index ? { ...competitor, ...patch } : competitor))
        : []
    );
  }

  function removeCompetitor(index: number) {
    setCompetitors((current: CompetitorInput[]) =>
      Array.isArray(current) ? current.filter((_, i) => i !== index) : []
    );
  }

  const canRun = competitors.length > 0 && !busy;

  return (
    <>
      <section className="section">
        <div>
          <h1>Competitor Intake</h1>
          <p className="text-body">
            Paste provider names with websites. The system validates public URLs, crawls key pages, and applies AI extraction to generate competitive intelligence.
          </p>
        </div>
        <div className="row" style={{ gap: '8px', flexShrink: 0 }}>
          <Badge>{competitors.length} of 25 selected</Badge>
          {competitors.length > 0 && (
            <button className="btn primary" disabled={!canRun} onClick={runAnalysis}>
              {busy ? 'Running scan…' : 'Run Competitive Scan'}
            </button>
          )}
        </div>
      </section>

      <Panel title="Add Competitor Websites">
        <label htmlFor="url-input" className="text-xs text-overline" style={{ display: 'block', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
          Paste one competitor per line
        </label>
        <textarea
          id="url-input"
          className="textarea largeInput"
          aria-label="Competitor websites — one per line"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={
            'Northern Light Health | https://northernlighthealth.org\n' +
            'MaineHealth Home Health - https://www.mainehealth.org/mainehealth-home-health-and-hospice\n' +
            'Amedisys | https://locations.amedisys.com/me/bangor/hospice-4804/\n' +
            'https://www.gentivahs.com/find-care-near-you/'
          }
        />
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', margin: '8px 0 12px' }}>
          Accepted: <code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 5px', borderRadius: '4px' }}>Name | URL</code>
          {' · '}<code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 5px', borderRadius: '4px' }}>Name - URL</code>
          {' · '}<code style={{ background: 'var(--color-bg-tertiary)', padding: '1px 5px', borderRadius: '4px' }}>URL only</code>
        </p>
        <div className="row" style={{ gap: '8px' }}>
          <button className="btn" onClick={addUrls}>Add to list</button>
          <button className="btn" disabled={busy || competitors.length === 0} onClick={saveCompetitors}>Save library</button>
          {competitors.length === 0 && (
            <span className="text-small" style={{ color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>
              Add competitors above, then run the scan.
            </span>
          )}
        </div>
      </Panel>

      {competitors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 32px', borderStyle: 'dashed', marginTop: '0' }}>
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700 }}>No competitors added yet</p>
          <p className="text-small" style={{ color: 'var(--color-text-tertiary)', margin: 0, maxWidth: '420px', marginInline: 'auto' }}>
            Paste provider URLs above and click &ldquo;Add to list&rdquo; to build your competitor library, then run the scan.
          </p>
        </div>
      ) : (
        <SectionGroup title={`Competitor library (${competitors.length})`} action={
          <button className="btn primary" disabled={!canRun} onClick={runAnalysis}>
            {busy ? 'Running scan…' : `Run Scan — ${competitors.length} competitor${competitors.length !== 1 ? 's' : ''}`}
          </button>
        }>
          <div className="grid cols2">
            {competitors.map((competitor, index) => (
              <div className="briefItem hover-card competitorIntakeCard" key={`${competitor.url}${index}`}>
                <div className="competitorIntakeFields">
                  <label htmlFor={`name-${index}`}>
                    <span>Provider name</span>
                    <input
                      id={`name-${index}`}
                      className="input"
                      value={competitor.name || ''}
                      onChange={(e) => updateCompetitor(index, { name: e.target.value })}
                      placeholder="Provider name"
                      aria-label="Provider name"
                    />
                  </label>
                  <label htmlFor={`url-${index}`}>
                    <span>Website</span>
                    <input
                      id={`url-${index}`}
                      className="input"
                      value={competitor.url || ''}
                      onChange={(e) => updateCompetitor(index, { url: e.target.value })}
                      placeholder="https://provider.org"
                      aria-label="Provider website URL"
                      type="url"
                    />
                  </label>
                  <label htmlFor={`market-${index}`}>
                    <span>Market / note</span>
                    <input
                      id={`market-${index}`}
                      className="input"
                      value={competitor.market || ''}
                      onChange={(e) => updateCompetitor(index, { market: e.target.value })}
                      placeholder="Needs review"
                      aria-label="Market or note"
                    />
                  </label>
                </div>
                <div className="row" style={{ gap: '6px' }}>
                  {runSingleAnalysis && (
                    <button
                      className="btn btn-sm"
                      disabled={busy || !competitor.url}
                      onClick={() => runSingleAnalysis(competitor)}
                      aria-label={`Re-scan ${competitor.name || competitor.url || 'competitor'}`}
                    >
                      Re-scan
                    </button>
                  )}
                  <button
                    className="btn danger btn-sm"
                    onClick={() => removeCompetitor(index)}
                    aria-label={`Remove ${competitor.name || competitor.url || 'competitor'}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionGroup>
      )}
    </>
  );
}
