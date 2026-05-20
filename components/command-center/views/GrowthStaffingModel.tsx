'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import StaffingModel from '../../../lib/growth-plan/views/StaffingModel';

export function GrowthStaffingModel() {
  const { rows } = useMemo(() => getGrowthPlanData(), []);
  return <GrowthPlanShell><StaffingModel rows={rows} /></GrowthPlanShell>;
}
