'use client';

import React, { useMemo, useState } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import CountyPlan from '../../../lib/growth-plan/views/CountyPlan';

export function GrowthCountyPlan() {
  const { rows } = useMemo(() => getGrowthPlanData(), []);
  const [selectedCounty, setSelectedCounty] = useState('York');
  return <GrowthPlanShell><CountyPlan rows={rows} selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty} /></GrowthPlanShell>;
}
