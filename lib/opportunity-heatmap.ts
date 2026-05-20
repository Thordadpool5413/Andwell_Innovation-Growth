import type { GrowthRow, GrowthServiceName } from './growth-plan';
import { cmsCountyMarket, growthServices, launchPlan, staffingRatios } from './growth-plan';

export type HeatCategory = 'Launch Now' | 'Validate' | 'Monitor' | 'Do Not Launch';

export type HeatDimension = 'marketSize' | 'footprintStrength' | 'competitorDensity' | 'revenuePotential' | 'staffingFeasibility' | 'referralAccess' | 'serviceGap' | 'priorityAlignment';

export type CountyHeatScore = {
  county: string;
  dimensions: Record<HeatDimension, { raw: number; score: number; label: string }>;
  composite: number;
  category: HeatCategory;
  topService: GrowthServiceName;
  recommendation: string;
};

export type ReadinessScore = {
  county: string;
  service: GrowthServiceName;
  readinessPercent: number;
  revenueUpside: number;
  staffingConfidence: 'High' | 'Moderate' | 'Low';
  referralAccess: 'Strong' | 'Adequate' | 'Weak';
  competitorPressure: 'Low' | 'Moderate' | 'High';
  governanceRisk: 'Low' | 'Medium' | 'High';
  recommendation: string;
  gaps: string[];
};

export type StaffingAlert = {
  service: GrowthServiceName;
  county: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  detail: string;
  demandStarts: number;
  currentFte: number;
  fteGap: number;
};

const heatLabels: Record<HeatDimension, string> = {
  marketSize: 'Market size',
  footprintStrength: 'Andwell footprint',
  competitorDensity: 'Competitor density',
  revenuePotential: 'Revenue potential',
  staffingFeasibility: 'Staffing feasibility',
  referralAccess: 'Referral access',
  serviceGap: 'Service gap',
  priorityAlignment: 'Priority alignment'
};

function scoreDimension(rows: GrowthRow[], county: string, dim: HeatDimension): { raw: number; score: number; label: string } {
  const countyRows = rows.filter((r) => r.county === county);
  const hhRow = countyRows.find((r) => r.service === 'Home Healthcare');
  const woundRow = countyRows.find((r) => r.service === 'Mobile Wound');
  const therapyRow = countyRows.find((r) => r.service === 'Therapy Care');
  const market = cmsMarket[county];
  const plan = launchPlan.find((p) => p.county === county);

  let raw = 0;
  switch (dim) {
    case 'marketSize': {
      raw = plan?.age65 || 0;
      break;
    }
    case 'footprintStrength': {
      const presentCount = plan ? plan.current.split(', ').length : 0;
      raw = presentCount;
      break;
    }
    case 'competitorDensity': {
      const provCount = market ? market.hh.prov + market.hos.prov : 0;
      raw = 15 - provCount; // inverse: fewer competitors = higher score
      break;
    }
    case 'revenuePotential': {
      raw = countyRows.reduce((sum, r) => sum + r.revenue[0], 0);
      break;
    }
    case 'staffingFeasibility': {
      const ruralCounties = ['Washington', 'Aroostook', 'Oxford', 'Somerset', 'Franklin', 'Piscataquis'];
      raw = ruralCounties.includes(county) ? 3 : 10;
      break;
    }
    case 'referralAccess': {
      const hospitalCount = market ? (market.hos.prov || 0) : 0;
      raw = Math.min(hospitalCount * 1.5, 10);
      break;
    }
    case 'serviceGap': {
      const missingCount = plan ? plan.missing.split(', ').length : 0;
      raw = Math.min(missingCount, 10); // more missing = more opportunity
      break;
    }
    case 'priorityAlignment': {
      const group = plan?.launchGroup || 'Priority 3';
      raw = group === 'Priority 1' ? 10 : group === 'Priority 2' ? 6 : 3;
      break;
    }
  }

  const maxValues: Record<HeatDimension, number> = {
    marketSize: 60000,
    footprintStrength: 10,
    competitorDensity: 15,
    revenuePotential: 10000000,
    staffingFeasibility: 10,
    referralAccess: 10,
    serviceGap: 10,
    priorityAlignment: 10
  };

  const score = Math.round((Math.min(raw, maxValues[dim]) / maxValues[dim]) * 100);
  return { raw, score, label: heatLabels[dim] };
}

const cmsMarket = cmsCountyMarket as unknown as Record<string, { ffs: number; hh: { prov: number; users: number; rate: number; pay: number; ppu: number }; hos: { prov: number; users: number; ppu: number } }>;

export function computeCountyHeatMap(rows: GrowthRow[]): CountyHeatScore[] {
  const counties = [...new Set(rows.map((r) => r.county))];
  return counties.map((county) => {
    const dimensions = Object.keys(heatLabels) as HeatDimension[];
    const scored = dimensions.reduce((acc, dim) => {
      acc[dim] = scoreDimension(rows, county, dim);
      return acc;
    }, {} as Record<HeatDimension, { raw: number; score: number; label: string }>);

    const composite = Math.round(Object.values(scored).reduce((sum, s) => sum + s.score, 0) / dimensions.length);

    let category: HeatCategory;
    if (composite >= 60) category = 'Launch Now';
    else if (composite >= 40) category = 'Validate';
    else if (composite >= 25) category = 'Monitor';
    else category = 'Do Not Launch';

    const countyRows = rows.filter((r) => r.county === county);
    const topService = countyRows.sort((a, b) => b.opportunityScore - a.opportunityScore)[0]?.service || 'Home Healthcare';

    const plan = launchPlan.find((p) => p.county === county);
    let recommendation = '';
    if (category === 'Launch Now') recommendation = `Prioritize ${county} for near-term launch. ${plan?.action?.split('.')[0] || 'Confirm staffing and referral pathways.'}`;
    else if (category === 'Validate') recommendation = `Validate ${county} demand and access before committing. Focus on referral source confirmation and staffing feasibility.`;
    else if (category === 'Monitor') recommendation = `Monitor ${county} market conditions. Current data does not support launch investment without additional validation.`;
    else recommendation = `Do not launch ${county} at this time. Insufficient market, staffing, or referral indicators.`;

    return { county, dimensions: scored, composite, category, topService, recommendation };
  }).sort((a, b) => b.composite - a.composite);
}

export function computeReadinessScores(rows: GrowthRow[]): ReadinessScore[] {
  return rows.map((row) => {
    const market = cmsMarket[row.county];
    const ruralCounties = ['Washington', 'Aroostook', 'Oxford', 'Somerset', 'Franklin', 'Piscataquis'];
    const isRural = ruralCounties.includes(row.county);

    const marketScore = Math.min(row.age65 / 50000, 1) * 25;
    const footprintScore = Math.min(row.current.split(', ').length / 10, 1) * 15;
    const revenueScore = Math.min(row.revenue[0] / 2000000, 1) * 20;
    const staffingScore = isRural ? 5 : 15;
    const referralScore = market ? Math.min((market.hos.prov + market.hh.prov) / 15, 1) * 15 : 5;
    const competitorScore = market ? Math.max(0, 10 - (market.hh.prov + market.hos.prov) * 0.5) : 5;
    const priorityScore = row.launchGroup === 'Priority 1' ? 10 : row.launchGroup === 'Priority 2' ? 6 : 3;

    const total = marketScore + footprintScore + revenueScore + staffingScore + referralScore + competitorScore + priorityScore;
    const readinessPercent = Math.min(100, Math.round(total));

    const revenueUpside = row.revenue[2] - row.revenue[0];
    const staffingConfidence = isRural ? 'Low' : row.launchGroup === 'Priority 1' ? 'High' : 'Moderate';
    const referralAccess = (market && (market.hos.prov + market.hh.prov) >= 8) ? 'Strong' : (market && (market.hos.prov + market.hh.prov) >= 4) ? 'Adequate' : 'Weak';
    const competitorPressure = market ? (market.hh.prov + market.hos.prov >= 10 ? 'High' : market.hh.prov + market.hos.prov >= 5 ? 'Moderate' : 'Low') : 'Moderate';
    const governanceRisk = row.launchGroup === 'Priority 3' ? 'High' : row.launchGroup === 'Priority 2' ? 'Medium' : 'Low';

    const gaps: string[] = [];
    if (staffingConfidence === 'Low') gaps.push('Rural staffing access is a constraint');
    if (referralAccess === 'Weak') gaps.push('Limited referral source density');
    if (competitorPressure === 'High') gaps.push('High competitor density may slow capture');
    if (governanceRisk === 'High') gaps.push('Governance review needed before proceeding');
    if (readinessPercent < 50) gaps.push('Composite readiness score below threshold');

    let recommendation = '';
    if (readinessPercent >= 70) recommendation = `Proceed with ${row.county} ${row.service} launch. Address ${gaps.slice(0, 2).join(', ') || 'standard readiness items'}.`;
    else if (readinessPercent >= 45) recommendation = `Proceed conditionally. Mitigate: ${gaps.join('; ') || 'monitor key indicators'}.`;
    else recommendation = `Pause ${row.county} ${row.service}. Key gaps: ${gaps.join('; ') || 'insufficient readiness signals'}.`;

    return {
      county: row.county,
      service: row.service,
      readinessPercent,
      revenueUpside,
      staffingConfidence,
      referralAccess,
      competitorPressure,
      governanceRisk,
      recommendation,
      gaps
    };
  });
}

export function computeStaffingAlerts(rows: GrowthRow[]): StaffingAlert[] {
  const alerts: StaffingAlert[] = [];
  const ratios = staffingRatios;

  for (const [service, ratio] of Object.entries(ratios)) {
    const serviceRows = rows.filter((r) => r.service === service);
    if (serviceRows.length === 0) continue;

    const totalYear3Starts = serviceRows.reduce((sum, r) => sum + r.starts[2], 0);
    const fteNeeded = Math.ceil(totalYear3Starts / ratio.patientsPerFTE);

    const hiredFte = service === 'Home Healthcare' ? Math.ceil(serviceRows.length * 1.5) : service === 'Mobile Wound' ? Math.ceil(serviceRows.length * 1) : Math.ceil(serviceRows.length * 0.8);
    const fteGap = Math.max(0, fteNeeded - hiredFte);

    if (fteGap > 0) {
      const severity = fteGap >= 10 ? 'critical' : fteGap >= 4 ? 'warning' : 'info';
      const pctOver = Math.round((fteGap / fteNeeded) * 100);
      alerts.push({
        service: service as GrowthServiceName,
        county: 'All counties',
        severity,
        message: `${service}: ${fteGap} FTE gap (${pctOver}% over capacity) by Year 3`,
        detail: `Needs ${fteNeeded} ${ratio.role} FTEs for ${totalYear3Starts} Y3 starts; currently modeled at ~${hiredFte} FTEs.`,
        demandStarts: totalYear3Starts,
        currentFte: hiredFte,
        fteGap
      });
    }

    for (const row of serviceRows) {
      const y3Starts = row.starts[2];
      const localFte = Math.ceil(y3Starts / ratio.patientsPerFTE);
      const localHired = Math.max(1, Math.round(localFte * 0.4));
      const localGap = Math.max(0, localFte - localHired);

      if (localGap >= 2) {
        const severity = localGap >= 5 ? 'critical' : 'warning';
        alerts.push({
          service: service as GrowthServiceName,
          county: row.county,
          severity,
          message: `${row.county} ${service}: ${localGap} FTE gap by Year 3`,
          detail: `Y3 demand: ${y3Starts} starts. Needs ~${localFte} FTEs; modeled at ~${localHired}. ${ratio.role} constraint likely.`,
          demandStarts: y3Starts,
          currentFte: localHired,
          fteGap: localGap
        });
      }
    }

    if (alerts.filter((a) => a.severity === 'critical').length >= 3) break;
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function heatCategoryTone(category: HeatCategory): 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark' {
  if (category === 'Launch Now') return 'green';
  if (category === 'Validate') return 'amber';
  if (category === 'Monitor') return 'blue';
  return 'red';
}

export function readinessTone(percent: number): 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark' {
  if (percent >= 70) return 'green';
  if (percent >= 45) return 'amber';
  return 'red';
}
