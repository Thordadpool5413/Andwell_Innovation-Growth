'use client';

import React, { useEffect } from 'react';

interface ProgressItem {
  name: string;
  status: 'queued' | 'crawling' | 'ai' | 'done' | 'error';
  pages?: number;
  error?: string;
  errorType?: string;
}

interface ProgressRegionProps {
  items: ProgressItem[];
  busy: boolean;
  onDismiss?: () => void;
  summary?: string;
}

export function ProgressRegion({ items, busy, onDismiss, summary }: ProgressRegionProps) {
  const scanDone = !busy && items.length > 0;
  const errorCount = items.filter((item) => item.status === 'error').length;

  useEffect(() => {
    if (!scanDone || errorCount > 0) return;
    const timer = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(timer);
  }, [scanDone, errorCount, onDismiss]);

  if (!items.length) return null;

  const statusLabel: Record<string, string> = { queued: 'Queued', crawling: 'Crawling…', ai: 'AI extraction…', done: 'Done', error: 'Failed' };
  const statusColor: Record<string, string> = { queued: 'var(--color-text-tertiary)', crawling: 'var(--color-info)', ai: 'var(--color-accent)', done: 'var(--color-success)', error: 'var(--color-danger)' };
  const headerLabel = scanDone
    ? errorCount > 0 ? `Scan complete — ${errorCount} error${errorCount > 1 ? 's' : ''}` : 'Scan complete — closing…'
    : 'Analysis in progress';
  const headerColor = scanDone ? (errorCount > 0 ? 'var(--color-danger)' : 'var(--color-success)') : 'var(--color-text-tertiary)';

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: 'min(340px, calc(100vw - 48px))', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px', zIndex: 300, boxShadow: 'var(--color-shadow)', maxHeight: '50vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: headerColor }}>{headerLabel}</p>
          {summary && <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{summary}</p>}
        </div>
        {scanDone && onDismiss && <button className="btn btn-sm" onClick={onDismiss}>✕</button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: statusColor[item.status] || 'var(--color-text-tertiary)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</span>
              <span style={{ color: statusColor[item.status] || 'var(--color-text-tertiary)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                {statusLabel[item.status] || item.status}
                {item.pages && item.status !== 'queued' ? ` · ${item.pages}p` : ''}
              </span>
            </div>
            {item.error && (
              <p style={{ margin: '0 0 0 18px', fontSize: '11px', color: 'var(--color-danger)', lineHeight: 1.3 }}>
                {item.errorType ? `[${item.errorType}] ` : ''}{item.error}
                {item.errorType === 'timeout' && ' — Try fewer pages or check site speed.'}
                {item.errorType === 'blocked' && ' — Site likely blocks automated access.'}
                {item.errorType === 'network' && ' — Transient connection issue; retry later.'}
                {item.errorType === 'ai' && ' — AI extraction problem (rate or model).'}
                {item.errorType === 'parse' && ' — No usable content found on the page(s).'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}