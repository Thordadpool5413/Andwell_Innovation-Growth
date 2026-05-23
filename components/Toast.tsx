'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TYPE_STYLES: Record<ToastType, { border: string; bg: string; dot: string; icon: string }> = {
  success: { border: 'var(--color-success)', bg: 'rgba(16,185,129,0.08)', dot: 'var(--color-success)', icon: '✓' },
  error:   { border: 'var(--color-danger)',  bg: 'rgba(239,68,68,0.08)',   dot: 'var(--color-danger)',  icon: '✕' },
  warning: { border: 'var(--color-warning)', bg: 'rgba(245,158,11,0.08)', dot: 'var(--color-warning)', icon: '!' },
  info:    { border: 'var(--color-accent)',  bg: 'rgba(59,130,246,0.08)', dot: 'var(--color-accent)',  icon: 'i' },
};

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const s = TYPE_STYLES[item.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 3400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onDismiss]);

  return (
    <div
      className="animate-fadeIn"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '12px 14px',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${s.border}`,
        background: `color-mix(in srgb, var(--color-bg-secondary) 88%, transparent)`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
        cursor: 'pointer',
        maxWidth: '360px',
        minWidth: '240px',
      }}
      onClick={onDismiss}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '20px', height: '20px', borderRadius: '50%',
        background: s.bg, border: `1px solid ${s.border}`,
        color: s.dot, fontSize: '10px', fontWeight: 900, flexShrink: 0,
      }}>
        {s.icon}
      </span>
      <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-primary)', flex: 1 }}>
        {item.message}
      </p>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '24px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <Toast item={t} onDismiss={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
