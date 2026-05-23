'use client';

import React, { useState } from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import CompetitiveView from '../../../lib/growth-plan/views/CompetitiveView';
import type { GrowthScenario } from '../../../lib/growth-plan';

export function GrowthCompetitiveView({ scenario: _scenario }: { scenario?: GrowthScenario }) {
  const [selectedCounty, setSelectedCounty] = useState('York');
  return <GrowthPlanShell><CompetitiveView selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty} /></GrowthPlanShell>;
}
