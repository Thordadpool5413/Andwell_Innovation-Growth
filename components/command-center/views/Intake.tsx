'use client';

import React, { useMemo } from 'react';
import { Badge, Panel, SectionGroup } from '../Shared';
import { appendAuditEvent } from '../../../lib/audit-log';
import { ANDWELL_BASELINE_SOURCES, FULL_SCAN_MAX_PAGES_PER_SITE, SOURCE_LIBRARY_GEOGRAPHY, SOURCE_LIBRARY_MODE } from '../../../lib/preloaded-competitors';
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
  const preloadedCount = useMemo(() => competitors.filter((competitor) => competitor.preloaded).length, [competitors]);
  const savedSources = useMemo(() => competitors.filter((competitor) => competitor.url), [competitors]);
  const canRun = savedSources.length > 0 && !busy;

  function updateCompetitor(index: number, patch: Partial<CompetitorInput>) {
    setCompetitors((current: CompetitorInput[]) =>
      Array.isArray(current)
        ? current.map((competitor, i) => (i === index ? { ...competitor, ...patch } : competitor))
        : []
    );
  }

  function removeCompetitor(index: number) {
    setCompetitors((current: CompetitorInput[]) =>
      Array.isArray(current) ? current.filter((_, i) => i !== index || current[i].preloaded) : []
    );
  }

  function saveLibrary() {
    appendAuditEvent({
      type: 'source_library_saved',
      actor: 'Admin',
      description: `Source library saved with ${savedSources.length} Maine source${savedSources.length === 1 ? '' : 's'}`,
      detail: SOURCE_LIBRARY_MODE,
    });
    saveCompetitors();
  }

  return (
    <>
      <section className="section">
        <div>
          <h1>Maine Competitor Source Library</h1>
          <p className="text-body">
            Admin-managed source library for the prebuilt Maine intelligence system. End users receive the scrubbed intelligence, not this source setup workflow.
          </p>
        </div>
        <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
          <Badge tone="green">{SOURCE_LIBRARY_MODE}</Badge>
          <Badge tone="blue">{SOURCE_LIBRARY_GEOGRAPHY}</Badge>
          <Badge tone="amber">Full scan up to {FULL_SCAN_MAX_PAGES_PER_SITE} pages/site</Badge>
        </div>
      </section>

      <div className="sourceLibraryHero">
        <article>
          <span className="text-overline">Current library</span>
          <strong>{savedSources.length}</strong>
          <p>Competitor URLs are preloaded for Maine and can be re-scanned by an admin when public evidence changes.</p>
        </article>
        <article>
          <span className="text-overline">Preloaded sources</span>
          <strong>{preloadedCount}</strong>
          <p>Baseline competitors supplied for Maine home health, hospice, palliative, and related referral intelligence.</p>
        </article>
        <article>
          <span className="text-overline">Andwell baseline</span>
          <strong>{ANDWELL_BASELINE_SOURCES.length}</strong>
          <p>Andwell public source pages are used as the baseline alongside the app catalog.</p>
        </article>
      </div>

      <SectionGroup
        title="Preloaded source library"
        action={
          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn" disabled={busy || savedSources.length === 0} onClick={saveLibrary}>Save library</button>
            <button className="btn primary" disabled={!canRun} onClick={runAnalysis}>
              {busy ? 'Scanning...' : `Run full Maine scan (${savedSources.length})`}
            </button>
          </div>
        }
      >
        {savedSources.length === 0 ? (
          <Panel title="No source library loaded">
            <p className="text-body">The preloaded Maine source library is not available yet. Refresh server state or add sources below.</p>
          </Panel>
        ) : (
          <div className="sourceLibraryList">
            {savedSources.map((competitor, index) => (
              <article className="sourceLibraryRow" key={`${competitor.url}${index}`}>
                <div>
                  <div className="row" style={{ gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {competitor.preloaded ? <Badge tone="green">Preloaded</Badge> : <Badge tone="blue">Admin added</Badge>}
                    <Badge>{competitor.market || 'Maine'}</Badge>
                  </div>
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
                </div>
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
                  <span>Market / notes</span>
                  <input
                    id={`market-${index}`}
                    className="input"
                    value={competitor.market || competitor.notes || ''}
                    onChange={(e) => updateCompetitor(index, { market: e.target.value })}
                    placeholder="Maine service area"
                    aria-label="Market or note"
                  />
                </label>
                <div className="sourceLibraryActions">
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
                    disabled={competitor.preloaded}
                    onClick={() => removeCompetitor(index)}
                    aria-label={`Remove ${competitor.name || competitor.url || 'competitor'}`}
                    title={competitor.preloaded ? 'Preloaded Maine sources stay in the baseline library.' : 'Remove source'}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionGroup>

      <Panel title="Admin maintenance: add or update sources">
        <details className="adminSourceDetails">
          <summary>Add more competitor websites</summary>
          <label htmlFor="url-input" className="text-xs text-overline" style={{ display: 'block', color: 'var(--color-text-tertiary)', margin: '14px 0 8px' }}>
            Paste one competitor per line
          </label>
          <textarea
            id="url-input"
            className="textarea"
            aria-label="Competitor websites - one per line"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={
              'Provider Name | https://provider.org/service-page | Maine market notes\n' +
              'Provider Name - https://provider.org/location/maine'
            }
          />
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', margin: '8px 0 12px' }}>
            The app accepts <code>Name | URL</code>, <code>Name - URL</code>, or a URL only. Normal users should not need this area.
          </p>
          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={addUrls}>Add to library</button>
            <button className="btn" disabled={busy || savedSources.length === 0} onClick={saveLibrary}>Save library</button>
          </div>
        </details>
      </Panel>
    </>
  );
}
