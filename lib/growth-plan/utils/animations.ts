export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  easeInElastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeOutElastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInBounce: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutBounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

export const durations = {
  instant: 0,
  fastest: 100,
  faster: 200,
  fast: 300,
  normal: 400,
  slow: 500,
  slower: 600,
  slowest: 800,
};

export const interpolate = (start: number, end: number, progress: number): number => {
  return start + (end - start) * progress;
};

export const formatNumberWithAnimation = (value: number, formatter?: (n: number) => string): string => {
  if (typeof value !== 'number') return String(value);
  return formatter ? formatter(value) : value.toLocaleString();
};

export const getAnimationClass = (variant: string): string => {
  const variants: Record<string, string> = {
    slideIn: 'animate-slide-in',
    slideOut: 'animate-slide-out',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    slideInTop: 'animate-slide-in-top',
    slideInBottom: 'animate-slide-in-bottom',
    fadeIn: 'animate-fade-in',
    fadeOut: 'animate-fade-out',
    scaleIn: 'animate-scale-in',
    scaleOut: 'animate-scale-out',
    bounceIn: 'animate-bounce-in',
    bounceOut: 'animate-bounce-out',
    flipIn: 'animate-flip-in',
    rotateIn: 'animate-rotate-in',
    shake: 'animate-shake',
  };
  return variants[variant] || variants.fadeIn;
};

export const getStaggerDelay = (index: number, baseDelay: number = 50): string => {
  return `${index * baseDelay}ms`;
};

export const springAnimation = (mass: number = 1, tension: number = 170, friction: number = 26) => {
  return {
    mass,
    tension,
    friction,
    config: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  };
};
