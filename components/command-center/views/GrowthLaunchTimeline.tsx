'use client';

import React, { useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import LaunchTimeline from '../../../lib/growth-plan/views/LaunchTimeline';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthLaunchTimeline({ scenario }: { scenario?: GrowthScenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  return <GrowthPlanShell><LaunchTimeline rows={rows} /></GrowthPlanShell>;
}
