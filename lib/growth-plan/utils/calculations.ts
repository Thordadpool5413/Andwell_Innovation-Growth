import services from "../data/services";
import { cmsCountyMarketData as cmsCountyMarket } from "../data/cmsCountyMarket";
import { launchPlanData as launchPlan } from "../data/launchPlan";
import { namedProviderRows } from "../data/providers";
import {
  DEFAULT_SCENARIO,
  STAFFING_RATIOS,
  SENSITIVITY_VARIABLES,
  OPPORTUNITY_WEIGHTS,
  type Scenario,
  type StaffingRatio,
  type SensitivityVariable,
} from "../data/constants";
import type { ServiceInfo } from "../data/services";
import type { CmsCountyData } from "../data/cmsCountyMarket";
import type { LaunchPlanEntry } from "../data/launchPlan";
import type { NamedProviderRow } from "../data/providers";

type CountyMathRow = LaunchPlanEntry & {
  meta: ServiceInfo & { margin: number };
  market?: CmsCountyData;
  basis: string;
  demandPool: number;
  reimbursement: number;
  starts: number[];
  referrals: number[];
  revenue: number[];
  totalStarts: number;
  totalReferrals: number;
  totalRevenue: number;
  totalContribution: number;
};

export function getCountyMath(row: LaunchPlanEntry, scenario: Scenario = DEFAULT_SCENARIO): CountyMathRow {
  const meta = services[row.service];
  const market = cmsCountyMarket[row.county];
  const conversionRate = scenario.conversionRate;
  const marginOverride = scenario.marginOverrides[row.service];
  const margin = marginOverride !== undefined ? marginOverride : meta.margin;

  let demandPool = row.age65 * meta.demandRate;
  let reimbursement = meta.reimbursement;
  let basis = "Planning proxy";

  if (market && row.service === "Home Healthcare") {
    demandPool = market.hh.users;
    reimbursement = market.hh.ppu;
    basis = "CMS direct HH market";
  }
  if (market && row.service === "Mobile Wound") {
    demandPool = Math.round(market.hh.users * 0.2);
    basis = "CMS HH wound proxy";
  }
  if (market && row.service === "Therapy Care") {
    demandPool = Math.round(market.hh.users * 0.4);
    basis = "CMS HH therapy proxy";
  }

  const capture =
    row.service === "Home Healthcare"
      ? scenario.hhCapture
      : row.service === "Mobile Wound"
        ? scenario.woundCapture
        : scenario.therapyCapture;

  const starts = capture.map((rate: number) => Math.round(demandPool * rate));
  const referrals = starts.map((value: number) => Math.ceil(value / conversionRate));
  const revenue = starts.map((value: number) => value * reimbursement);

  return {
    ...row,
    meta: { ...meta, margin },
    market,
    basis,
    demandPool,
    reimbursement,
    starts,
    referrals,
    revenue,
    totalStarts: starts.reduce((a: number, b: number) => a + b, 0),
    totalReferrals: referrals.reduce((a: number, b: number) => a + b, 0),
    totalRevenue: revenue.reduce((a: number, b: number) => a + b, 0),
    totalContribution: revenue.reduce((a: number, b: number) => a + Math.round(b * margin), 0),
  };
}

export function buildRows(scenario: Scenario = DEFAULT_SCENARIO): CountyMathRow[] {
  return launchPlan.map((row: LaunchPlanEntry) => getCountyMath(row, scenario));
}

interface RollupRow {
  service: string;
  starts: number;
  revenue: number;
  color: string;
}

export function rollupByService(rows: CountyMathRow[]): RollupRow[] {
  return Object.keys(services)
    .map((service: string) => {
      const group = rows.filter((row: CountyMathRow) => row.service === service);
      return {
        service,
        starts: group.reduce((sum: number, row: CountyMathRow) => sum + row.starts[0], 0),
        revenue: group.reduce((sum: number, row: CountyMathRow) => sum + row.revenue[0], 0),
        color: services[service].color,
      };
    })
    .filter((row: RollupRow) => row.starts > 0);
}

interface ProviderSummary {
  service: string;
  providers: number;
  beneficiaries: number;
  payment: number;
  andwellShare: number;
  andwellRank: number | null;
}

export function getProviderSummary(service: string): ProviderSummary {
  const rows = namedProviderRows.filter((provider: NamedProviderRow) => provider.service === service);
  const ranked = [...rows].sort((a: NamedProviderRow, b: NamedProviderRow) => b.beneficiaries - a.beneficiaries);
  const andwell = ranked.find((provider: NamedProviderRow) => provider.isAndwellCmsRecord);
  return {
    service,
    providers: rows.length,
    beneficiaries: rows.reduce((sum: number, row: NamedProviderRow) => sum + row.beneficiaries, 0),
    payment: rows.reduce((sum: number, row: NamedProviderRow) => sum + row.payment, 0),
    andwellShare: andwell?.providerVolumeShare || 0,
    andwellRank: andwell ? ranked.findIndex((row: NamedProviderRow) => row.isAndwellCmsRecord) + 1 : null,
  };
}

const NATIONAL_CHAINS: string[] = [
  "amedisys", "centerwell", "gentiva", "kindred", "compassus",
  "elara", "constellation", "enhabit", "lhc group", "bayada",
];

interface CompetitiveThreat {
  county: string;
  score: number;
  level: string;
  competitorCount: number;
  totalBeneficiaries: number;
  totalShare: number;
  hasNationalChain: boolean;
  providerDensity: number;
}

export function getCompetitiveThreatScore(county: string): CompetitiveThreat | null {
  const market = cmsCountyMarket[county];
  if (!market) return null;

  const hhProviders = namedProviderRows.filter(
    (p: NamedProviderRow) => p.service === "Home Healthcare" && p.locationCounty === county && !p.isAndwellCmsRecord,
  );
  const hosProviders = namedProviderRows.filter(
    (p: NamedProviderRow) => p.service === "Hospice" && p.locationCounty === county && !p.isAndwellCmsRecord,
  );
  const allCompetitors = [...hhProviders, ...hosProviders];

  const competitorCount = allCompetitors.length;
  const totalBeneficiaries = allCompetitors.reduce((s: number, p: NamedProviderRow) => s + p.beneficiaries, 0);
  const totalShare = allCompetitors.reduce((s: number, p: NamedProviderRow) => s + p.providerVolumeShare, 0);
  const hasNationalChain = allCompetitors.some((p: NamedProviderRow) =>
    NATIONAL_CHAINS.some((chain: string) => p.providerName.toLowerCase().includes(chain)),
  );
  const providerDensity = (market.hh.prov + market.hos.prov) / (market.ffs / 10000);

  const countScore = Math.min(competitorCount / 8, 1) * 25;
  const shareScore = Math.min(totalShare / 0.6, 1) * 30;
  const nationalScore = hasNationalChain ? 20 : 0;
  const densityScore = Math.min(providerDensity / 8, 1) * 25;

  const raw = countScore + shareScore + nationalScore + densityScore;
  const score = Math.round(raw);

  let level = "Low";
  if (score >= 70) level = "Fortress";
  else if (score >= 50) level = "High";
  else if (score >= 30) level = "Moderate";

  return {
    county,
    score,
    level,
    competitorCount,
    totalBeneficiaries,
    totalShare,
    hasNationalChain,
    providerDensity: Math.round(providerDensity * 10) / 10,
  };
}

interface MarketPenetration {
  county: string;
  y1Penetration: number;
  y3Penetration: number;
  totalMarket: number;
  y1Starts: number;
  y3Starts: number;
  revenuePerBeneficiary: number;
}

export function getMarketPenetration(county: string, rows: CountyMathRow[]): MarketPenetration | null {
  const market = cmsCountyMarket[county];
  if (!market) return null;

  const countyRows = rows.filter((r: CountyMathRow) => r.county === county);
  const y1Starts = countyRows.reduce((s: number, r: CountyMathRow) => s + r.starts[0], 0);
  const y3Starts = countyRows.reduce((s: number, r: CountyMathRow) => s + r.starts[2], 0);
  const totalMarket = market.hh.users + market.hos.users;

  return {
    county,
    y1Penetration: totalMarket > 0 ? y1Starts / totalMarket : 0,
    y3Penetration: totalMarket > 0 ? y3Starts / totalMarket : 0,
    totalMarket,
    y1Starts,
    y3Starts,
    revenuePerBeneficiary: market.ffs > 0
      ? Math.round(countyRows.reduce((s: number, r: CountyMathRow) => s + r.revenue[0], 0) / market.ffs)
      : 0,
  };
}

interface CountyIntelligence {
  county: string;
  threat: CompetitiveThreat | null;
  penetration: MarketPenetration | null;
  providerDensityHH: number;
  providerDensityHos: number;
  hhUtilization: number;
  ffs: number;
}

export function getCountyIntelligence(county: string, rows: CountyMathRow[]): CountyIntelligence | null {
  const threat = getCompetitiveThreatScore(county);
  const penetration = getMarketPenetration(county, rows);
  const market = cmsCountyMarket[county];

  if (!market) return null;

  const providerDensityHH = market.ffs > 0
    ? Math.round((market.hh.prov / (market.ffs / 10000)) * 10) / 10
    : 0;
  const providerDensityHos = market.ffs > 0
    ? Math.round((market.hos.prov / (market.ffs / 10000)) * 10) / 10
    : 0;
  const hhUtilization = market.hh.rate ?? 0;

  return {
    county,
    threat,
    penetration,
    providerDensityHH,
    providerDensityHos,
    hhUtilization,
    ffs: market.ffs,
  };
}

interface StaffingYear {
  starts: number;
  fte: number;
  cost: number;
  costPerStart: number;
}

interface StaffingServiceInfo extends StaffingRatio {
  y1: StaffingYear;
  y2: StaffingYear;
  y3: StaffingYear;
}

interface CountyStaffing {
  y1: number;
  y2: number;
  y3: number;
}

interface StaffingModel {
  byService: Record<string, StaffingServiceInfo>;
  byCounty: Record<string, CountyStaffing>;
  totalFTE: number[];
  totalCost: number[];
}

export function getStaffingModel(rows: CountyMathRow[]): StaffingModel {
  const byService: Record<string, StaffingServiceInfo> = {};
  Object.entries(STAFFING_RATIOS).forEach(([service, ratio]) => {
    const serviceRows = rows.filter((r: CountyMathRow) => r.service === service);
    const y1Starts = serviceRows.reduce((s: number, r: CountyMathRow) => s + r.starts[0], 0);
    const y2Starts = serviceRows.reduce((s: number, r: CountyMathRow) => s + r.starts[1], 0);
    const y3Starts = serviceRows.reduce((s: number, r: CountyMathRow) => s + r.starts[2], 0);
    const y1FTE = Math.ceil(y1Starts / ratio.patientsPerFTE);
    const y2FTE = Math.ceil(y2Starts / ratio.patientsPerFTE);
    const y3FTE = Math.ceil(y3Starts / ratio.patientsPerFTE);
    byService[service] = {
      role: ratio.role,
      patientsPerFTE: ratio.patientsPerFTE,
      avgSalary: ratio.avgSalary,
      y1: { starts: y1Starts, fte: y1FTE, cost: y1FTE * ratio.avgSalary, costPerStart: y1Starts > 0 ? Math.round((y1FTE * ratio.avgSalary) / y1Starts) : 0 },
      y2: { starts: y2Starts, fte: y2FTE, cost: y2FTE * ratio.avgSalary, costPerStart: y2Starts > 0 ? Math.round((y2FTE * ratio.avgSalary) / y2Starts) : 0 },
      y3: { starts: y3Starts, fte: y3FTE, cost: y3FTE * ratio.avgSalary, costPerStart: y3Starts > 0 ? Math.round((y3FTE * ratio.avgSalary) / y3Starts) : 0 },
    };
  });

  const byCounty: Record<string, CountyStaffing> = {};
  const counties = [...new Set(rows.map((r: CountyMathRow) => r.county))];
  counties.forEach((county: string) => {
    const countyRows = rows.filter((r: CountyMathRow) => r.county === county);
    const ftes = [0, 1, 2].map((yi: number) => {
      let total = 0;
      countyRows.forEach((r: CountyMathRow) => {
        const ratio = STAFFING_RATIOS[r.service];
        if (ratio) total += Math.ceil(r.starts[yi] / ratio.patientsPerFTE);
      });
      return total;
    });
    byCounty[county] = { y1: ftes[0], y2: ftes[1], y3: ftes[2] };
  });

  const totalFTE = [0, 1, 2].map((yi: number) =>
    Object.values(byService).reduce((s: number, svc: StaffingServiceInfo) => s + [svc.y1, svc.y2, svc.y3][yi].fte, 0),
  );
  const totalCost = [0, 1, 2].map((yi: number) =>
    Object.values(byService).reduce((s: number, svc: StaffingServiceInfo) => s + [svc.y1, svc.y2, svc.y3][yi].cost, 0),
  );

  return { byService, byCounty, totalFTE, totalCost };
}

interface SensitivityResult extends SensitivityVariable {
  baseRevenue: number;
  lowRevenue: number;
  highRevenue: number;
  lowDelta: number;
  highDelta: number;
  range: number;
}

export function getSensitivityAnalysis(rows: CountyMathRow[]): SensitivityResult[] {
  const baseRevenue = rows.reduce((s: number, r: CountyMathRow) => s + r.revenue[0], 0);

  return SENSITIVITY_VARIABLES.map((variable: SensitivityVariable) => {
    const buildScenario = (overrideValue: number): number => {
      const s: Scenario = { ...DEFAULT_SCENARIO };
      switch (variable.key) {
        case "conversionRate": s.conversionRate = overrideValue; break;
        case "hhCapture": s.hhCapture = [overrideValue, overrideValue * 1.5, overrideValue * 2]; break;
        case "woundCapture": s.woundCapture = [overrideValue, overrideValue * 1.4, overrideValue * 1.8]; break;
        case "therapyCapture": s.therapyCapture = [overrideValue, overrideValue * 1.5, overrideValue * 2]; break;
        case "hhReimbursement": {
          const adjusted = launchPlan.map((row: LaunchPlanEntry) => {
            if (row.service === "Home Healthcare") return { ...row, _reimbOverride: overrideValue };
            return row;
          });
          const lowRows = adjusted.map((row: LaunchPlanEntry & { _reimbOverride?: number }) => {
            const result = getCountyMath(row, s);
            if (row._reimbOverride) {
              const starts = result.starts;
              const revenue = starts.map((st: number) => st * overrideValue);
              return { ...result, revenue, totalRevenue: revenue.reduce((a: number, b: number) => a + b, 0) };
            }
            return result;
          });
          return lowRows.reduce((sum: number, r: CountyMathRow & { totalRevenue: number }) => sum + r.revenue[0], 0);
        }
        case "woundReimbursement": {
          const adjusted2 = launchPlan.map((row: LaunchPlanEntry) => {
            if (row.service === "Mobile Wound") return { ...row, _reimbOverride: overrideValue };
            return row;
          });
          const lowRows2 = adjusted2.map((row: LaunchPlanEntry & { _reimbOverride?: number }) => {
            const result = getCountyMath(row, s);
            if (row._reimbOverride) {
              const starts = result.starts;
              const revenue = starts.map((st: number) => st * overrideValue);
              return { ...result, revenue, totalRevenue: revenue.reduce((a: number, b: number) => a + b, 0) };
            }
            return result;
          });
          return lowRows2.reduce((sum: number, r: CountyMathRow & { totalRevenue: number }) => sum + r.revenue[0], 0);
        }
        default: break;
      }
      if (variable.key === "hhReimbursement" || variable.key === "woundReimbursement") return 0;
      const newRows = buildRows(s);
      return newRows.reduce((sum: number, r: CountyMathRow) => sum + r.revenue[0], 0);
    };

    const lowRevenue = buildScenario(variable.low);
    const highRevenue = buildScenario(variable.high);

    return {
      ...variable,
      baseRevenue,
      lowRevenue,
      highRevenue,
      lowDelta: lowRevenue - baseRevenue,
      highDelta: highRevenue - baseRevenue,
      range: highRevenue - lowRevenue,
    };
  }).sort((a: SensitivityResult, b: SensitivityResult) => b.range - a.range);
}

interface OpportunityFactor {
  name: string;
  value: number;
  weight: number;
  direction: string;
}

interface OpportunityScore {
  county: string;
  score: number;
  tier: string;
  factors: OpportunityFactor[];
  y1Revenue: number;
  y3Revenue: number;
  marketUsers: number;
  threatScore: number;
}

export function getOpportunityScore(county: string, rows: CountyMathRow[]): OpportunityScore | null {
  const market = cmsCountyMarket[county];
  if (!market) return null;

  const allMarkets = Object.values(cmsCountyMarket);
  const maxMarket = Math.max(...allMarkets.map((m: CmsCountyData) => m.hh.users + m.hos.users));
  const marketSize = (market.hh.users + market.hos.users) / maxMarket;

  const threat = getCompetitiveThreatScore(county);
  const lowCompetition = threat ? 1 - threat.score / 100 : 0.5;

  const countyRows = rows.filter((r: CountyMathRow) => r.county === county);
  const currentServices = countyRows.length > 0 ? countyRows[0].current.split(",").length : 0;
  const maxServices = 8;
  const andwellPresence = Math.min(currentServices / maxServices, 1);

  const maxFFS = Math.max(...allMarkets.map((m: CmsCountyData) => m.ffs));
  const y1Revenue = countyRows.reduce((s: number, r: CountyMathRow) => s + r.revenue[0], 0);
  const revenueEfficiency = maxFFS > 0 ? Math.min((y1Revenue / market.ffs) / (rows.reduce((s: number, r: CountyMathRow) => s + r.revenue[0], 0) / Object.values(cmsCountyMarket).reduce((s: number, m: CmsCountyData) => s + m.ffs, 0)), 2) / 2 : 0;

  const y3Revenue = countyRows.reduce((s: number, r: CountyMathRow) => s + r.revenue[2], 0);
  const growthPotential = y1Revenue > 0 ? Math.min((y3Revenue - y1Revenue) / y1Revenue, 2) / 2 : 0;

  const raw =
    marketSize * OPPORTUNITY_WEIGHTS.marketSize +
    lowCompetition * OPPORTUNITY_WEIGHTS.lowCompetition +
    andwellPresence * OPPORTUNITY_WEIGHTS.andwellPresence +
    revenueEfficiency * OPPORTUNITY_WEIGHTS.revenueEfficiency +
    growthPotential * OPPORTUNITY_WEIGHTS.growthPotential;

  const score = Math.round(raw * 100);

  let tier = "Watch";
  if (score >= 80) tier = "Prime";
  else if (score >= 60) tier = "Strong";
  else if (score >= 40) tier = "Developing";

  const factors: OpportunityFactor[] = [
    { name: "Market size", value: Math.round(marketSize * 100), weight: OPPORTUNITY_WEIGHTS.marketSize, direction: marketSize > 0.5 ? "up" : "down" },
    { name: "Low competition", value: Math.round(lowCompetition * 100), weight: OPPORTUNITY_WEIGHTS.lowCompetition, direction: lowCompetition > 0.5 ? "up" : "down" },
    { name: "Andwell presence", value: Math.round(andwellPresence * 100), weight: OPPORTUNITY_WEIGHTS.andwellPresence, direction: andwellPresence > 0.5 ? "up" : "down" },
    { name: "Revenue efficiency", value: Math.round(revenueEfficiency * 100), weight: OPPORTUNITY_WEIGHTS.revenueEfficiency, direction: revenueEfficiency > 0.5 ? "up" : "down" },
    { name: "Growth potential", value: Math.round(growthPotential * 100), weight: OPPORTUNITY_WEIGHTS.growthPotential, direction: growthPotential > 0.5 ? "up" : "down" },
  ];

  return { county, score, tier, factors, y1Revenue, y3Revenue, marketUsers: market.hh.users + market.hos.users, threatScore: threat?.score || 0 };
}

export function getHeatmapValue(county: string, mode: string, rows: CountyMathRow[]): number {
  const market = cmsCountyMarket[county];
  if (!market) return 0;

  const countyRows = rows.filter((r: CountyMathRow) => r.county === county);

  switch (mode) {
    case "revenue":
      return countyRows.reduce((s: number, r: CountyMathRow) => s + r.revenue[0], 0);
    case "demand":
      return market.hh.users + market.hos.users;
    case "competition": {
      const threat = getCompetitiveThreatScore(county);
      return threat ? threat.score : 0;
    }
    case "penetration": {
      const pen = getMarketPenetration(county, rows);
      return pen ? pen.y1Penetration * 100 : 0;
    }
    default:
      return 0;
  }
}
