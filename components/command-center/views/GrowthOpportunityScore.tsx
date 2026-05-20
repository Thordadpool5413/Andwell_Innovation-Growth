'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import OpportunityScore from '../../../lib/growth-plan/views/OpportunityScore';

export function GrowthOpportunityScore() {
  const { rows } = useMemo(() => getGrowthPlanData(), []);
  return <GrowthPlanShell><OpportunityScore rows={rows} /></GrowthPlanShell>;
}
