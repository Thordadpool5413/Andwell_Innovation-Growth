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
    const competitor = competitors[index];
    if ((competitor as any).isPreloaded) return;
    setCompetitors((current: CompetitorInput[]) =>
      Array.isArray(current)
        ? current.map((c, i) => (i === index ? { ...c, ...patch } : c))
        : []
    );
  }

  function removeCompetitor(index: number) {
    const competitor = competitors[index];
    if ((competitor as any).isPreloaded) return;
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
  const userAddedCount = competitors.filter(c => !(c as any).isPreloaded).length;
  const preloadedCount = competitors.filter(c => (c as any).isPreloaded).length;
  const maxCompetitors = 25;
  const atLimit = userAddedCount >= maxCompetitors;

  const canRun = competitors.length > 0 && !busy;

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
          <h1>Step 1: Build Your Competitor Library</h1>
          <p className="text-body">
            {preloadedCount > 0 ? (
              <>Maine competitors are preloaded and ready to scan. Add more providers below to expand your competitive library. The system validates URLs, crawls pages, and applies AI extraction to generate insights.</>
            ) : (
              <>Paste provider names with websites. The system validates public URLs, crawls key pages, and applies AI extraction to generate competitive intelligence.</>
            )}
          </p>
          <p className="text-small" style={{ color: 'var(--color-text-tertiary)', marginTop: '8px' }}>
            After you run a scan, you'll be able to access the Evidence Matrix, battlecards, expert brief, and leadership reports.
          </p>
        </div>
        <div className="row" style={{ gap: '8px', flexShrink: 0 }}>
          <Badge>{userAddedCount} / {maxCompetitors} custom</Badge>
          {preloadedCount > 0 && <Badge tone="blue">{preloadedCount} preloaded</Badge>}
          {atLimit && <Badge tone="amber">At limit</Badge>}
          {competitors.length > 0 && (
            <button className={`btn primary ${busy ? 'btn-loading' : ''}`} disabled={!canRun} onClick={runAnalysis} aria-label="Run competitive scan">
              {busy ? 'Scanning...' : 'Run Competitive Scan →'}
            </button>
          )}
        </div>
      </section>

      <Panel title="Add Competitor Websites">
        <label htmlFor="url-input" className="text-xs text-overline" style={{ display: 'block', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
          Paste one competitor per line — name optional
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
          disabled={atLimit}
          style={{ opacity: atLimit ? 0.6 : 1, fontFamily: 'monospace', fontSize: '12px' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <div>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Format examples</p>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              <li><code style={{ background: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }}>name | url</code></li>
              <li><code style={{ background: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }}>name - url</code></li>
              <li><code style={{ background: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '3px' }}>url alone</code></li>
            </ul>
          </div>
          <div>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Limits & notes</p>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              <li>URLs must be valid (http/https)</li>
              <li>Max {maxCompetitors} per scan</li>
              <li>8 pages crawled per site</li>
            </ul>
          </div>
        </div>
        <p className="text-xs" style={{ color: atLimit ? 'var(--color-danger)' : 'var(--color-text-tertiary)', margin: '12px 0 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {atLimit && <span className="error-badge" style={{ fontSize: '11px', marginRight: '4px' }}>Limit reached</span>}
          <span>{userAddedCount} / {maxCompetitors} custom competitors</span>
        </p>
        <div className="row" style={{ gap: '8px' }}>
          <button className="btn" onClick={addUrls} disabled={atLimit}>Add to list</button>
          <button className="btn" disabled={busy || competitors.length === 0} onClick={saveCompetitors}>Save library</button>
          {competitors.length === 0 && (
            <span className="text-small" style={{ color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>
              Add competitors above, then run the scan.
            </span>
          )}
          {atLimit && (
            <span className="text-small" style={{ color: 'var(--color-danger)', alignSelf: 'center' }}>
              ⚠️ Limit reached. Remove competitors to add more.
            </span>
          )}
        </div>
      </Panel>

      {competitors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 32px', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', borderRadius: 'var(--radius)', marginTop: '0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700 }}>No competitors added yet</p>
          <p className="text-small" style={{ color: 'var(--color-text-tertiary)', margin: 0, maxWidth: '420px', marginInline: 'auto', lineHeight: 1.5 }}>
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
            {competitors.map((competitor, index) => {
              const isPreloaded = (competitor as any).isPreloaded;
              return (
                <div className="briefItem hover-card competitorIntakeCard" key={`${competitor.url}${index}`} style={{ minWidth: 0, opacity: isPreloaded ? 0.9 : 1 }}>
                  <div className="competitorIntakeFields" style={{ minWidth: 0 }}>
                    <label htmlFor={`name-${index}`} style={{ minWidth: 0 }}>
                      <span style={{ display: 'flex', gap: '6px', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>Provider name</span>
                        {isPreloaded && <Badge tone="blue">Preloaded</Badge>}
                      </span>
                      <input
                        id={`name-${index}`}
                        className="input"
                        value={competitor.name || ''}
                        onChange={(e) => updateCompetitor(index, { name: e.target.value })}
                        placeholder="Provider name"
                        aria-label="Provider name"
                        style={{ maxWidth: '100%' }}
                        disabled={isPreloaded}
                      />
                    </label>
                    <label htmlFor={`url-${index}`} style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Website</span>
                      <input
                        id={`url-${index}`}
                        className="input"
                        value={competitor.url || ''}
                        onChange={(e) => updateCompetitor(index, { url: e.target.value })}
                        placeholder="https://provider.org"
                        aria-label="Provider website URL"
                        type="url"
                        style={{ maxWidth: '100%' }}
                        disabled={isPreloaded}
                      />
                    </label>
                    <label htmlFor={`market-${index}`} style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Market / note</span>
                      <input
                        id={`market-${index}`}
                        className="input"
                        value={competitor.market || ''}
                        onChange={(e) => updateCompetitor(index, { market: e.target.value })}
                        placeholder="Needs review"
                        aria-label="Market or note"
                        style={{ maxWidth: '100%' }}
                        disabled={isPreloaded}
                      />
                    </label>
                  </div>
                  <div className="row" style={{ gap: '6px', flexShrink: 0 }}>
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
                      disabled={isPreloaded}
                      onClick={() => removeCompetitor(index)}
                      aria-label={`Remove ${competitor.name || competitor.url || 'competitor'}`}
                      title={isPreloaded ? "Preloaded competitors cannot be removed" : undefined}
                    >
                      {isPreloaded ? 'Locked' : 'Remove'}
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
                </div>
              );
            })}
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
