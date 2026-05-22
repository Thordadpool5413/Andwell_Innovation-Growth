import type { GrowthScenario, GrowthRow } from './growth-plan';
import { growthDefaultScenario, buildGrowthRows, summarizeGrowth } from './growth-plan';

export type ScenarioPreset = {
  id: string;
  name: string;
  description: string;
  scenario: GrowthScenario;
};

export type ScenarioComparison = {
  presets: ScenarioPreset[];
  rows: Record<string, ReturnType<typeof buildGrowthRows>>;
  totals: Record<string, ReturnType<typeof summarizeGrowth>>;
};

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Low capture rates, cautious conversion. Best for cash preservation and slow build.',
    scenario: { conversionRate: 0.5, hhCapture: [0.05, 0.08, 0.12], woundCapture: [0.1, 0.15, 0.2], therapyCapture: [0.08, 0.12, 0.18] }
  },
  {
    id: 'base-case',
    name: 'Base Case',
    description: 'Moderate capture aligned with CMS market data and typical referral conversion.',
    scenario: { conversionRate: 0.75, hhCapture: [0.1, 0.15, 0.2], woundCapture: [0.25, 0.35, 0.45], therapyCapture: [0.2, 0.3, 0.4] }
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'High capture rates assuming strong referral relationships and fast staffing.',
    scenario: { conversionRate: 0.9, hhCapture: [0.2, 0.28, 0.35], woundCapture: [0.35, 0.5, 0.65], therapyCapture: [0.3, 0.45, 0.6] }
  },
  {
    id: 'staffing-constrained',
    name: 'Staffing-Constrained',
    description: 'Good conversion but supply-limited. Reflects rural hiring challenges.',
    scenario: { conversionRate: 0.8, hhCapture: [0.08, 0.1, 0.12], woundCapture: [0.15, 0.2, 0.25], therapyCapture: [0.12, 0.15, 0.2] }
  },
  {
    id: 'wound-focused',
    name: 'Wound-Focused',
    description: 'Prioritizes wound care growth. Home health and therapy at moderate levels.',
    scenario: { conversionRate: 0.7, hhCapture: [0.1, 0.14, 0.18], woundCapture: [0.4, 0.55, 0.7], therapyCapture: [0.15, 0.22, 0.3] }
  },
  {
    id: 'referral-max',
    name: 'Referral-Max',
    description: 'Maximizes referral volume through high conversion rate and broad capture.',
    scenario: { conversionRate: 0.95, hhCapture: [0.15, 0.22, 0.3], woundCapture: [0.3, 0.4, 0.55], therapyCapture: [0.25, 0.35, 0.5] }
  }
];

export function getScenarioById(id: string): ScenarioPreset | undefined {
  return scenarioPresets.find((p) => p.id === id);
}

export function applyScenario(rows: GrowthRow[], scenario: GrowthScenario): GrowthRow[] {
  return buildGrowthRows(scenario);
}

export function buildComparison(scenarioIds: string[]): ScenarioComparison {
  const presets = scenarioIds.map((id) => getScenarioById(id)).filter(Boolean) as ScenarioPreset[];
  const rows: Record<string, ReturnType<typeof buildGrowthRows>> = {};
  const totals: Record<string, ReturnType<typeof summarizeGrowth>> = {};
  for (const preset of presets) {
    const r = buildGrowthRows(preset.scenario);
    rows[preset.id] = r;
    totals[preset.id] = summarizeGrowth(r);
  }
  return { presets, rows, totals };
}
