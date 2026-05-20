import { buildRows } from '../../lib/growth-plan/utils/calculations';
import type { GrowthRow } from '../../lib/growth-plan/data/constants';
import { DEFAULT_SCENARIO } from '../../lib/growth-plan/data/constants';

export type GrowthPlanTotals = {
  y1Referrals: number;
  y2Referrals: number;
  y3Referrals: number;
  y1Revenue: number;
  y2Revenue: number;
  y3Revenue: number;
  y1Starts: number;
  totalContribution: number;
};

export function getGrowthPlanData() {
  const rows = buildRows(DEFAULT_SCENARIO);
  const totals: GrowthPlanTotals = {
    y1Referrals: rows.reduce((s: number, r: GrowthRow) => s + r.referrals[0], 0),
    y2Referrals: rows.reduce((s: number, r: GrowthRow) => s + r.referrals[1], 0),
    y3Referrals: rows.reduce((s: number, r: GrowthRow) => s + r.referrals[2], 0),
    y1Revenue: rows.reduce((s: number, r: GrowthRow) => s + r.revenue[0], 0),
    y2Revenue: rows.reduce((s: number, r: GrowthRow) => s + r.revenue[1], 0),
    y3Revenue: rows.reduce((s: number, r: GrowthRow) => s + r.revenue[2], 0),
    y1Starts: rows.reduce((s: number, r: GrowthRow) => s + r.starts[0], 0),
    totalContribution: rows.reduce((s: number, r: GrowthRow) => s + r.totalContribution, 0),
  };
  return { rows, totals };
}
