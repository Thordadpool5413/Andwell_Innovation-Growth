'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import BoardReport from '../../../lib/growth-plan/views/BoardReport';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthBoardReport({ scenario }: { scenario?: GrowthScenario }) {
  const { rows, totals } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><BoardReport rows={rows} totals={totals} /></GrowthPlanShell>;
}
