export type GrowthServiceName = 'Home Healthcare' | 'Mobile Wound' | 'Therapy Care';

export type GrowthScenario = {
  conversionRate: number;
  hhCapture: [number, number, number];
  woundCapture: [number, number, number];
  therapyCapture: [number, number, number];
};

type ServiceModel = {
  color: string;
  role: string;
  unit: string;
  reimbursement: number;
  margin: number;
  demandRate: number;
};

export type StaffingPlanItem = {
  service: GrowthServiceName;
  role: string;
  patientsPerFTE: number;
  avgSalary: number;
  starts: [number, number, number];
  fte: [number, number, number];
  cost: [number, number, number];
};

export type CountyMarket = {
  ffs: number;
  hh: { prov: number; users: number; rate: number; pay: number; ppu: number };
  hos: { prov: number; users: number; ppu: number };
};

export type LaunchPlanItem = {
  county: string;
  service: GrowthServiceName;
  age65: number;
  launchGroup: 'Priority 1' | 'Priority 2' | 'Priority 3';
  current: string;
  missing: string;
  reason: string;
  action: string;
  accounts: string[];
};

export type GrowthRow = LaunchPlanItem & {
  meta: ServiceModel;
  market?: CountyMarket;
  basis: string;
  demandPool: number;
  reimbursement: number;
  starts: [number, number, number];
  referrals: [number, number, number];
  revenue: [number, number, number];
  contribution: [number, number, number];
  totalStarts: number;
  totalReferrals: number;
  totalRevenue: number;
  totalContribution: number;
  opportunityScore: number;
};

export type GrowthTotals = {
  starts: [number, number, number];
  referrals: [number, number, number];
  revenue: [number, number, number];
  contribution: [number, number, number];
  totalRevenue: number;
  totalContribution: number;
  totalReferrals: number;
};

export const growthDefaultScenario: GrowthScenario = {
  conversionRate: 0.75,
  hhCapture: [0.1, 0.15, 0.2],
  woundCapture: [0.25, 0.35, 0.45],
  therapyCapture: [0.2, 0.3, 0.4]
};

export const growthServices: Record<GrowthServiceName, ServiceModel> = {
  'Home Healthcare': { color: '#2563eb', role: 'Foundation service line', unit: 'admissions', reimbursement: 3189, margin: 0.18, demandRate: 0.08 },
  'Mobile Wound': { color: '#dc2626', role: 'Specialty growth line', unit: 'wound service starts', reimbursement: 1800, margin: 0.24, demandRate: 0.025 },
  'Therapy Care': { color: '#16a34a', role: 'Referral retention line', unit: 'therapy service starts', reimbursement: 1650, margin: 0.2, demandRate: 0.05 }
};

export const cmsCountyMarket: Record<string, CountyMarket> = {
  York: { ffs: 32287, hh: { prov: 11, users: 2191, rate: 0.0679, pay: 10448386, ppu: 4769 }, hos: { prov: 9, users: 851, ppu: 14723 } },
  Cumberland: { ffs: 35113, hh: { prov: 8, users: 2196, rate: 0.0625, pay: 10598866, ppu: 4826 }, hos: { prov: 9, users: 1011, ppu: 15736 } },
  Penobscot: { ffs: 20564, hh: { prov: 5, users: 1056, rate: 0.0514, pay: 4812225, ppu: 4557 }, hos: { prov: 6, users: 473, ppu: 15839 } },
  Kennebec: { ffs: 15639, hh: { prov: 5, users: 708, rate: 0.0453, pay: 2762228, ppu: 3901 }, hos: { prov: 5, users: 407, ppu: 15340 } },
  Knox: { ffs: 6927, hh: { prov: 2, users: 351, rate: 0.0507, pay: 1302451, ppu: 3711 }, hos: { prov: 4, users: 176, ppu: 14083 } },
  Lincoln: { ffs: 5990, hh: { prov: 4, users: 319, rate: 0.0533, pay: 1282277, ppu: 4020 }, hos: { prov: 3, users: 157, ppu: 13274 } },
  Sagadahoc: { ffs: 5475, hh: { prov: 3, users: 267, rate: 0.0488, pay: 1198675, ppu: 4489 }, hos: { prov: 3, users: 131, ppu: 10997 } },
  Washington: { ffs: 6508, hh: { prov: 1, users: 174, rate: 0.0267, pay: 716751, ppu: 4119 }, hos: { prov: 2, users: 99, ppu: 9759 } },
  Aroostook: { ffs: 11867, hh: { prov: 4, users: 689, rate: 0.0581, pay: 2671380, ppu: 3877 }, hos: { prov: 1, users: 172, ppu: 9971 } },
  Oxford: { ffs: 8359, hh: { prov: 1, users: 389, rate: 0.0465, pay: 1515465, ppu: 3896 }, hos: { prov: 2, users: 210, ppu: 13991 } },
  Somerset: { ffs: 7342, hh: { prov: 4, users: 367, rate: 0.05, pay: 1389545, ppu: 3786 }, hos: { prov: 5, users: 171, ppu: 15551 } },
  Franklin: { ffs: 3543, hh: { prov: 2, users: 181, rate: 0.0511, pay: 801499, ppu: 4428 }, hos: { prov: 2, users: 96, ppu: 14348 } }
};

export const launchPlan: LaunchPlanItem[] = [
  { county: 'York', service: 'Home Healthcare', age65: 45362, launchGroup: 'Priority 1', current: 'Hospice, Palliative Medicine, Community and Behavioral Health', missing: 'Home Healthcare, GUIDE, CareGivers, Therapy Care, Audiology, Mobile Wound, Grief Support Groups', reason: 'Largest modeled opportunity. Andwell is already visible in serious illness care, but Home Healthcare would create the upstream skilled care funnel before patients reach hospice eligibility.', action: 'Confirm staffing capacity, hospital discharge access, physician referral workflow, and Home Healthcare launch readiness.', accounts: ['MaineHealth Maine Medical Center Biddeford and Sanford', 'York Hospital', 'Primary care groups', 'SNF and short stay rehabilitation centers', 'Senior living communities'] },
  { county: 'Cumberland', service: 'Therapy Care', age65: 59705, launchGroup: 'Priority 1', current: 'Home Healthcare, Mobile Wound, GUIDE, CareGivers, Palliative Medicine, Hospice, Community and Behavioral Health', missing: 'Therapy Care, Audiology, Grief Support Groups', reason: 'Largest older adult market. Andwell already has a strong platform, so Therapy Care protects referrals that could otherwise leak to agencies able to accept nursing plus therapy together.', action: 'Confirm therapy staffing, post acute referral demand, rehab partner workflows, and Therapy Care launch readiness.', accounts: ['MaineHealth Maine Medical Center Portland', 'Northern Light Mercy Hospital', 'New England Rehabilitation Hospital of Portland', 'Specialty practices', 'Large senior living communities'] },
  { county: 'Penobscot', service: 'Mobile Wound', age65: 29983, launchGroup: 'Priority 1', current: 'CareGivers, Home Healthcare, Palliative Medicine, Community and Behavioral Health, Hospice', missing: 'GUIDE, Therapy Care, Audiology, Mobile Wound, Grief Support Groups', reason: 'Strong regional referral density and existing Home Healthcare platform make Mobile Wound the clearest specialty growth opportunity.', action: 'Confirm wound referral volume from hospitals, SNFs, vascular, diabetes, podiatry, surgical, and wound related practices.', accounts: ['Northern Light Eastern Maine Medical Center', 'St. Joseph Hospital', 'Bangor primary care and specialty practices', 'SNF and rehab centers', 'Wound, vascular, diabetes, podiatry, and surgical practices'] },
  { county: 'Kennebec', service: 'Mobile Wound', age65: 26088, launchGroup: 'Priority 1', current: 'GUIDE, CareGivers, Home Healthcare, Palliative Medicine, Community and Behavioral Health, Hospice', missing: 'Therapy Care, Audiology, Mobile Wound, Grief Support Groups', reason: 'Existing Home Healthcare platform plus a large older adult base supports a wound specialty add on.', action: 'Confirm referral opportunity with MaineGeneral, Augusta and Waterville provider networks, SNFs, and wound related specialty practices.', accounts: ['MaineGeneral Medical Center', 'Augusta and Waterville primary care networks', 'SNF and rehabilitation centers', 'Vascular, podiatry, diabetes, and surgical practices', 'Senior living communities'] },
  { county: 'Knox', service: 'Home Healthcare', age65: 10923, launchGroup: 'Priority 2', current: 'Hospice, Palliative Medicine, Community and Behavioral Health', missing: 'GUIDE, CareGivers, Home Healthcare, Therapy Care, Audiology, Mobile Wound, Grief Support Groups', reason: 'Andwell has downstream serious illness presence but lacks the skilled care front door. Home Healthcare creates earlier patient capture.', action: 'Confirm hospital discharge relationships, primary care referral access, and home health staffing coverage.', accounts: ['MaineHealth Pen Bay Hospital', 'Coastal primary care practices', 'SNF and rehabilitation centers', 'Senior living communities', 'Community aging organizations'] },
  { county: 'Lincoln', service: 'Home Healthcare', age65: 10395, launchGroup: 'Priority 2', current: 'GUIDE, Hospice, Palliative Medicine, Community and Behavioral Health', missing: 'CareGivers, Home Healthcare, Therapy Care, Audiology, Mobile Wound, Grief Support Groups', reason: 'High aging profile and current serious illness footprint. Home Healthcare fills the missing middle between dementia support, palliative needs, and hospice.', action: 'Confirm hospital discharge flow, dementia related skilled needs, and clinical coverage before launch.', accounts: ['MaineHealth Lincoln Hospital', 'LincolnHealth primary care', 'Damariscotta area senior living', 'SNF and rehabilitation centers', 'Memory care and caregiver organizations'] },
  { county: 'Sagadahoc', service: 'Home Healthcare', age65: 8698, launchGroup: 'Priority 2', current: 'GUIDE, Hospice, Mobile Wound, Palliative Medicine, Community and Behavioral Health', missing: 'CareGivers, Home Healthcare, Therapy Care, Audiology, Grief Support Groups', reason: 'Mobile Wound is visible, but Home Healthcare is missing. Adding Home Healthcare strengthens the existing specialty and serious illness platform.', action: 'Confirm whether current Mobile Wound visibility can support broader skilled home health referrals.', accounts: ['MaineHealth Mid Coast Hospital', 'Bath and Brunswick area primary care', 'SNF and rehabilitation centers', 'Assisted living communities', 'Wound referral sources'] },
  { county: 'Washington', service: 'Home Healthcare', age65: 8116, launchGroup: 'Priority 2', current: 'CareGivers, Community and Behavioral Health', missing: 'GUIDE, Home Healthcare, Hospice, Palliative Medicine, Therapy Care, Audiology, Mobile Wound, Grief Support Groups', reason: 'Thinnest visible Andwell footprint. Home Healthcare is the first clinical platform needed before Hospice, Palliative Medicine, Mobile Wound, or Therapy Care can scale logically.', action: 'Confirm rural staffing feasibility, hospital discharge access, referral source commitment, and travel model before launch.', accounts: ['Down East Community Hospital', 'Calais Community Hospital', 'Rural health clinics and FQHCs', 'SNF and long term care facilities', 'Senior centers and caregiver support organizations'] },
  { county: 'Aroostook', service: 'Mobile Wound', age65: 16978, launchGroup: 'Priority 3', current: 'GUIDE, CareGivers, Home Healthcare, Palliative Medicine, Community and Behavioral Health, Hospice', missing: 'Therapy Care, Audiology, Mobile Wound, Grief Support Groups', reason: 'Rural access burden makes mobile wound capability strategically valuable, but the geography requires careful staffing and routing validation.', action: 'Confirm wound referral demand, geography based routing, wound nurse capacity, and visit productivity before launch.', accounts: ['Northern Light A.R. Gould Hospital', 'Cary Medical Center', 'Houlton Regional Hospital', 'Northern Maine Medical Center', 'Rural primary care and specialty practices'] },
  { county: 'Oxford', service: 'Therapy Care', age65: 13173, launchGroup: 'Priority 3', current: 'GUIDE, CareGivers, Mobile Wound, Home Healthcare, Palliative Medicine, Grief Support Groups, Community and Behavioral Health, Hospice', missing: 'Therapy Care, Audiology', reason: 'Near complete continuum. Therapy Care is the meaningful missing line that protects post acute referrals from leaking to competitors.', action: 'Confirm therapy staffing, falls and deconditioning demand, and post acute referral patterns.', accounts: ['MaineHealth Stephens Hospital', 'Rumford Hospital referral corridor', 'Rural primary care practices', 'SNF and rehabilitation centers', 'Senior living and community aging programs'] },
  { county: 'Somerset', service: 'Mobile Wound', age65: 11155, launchGroup: 'Priority 3', current: 'GUIDE, CareGivers, Home Healthcare, Palliative Medicine, Community and Behavioral Health, Hospice', missing: 'Therapy Care, Audiology, Mobile Wound, Grief Support Groups', reason: 'Existing Home Healthcare platform supports Mobile Wound, but the opportunity should follow larger wound launches unless local referral volume is validated.', action: 'Confirm diabetes, vascular, pressure injury, and post surgical wound referral volume before launch.', accounts: ['Redington Fairview General Hospital', 'Northern Light Sebasticook Valley Hospital corridor', 'Rural primary care and diabetes practices', 'SNF and rehabilitation centers', 'Senior living and community aging programs'] },
  { county: 'Franklin', service: 'Therapy Care', age65: 6952, launchGroup: 'Priority 3', current: 'GUIDE, CareGivers, Mobile Wound, Home Healthcare, Palliative Medicine, Grief Support Groups, Community and Behavioral Health, Hospice', missing: 'Therapy Care, Audiology', reason: 'Small rural continuum completion opportunity. Therapy Care strengthens existing Home Healthcare, but should use a lean staffing model.', action: 'Confirm shared therapy staffing, falls and mobility demand, and referral density before launch.', accounts: ['MaineHealth Franklin Hospital', 'Franklin Health primary care network', 'Rural health clinics', 'SNF and rehabilitation centers', 'Senior living and caregiver organizations'] }
];

export const staffingRatios: Record<GrowthServiceName, { role: string; patientsPerFTE: number; avgSalary: number }> = {
  'Home Healthcare': { role: 'RN / LPN', patientsPerFTE: 25, avgSalary: 78000 },
  'Mobile Wound': { role: 'Wound Care Specialist', patientsPerFTE: 15, avgSalary: 85000 },
  'Therapy Care': { role: 'PT / OT / SLP', patientsPerFTE: 20, avgSalary: 82000 }
};

function scoreOpportunity(row: LaunchPlanItem, demandPool: number, market?: CountyMarket) {
  const priority = row.launchGroup === 'Priority 1' ? 35 : row.launchGroup === 'Priority 2' ? 24 : 16;
  const demand = Math.min(demandPool / 2200, 1) * 30;
  const providerPressure = market ? Math.min(((market.hh.prov + market.hos.prov) / Math.max(market.ffs / 10000, 1)) / 7, 1) * 20 : 10;
  const footprintGap = row.missing.includes(row.service) ? 15 : 6;
  return Math.round(priority + demand + footprintGap - providerPressure * 0.45);
}

export function buildGrowthRows(scenario: GrowthScenario = growthDefaultScenario): GrowthRow[] {
  return launchPlan.map((row) => {
    const meta = growthServices[row.service];
    const market = cmsCountyMarket[row.county];
    let demandPool = row.age65 * meta.demandRate;
    let reimbursement = meta.reimbursement;
    let basis = 'Planning proxy';

    if (market && row.service === 'Home Healthcare') {
      demandPool = market.hh.users;
      reimbursement = market.hh.ppu;
      basis = 'CMS direct HH market';
    } else if (market && row.service === 'Mobile Wound') {
      demandPool = Math.round(market.hh.users * 0.2);
      basis = 'CMS HH wound proxy';
    } else if (market && row.service === 'Therapy Care') {
      demandPool = Math.round(market.hh.users * 0.4);
      basis = 'CMS HH therapy proxy';
    }

    const capture = row.service === 'Home Healthcare' ? scenario.hhCapture : row.service === 'Mobile Wound' ? scenario.woundCapture : scenario.therapyCapture;
    const starts = capture.map((rate) => Math.round(demandPool * rate)) as [number, number, number];
    const referrals = starts.map((value) => Math.ceil(value / scenario.conversionRate)) as [number, number, number];
    const revenue = starts.map((value) => value * reimbursement) as [number, number, number];
    const contribution = revenue.map((value) => Math.round(value * meta.margin)) as [number, number, number];

    return {
      ...row,
      meta,
      market,
      basis,
      demandPool,
      reimbursement,
      starts,
      referrals,
      revenue,
      contribution,
      totalStarts: starts.reduce((a, b) => a + b, 0),
      totalReferrals: referrals.reduce((a, b) => a + b, 0),
      totalRevenue: revenue.reduce((a, b) => a + b, 0),
      totalContribution: contribution.reduce((a, b) => a + b, 0),
      opportunityScore: scoreOpportunity(row, demandPool, market)
    };
  });
}

export function summarizeGrowth(rows: GrowthRow[]): GrowthTotals {
  const addYear = (key: 'starts' | 'referrals' | 'revenue' | 'contribution', year: number) => rows.reduce((sum, row) => sum + row[key][year], 0);
  const starts = [0, 1, 2].map((year) => addYear('starts', year)) as [number, number, number];
  const referrals = [0, 1, 2].map((year) => addYear('referrals', year)) as [number, number, number];
  const revenue = [0, 1, 2].map((year) => addYear('revenue', year)) as [number, number, number];
  const contribution = [0, 1, 2].map((year) => addYear('contribution', year)) as [number, number, number];
  return {
    starts,
    referrals,
    revenue,
    contribution,
    totalRevenue: revenue.reduce((a, b) => a + b, 0),
    totalContribution: contribution.reduce((a, b) => a + b, 0),
    totalReferrals: referrals.reduce((a, b) => a + b, 0)
  };
}

export function rollupGrowthByService(rows: GrowthRow[]) {
  return (Object.keys(growthServices) as GrowthServiceName[]).map((service) => {
    const group = rows.filter((row) => row.service === service);
    return {
      service,
      role: growthServices[service].role,
      color: growthServices[service].color,
      y1Starts: group.reduce((sum, row) => sum + row.starts[0], 0),
      y3Starts: group.reduce((sum, row) => sum + row.starts[2], 0),
      y1Revenue: group.reduce((sum, row) => sum + row.revenue[0], 0),
      y3Revenue: group.reduce((sum, row) => sum + row.revenue[2], 0),
      counties: group.length
    };
  }).filter((item) => item.counties > 0);
}

export function buildStaffingPlan(rows: GrowthRow[]) {
  return (Object.keys(staffingRatios) as GrowthServiceName[]).map((service) => {
    const ratio = staffingRatios[service];
    const group = rows.filter((row) => row.service === service);
    const starts = [0, 1, 2].map((year) => group.reduce((sum, row) => sum + row.starts[year], 0));
    const fte = starts.map((count) => Math.max(1, Math.ceil(count / ratio.patientsPerFTE))) as [number, number, number];
    const cost = fte.map((count) => count * ratio.avgSalary) as [number, number, number];
    return { service, ...ratio, starts: starts as [number, number, number], fte, cost };
  });
}

export const launchTimeline = [
  { window: 'Days 0-30', title: 'Validate market moves', focus: 'Confirm priority counties, referral owners, staffing confidence, and compliance language for each service line.' },
  { window: 'Days 31-60', title: 'Stand up the field engine', focus: 'Build account lists, call plans, wound and therapy referral pathways, and manager review rhythm.' },
  { window: 'Days 61-90', title: 'Launch measurable growth', focus: 'Run the first campaigns, track referrals to starts, and feed competitive signals back into battlecards.' },
  { window: 'Quarter 2', title: 'Scale what converts', focus: 'Move budget and staffing toward counties with the strongest referral conversion and lowest execution drag.' }
];
