'use client';

import React from 'react';
import type { View } from '../../lib/command-center/types';

interface WorkspaceToolsProps {
  view: View;
  setView: (view: View) => void;
  workspaceTools: Partial<Record<View, { label: string; keys: View[] }>>;
  nav: Array<{ key: View; label: string; note: string }>;
  scenarioName?: string;
}

export function WorkspaceTools({ view, setView, workspaceTools, nav, scenarioName }: WorkspaceToolsProps) {
  const tools = Object.values(workspaceTools).find((group) => group?.keys.includes(view));
  if (!tools) return null;

  const isGrowthWorkspace = view === 'growth' || tools.keys.includes('growth');

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', overflowX: 'auto', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--color-text-tertiary)', letterSpacing: '0.1em' }}>Workspace:</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}>{tools.label}</span>
      </div>
      <div style={{ display: 'flex', overflowX: 'auto', flexShrink: 0, borderLeft: '1px solid var(--color-border)', paddingLeft: '8px' }}>
        {tools.keys.map((key) => {
          const item = nav.find((entry) => entry.key === key);
          if (!item) return null;
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                padding: '10px 14px',
                background: active ? 'var(--color-bg-primary)' : 'none',
                border: 'none',
                borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                marginBottom: '-1px',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                borderRadius: active ? '6px 6px 0 0' : '0',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {isGrowthWorkspace && scenarioName && (
        <div style={{ padding: '10px 18px', fontSize: '12px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0, borderLeft: '1px solid var(--color-border)' }}>
          Scenario: <strong style={{ color: 'var(--color-text-primary)' }}>{scenarioName}</strong>
        </div>
      )}
    </div>
  );
}