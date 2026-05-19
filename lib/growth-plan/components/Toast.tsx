'use client';

import React, { useEffect } from "react";
import { useDarkMode } from "./DarkModeContext";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
  id?: string;
}

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
  id,
}: ToastProps) {
  const { dark } = useDarkMode();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyles = () => {
    const baseStyle = `
      flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
      animate-slide-in transition-smooth
      ${dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}
    `;

    const typeStyles: Record<string, { icon: React.ComponentType<{ className?: string }>; text: string; container: string }> = {
      success: {
        icon: CheckCircle,
        text: `${dark ? "text-success-400" : "text-success-600"}`,
        container: `${dark ? "bg-success-900/20 border-success-800" : "bg-success-50 border-success-200"}`,
      },
      error: {
        icon: AlertCircle,
        text: `${dark ? "text-error-400" : "text-error-600"}`,
        container: `${dark ? "bg-error-900/20 border-error-800" : "bg-error-50 border-error-200"}`,
      },
      warning: {
        icon: AlertCircle,
        text: `${dark ? "text-warning-400" : "text-warning-600"}`,
        container: `${dark ? "bg-warning-900/20 border-warning-800" : "bg-warning-50 border-warning-200"}`,
      },
      info: {
        icon: Info,
        text: `${dark ? "text-info-400" : "text-info-600"}`,
        container: `${dark ? "bg-info-900/20 border-info-800" : "bg-info-50 border-info-200"}`,
      },
    };

    const style = typeStyles[type] || typeStyles.info;
    return { ...style, baseStyle };
  };

  const styles = getStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`${styles.baseStyle} ${styles.container}`}>
      <IconComponent className={`w-5 h-5 ${styles.text} flex-shrink-0`} />
      <span className={`flex-1 text-sm font-medium ${styles.text}`}>
        {message}
      </span>
      <button
        onClick={onClose}
        className={`p-1 hover:opacity-80 transition-smooth ${styles.text}`}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
