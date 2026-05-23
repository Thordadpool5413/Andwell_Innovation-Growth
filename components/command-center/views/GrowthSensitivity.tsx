'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import SensitivityAnalysis from '../../../lib/growth-plan/views/SensitivityAnalysis';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthSensitivity({ scenario }: { scenario?: GrowthScenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><SensitivityAnalysis rows={rows} /></GrowthPlanShell>;
}
