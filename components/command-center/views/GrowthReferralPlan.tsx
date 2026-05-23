'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import ReferralPlan from '../../../lib/growth-plan/views/ReferralPlan';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthReferralPlan({ scenario }: { scenario?: GrowthScenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><ReferralPlan rows={rows} /></GrowthPlanShell>;
}
