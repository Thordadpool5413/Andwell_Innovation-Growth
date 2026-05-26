'use client';

import React from 'react';
import type { View } from '../../lib/command-center/types';

interface WorkspaceToolsProps {
  view: View;
  setView: (view: View) => void;
  workspaceTools: Partial<Record<View, { label: string; keys: View[] }>>;
  nav: Array<{ key: View; label: string; note: string }>;
}

export function WorkspaceTools({ view, setView, workspaceTools, nav }: WorkspaceToolsProps) {
  const tools = Object.values(workspaceTools).find((group) => group?.keys.includes(view));
  if (!tools) return null;

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', overflowX: 'auto', flexShrink: 0 }}>
      {tools.keys.map((key) => {
        const item = nav.find((entry) => entry.key === key);
        if (!item) return null;
        const active = view === key;
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
              marginBottom: '-1px',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              fontSize: '13px',
              fontWeight: active ? 700 : 400,
              cursor: 'pointer',
              transition: 'color 150ms ease, border-color 150ms ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}