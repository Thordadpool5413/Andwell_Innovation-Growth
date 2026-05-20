'use client';

import React, { useState, useMemo } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import { getGrowthPlanData } from '../../../lib/command-center/growth-plan-bridge';
import CompetitiveView from '../../../lib/growth-plan/views/CompetitiveView';

export function GrowthCompetitiveView() {
  const { rows } = useMemo(() => getGrowthPlanData(), []);
  const [selectedCounty, setSelectedCounty] = useState('York');
  return <GrowthPlanShell><CompetitiveView selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty} /></GrowthPlanShell>;
}
