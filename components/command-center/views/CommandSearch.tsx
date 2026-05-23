'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Badge } from '../Shared';
import { globalSearch } from '../../../lib/command-search';
import type { IntelligenceReport } from '../../../lib/types';
import type { View } from '../../../lib/command-center/types';
import type { GrowthRow } from '../../../lib/growth-plan';

export function CommandSearch({ currentReport, growthRows, onNavigate }: { currentReport: IntelligenceReport | null; growthRows?: GrowthRow[]; onNavigate: (view: View) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const results = useMemo(() => globalSearch(query, currentReport, growthRows), [query, currentReport, growthRows]);

  useEffect(() => { setActiveIndex(-1); }, [results]);

  const handleNavigate = useCallback((view: View) => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
    onNavigate(view);
  }, [onNavigate]);

  const viewMap: Record<string, View> = {
    competitor: 'battlecards',
    service: 'catalog',
    finding: 'matrix',
    county: 'launch',
    growth: 'heatmap',
    claim: 'governance',
    decision: 'decisions',
    referral: 'referrals'
  };

  if (!open) {
    return <button className="btn" onClick={() => setOpen(true)} title="Search (Ctrl+K)">Search</button>;
  }

  return <>
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '80px'
    }} onClick={() => setOpen(false)}>
      <div style={{
        background: 'var(--color-bg-primary)', borderRadius: '12px',
        border: '1px solid var(--color-border)',
        width: '600px', maxWidth: '90vw', maxHeight: '60vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <input
            ref={inputRef}
            className="input"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            placeholder="Search competitors, services, counties, claims, findings..."
            style={{ width: '100%', fontSize: '16px', padding: '12px' }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(i => Math.min(i + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(i => Math.max(i - 1, -1));
              } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
                e.preventDefault();
                handleNavigate((viewMap[results[activeIndex].type] || 'dashboard') as View);
              }
            }}
          />
        </div>
        <div ref={listRef} style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {query.length < 2
            ? <p className="text-small" style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Type at least 2 characters to search across competitors, services, counties, claims, and findings.</p>
            : results.length === 0
              ? <p className="text-small" style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No results found for &ldquo;{query}&rdquo;. Try a different search term.</p>
              : <div style={{ display: 'grid', gap: '4px' }}>{results.map((r, i) =>
                <div key={i} className="hover-card" style={{
                  padding: '12px', borderRadius: '8px', cursor: 'pointer',
                  border: `1px solid ${i === activeIndex ? 'var(--color-accent)' : 'transparent'}`,
                  background: i === activeIndex ? 'var(--color-bg-tertiary)' : undefined,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  gap: '8px'
                }} onClick={() => handleNavigate((viewMap[r.type] || 'dashboard') as View)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: '6px', marginBottom: '4px' }}>
                      <Badge>{r.type}</Badge>
                      <span className="text-small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{r.label}</span>
                    </div>
                    <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>{r.description}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', marginTop: '2px' }}>→ {r.view}</span>
                </div>
              )}</div>
          }
        </div>
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border)', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
          <span>Ctrl+K to toggle · Esc to close · ↑↓ to navigate · Enter to open</span>
        </div>
      </div>
    </div>
  </>;
}
