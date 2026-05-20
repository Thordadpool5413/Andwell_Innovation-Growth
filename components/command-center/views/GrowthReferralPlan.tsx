'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import ReferralPlan from '../../../lib/growth-plan/views/ReferralPlan';

export function GrowthReferralPlan() {
  const { rows } = useMemo(() => getGrowthPlanData(), []);
  return <GrowthPlanShell><ReferralPlan rows={rows} /></GrowthPlanShell>;
}
