'use client';

import React, { useState, useEffect } from "react";
import { easings, durations, interpolate } from "../utils/animations";

interface AnimatedNumberProps {
  value?: number;
  duration?: number;
  easing?: string;
  format?: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({ value = 0, duration = durations.normal, easing = easings.easeOut, format, className = "" }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value === prevValue) return;
    let startTime: number | null = null;
    let animationId: number | null = null;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      let easedProgress = progress;
      if (easing === easings.easeOut) {
        easedProgress = 1 - Math.pow(1 - progress, 3);
      } else if (easing === easings.easeInOut) {
        easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      }
      const newValue = interpolate(prevValue, value, easedProgress);
      setDisplayValue(newValue);
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    setPrevValue(value);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [value, duration, easing]);

  return <span className={className}>{typeof format === 'function' ? format(displayValue) : displayValue.toLocaleString()}</span>;
}

export function AnimatedCounter({ value = 0, suffix = "", prefix = "", duration = durations.normal, className = "" }: {
  value?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  return (
    <AnimatedNumber value={value} duration={duration} format={(n) => `${prefix}${Math.round(n).toLocaleString()}${suffix}`} className={className} />
  );
}

export function AnimatedPercent({ value = 0, decimals = 1, duration = durations.normal, className = "" }: {
  value?: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <AnimatedNumber value={value} duration={duration} format={(n) => `${Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals)}%`} className={className} />
  );
}

export function AnimatedCurrency({ value = 0, currency = "USD", duration = durations.normal, className = "" }: {
  value?: number;
  currency?: string;
  duration?: number;
  className?: string;
}) {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return <AnimatedNumber value={value} duration={duration} format={(n) => formatter.format(n)} className={className} />;
}
