'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import FinancialModel from '../../../lib/growth-plan/views/FinancialModel';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthFinancialModel({ scenario }: { scenario?: GrowthScenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><FinancialModel rows={rows} /></GrowthPlanShell>;
}
