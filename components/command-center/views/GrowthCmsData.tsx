'use client';

import React from 'react';
import { GrowthPlanShell } from './GrowthPlanShell';
import CmsData from '../../../lib/growth-plan/views/CmsData';

export function GrowthCmsData() {
  return <GrowthPlanShell><CmsData /></GrowthPlanShell>;
}
