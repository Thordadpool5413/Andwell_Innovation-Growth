'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import LaunchTimeline from '../../../lib/growth-plan/views/LaunchTimeline';

export function GrowthLaunchTimeline() {
  const { rows } = useMemo(() => getGrowthPlanData(), []);
  return <GrowthPlanShell><LaunchTimeline rows={rows} /></GrowthPlanShell>;
}
