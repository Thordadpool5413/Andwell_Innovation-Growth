'use client';

import React from 'react';
import { DarkModeProvider } from '../../../lib/growth-plan/components/DarkModeContext';

export function GrowthPlanShell({ children }: { children: React.ReactNode }) {
  return <DarkModeProvider><div className="growth-plan-view">{children}</div></DarkModeProvider>;
}
