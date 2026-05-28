import type { ReferralSourceProfile, ReferralSourceType, IntelligenceReport, CompetitorAnalysis } from './types';
import { andwellCatalog, referralAudiences } from './andwell';
import { getCompetitorProfile, getAllCompetitors, type CompetitorProfile } from './command-center/competitor-intelligence';

const sourceProfiles: Record<ReferralSourceType, { leadService: string; painPoints: string[]; discoveryQs: string[]; positioning: string; cta: string; serviceLines: string[] }> = {
  Hospital: {
    leadService: 'Home Healthcare',
    painPoints: ['Readmission reduction', 'Discharge coordination delays', 'Patient handoff communication gaps', 'Insurance authorization complexity', 'Post-acute care capacity'],
    discoveryQs: ['What is your average discharge volume per month?', 'How do you currently select home health partners?', 'What readmission metrics matter most to your team?'],
    positioning: 'Andwell partners with hospitals across Maine for coordinated discharges, reducing readmissions through skilled home health, therapy, and palliative follow-up.',
    cta: 'Let us share our hospital discharge partnership package and readmission reduction data.',
    serviceLines: ['Home Healthcare', 'Palliative Medicine', 'Adult Therapy', 'Mobile Wound Care']
  },
  SNF: {
    leadService: 'Home Healthcare',
    painPoints: ['Post-discharge continuity gaps', 'Therapy transition complexity', 'Wound care follow-up coordination', 'Medication reconciliation handoffs', 'Patient family education needs'],
    discoveryQs: ['How many patients do you discharge to home health per month?', 'What therapy services do you most need help transitioning?', 'How do you currently manage wound care follow-up?'],
    positioning: 'Andwell provides skilled home health, therapy, and wound care follow-up for SNF discharges, ensuring continuity and reducing readmissions.',
    cta: 'Let me send you our SNF discharge partnership overview and service area map.',
    serviceLines: ['Home Healthcare', 'Adult Therapy', 'Mobile Wound Care', 'Palliative Medicine']
  },
  'Primary Care': {
    leadService: 'In Home Care Giving',
    painPoints: ['Chronic disease management support', 'Caregiver burnout in families', 'Home safety assessments', 'Medication adherence', 'Patient transportation barriers'],
    discoveryQs: ['What chronic conditions do you most frequently manage?', 'How often do your patients need home-based support?', 'What caregiver resources do you currently recommend?'],
    positioning: 'Andwell supports primary care with home health, in-home caregiving, and behavioral health services, keeping patients stable between visits.',
    cta: 'I will send you our primary care referral guide and a list of services available in your area.',
    serviceLines: ['In Home Care Giving', 'Home Healthcare', 'Dementia Care Management through GUIDE', 'Community and Behavioral Health']
  },
  Specialist: {
    leadService: 'Pediatric Therapy',
    painPoints: ['Therapy compliance tracking', 'School-home care coordination', 'Specialized equipment needs', 'Family training consistency', 'Progress documentation delays'],
    discoveryQs: ['What pediatric conditions do you most commonly treat?', 'How do you currently coordinate therapy between clinic and home?', 'What gaps do you see in home-based therapy follow-through?'],
    positioning: 'Andwell provides pediatric OT, PT, and speech therapy in clinic, school, and home settings, with coordinated care plans and family partnership.',
    cta: 'Let me share our pediatric therapy referral packet and service descriptions.',
    serviceLines: ['Pediatric Therapy', 'Maternal and Child Health', 'Audiology', 'Adult Therapy']
  },
  'Assisted Living': {
    leadService: 'In Home Care Giving',
    painPoints: ['Resident acuity changes', 'Hospice eligibility timing', 'Family communication gaps', 'Fall prevention programs', 'Medication management support'],
    discoveryQs: ['What level of acuity change triggers a referral for your residents?', 'How do you currently manage hospice transitions?', 'What family communication tools would help your team?'],
    positioning: 'Andwell brings home health, hospice, and caregiving services into assisted living settings, supporting residents where they live.',
    cta: 'I will send you our assisted living partnership overview and service integration options.',
    serviceLines: ['In Home Care Giving', 'Hospice Home Care', 'Palliative Medicine', 'Mobile Wound Care']
  },
  'Home Health Referral': {
    leadService: 'Home Healthcare',
    painPoints: ['Referral status tracking', 'Authorization delays', 'Patient intake duplication', 'Service availability by county', 'Communication with intake team'],
    discoveryQs: ['What is your current referral volume for home health?', 'How do you track referral status through intake?', 'What would make your referral process faster?'],
    positioning: 'Andwell accepts home health referrals across all Maine counties with a dedicated intake team and real-time status updates.',
    cta: 'Let me send you our referral intake guide and direct contact information.',
    serviceLines: ['Home Healthcare', 'Mobile Wound Care', 'Adult Therapy', 'Dementia Care Management through GUIDE']
  },
  'Behavioral Health': {
    leadService: 'Community and Behavioral Health',
    painPoints: ['Co-occurring treatment coordination', 'Youth access to care', 'Medication management integration', 'Housing instability impact', 'Insurance coverage gaps'],
    discoveryQs: ['What behavioral health services are most in demand in your area?', 'How do you currently coordinate with home-based providers?', 'What age groups need the most support?'],
    positioning: 'Andwell offers outpatient counseling, behavioral health home services, and community support for children, adults, and families across Maine.',
    cta: 'Let me share our behavioral health referral network and service descriptions.',
    serviceLines: ['Community and Behavioral Health', 'Pediatric Therapy', 'Maternal and Child Health']
  },
  'Community Partner': {
    leadService: 'Caring Comfort Program',
    painPoints: ['Serious illness support gaps', 'Caregiver resource awareness', 'Non-medical support access', 'Advance care planning education', 'Bereavement follow-up'],
    discoveryQs: ['What gaps do you see in serious illness support for families?', 'How do you currently connect families to non-medical support?', 'What bereavement resources are most needed?'],
    positioning: 'Andwell provides free Caring Comfort program, bereavement support, and advance care planning resources for community partners.',
    cta: 'I will send you our community partnership packet with program descriptions and referral forms.',
    serviceLines: ['Caring Comfort Program', 'Bereavement Support', 'Palliative Medicine', 'Hospice Home Care']
  },
  'Family Caregiver': {
    leadService: 'In Home Care Giving',
    painPoints: ['Caregiver burnout and stress', 'Respite care access', 'Home safety concerns', 'Understanding available services', 'Navigating insurance coverage'],
    discoveryQs: ['What is the hardest part of caregiving for you right now?', 'How much support do you have from other family members?', 'What would make your day-to-day easier?'],
    positioning: 'Andwell supports family caregivers with respite, in-home caregiving, caregiver education, and emotional support so you do not have to do this alone.',
    cta: 'Let me send you our family caregiver resource guide with service options in your area.',
    serviceLines: ['In Home Care Giving', 'Dementia Care Management through GUIDE', 'Caring Comfort Program', 'Bereavement Support']
  }
};

export function getReferralProfile(sourceType: ReferralSourceType): ReferralSourceProfile {
  const profile = sourceProfiles[sourceType];
  return {
    sourceType,
    leadService: profile.leadService,
    painPoints: [...profile.painPoints],
    discoveryQuestions: [...profile.discoveryQs],
    positioningLanguage: profile.positioning,
    referralCta: profile.cta,
    serviceLines: profile.serviceLines.map((name) => {
      const catalog = andwellCatalog.find((s) => s.serviceLine === name);
      return {
        name,
        relevance: catalog ? 'High' : 'Medium',
        reason: catalog
          ? `Publicly described by Andwell with ${catalog.subservices.length} subservices`
          : 'Referenced but not fully cataloged'
      };
    })
  };
}

export function getReferralProfilesForReport(report?: IntelligenceReport | null): ReferralSourceProfile[] {
  const types: ReferralSourceType[] = ['Hospital', 'SNF', 'Primary Care', 'Specialist', 'Assisted Living', 'Home Health Referral', 'Behavioral Health', 'Community Partner', 'Family Caregiver'];
  return types.map(getReferralProfile);
}

export function getReferralSourceTypes(): ReferralSourceType[] {
  return Object.keys(sourceProfiles) as ReferralSourceType[];
}

// Get competitor intelligence for a specific competitor
export function getCompetitorIntelligence(competitorName: string): CompetitorProfile | null {
  return getCompetitorProfile(competitorName);
}

// Get all Maine competitors with their intelligence
export function getAllCompetitorIntelligence(): CompetitorProfile[] {
  return getAllCompetitors();
}

// Build competitive positioning against a specific competitor
export function buildCompetitivePositioning(competitorName: string) {
  const competitor = getCompetitorProfile(competitorName);
  if (!competitor) return null;

  return {
    competitorName: competitor.name,
    andwellAdvantages: [
      'Full service continuum from home health through hospice to palliative care',
      'Integrated behavioral health and ABA therapy (specialized area for many competitors)',
      'Dedicated dementia care management (GUIDE program)',
      'Specialized mobile wound care with telehealth options',
      'Technology-first boutique approach vs. hospital-system models',
      'Local, personalized care model vs. national brands'
    ],
    competitorStrengths: competitor.capabilities,
    competitorGaps: competitor.gaps,
    keyDifferentiators: [
      competitor.andwellDifferentiator
    ],
    overallStrategy: `Compete with ${competitor.name} by emphasizing Andwell's ${competitor.gaps.includes('behavioral health/mental health specialization') ? 'behavioral health integration and' : ''} full service continuum and specialized expertise where ${competitor.name} has limitations.`,
    referralOpportunities: [
      `Patients needing services beyond ${competitor.name}'s scope`,
      `Patients preferring boutique, personalized care vs. large system model`,
      `Complex patients with behavioral health + medical needs`,
      `Early-stage serious illness patients not yet ready for ${competitor.leadService === 'Hospice' ? 'hospice' : 'specialty'} care`
    ]
  };
}
