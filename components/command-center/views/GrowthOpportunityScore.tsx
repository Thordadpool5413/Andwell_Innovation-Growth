'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import OpportunityScore from '../../../lib/growth-plan/views/OpportunityScore';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthOpportunityScore({ scenario }: { scenario?: GrowthScenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><OpportunityScore rows={rows} /></GrowthPlanShell>;
}
