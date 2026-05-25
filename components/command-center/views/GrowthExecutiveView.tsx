'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import ExecutiveView from '../../../lib/growth-plan/views/ExecutiveView';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthExecutiveView({ scenario }: { scenario?: GrowthScenario }) {
  const { rows, totals } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><ExecutiveView rows={rows} totals={totals} /></GrowthPlanShell>;
}
