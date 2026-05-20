'use client';

import React from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import ServiceLines from '../../../lib/growth-plan/views/ServiceLines';

export function GrowthServiceLines() {
  return <GrowthPlanShell><ServiceLines /></GrowthPlanShell>;
}
