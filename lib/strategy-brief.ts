import type { IntelligenceReport } from './types';
import type { GrowthRow, GrowthTotals, StaffingPlanItem } from './growth-plan';
import { andwellCatalog } from './andwell';
import { categorizeAllClaims } from './claim-governance';

export type BriefAudience = 'Executive' | 'Sales Leader' | 'Field Rep' | 'Board' | 'Compliance' | 'Referral Partner';

export type StrategyBrief = {
  audience: BriefAudience;
  title: string;
  summary: string;
  sections: { heading: string; content: string }[];
  keyMetrics: { label: string; value: string }[];
  generatedAt: string;
};

export type ExecutiveNarrative = {
  executiveReadout: string;
  boardNarrative: string;
  riskSummary: string;
  launchRecommendation: string;
  strategicPriorities: string[];
  generatedAt: string;
};

export type BoardPacket = {
  title: string;
  executiveSummary: string;
  marketOpportunity: string;
  financialModel: { label: string; value: string }[];
  priorityCounties: { county: string; service: string; rationale: string; revenue: string }[];
  staffingSummary: { role: string; y1Fte: number; y3Fte: number; costY1: string }[];
  risks: { risk: string; mitigation: string; severity: 'High' | 'Medium' | 'Low' }[];
  appendix: string[];
  generatedAt: string;
};

export type CoachingPlan = {
  competitor: string;
  serviceLine: string;
  preCallPlan: string;
  discoveryQuestions: string[];
  competitorWarnings: string[];
  postCallNotes: string;
  followUpDraft: string;
  safeLanguage: string;
  doNotSay: string[];
};

function formatMoney(v: number): string {
  return '$' + (v / 1000000).toFixed(1) + 'M';
}

function getHighRiskClaimsCount(report?: IntelligenceReport | null): number {
  if (!report?.analyses?.length) return 0;
  try {
    const all = categorizeAllClaims(report);
    return all.filter((c: any) => c.category === 'High risk').length;
  } catch {
    return 0;
  }
}

export function generateStrategyBrief(audience: BriefAudience, report?: IntelligenceReport | null, growthRows?: GrowthRow[], totals?: GrowthTotals): StrategyBrief {
  const now = new Date().toISOString().split('T')[0];
  const threatCount = report?.competitorScores?.filter((s) => s.threatLevel === 'Strategic threat' || s.threatLevel === 'High overlap').length || 0;
  const topThreat = report?.competitorScores?.sort((a, b) => (b.serviceLineMatchScore + b.subserviceDepthScore) - (a.serviceLineMatchScore + a.subserviceDepthScore))[0];
  const topOpp = report?.competitorScores?.sort((a, b) => b.andwellDifferentiationScore - a.andwellDifferentiationScore)[0];
  const priorityCounties = growthRows?.filter((r) => r.launchGroup === 'Priority 1').length || 0;
  const totalRevenue = totals ? formatMoney(totals.totalRevenue) : 'N/A';
  const y1Revenue = totals ? formatMoney(totals.revenue[0]) : 'N/A';

  const audienceTitles: Record<BriefAudience, string> = {
    Executive: 'Executive Strategy Brief',
    'Sales Leader': 'Sales Leadership Brief',
    'Field Rep': 'Field Rep Briefing',
    Board: 'Board Strategy Brief',
    Compliance: 'Compliance & Governance Brief',
    'Referral Partner': 'Referral Partner Brief'
  };

  const sections: { heading: string; content: string }[] = [
    {
      heading: 'Competitive Landscape',
      content: report
        ? `Analyzed ${report.competitorsAnalyzed} competitors across ${report.serviceLinesMapped} service lines and ${report.subservicesMapped} subservices. ${threatCount} competitors identified as strategic or high-overlap threats.${topThreat ? ` Top threat: ${topThreat.competitorName} (${topThreat.threatLevel}).` : ''}${topOpp ? ` Best differentiation opportunity: ${topOpp.competitorName} (${topOpp.andwellDifferentiationScore}% differentiation).` : ''}`
        : 'No competitive report loaded. Run a competitive scan to populate intelligence.'
    },
    {
      heading: 'Market Opportunity',
      content: growthRows
        ? `${priorityCounties} priority counties identified across ${growthRows.length} total county-service combinations. Modeled Y1 revenue: ${y1Revenue}. 3-year total revenue: ${totalRevenue}.`
        : 'No growth model data loaded. Tune scenario parameters in Growth Command.'
    },
    {
      heading: audience === 'Field Rep' ? 'Key Talking Points' : audience === 'Compliance' ? 'Governance Review Items' : audience === 'Referral Partner' ? 'Referral Overview' : 'Strategic Recommendations',
      content: audience === 'Field Rep'
        ? (report ? `Lead with verified depth: ${report.competitorScores?.slice(0, 3).map((s) => s.leadWith.slice(0, 2).join(', ')).join(' | ') || 'differentiation points from competitor analysis'}. Always use approved language from the Claim Governance view.` : 'Load a report for field talking points.')
        : audience === 'Compliance'
          ? (report ? `${report.humanReviewItems} items requiring human review. ${report.expertBrief?.governanceWarning || 'No governance warnings from Foremost Expert.'}` : 'No compliance data available.')
          : audience === 'Referral Partner'
            ? 'Andwell provides a full continuum of home health, hospice, palliative, therapy, and behavioral health services across Maine. Referral partners can access dedicated intake and real-time status updates.'
            : `Prioritize ${priorityCounties} priority-1 county launches. Address staffing gaps before scaling. ${report?.humanReviewItems ? `Resolve ${report.humanReviewItems} pending review items.` : ''}`
    }
  ];

  if (report?.expertBrief) {
    sections.push({
      heading: 'Foremost Expert Analysis',
      content: `Expert score: ${report.expertBrief.expertScore}. ${report.expertBrief.expertSummary} Leadership decision: ${report.expertBrief.leadershipDecision}`
    });
  }

  const keyMetrics = [
    { label: 'Y1 Revenue', value: y1Revenue },
    { label: 'Priority Counties', value: String(priorityCounties) },
    { label: 'Competitors Analyzed', value: String(report?.competitorsAnalyzed || 0) },
    { label: 'Review Items', value: String(report?.humanReviewItems || 0) }
  ];

  return {
    audience,
    title: audienceTitles[audience],
    summary: `Strategy brief generated for ${audience} audience. Based on ${report ? 'loaded competitive report' : 'available growth model data'}.`,
    sections,
    keyMetrics,
    generatedAt: now
  };
}

export function generateExecutiveNarrative(report?: IntelligenceReport | null, growthRows?: GrowthRow[], totals?: GrowthTotals): ExecutiveNarrative {
  const now = new Date().toISOString().split('T')[0];
  const threatCount = report?.competitorScores?.filter((s) => s.threatLevel === 'Strategic threat' || s.threatLevel === 'High overlap').length || 0;
  const topThreat = report?.competitorScores?.sort((a, b) => (b.serviceLineMatchScore + b.subserviceDepthScore) - (a.serviceLineMatchScore + a.subserviceDepthScore))[0];
  const topOpp = report?.competitorScores?.sort((a, b) => b.andwellDifferentiationScore - a.andwellDifferentiationScore)[0];
  const priorityCounties = growthRows?.filter((r) => r.launchGroup === 'Priority 1') || [];
  const y1Rev = totals ? formatMoney(totals.revenue[0]) : 'N/A';
  const y3Rev = totals ? formatMoney(totals.revenue[2]) : 'N/A';
  const totalRevenue = totals ? formatMoney(totals.totalRevenue) : 'N/A';

  const executiveReadout = report
    ? `${report.competitorsAnalyzed} competitors analyzed across ${report.serviceLinesMapped} service lines. ${threatCount} strategic threats identified.${topThreat ? ` ${topThreat.competitorName} shows the highest composite threat with ${topThreat.serviceLineMatchScore}% service match and ${topThreat.subserviceDepthScore}% subservice depth.` : ''}${topOpp ? ` Best opportunity: ${topOpp.competitorName} at ${topOpp.andwellDifferentiationScore}% differentiation.` : ''}${totalRevenue ? ` 3-year modeled revenue: ${totalRevenue}.` : ''}`
    : 'No report loaded. Run a competitive scan to generate the executive readout.';

  const boardNarrative = `Andwell is positioned across ${report?.serviceLinesMapped || 0} service lines in ${report?.competitorsAnalyzed || 0} competitor markets. The growth model identifies ${priorityCounties.length} priority-1 county launches with a combined 3-year revenue potential of ${y3Rev}. Staffing requirements scale from ${growthRows?.[0]?.starts?.[0] || 0} Y1 starts to ${growthRows?.[0]?.starts?.[2] || 0} Y3 starts per top county.${topThreat ? ` Competitive pressure from ${topThreat.competitorName} requires disciplined field positioning and approved language.` : ''} The Foremost Expert layer${report?.expertBrief ? ' is active with a score of ' + report.expertBrief.expertScore : ' is not yet active'} and provides governance oversight for all field-facing claims.`;

  const riskSummary = report
    ? [
      threatCount > 0 ? `${threatCount} strategic competitor threats require active monitoring and field coaching.` : '',
      report.humanReviewItems > 0 ? `${report.humanReviewItems} intelligence findings need human review before field use.` : '',
      report.expertBrief?.governanceWarning ? `Governance warning: ${report.expertBrief.governanceWarning}` : '',
      getHighRiskClaimsCount(report) > 0 ? `${getHighRiskClaimsCount(report)} high-risk claims flagged by AI governance (review in Claim Governance before sales use).` : '',
      growthRows?.some((r) => r.launchGroup !== 'Priority 1') ? `${growthRows.filter((r) => r.launchGroup !== 'Priority 1').length} county-service combos in lower priority groups need validation before full investment.` : ''
    ].filter(Boolean).join(' ') || 'No significant risks identified at this time.'
    : 'No report data available for risk assessment.';

  const launchRecommendation = priorityCounties.length >= 3
    ? `Proceed with ${priorityCounties.slice(0, 3).map((r) => r.county).join(', ')} launches. These show the strongest combination of market size, Andwell footprint, and modeled revenue. Deploy staffing and referral development in parallel.`
    : priorityCounties.length > 0
      ? `Proceed with ${priorityCounties.length} priority county launches while validating additional markets through referral source outreach.`
      : 'No priority counties identified. Tune growth scenario or load a report to generate launch recommendations.';

  const strategicPriorities = [
    `Launch ${priorityCounties.length > 0 ? priorityCounties.map((r) => r.county + ' ' + r.service).join(', ') : 'priority counties'}`,
    report?.humanReviewItems ? `Resolve ${report.humanReviewItems} pending review items for field readiness` : 'Maintain evidence quality standards',
    threatCount > 0 ? `Coach field team on ${threatCount} strategic competitor threats` : 'Monitor competitive landscape',
    `Scale staffing to meet ${totals ? totals.starts[2] : 'modeled'} Y3 start volume`
  ];

  return {
    executiveReadout,
    boardNarrative,
    riskSummary,
    launchRecommendation,
    strategicPriorities,
    generatedAt: now
  };
}

export function generateBoardPacket(report?: IntelligenceReport | null, growthRows?: GrowthRow[], totals?: GrowthTotals, staffing?: StaffingPlanItem[]): BoardPacket {
  const now = new Date().toISOString().split('T')[0];
  const priorityRows = growthRows?.filter((r) => r.launchGroup === 'Priority 1') || [];
  const allPriority = growthRows?.filter((r) => r.launchGroup !== 'Priority 3') || [];
  const totalRevenue = totals ? formatMoney(totals.totalRevenue) : 'N/A';
  const y1Rev = totals ? formatMoney(totals.revenue[0]) : 'N/A';

  const financialModel = totals ? [
    { label: 'Year 1 Revenue', value: formatMoney(totals.revenue[0]) },
    { label: 'Year 2 Revenue', value: formatMoney(totals.revenue[1]) },
    { label: 'Year 3 Revenue', value: formatMoney(totals.revenue[2]) },
    { label: 'Total 3-Year Revenue', value: formatMoney(totals.totalRevenue) },
    { label: 'Total 3-Year Contribution', value: formatMoney(totals.totalContribution) },
    { label: 'Year 1 Starts', value: String(totals.starts[0]) },
    { label: 'Year 3 Starts', value: String(totals.starts[2]) },
    { label: 'Total Referrals', value: String(totals.totalReferrals) }
  ] : [];

  const risks = [];
  if (report?.humanReviewItems) risks.push({ risk: `${report.humanReviewItems} AI findings pending human review`, mitigation: 'Assign content team to review and approve before field use', severity: 'Medium' as const });
  if (report?.competitorScores?.some((s) => s.threatLevel === 'Strategic threat')) risks.push({ risk: 'Strategic competitor threats identified', mitigation: 'Deploy battlecard coaching and field positioning updates', severity: 'High' as const });
  const hr = getHighRiskClaimsCount(report);
  if (hr > 0) risks.push({ risk: `${hr} high-risk claims from AI governance`, mitigation: 'Review and approve or reject in Claim Governance view before any sales/field use', severity: 'High' as const });
  if (growthRows?.some((r) => r.launchGroup === 'Priority 3')) risks.push({ risk: 'Rural county staffing constraints', mitigation: 'Validate remote staffing model and telehealth infrastructure', severity: 'Medium' as const });
  risks.push({ risk: 'Referral source dependency', mitigation: 'Diversify referral base across hospital, SNF, and primary care channels', severity: 'Low' as const });

  const appendix = [
    `Competitors analyzed: ${report?.competitorsAnalyzed || 0}`,
    `Service lines mapped: ${report?.serviceLinesMapped || 0}`,
    `Pages reviewed: ${report?.pagesReviewed || 0}`,
    `Potential advantages identified: ${report?.potentialAndwellAdvantages || 0}`,
    `Foremost Expert score: ${report?.expertBrief?.expertScore || 'Not generated'}`,
    `Total modeled counties: ${growthRows?.length || 0}`,
    `Growth scenario: ${totals ? `${formatMoney(totals.revenue[0])} Y1 / ${formatMoney(totals.revenue[2])} Y3` : 'Not configured'}`
  ];

  return {
    title: 'Andwell Growth Strategy — Board Packet',
    executiveSummary: report
      ? `Competitive intelligence report covering ${report.competitorsAnalyzed} competitors. ${report.potentialAndwellAdvantages} potential advantages identified. ${report.humanReviewItems} items requiring human review.${report.expertBrief ? ` Foremost Expert score: ${report.expertBrief.expertScore}.` : ''}`
      : 'No competitive report loaded.',
    marketOpportunity: growthRows
      ? `${allPriority.length} county-service combinations in launch or validation groups. Modeled total addressable market across ${growthRows.length} rows. Y1 revenue: ${y1Rev}. Top counties by opportunity score: ${[...growthRows].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 3).map((r) => r.county).join(', ')}.`
      : 'No growth model data loaded.',
    financialModel,
    priorityCounties: priorityRows.slice(0, 8).map((r) => ({
      county: r.county,
      service: r.service,
      rationale: r.reason.slice(0, 200),
      revenue: formatMoney(r.revenue[0])
    })),
    staffingSummary: staffing?.map((s) => ({
      role: s.service,
      y1Fte: s.fte[0],
      y3Fte: s.fte[2],
      costY1: formatMoney(s.cost[0])
    })) || [],
    risks,
    appendix,
    generatedAt: now
  };
}

export function generateCoachingPlan(competitorName: string, report?: IntelligenceReport | null): CoachingPlan {
  const analysis = report?.analyses?.find((a) => a.name === competitorName);
  const score = report?.competitorScores?.find((s) => s.competitorName === competitorName);
  const serviceLine = analysis?.aiExtraction?.serviceLineDepth?.[0]?.serviceLine || score?.leadWith?.[0] || 'Home Healthcare';

  const discoveryQuestions = [
    `What is your current experience with ${competitorName}?`,
    `How do ${competitorName}'s services compare to what you need for your patients?`,
    `What would an ideal partnership look like for ${serviceLine} referrals?`,
    `Have you encountered any limitations with ${competitorName} in ${serviceLine}?`,
    `What outcomes matter most when choosing a ${serviceLine} provider?`
  ];

  const competitorWarnings = score
    ? [
      `${competitorName} has a ${score.threatLevel} profile with ${score.serviceLineMatchScore}% service match.`,
      score.needsReview.length > 0 ? `Needs review: ${score.needsReview.slice(0, 3).join('; ')}` : '',
      `Lead with: ${score.leadWith.slice(0, 3).join(', ')}`
    ].filter(Boolean)
    : [`No specific competitor data for ${competitorName}. Use general positioning.`];

  const safeLanguage = analysis?.aiExtraction?.safeSalesLanguage?.slice(0, 2).join(' ') || 'Focus on Andwell described capabilities and depth rather than competitor comparison.';

  return {
    competitor: competitorName,
    serviceLine,
    preCallPlan: `Before the call with ${competitorName} prospect: Review the battlecard for ${competitorName}. Confirm the prospect's referral history and service line needs. ${score ? `Key differentiator: ${score.andwellDifferentiationScore}% differentiation score.` : ''} Prepare to lead with verified Andwell depth in ${serviceLine}.`,
    discoveryQuestions,
    competitorWarnings,
    postCallNotes: 'Document the prospect\'s current provider relationship, pain points, and next steps. Flag any objections for team coaching.',
    followUpDraft: `Thank you for the conversation about ${serviceLine} needs. As discussed, Andwell provides ${safeLanguage}. I will send over our ${serviceLine} overview specific to your area. Please let me know if you would like to schedule a deeper discussion.`,
    safeLanguage,
    doNotSay: analysis?.aiExtraction?.doNotSayLanguage?.slice(0, 4) || ['Do not claim a competitor does not offer a service unless publicly confirmed.']
  };
}
