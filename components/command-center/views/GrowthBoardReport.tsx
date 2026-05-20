'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import BoardReport from '../../../lib/growth-plan/views/BoardReport';

export function GrowthBoardReport() {
  const { rows, totals } = useMemo(() => getGrowthPlanData(), []);
  return <GrowthPlanShell><BoardReport rows={rows} totals={totals} /></GrowthPlanShell>;
}
