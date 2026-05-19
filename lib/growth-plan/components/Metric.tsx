'use client';

import React from "react";
import Sparkline from "./Sparkline";

interface MetricProps {
  label: string;
  value: string | number;
  detail?: string;
  sparkData?: number[];
  sparkColor?: string;
  confidence?: string | null;
  className?: string;
}

export default function Metric({ label, value, detail, sparkData, sparkColor, confidence = null, className = "" }: MetricProps) {
  const getConfidenceBadge = (level: string) => {
    if (!level) return null;
    const colors: Record<string, string> = {
      high: "badge-success",
      medium: "badge-warning",
      low: "badge-error",
    };
    return (
      <span className={`badge ${colors[level] || colors.medium}`}>
        {level}
      </span>
    );
  };

  return (
    <div className={`metric-card ${className}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "var(--text-tertiary)" }}>
          {label}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {confidence && getConfidenceBadge(confidence)}
          {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
        </div>
      </div>
      <p style={{ margin: "1rem 0", fontSize: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: "14px", color: "var(--text-tertiary)", lineHeight: 1.6 }}>
        {detail}
      </p>
    </div>
  );
}
