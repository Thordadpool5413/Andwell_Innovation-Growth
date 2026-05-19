'use client';

import React from "react";
import { useDarkMode } from "./DarkModeContext";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TooltipItem {
  color?: string;
  label: string;
  value: string;
}

interface EnhancedTooltipProps {
  title?: string;
  items?: TooltipItem[];
  footer?: React.ReactNode;
  dark?: boolean;
}

export default function EnhancedTooltip({ title, items = [], footer = null }: EnhancedTooltipProps) {
  const { dark } = useDarkMode();
  return (
    <div className={`rounded-xl border shadow-lg p-4 w-max max-w-xs ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
      {title && <p className={`text-sm font-bold mb-3 ${dark ? "text-white" : "text-slate-900"}`}>{title}</p>}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className={`text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>{item.label}</span>
            </div>
            <span className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{item.value}</span>
          </div>
        ))}
      </div>
      {footer && <div className={`text-xs mt-3 pt-3 border-t ${dark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"}`}>{footer}</div>}
    </div>
  );
}

export function TrendIndicator({ value, previousValue = null, format, showLabel = true, showPercent = true, size = "md", className = "" }: {
  value: number;
  previousValue?: number | null;
  format?: (n: number) => string;
  showLabel?: boolean;
  showPercent?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { dark } = useDarkMode();
  const fmt = format || ((n: number) => n.toFixed(2));

  if (previousValue === null) {
    return <span className={className}>{fmt(value)}</span>;
  }

  const change = value - previousValue;
  const percentChange = previousValue === 0 ? 0 : (change / previousValue) * 100;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const iconSizes: Record<string, string> = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const textSizes: Record<string, string> = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className={`font-semibold ${textSizes[size]}`}>{fmt(value)}</span>
      <div className={`flex items-center gap-0.5 ${textSizes[size]}`}>
        {isNeutral ? (
          <Minus className={`${iconSizes[size]} ${dark ? "text-slate-500" : "text-slate-400"}`} />
        ) : isPositive ? (
          <TrendingUp className={`${iconSizes[size]} text-emerald-500`} />
        ) : (
          <TrendingDown className={`${iconSizes[size]} text-red-500`} />
        )}
        <span className={isPositive ? "text-emerald-500" : isNeutral ? (dark ? "text-slate-500" : "text-slate-400") : "text-red-500"}>
          {isNeutral ? "\u2014" : `${isPositive ? "+" : ""}${percentChange.toFixed(1)}%`}
        </span>
        {showLabel && (
          <span className={dark ? "text-slate-500" : "text-slate-400"}>
            {isPositive ? "\u2191" : isNeutral ? "" : "\u2193"}
          </span>
        )}
      </div>
    </div>
  );
}

export function DataAnnotation({ label, value, position = "top", offset = { x: 0, y: 0 }, className = "" }: {
  label: string;
  value: string;
  position?: string;
  offset?: { x: number; y: number };
  className?: string;
}) {
  const { dark } = useDarkMode();
  return (
    <div className={`absolute flex flex-col items-center pointer-events-none ${className}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
      <div className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shadow-md ${dark ? "bg-slate-800 text-white border border-slate-700" : "bg-white text-slate-900 border border-slate-200"}`}>
        {label}
        <div className={`text-lg font-bold ${dark ? "text-blue-400" : "text-blue-600"}`}>{value}</div>
      </div>
      <div className={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${dark ? "border-t-slate-800" : "border-t-white"}`} />
    </div>
  );
}

export function ComparisonIndicator({ current, baseline, label = "vs Baseline", formatter }: {
  current: number;
  baseline: number;
  label?: string;
  formatter?: (n: number) => string;
}) {
  const { dark } = useDarkMode();
  const fmt = formatter || ((n: number) => n.toFixed(0));
  const difference = current - baseline;
  const percentDiff = baseline === 0 ? 0 : (difference / baseline) * 100;
  const isPositive = difference > 0;

  return (
    <div className={`rounded-lg border p-2 text-xs ${dark ? `border-slate-700 ${isPositive ? "bg-green-900/30" : "bg-red-900/30"}` : `border-slate-200 ${isPositive ? "bg-green-50" : "bg-red-50"}`}`}>
      <div className={`font-semibold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>{isPositive ? "+" : ""}{percentDiff.toFixed(1)}%</div>
      <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>{label}</div>
    </div>
  );
}
