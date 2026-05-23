'use client';

import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: '12px' }}>
      <Loader2 style={{ width: '28px', height: '28px', color: 'var(--color-info)', animation: 'spin 1s linear infinite' }} />
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-tertiary)' }}>{message}</p>
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 32px', borderStyle: 'dashed' }}>
      <Inbox style={{ width: '36px', height: '36px', margin: '0 auto 14px', color: 'var(--color-text-tertiary)', opacity: 0.4 }} />
      <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{title}</h3>
      <p className="text-small" style={{ color: 'var(--color-text-tertiary)', margin: action ? '0 0 20px' : 0 }}>{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <AlertCircle style={{ width: '18px', height: '18px', marginTop: '1px', flexShrink: 0, color: 'var(--color-danger)' }} />
        <div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>Something went wrong</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>{message}</p>
          {onRetry && (
            <button className="btn btn-sm" style={{ marginTop: '12px' }} onClick={onRetry}>Try again</button>
          )}
        </div>
      </div>
    </div>
  );
}
