'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import SensitivityAnalysis from '../../../lib/growth-plan/views/SensitivityAnalysis';

export function GrowthSensitivity() {
  const { rows } = useMemo(() => getGrowthPlanData(), []);
  return <GrowthPlanShell><SensitivityAnalysis rows={rows} /></GrowthPlanShell>;
}
