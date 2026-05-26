'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const icons: Record<Theme, React.ReactNode> = {
    dark: <Moon size={16} />,
    light: <Sun size={16} />,
    system: <Monitor size={16} />,
  };

  const labels: Record<Theme, string> = {
    dark: 'Dark',
    light: 'Light',
    system: 'System',
  };

  const nextTheme: Theme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="btn btn-sm"
      aria-label={`Switch to ${labels[nextTheme]} theme`}
      title={`Current: ${labels[theme]} (${resolvedTheme})`}
    >
      {icons[theme]}
    </button>
  );
}