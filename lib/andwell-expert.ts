import type { CategorizedClaim, IntelligenceReport, ReferralSourceProfile } from './types';
import type { GrowthRow, GrowthTotals, StaffingPlanItem } from './growth-plan';
import { categorizeAllClaims } from './claim-governance';
import { getReferralProfilesForReport } from './referral-sources';

export type ExpertAction = {
  id: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: 'Executive' | 'Growth' | 'Field' | 'Clinical' | 'Admin';
  recommendation: string;
  why: string;
  evidence: string[];
  nextStep: string;
  safeLanguage: string;
  reviewRequired: boolean;
};

export type AndwellExpertBrief = {
  generatedAt: string;
  posture: string;
  executiveSummary: string;
  topActions: ExpertAction[];
  priorityMarkets: GrowthRow[];
  competitorThreats: NonNullable<IntelligenceReport['competitorScores']>;
  opportunitySignals: NonNullable<IntelligenceReport['competitorScores']>;
  staffingRisks: StaffingPlanItem[];
  governedClaims: CategorizedClaim[];
  referralStrategy: ReferralSourceProfile[];
  boardNarrative: string;
  fieldGuidance: string[];
  openQuestions: string[];
  metrics: {
    competitors: number;
    reviewItems: number;
    priorityMarkets: number;
    threeYearRevenue: string;
    threeYearContribution: string;
    y3Starts: number;
  };
};

function formatMoney(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}

function sortThreats(report?: IntelligenceReport | null) {
  return [...(report?.competitorScores || [])].sort((a, b) => {
    const bScore = b.serviceLineMatchScore + b.subserviceDepthScore + b.reviewRiskScore;
    const aScore = a.serviceLineMatchScore + a.subserviceDepthScore + a.reviewRiskScore;
    return bScore - aScore;
  });
}

function sortOpportunities(report?: IntelligenceReport | null) {
  return [...(report?.competitorScores || [])].sort((a, b) => b.andwellDifferentiationScore - a.andwellDifferentiationScore);
}

function buildStaffingRisks(staffingPlan: StaffingPlanItem[] = []) {
  return [...staffingPlan]
    .sort((a, b) => b.fte[2] - a.fte[2])
    .filter((item) => item.fte[2] >= 3);
}

function defaultEvidence(report: IntelligenceReport | null | undefined, priorityMarkets: GrowthRow[]) {
  const evidence = [];
  if (report) evidence.push(`${report.competitorsAnalyzed} competitors and ${report.pagesReviewed} pages analyzed.`);
  if (priorityMarkets[0]) evidence.push(`${priorityMarkets[0].county} ${priorityMarkets[0].service} is the highest launch signal at score ${priorityMarkets[0].opportunityScore}.`);
  return evidence.length ? evidence : ['Growth model and Andwell catalog are available; competitive scan has not been loaded yet.'];
}

export function generateAndwellExpertBrief(params: {
  report?: IntelligenceReport | null;
  growthRows: GrowthRow[];
  totals: GrowthTotals;
  staffingPlan: StaffingPlanItem[];
}): AndwellExpertBrief {
  const { report, growthRows, totals, staffingPlan } = params;
  const threats = sortThreats(report);
  const opportunities = sortOpportunities(report);
  const priorityMarkets = [...growthRows].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 6);
  const staffingRisks = buildStaffingRisks(staffingPlan);
  const governedClaims = report ? categorizeAllClaims(report) : [];
  const referralStrategy = getReferralProfilesForReport(report).slice(0, 5);
  const unsafeClaims = governedClaims.filter((claim) => claim.category !== 'Safe');
  const topThreat = threats[0];
  const topMarket = priorityMarkets[0];
  const threeYearRevenue = formatMoney(totals.totalRevenue);
  const threeYearContribution = formatMoney(totals.totalContribution);

  const topActions: ExpertAction[] = [
    {
      id: 'growth-priority',
      title: topMarket ? `Validate ${topMarket.county} ${topMarket.service}` : 'Validate the first priority market',
      priority: 'Critical',
      owner: 'Growth',
      recommendation: topMarket ? `Treat ${topMarket.county} ${topMarket.service} as the lead growth move until staffing, referral access, and launch readiness are confirmed.` : 'Load the growth model and confirm the highest county-service opportunity.',
      why: topMarket ? topMarket.reason : 'The expert layer needs a validated first move before staffing and board language can be finalized.',
      evidence: defaultEvidence(report, priorityMarkets),
      nextStep: topMarket ? topMarket.action : 'Review priority county assumptions and confirm service-line demand.',
      safeLanguage: topMarket ? `Andwell is evaluating ${topMarket.service} growth in ${topMarket.county} based on market need, existing footprint, and referral readiness.` : 'Andwell is evaluating growth priorities based on market need and operational readiness.',
      reviewRequired: false
    },
    {
      id: 'competitive-position',
      title: topThreat ? `Prepare for ${topThreat.competitorName}` : 'Run competitive scan',
      priority: topThreat ? 'High' : 'Medium',
      owner: 'Field',
      recommendation: topThreat ? `Use governed talk tracks before field teams discuss ${topThreat.competitorName}.` : 'Run or load a competitor scan before field teams use competitive positioning.',
      why: topThreat ? topThreat.executiveReadout : 'The app cannot safely coach against competitors without current evidence.',
      evidence: topThreat ? [`${topThreat.serviceLineMatchScore}% service match`, `${topThreat.subserviceDepthScore}% subservice depth`, `${topThreat.reviewRiskScore}% review risk`] : ['No report loaded.'],
      nextStep: topThreat ? 'Open Field workspace and review battlecards, evidence, and approved language.' : 'Open Intelligence and run competitor intake.',
      safeLanguage: topThreat ? `Based on public information reviewed, Andwell should lead with verified service depth and avoid unsupported competitor comparisons.` : 'We need verified public evidence before making competitor-specific claims.',
      reviewRequired: Boolean(topThreat?.needsReview?.length)
    },
    {
      id: 'staffing-constraint',
      title: staffingRisks[0] ? `Staff ${staffingRisks[0].service} capacity` : 'Confirm staffing capacity',
      priority: staffingRisks.length ? 'High' : 'Medium',
      owner: 'Clinical',
      recommendation: staffingRisks[0] ? `Confirm year-3 ${staffingRisks[0].role} capacity before committing to the full launch sequence.` : 'Confirm staffing assumptions before approving launch timing.',
      why: staffingRisks[0] ? `${staffingRisks[0].service} reaches ${staffingRisks[0].fte[2]} FTE by year 3 in the modeled scenario.` : 'Growth recommendations must be constrained by staffing feasibility.',
      evidence: staffingRisks.map((item) => `${item.service}: ${item.fte[2]} Y3 FTE`).slice(0, 3),
      nextStep: 'Review staffing model and assign owners for recruiting, coverage, and productivity assumptions.',
      safeLanguage: 'Launch timing should be aligned with confirmed staffing capacity and care quality standards.',
      reviewRequired: true
    },
    {
      id: 'claim-governance',
      title: unsafeClaims.length ? `Resolve ${unsafeClaims.length} claim risks` : 'Maintain claim governance',
      priority: unsafeClaims.length ? 'High' : 'Low',
      owner: 'Admin',
      recommendation: unsafeClaims.length ? 'Do not release field-facing language until non-safe claims are reviewed.' : 'Continue routing field language through governance before use.',
      why: unsafeClaims.length ? 'Some claims are speculative, comparative, internal-only, or high risk.' : 'Governance protects Andwell from unsupported competitive statements.',
      evidence: unsafeClaims.slice(0, 3).map((claim) => `${claim.category}: ${claim.claim}`),
      nextStep: unsafeClaims.length ? 'Open Claim Governance and resolve high-risk or review-required claims.' : 'Keep approved claims tied to public evidence.',
      safeLanguage: 'Use specific, evidence-backed Andwell service language and avoid unsupported superiority claims.',
      reviewRequired: unsafeClaims.length > 0
    }
  ];

  const executiveSummary = report?.expertBrief?.expertSummary || report?.executiveSummary || `Andwell has a modeled ${threeYearRevenue} three-year growth opportunity across priority service-line launches. The expert layer needs a current competitive scan to complete threat-ranked field guidance.`;
  const posture = topThreat ? `Growth-ready with active competitive pressure from ${topThreat.competitorName}` : 'Growth-ready; competitive scan needed for full expert posture';
  const boardNarrative = `Recommendation: validate the first growth wave, govern field language, and align staffing before launch approval. The current model shows ${threeYearRevenue} revenue and ${threeYearContribution} contribution over three years, with ${totals.starts[2]} year-3 starts. ${topMarket ? `${topMarket.county} ${topMarket.service} should be validated first.` : ''} ${topThreat ? `${topThreat.competitorName} is the highest competitive signal.` : 'Competitive threat ranking requires a loaded report.'}`;

  return {
    generatedAt: new Date().toISOString(),
    posture,
    executiveSummary,
    topActions,
    priorityMarkets,
    competitorThreats: threats.slice(0, 5),
    opportunitySignals: opportunities.slice(0, 5),
    staffingRisks,
    governedClaims,
    referralStrategy,
    boardNarrative,
    fieldGuidance: [
      'Lead with verified Andwell service depth, not unsupported competitor weakness.',
      'Tie every competitive statement to public evidence or approved internal governance.',
      'Use referral discovery questions before positioning a service-line recommendation.'
    ],
    openQuestions: [
      'Which county-service launch has confirmed staffing capacity?',
      'Which referral source owns the first 90 days of demand creation?',
      'Which claims need approval before field use?',
      'What competitor evidence should be refreshed before board review?'
    ],
    metrics: {
      competitors: report?.competitorsAnalyzed || 0,
      reviewItems: report?.humanReviewItems || unsafeClaims.length,
      priorityMarkets: priorityMarkets.filter((row) => row.launchGroup === 'Priority 1').length,
      threeYearRevenue,
      threeYearContribution,
      y3Starts: totals.starts[2]
    }
  };
}
