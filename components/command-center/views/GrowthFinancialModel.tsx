'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import FinancialModel from '../../../lib/growth-plan/views/FinancialModel';

export function GrowthFinancialModel() {
  const { rows } = useMemo(() => getGrowthPlanData(), []);
  return <GrowthPlanShell><FinancialModel rows={rows} /></GrowthPlanShell>;
}
