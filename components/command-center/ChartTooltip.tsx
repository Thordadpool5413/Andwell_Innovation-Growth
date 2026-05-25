'use client';

import React from 'react';

interface PayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

interface AppTooltipProps {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string | number;
  formatValue?: (value: number, name: string) => string;
  unit?: string;
}

export function AppTooltip({ active, payload, label, formatValue, unit }: AppTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 14px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.32)',
      backdropFilter: 'blur(12px)',
      minWidth: '160px',
    }}>
      {label !== undefined && (
        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)' }}>
          {String(label)}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {payload.map((entry: PayloadEntry, i: number) => {
          const val = typeof entry.value === 'number' ? entry.value : 0;
          const displayVal = formatValue ? formatValue(val, entry.name ?? '') : `${unit ?? ''}${val.toLocaleString()}`;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color ?? 'var(--color-accent)', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{entry.name}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {displayVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function currencyFormatter(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function numberFormatter(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}
