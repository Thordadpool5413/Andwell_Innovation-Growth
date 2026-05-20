'use client';

import React from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import LaunchChecklist from '../../../lib/growth-plan/views/LaunchChecklist';

export function GrowthLaunchChecklist() {
  return <GrowthPlanShell><LaunchChecklist /></GrowthPlanShell>;
}
