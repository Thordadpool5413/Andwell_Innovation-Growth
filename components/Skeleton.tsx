'use client';

import React from 'react';

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-border-light) 50%, var(--color-bg-tertiary) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease infinite',
  borderRadius: 'var(--radius)',
};

export function SkeletonLine({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return <div style={{ ...shimmer, width, height, borderRadius: '999px', marginBottom: '6px' }} />;
}

export function SkeletonCard({ rows = 3, height = 140 }: { rows?: number; height?: number }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      background: 'var(--color-bg-secondary)',
      minHeight: height,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <SkeletonLine width="40%" height={12} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} width={i === rows - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonMetric() {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      background: 'var(--color-bg-secondary)',
    }}>
      <SkeletonLine width="55%" height={11} />
      <div style={{ height: '8px' }} />
      <SkeletonLine width="70%" height={32} />
      <div style={{ height: '6px' }} />
      <SkeletonLine width="80%" height={11} />
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      padding: '28px',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary))',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <SkeletonLine width="20%" height={11} />
      <SkeletonLine width="75%" height={28} />
      <SkeletonLine width="55%" height={14} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {[80, 100, 90, 110].map((w, i) => <div key={i} style={{ ...shimmer, width: w, height: 32, borderRadius: 'var(--radius)' }} />)}
      </div>
    </div>
  );
}
