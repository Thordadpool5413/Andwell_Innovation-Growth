'use client';

import React, { useState, useCallback, createContext, useContext } from "react";
import Toast from "./Toast";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration: number;
}

interface ToastContextValue {
  addToast: (message: string, type?: "success" | "error" | "warning" | "info", duration?: number) => number;
  removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  addToast: () => 0,
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={String(toast.id)}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
