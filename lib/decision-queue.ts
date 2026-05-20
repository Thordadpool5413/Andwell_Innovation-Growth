import type { IntelligenceReport, Finding, CompetitorScore } from './types';
import type { GrowthRow } from './growth-plan';
import { andwellCatalog } from './andwell';

export type DecisionUrgency = 'Immediate' | 'Today' | 'This week' | 'This month' | 'This quarter';
export type DecisionType = 'Leadership' | 'Governance' | 'Staffing' | 'Growth' | 'Competitive' | 'Compliance' | 'Field enablement' | 'Referral';
export type DecisionStatus = 'Pending' | 'Approved' | 'Deferred' | 'Assigned' | 'Escalated';

export type DecisionItem = {
  id: string;
  type: DecisionType;
  owner: string;
  urgency: DecisionUrgency;
  risk: 'High' | 'Medium' | 'Low';
  title: string;
  evidence: string;
  recommendedAction: string;
  status: DecisionStatus;
  relatedCounty?: string;
  relatedCompetitor?: string;
  relatedService?: string;
  createdAt: string;
};

const owners = ['CEO', 'COO', 'Sales Leader', 'Clinical Leader', 'Marketing', 'Admin'] as const;

function randomOwner(): string {
  return owners[Math.floor(Math.random() * owners.length)];
}

function pickUrgency(risk: 'High' | 'Medium' | 'Low'): DecisionUrgency {
  if (risk === 'High') return Math.random() > 0.5 ? 'Immediate' : 'Today';
  if (risk === 'Medium') return Math.random() > 0.5 ? 'This week' : 'This month';
  return 'This quarter';
}

export function generateDecisions(report?: IntelligenceReport | null, growthRows?: GrowthRow[]): DecisionItem[] {
  const decisions: DecisionItem[] = [];
  const now = new Date().toISOString().split('T')[0];

  if (report) {
    for (const insight of report.executiveInsights || []) {
      const risk = insight.priority === 'High' ? 'High' : insight.priority === 'Medium' ? 'Medium' : 'Low';
      decisions.push({
        id: `dec-insight-${decisions.length}`,
        type: 'Leadership',
        owner: randomOwner(),
        urgency: pickUrgency(risk),
        risk,
        title: insight.title,
        evidence: insight.summary,
        recommendedAction: insight.action,
        status: 'Pending',
        createdAt: now
      });
    }

    for (const score of report.competitorScores || []) {
      if (score.threatLevel === 'Strategic threat' || score.threatLevel === 'High overlap') {
        decisions.push({
          id: `dec-threat-${decisions.length}`,
          type: 'Competitive',
          owner: 'CEO',
          urgency: 'Immediate',
          risk: 'High',
          title: `${score.competitorName} is a ${score.threatLevel}`,
          evidence: score.executiveReadout,
          recommendedAction: `Review ${score.competitorName} battlecard and coach reps on differentiation. Focus on: ${score.leadWith.slice(0, 3).join(', ')}.`,
          status: 'Pending',
          relatedCompetitor: score.competitorName,
          createdAt: now
        });
      }

      if (score.needsReview.length > 0) {
        decisions.push({
          id: `dec-review-${decisions.length}`,
          type: 'Governance',
          owner: 'Admin',
          urgency: 'This week',
          risk: 'Medium',
          title: `${score.competitorName} has ${score.needsReview.length} items needing review`,
          evidence: score.needsReview.slice(0, 3).join('; '),
          recommendedAction: 'Open Claim Governance view and review flagged items. Assign to content team.',
          status: 'Pending',
          relatedCompetitor: score.competitorName,
          createdAt: now
        });
      }
    }

    for (const analysis of report.analyses || []) {
      if (analysis.aiExtraction?.doNotSayLanguage?.length) {
        decisions.push({
          id: `dec-dosay-${decisions.length}`,
          type: 'Field enablement',
          owner: 'Sales Leader',
          urgency: 'Today',
          risk: 'Medium',
          title: `Field language warning for ${analysis.name}`,
          evidence: `Do not say: ${analysis.aiExtraction.doNotSayLanguage.slice(0, 3).join('; ')}`,
          recommendedAction: 'Update battlecard with corrected language and brief reps during next team call.',
          status: 'Pending',
          relatedCompetitor: analysis.name,
          createdAt: now
        });
      }
    }

    if (report.humanReviewItems > 0) {
      decisions.push({
        id: `dec-human-${decisions.length}`,
        type: 'Governance',
        owner: 'Admin',
        urgency: 'This week',
        risk: 'Medium',
        title: `${report.humanReviewItems} findings require human review`,
        evidence: 'AI-generated findings that need manager approval before field use.',
        recommendedAction: 'Open Evidence Matrix, filter by Needs Review, and approve or reject each item.',
        status: 'Pending',
        createdAt: now
      });
    }

    if (report.expertBrief?.governanceWarning) {
      decisions.push({
        id: `dec-gov-${decisions.length}`,
        type: 'Compliance',
        owner: 'Clinical Leader',
        urgency: 'Today',
        risk: 'High',
        title: 'Governance warning from Foremost Expert',
        evidence: report.expertBrief.governanceWarning,
        recommendedAction: 'Review governance warning with clinical leadership and update field language before next sales cycle.',
        status: 'Pending',
        createdAt: now
      });
    }

    if (report.expertBrief?.fastestFieldMove) {
      decisions.push({
        id: `dec-field-${decisions.length}`,
        type: 'Field enablement',
        owner: 'Sales Leader',
        urgency: 'Today',
        risk: 'Low',
        title: 'Fastest field move identified',
        evidence: report.expertBrief.fastestFieldMove,
        recommendedAction: 'Brief sales team on the fastest field move and update battlecards accordingly.',
        status: 'Pending',
        createdAt: now
      });
    }
  }

  if (growthRows) {
    for (const row of growthRows) {
      if (row.launchGroup === 'Priority 1') {
        decisions.push({
          id: `dec-growth-${decisions.length}`,
          type: 'Growth',
          owner: 'COO',
          urgency: 'This month',
          risk: 'Medium',
          title: `Launch ${row.service} in ${row.county}`,
          evidence: row.reason,
          recommendedAction: row.action,
          status: 'Pending',
          relatedCounty: row.county,
          relatedService: row.service,
          createdAt: now
        });
      }
    }

    const criticalGrowth = growthRows.filter((r) => r.opportunityScore >= 70);
    if (criticalGrowth.length >= 3) {
      decisions.push({
        id: `dec-scale-${decisions.length}`,
        type: 'Growth',
        owner: 'CEO',
        urgency: 'This quarter',
        risk: 'Low',
        title: `${criticalGrowth.length} high-opportunity markets identified`,
        evidence: `Counties with 70+ opportunity scores: ${criticalGrowth.map((r) => r.county).join(', ')}.`,
        recommendedAction: 'Allocate expansion budget and prioritise staffing for top-scoring counties.',
        status: 'Pending',
        createdAt: now
      });
    }
  }

  decisions.push({
    id: `dec-dashboard-${decisions.length}`,
    type: 'Referral',
    owner: 'Sales Leader',
    urgency: 'This week',
    risk: 'Medium',
    title: 'Review referral source coverage gaps',
    evidence: 'Referral Source Command View shows account-type profiles with pain points and discovery questions.',
    recommendedAction: 'Open Referral Sources view and review profiles for Hospital, SNF, and Primary Care. Assign account owners.',
    status: 'Pending',
    createdAt: now
  });

  return decisions;
}

export function applyDecisionAction(items: DecisionItem[], id: string, action: DecisionStatus): DecisionItem[] {
  return items.map((item) => item.id === id ? { ...item, status: action } : item);
}

export function urgencyOrder(urgency: DecisionUrgency): number {
  const order: Record<DecisionUrgency, number> = { Immediate: 0, Today: 1, 'This week': 2, 'This month': 3, 'This quarter': 4 };
  return order[urgency];
}

export function riskTone(risk: 'High' | 'Medium' | 'Low'): 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark' {
  if (risk === 'High') return 'red';
  if (risk === 'Medium') return 'amber';
  return 'green';
}
