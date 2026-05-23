'use client';

import React, { useMemo, useState } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import CountyPlan from '../../../lib/growth-plan/views/CountyPlan';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthCountyPlan({ scenario }: { scenario?: GrowthScenario }) {
  const { rows } = useMemo(() => getGrowthPlanData(scenario), [scenario]);
  const [selectedCounty, setSelectedCounty] = useState('York');
  return <GrowthPlanShell><CountyPlan rows={rows} selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty} /></GrowthPlanShell>;
}
