'use client';

import React, { useState } from 'react';
import type { Confidence, ConfidenceDetails } from '../../lib/types';
import { useCountUpOnMount } from '../../lib/useCountUp';

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Panel({ title, children, className = '', action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={`card ${className}`}>
      {action ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="text-overline" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>{title}</h3>
          {action}
        </div>
      ) : <h3>{title}</h3>}
      {children}
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const animated = useCountUpOnMount(value);
  return <>{animated.toLocaleString()}</>;
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: React.ReactNode }) {
  const isNumber = typeof value === 'number';
  return (
    <div className="metricCard hover-card">
      <p>{label}</p>
      <strong>{isNumber ? <AnimatedNumber value={value} /> : value}</strong>
      {hint ? <span>{hint}</span> : null}
    </div>
  );
}

export function StatMini({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'amber' | 'red' | 'blue' | 'neutral' }) {
  const isNumber = typeof value === 'number';
  const colorClass = tone === 'green' ? 'text-status-success' : tone === 'amber' ? 'text-status-warning' : tone === 'red' ? 'text-status-danger' : tone === 'blue' ? 'text-status-info' : '';
  return <div className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}><p className="text-xs text-overline" style={{ color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>{label}</p><strong className={colorClass} style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>{isNumber ? <AnimatedNumber value={value} /> : value}</strong></div>;
}

export function TagList({ items }: { items?: string[] }) {
  const safeItems = (items || []).filter(Boolean);
  if (!safeItems.length) return <p className="muted">No items returned yet.</p>;
  return <div className="tagCloud">{safeItems.map((item) => <span key={item}>{item}</span>)}</div>;
}

export function ExpandableSection({ title, defaultOpen = false, children, badge }: { title: string; defaultOpen?: boolean; children: React.ReactNode; badge?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return <div className="expandable"><div className="expandable-header" onClick={() => setOpen(!open)} role="button" aria-expanded={open} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}><span className="text-subhead" style={{ margin: 0 }}>{title}</span><span className="row" style={{ gap: '8px' }}>{badge}<span style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', transition: 'transform 200ms ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span></span></div>{open ? <div className="expandable-body">{children}</div> : null}</div>;
}

export function HoverPreviewContent({ summary, detail }: { summary: React.ReactNode; detail: React.ReactNode }) {
  return <div className="hover-preview" style={{ display: 'inline-block' }}><span>{summary}</span><div className="hover-preview-content">{detail}</div></div>;
}

function ConfidenceDetailContent({ detail }: { detail: ConfidenceDetails }) {
  return <div><p className="text-small" style={{ margin: '0 0 8px', fontWeight: 600 }}>Confidence Analysis</p><div style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}><span>Quality: {detail.evidenceQuality}</span><span>Sources: {detail.sourceCount}</span><span>Freshness: {detail.sourceFreshness}</span><span>CMS: {detail.hasCmsSupport ? 'Yes' : 'No'}</span><span>Human reviewed: {detail.humanReviewed ? 'Yes' : 'No'}</span></div><p className="text-small" style={{ margin: '8px 0 0', color: 'var(--color-text-tertiary)' }}>{detail.reason}</p></div>;
}

export function ConfidenceBadge({ confidence, details }: { confidence: Confidence | ConfidenceDetails; details?: boolean }) {
  const value = typeof confidence === 'string' ? confidence : confidence.overall;
  const tone = value === 'High' ? 'green' : value === 'Moderate' ? 'amber' : value === 'Low' || value === 'Not found' ? 'blue' : 'red';
  const detailInfo = typeof confidence !== 'string' && details ? confidence : null;
  return <HoverPreviewContent summary={<span className={`badge ${tone}`}>{value}</span>} detail={detailInfo ? <ConfidenceDetailContent detail={detailInfo} /> : null} />;
}

export function MetricGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  return <div className={`grid cols${cols}`}>{children}</div>;
}

export function SectionGroup({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="section-group"><div className="section-group-header"><h3>{title}</h3>{action}</div>{children}</div>;
}

export function SkeletonLoader({ height = '40px', className = '' }: { height?: string; className?: string }) {
  return <div className={`skeleton ${className}`} style={{ height, borderRadius: 'var(--radius-md)' }} />;
}

export function SkeletonStat() {
  return <div className="skeleton-stat" />;
}

export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {Array.from({ length: rows }).map((_, i) => <SkeletonLoader key={i} height="32px" />)}
  </div>;
}

export function EmptyState({ icon, title, description, action }: { icon?: string | React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return <div style={{ textAlign: 'center', padding: '40px 32px', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', borderRadius: 'var(--radius)' }}>
    {icon && <div style={{ fontSize: typeof icon === 'string' ? '32px' : 'inherit', marginBottom: '12px', opacity: typeof icon === 'string' ? 1 : 0.4 }}>{icon}</div>}
    <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700 }}>{title}</p>
    {description && <p className="text-small" style={{ color: 'var(--color-text-tertiary)', margin: '0 0 16px', maxWidth: '420px', marginInline: 'auto', lineHeight: 1.5 }}>{description}</p>}
    {action && <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>{action}</div>}
  </div>;
}
