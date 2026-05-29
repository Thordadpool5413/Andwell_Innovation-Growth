import { getCompetitorProfile, getAllCompetitors, type CompetitorProfile } from './command-center/competitor-intelligence';

export interface CompetitorCoachingPlan {
  accountName: string;
  competitorName: string;
  competitorProfile: CompetitorProfile;
  preCallStrategy: string;
  keyMessages: string[];
  discoveryQuestions: string[];
  painPointResponses: Record<string, string>;
  objectionHandlers: Record<string, string>;
  nextSteps: string[];
}

export function generateCompetitorCoachingPlan(competitorName: string, accountName: string): CompetitorCoachingPlan | null {
  const competitor = getCompetitorProfile(competitorName);
  if (!competitor) return null;

  const painPointResponses: Record<string, string> = {};
  competitor.painPoints.forEach((painPoint, i) => {
    painPointResponses[painPoint] = `Andwell addresses "${painPoint}" by offering integrated services that ${getAndwellSolution(painPoint, competitor)}`;
  });

  const objectionHandlers: Record<string, string> = {
    'They have been with their current provider for years': 'Loyalty is valuable, but outcomes drive change. Ask how their current provider handles behavioral health, specialized wound care, or dementia management - those are areas where Andwell differentiates.',
    [competitor.name]: `${competitor.name} excels at ${competitor.capabilities[0]}, but Andwell offers the full continuum they likely outsource.`,
    'Price is an issue': 'Our boutique model is actually more cost-effective than hospital systems. We focus on outcomes that reduce readmissions and hospital stays.',
    'We do not need home health': 'You may not need all services today, but having integrated partners for behavioral health, wound care, and dementia prevents future gaps and improves outcomes.'
  };

  return {
    accountName,
    competitorName,
    competitorProfile: competitor,
    preCallStrategy: `${accountName} currently uses ${competitorName}. ${competitor.andwellDifferentiator} Position Andwell as the specialist partner for ${competitor.gaps.length > 0 ? competitor.gaps[0] : 'behavioral health integration'} and full-continuum care.`,
    keyMessages: [
      `${competitorName} is strong at ${competitor.capabilities[0]}, but Andwell offers the full ecosystem`,
      `Andwell specializes in ${competitor.gaps[0] || 'integrated behavioral health'} - a key gap for ${competitorName}`,
      `Our boutique model delivers more personalized care than ${competitorName}'s ${competitor.name.includes('Health') ? 'health system' : 'national brand'} approach`,
      `Patients benefit from having Andwell handle the services ${competitorName} cannot support in-house`
    ],
    discoveryQuestions: [
      `How well does ${competitorName} handle behavioral health integration?`,
      `Are there services ${competitorName} refers out or cannot provide?`,
      `What is the average time for ${competitorName} to respond to new referrals?`,
      `How do they manage patients with complex dementia or serious illness?`,
      `What is ${competitorName}'s approach to care coordination?`,
      `Which service lines could Andwell complement rather than compete with?`
    ],
    painPointResponses,
    objectionHandlers,
    nextSteps: [
      `Schedule lunch-and-learn with ${accountName}'s clinical team on Andwell's ${competitor.gaps[0] ? competitor.gaps[0].toLowerCase() : 'behavioral health integration'}`,
      `Share case studies showing Andwell's success with ${competitor.painPoints[0]?.toLowerCase() || 'patients like theirs'}`,
      `Propose a pilot: Andwell handles ${competitor.gaps.length > 0 ? competitor.gaps[0].split(' ')[0].toLowerCase() : 'behavioral'} cases while ${competitorName} retains medical home health`,
      `Develop a formal referral partnership that positions Andwell as a specialist complement to ${competitorName}`
    ]
  };
}

// Helper to generate Andwell-specific solutions for competitor pain points
function getAndwellSolution(painPoint: string, competitor: CompetitorProfile): string {
  const painPointLower = painPoint.toLowerCase();

  if (painPointLower.includes('behavior') || painPointLower.includes('mental')) {
    return 'offering integrated behavioral health, ABA therapy, and counseling services that most competitors lack';
  } else if (painPointLower.includes('dementia') || painPointLower.includes('alzheimer')) {
    return 'providing specialized GUIDE dementia care management with family education and caregiver support';
  } else if (painPointLower.includes('wound')) {
    return 'delivering mobile wound, ostomy, and continence care with physician coordination and telehealth options';
  } else if (painPointLower.includes('hospice') || painPointLower.includes('end-of-life')) {
    return 'offering full hospice home care plus pre-hospice palliative and Caring Comfort programs';
  } else if (painPointLower.includes('readmission') || painPointLower.includes('discharge')) {
    return 'coordinating seamless post-acute transitions with 24/7 support and integrated behavioral health';
  } else {
    return 'providing comprehensive home-based services with specialized expertise the competitor may not have';
  }
}

// Build competitive win/loss analysis
export function analyzeCompetitiveWinLoss(competitorName: string): {
  whenWeWin: string[];
  whenTheyWin: string[];
  strategy: string;
} {
  const competitor = getCompetitorProfile(competitorName);
  if (!competitor) return { whenWeWin: [], whenTheyWin: [], strategy: '' };

  const whenWeWin: string[] = [];
  const whenTheyWin: string[] = [];

  // When Andwell wins
  competitor.gaps.forEach(gap => {
    whenWeWin.push(`When the patient or referrer needs ${gap.toLowerCase()}`);
  });
  whenWeWin.push(`When the customer wants a boutique, personalized approach vs. a large health system`);
  whenWeWin.push(`When behavioral health integration is critical to care`);

  // When they win
  competitor.capabilities.forEach((cap, i) => {
    if (i < 3) whenTheyWin.push(`When ${cap.toLowerCase()} is the primary need`);
  });
  whenTheyWin.push(`When the referrer has long-standing relationships with ${competitor.name}`);
  whenTheyWin.push(`When scale and network infrastructure matter`);

  return {
    whenWeWin: [...new Set(whenWeWin)],
    whenTheyWin: [...new Set(whenTheyWin)],
    strategy: `Differentiate on ${competitor.gaps[0] || 'behavioral health'}, position as specialist complement rather than competitor, develop formal referral partnerships`
  };
}
