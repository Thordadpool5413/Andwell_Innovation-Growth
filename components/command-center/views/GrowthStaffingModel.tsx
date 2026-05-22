'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import StaffingModel from '../../../lib/growth-plan/views/StaffingModel';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthStaffingModel({ scenario }: { scenario?: GrowthScenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><StaffingModel rows={rows} /></GrowthPlanShell>;
}
