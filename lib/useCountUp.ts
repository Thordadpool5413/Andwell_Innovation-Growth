import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 700, start = 0): number {
  const [value, setValue] = useState(start);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === start) { setValue(start); return; }
    startTimeRef.current = null;

    const step = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); };
  }, [target, duration, start]);

  return value;
}

// Convenience: animate on mount when value first becomes non-zero
export function useCountUpOnMount(target: number, duration = 700): number {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return useCountUp(mounted ? target : 0, duration);
}
