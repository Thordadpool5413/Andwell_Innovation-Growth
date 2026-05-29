import type { BattlecardTemplate, CompetitorAnalysis, IntelligenceReport } from './types';
import { andwellCatalog } from './andwell';

const countyList = [
  'Androscoggin', 'Aroostook', 'Cumberland', 'Franklin', 'Hancock',
  'Kennebec', 'Knox', 'Lincoln', 'Oxford', 'Penobscot',
  'Piscataquis', 'Sagadahoc', 'Somerset', 'Waldo', 'Washington', 'York'
];

const audienceOptions = [
  'Hospital discharge planner', 'Case manager', 'Primary care provider',
  'Specialist', 'Facility administrator', 'Assisted living leader',
  'Skilled nursing facility team', 'Family caregiver', 'Community partner'
];

const objectionOptions = [
  'We already work with another provider',
  'Your competitor offers the same services',
  'We handle this internally',
  'We do not have enough referrals',
  'Insurance does not cover this',
  'We do not have capacity',
  'Your pricing is too high',
  'We tried this before and it did not work',
  'Our patients prefer the other provider',
  'We need faster response times'
];

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickN<T>(items: T[], n: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, items.length));
}

export function buildBattlecard(params: {
  competitor: string;
  county: string;
  serviceLine: string;
  audience: string;
  objection: string;
  analysis?: CompetitorAnalysis;
  report?: IntelligenceReport;
}): BattlecardTemplate {
  const { competitor, county, serviceLine, audience, objection } = params;
  const catalogEntry = andwellCatalog.find((s) =>
    s.serviceLine.toLowerCase().includes(serviceLine.toLowerCase()) ||
    serviceLine.toLowerCase().includes(s.serviceLine.toLowerCase())
  );
  const serviceDesc = catalogEntry?.description || 'skilled home and community-based care';
  const subservices = catalogEntry?.subservices || [];

  const safeAngle = catalogEntry?.safeLanguage || `Andwell publicly describes ${serviceDesc}.`;

  const discoveryQuestions = [
    `What is your current experience with ${serviceLine} referrals in ${county}?`,
    `How many patients do you typically refer for ${serviceLine} per month?`,
    `What challenges have you faced with ${competitor} for ${serviceLine}?`,
    `What would an ideal ${serviceLine} partnership look like for your team?`,
    `How do you currently evaluate ${serviceLine} providers in ${county}?`,
    audience.includes('discharge') || audience.includes('case manager')
      ? `What discharge barriers do you see most often for ${serviceLine} patients?`
      : audience.includes('caregiver')
        ? `What support would make the biggest difference for your family right now?`
        : `What outcomes matter most to your organization for ${serviceLine}?`
  ];

  const positioning = catalogEntry
    ? `Andwell's ${serviceLine} in ${county} is publicly described with ${pickN(subservices, 3).join(', ')}. The key differentiator is ${catalogEntry.description.split('.')[0].toLowerCase()}. ${safeAngle}`
    : `Andwell provides ${serviceDesc} across ${county} and surrounding areas, with a focus on coordinated care and patient-centered outcomes.`;

  const opening = `Thank you for the opportunity to discuss ${serviceLine} in ${county}. Andwell serves patients across ${county} with ${serviceDesc}. I would love to learn more about your current referral patterns and how we can support your team.`;

  const close = `Let me suggest a next step: I will send you our ${serviceLine} overview specific to ${county}, and we can schedule a brief follow-up to discuss any questions. Would that work?`;

  const objectionResponse = `I understand your concern about "${objection}". Here is what I would share: ${safeAngle} In addition, Andwell's ${serviceLine} team in ${county} is focused on ${pickN(subservices, 2).join(' and ') || 'coordinated, patient-centered care'}. I would welcome the chance to show you how our approach differs.`;

  return {
    competitor,
    county,
    serviceLine,
    audience,
    objection,
    opening,
    discoveryQuestions,
    positioning,
    objectionResponse,
    close
  };
}

function extractLocationFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const location = pathParts[1];
      return location.charAt(0).toUpperCase() + location.slice(1);
    }
  } catch {
    return '';
  }
  return '';
}

export function getBuilderOptions(report?: IntelligenceReport | null) {
  const competitors = report
    ? report.analyses.map((a) => {
        const location = extractLocationFromUrl(a.url);
        return location ? `${a.name} - ${location}` : a.name;
      })
    : [];
  return {
    counties: countyList,
    audiences: audienceOptions,
    objections: objectionOptions,
    services: andwellCatalog.map((s) => s.serviceLine),
    competitors
  };
}

export { countyList, audienceOptions, objectionOptions };
