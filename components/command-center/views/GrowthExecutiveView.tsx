'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import ExecutiveView from '../../../lib/growth-plan/views/ExecutiveView';

export function GrowthExecutiveView() {
  const { rows, totals } = useMemo(() => getGrowthPlanData(), []);
  return <GrowthPlanShell><ExecutiveView rows={rows} totals={totals} /></GrowthPlanShell>;
}
