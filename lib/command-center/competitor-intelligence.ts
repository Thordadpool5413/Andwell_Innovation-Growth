import type { ServiceLine } from '../andwell.ts';

export interface CompetitorService {
  serviceName: string;
  andwellMatch: string; // which Andwell service line
  offered: boolean;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  positioning: string;
}

export interface CompetitorProfile {
  name: string;
  county: string[];
  positioningLanguage: string;
  painPoints: string[];
  capabilities: string[];
  services: CompetitorService[];
  gaps: string[];
  overallStrength: string;
  andwellDifferentiator: string;
  leadService: 'Home Health' | 'Hospice' | 'Palliative Care' | 'Behavioral Health' | 'Specialty';
  referralCta: string;
}

// Maine Competitor Intelligence - Manually Researched & Extracted
export const mainCompetitorProfiles: Record<string, CompetitorProfile> = {
  'Northern Light Health': {
    name: 'Northern Light Health',
    county: ['Cumberland', 'York', 'Penobscot', 'Aroostook', 'Lincoln'],
    positioningLanguage: "Maine's largest integrated health system since 1912; personalized in-home care with extensive clinical support and statewide network integration",
    painPoints: [
      'Managing serious illness at home',
      'Complex behavioral/mental health needs',
      'Dementia and Alzheimer\'s management',
      'Post-surgical recovery',
      'End-of-life comfort care'
    ],
    capabilities: [
      'State-wide network integration',
      'Behavioral health home programs',
      'Telepsychiatry network',
      'Memory care clinics',
      'Mood and Memory program',
      '24/7 on-call nursing',
      '8 nursing facilities with dementia units'
    ],
    services: [
      { serviceName: 'Home Healthcare', andwellMatch: 'Home Healthcare', offered: true, strength: 'strong', positioning: 'Part of integrated system with hospital coordination' },
      { serviceName: 'Behavioral Health', andwellMatch: 'Community and Behavioral Health', offered: true, strength: 'strong', positioning: 'Integrated behavioral health with telepsychiatry' },
      { serviceName: 'Dementia Care', andwellMatch: 'Dementia Care Management through GUIDE', offered: true, strength: 'strong', positioning: 'Memory care clinics and dedicated programs' },
      { serviceName: 'Hospice Care', andwellMatch: 'Hospice Home Care', offered: true, strength: 'moderate', positioning: 'Integrated hospice services' },
      { serviceName: 'Wound Care', andwellMatch: 'Mobile Wound Care', offered: false, strength: 'weak', positioning: 'Not prominently featured' }
    ],
    gaps: ['Limited specialized wound care prominence', 'No explicit ABA therapy', 'Limited telehealth-specific programs'],
    overallStrength: 'Scale and integration - largest statewide system with deep roots and comprehensive behavioral health infrastructure',
    andwellDifferentiator: 'Andwell competes through specialized wound care focus, integrated behavioral health with ABA/pediatric focus, technology-first approach, and boutique service model vs. Northern Light\'s hospital-system dominance',
    leadService: 'Behavioral Health',
    referralCta: 'For patients needing integrated behavioral health with home services, Northern Light\'s scale is advantageous; Andwell differentiates through specialized pediatric ABA and boutique care personalization'
  },
  'MaineHealth Home Health': {
    name: 'MaineHealth Home Health',
    county: ['York', 'Cumberland', 'Oxford', 'Knox', 'Waldo', 'Lincoln', 'Sagadahoc'],
    positioningLanguage: 'Major regional home health provider with 24/7 nursing; emphasis on comprehensive post-acute care and chronic condition management with evidence-based treatments',
    painPoints: [
      'Recovery from surgery/illness/injury',
      'Chronic disease management',
      'Wound care and healing',
      'Post-partum recovery',
      'Diabetes and metabolic disease',
      'Joint replacement recovery'
    ],
    capabilities: [
      '24/7 on-call nursing',
      '7 days per week service',
      'Telehealth services',
      'Specialized rehab therapies (PT/OT)',
      'Wound care programs',
      'Sussman House inpatient hospice facility in Rockport',
      'Hyperbaric oxygen therapy access',
      'Coordinated care with MaineHealth hospitals'
    ],
    services: [
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: true, strength: 'strong', positioning: '24/7 post-acute medical care' },
      { serviceName: 'Wound Care', andwellMatch: 'Mobile Wound Care', offered: true, strength: 'strong', positioning: 'Hyperbaric therapy and advanced wound treatments' },
      { serviceName: 'Hospice', andwellMatch: 'Hospice Home Care', offered: true, strength: 'moderate', positioning: 'Sussman House dedicated facility' },
      { serviceName: 'Behavioral Health', andwellMatch: 'Community and Behavioral Health', offered: false, strength: 'none', positioning: 'Not a focus area' },
      { serviceName: 'Dementia Care', andwellMatch: 'Dementia Care Management through GUIDE', offered: false, strength: 'none', positioning: 'Not mentioned' }
    ],
    gaps: ['Limited behavioral health/mental health focus', 'No explicit ABA therapy', 'No dementia-specific programs', 'No private duty services'],
    overallStrength: 'Comprehensive post-acute medical care with strong wound care program; integrated hospice with dedicated facilities; 24/7 availability',
    andwellDifferentiator: 'MaineHealth competes directly on home health, hospice, and wound care. Andwell differentiates through behavioral health and ABA integration, dementia care programs, and personalized boutique approach',
    leadService: 'Home Health',
    referralCta: 'MaineHealth wins on wound care and 24/7 availability; Andwell differentiates through behavioral health integration, dementia programs, and non-hospital independence'
  },
  'Beacon Hospice': {
    name: 'Beacon Hospice (Amedisys)',
    county: ['Penobscot', 'Cumberland', 'Kennebec', 'Androscoggin'],
    positioningLanguage: 'National hospice and palliative care leader with local presence; focus on whole-person end-of-life care with pain management and emotional/spiritual support',
    painPoints: [
      'End-of-life care planning',
      'Pain and symptom management',
      'Emotional and spiritual support for families',
      'Transitioning to comfort-focused care',
      'Caregiver support and respite'
    ],
    capabilities: [
      'Medicare and Medicaid certified',
      'Integrated palliative + hospice model',
      '24/7 availability',
      'Multi-disciplinary teams',
      'Bereavement services',
      'National Amedisys infrastructure',
      'Multiple Maine locations'
    ],
    services: [
      { serviceName: 'Hospice', andwellMatch: 'Hospice Home Care', offered: true, strength: 'strong', positioning: 'National expertise in end-of-life care' },
      { serviceName: 'Palliative Care', andwellMatch: 'Palliative Medicine', offered: true, strength: 'moderate', positioning: 'Integrated palliative + hospice' },
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: false, strength: 'weak', positioning: 'Limited beyond hospice scope' },
      { serviceName: 'Behavioral Health', andwellMatch: 'Community and Behavioral Health', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Wound Care', andwellMatch: 'Mobile Wound Care', offered: false, strength: 'none', positioning: 'Not offered' }
    ],
    gaps: ['Limited home health beyond hospice scope', 'No rehabilitation or therapy services', 'No behavioral health/mental health specialization', 'No ABA or pediatric services', 'No wound care programs', 'Primarily end-of-life focused'],
    overallStrength: 'Focused hospice expertise with multi-state scaling; strong end-of-life pain management; established palliative care model',
    andwellDifferentiator: 'Beacon competes narrowly on hospice and end-of-life palliative care. Andwell offers full service continuum from home health through palliative to hospice, plus behavioral health, ABA integration, dementia programs, and wound care',
    leadService: 'Hospice',
    referralCta: 'Beacon excels at end-of-life hospice; Andwell offers ecosystem approach - home health, behavioral health, and earlier-stage palliative programs Beacon doesn\'t emphasize'
  },
  'Bristol Hospice': {
    name: 'Bristol Hospice',
    county: ['Piscataquis', 'Penobscot', 'Hancock', 'Waldo', 'Somerset', 'Kennebec'],
    positioningLanguage: 'Compassionate end-of-life specialist serving multiple Maine counties; emphasis on dignity, respect, and quality care at end of life',
    painPoints: [
      'End-of-life comfort and dignity',
      'Family and emotional support',
      'Pain and symptom management at end of life',
      'Spiritual care during dying process',
      'Bereavement support'
    ],
    capabilities: [
      '24/7/365 availability',
      'Multi-disciplinary hospice teams',
      'Bereavement counseling',
      'Volunteer support',
      'Clinical on-call 24/7',
      'Serving 6 Maine counties',
      'Regional specialist focus'
    ],
    services: [
      { serviceName: 'Hospice', andwellMatch: 'Hospice Home Care', offered: true, strength: 'strong', positioning: 'Regional end-of-life specialist' },
      { serviceName: 'Palliative Care', andwellMatch: 'Palliative Medicine', offered: false, strength: 'weak', positioning: 'Limited to end-of-life stage' },
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Behavioral Health', andwellMatch: 'Community and Behavioral Health', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Wound Care', andwellMatch: 'Mobile Wound Care', offered: false, strength: 'none', positioning: 'Not offered' }
    ],
    gaps: ['Hospice-only focus', 'No home health or palliative care earlier stages', 'No rehabilitation or therapy services', 'No behavioral health services', 'No wound care', 'No ABA or pediatric services', 'Limited to end-of-life stage', 'No telehealth'],
    overallStrength: 'Regional hospice specialist with 24/7 dedicated focus on end-of-life compassionate care; serves rural Maine counties effectively',
    andwellDifferentiator: 'Bristol competes narrowly on hospice services in central Maine counties. Andwell offers full continuum beyond hospice, behavioral health, ABA integration, dementia programs, home health, wound care, and technology',
    leadService: 'Hospice',
    referralCta: 'Bristol owns rural end-of-life care in Piscataquis/Somerset; Andwell differentiates with comprehensive services beyond hospice and technology-enabled care'
  },
  'Constellation Health': {
    name: 'Constellation Health Services',
    county: ['Androscoggin', 'Penobscot', 'York', 'Kennebec'],
    positioningLanguage: 'Complete care solution combining technology, coordinated care teams, and home-based model; emphasis on affordable alternative to institutional care; ABA therapy specialist',
    painPoints: [
      'Keeping elderly/disabled at home vs. facilities',
      'Behavioral health for children with autism/developmental delays',
      'Coordinating complex care from home',
      'Affordable long-term care solutions',
      'School and community-based behavioral support'
    ],
    capabilities: [
      'Integrated home health + hospice model',
      'ABA therapy for autism and developmental delays',
      'School-based therapy services',
      'Private duty care',
      'Technology-enabled care coordination',
      'Multi-state insurance partnerships',
      'Behavioral health specialization'
    ],
    services: [
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: true, strength: 'moderate', positioning: 'Technology-enabled home health' },
      { serviceName: 'ABA Therapy', andwellMatch: 'Community and Behavioral Health', offered: true, strength: 'strong', positioning: 'ABA specialist for autism and developmental delays' },
      { serviceName: 'Hospice', andwellMatch: 'Hospice Home Care', offered: true, strength: 'moderate', positioning: 'Integrated hospice model' },
      { serviceName: 'Wound Care', andwellMatch: 'Mobile Wound Care', offered: false, strength: 'none', positioning: 'Limited emphasis' },
      { serviceName: 'Dementia Care', andwellMatch: 'Dementia Care Management through GUIDE', offered: false, strength: 'none', positioning: 'Not mentioned' }
    ],
    gaps: ['Limited emphasis on specialized wound care', 'No dementia-specific programs', 'No telepsychiatry for adults', 'Limited palliative care focus', 'No rehabilitation therapy emphasis', 'Fewer locations than larger systems'],
    overallStrength: 'Unique integrated ABA therapy with home health/hospice; behavioral health specialization for children; technology-enabled care; affordable alternatives',
    andwellDifferentiator: 'Constellation overlaps on home health, palliative, and behavioral health. Andwell differentiates through broader service integration, stronger palliative programming, deeper dementia expertise, fuller service continuum including wound care',
    leadService: 'Behavioral Health',
    referralCta: 'Constellation leads in ABA/pediatric behavioral services; Andwell competes with broader clinical depth and full home health-to-hospice continuum'
  },
  'Martin\'s Point': {
    name: 'Martin\'s Point HealthCare',
    county: ['Cumberland', 'York'],
    positioningLanguage: 'Health plan + integrated care provider offering palliative care to serious illness patients; emphasis on comfort, emotional/spiritual support, and coordination with multiple providers',
    painPoints: [
      'Serious illness management',
      'Pain and symptom control',
      'Goals-of-care conversations',
      'Quality of life focus for chronically ill',
      'Coordination across providers'
    ],
    capabilities: [
      'Palliative care team (doctors, nurses, social workers)',
      'In-person and telehealth palliative services',
      'Integration with MaineHealth providers',
      'Insurance options (Medicare, Medicaid)',
      'Integrated primary care + palliative',
      'Multi-location presence'
    ],
    services: [
      { serviceName: 'Palliative Care', andwellMatch: 'Palliative Medicine', offered: true, strength: 'strong', positioning: 'Health plan integrated palliative' },
      { serviceName: 'Primary Care Integration', andwellMatch: 'Home Healthcare', offered: true, strength: 'moderate', positioning: 'Coordinated with primary care' },
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: false, strength: 'none', positioning: 'Not standalone service' },
      { serviceName: 'Hospice', andwellMatch: 'Hospice Home Care', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Behavioral Health', andwellMatch: 'Community and Behavioral Health', offered: false, strength: 'none', positioning: 'Not standalone' }
    ],
    gaps: ['Palliative-only focus', 'No hospice, home health, or standalone behavioral health', 'No wound care specialization', 'No ABA therapy', 'No dementia-specific programs', 'No rehabilitation or therapy services'],
    overallStrength: 'Integrated palliative care within health plan/primary care model; coordination advantage; telehealth palliative option; strong insurance integration',
    andwellDifferentiator: 'Martin\'s Point competes narrowly on palliative care integrated with primary care. Andwell offers specialized standalone palliative programs, full continuum (home health, hospice, behavioral), dementia programs, wound care, ABA',
    leadService: 'Palliative Care',
    referralCta: 'Martin\'s Point owns palliative-integrated-primary-care; Andwell offers standalone palliative expertise plus full home health and hospice ecosystem'
  },
  'St. Joseph Healthcare': {
    name: 'St. Joseph Healthcare',
    county: ['Penobscot'],
    positioningLanguage: '112-bed acute care community hospital with personalized medicine focus; modern accredited facility with comprehensive specialty support',
    painPoints: [
      'Acute illness requiring hospitalization',
      'Emergency care access',
      'Surgical and orthopedic conditions',
      'Skin and wound healing',
      'Post-acute recovery'
    ],
    capabilities: [
      '112-bed acute care hospital',
      '24/7 emergency department',
      'Skin and Wound Healing Center',
      'Inpatient physical and occupational therapy',
      'Cardiopulmonary care',
      'Hyperbaric medicine',
      '1,080+ employees',
      '30+ departments'
    ],
    services: [
      { serviceName: 'Acute Care', andwellMatch: 'Home Healthcare', offered: true, strength: 'strong', positioning: 'Hospital-based acute care' },
      { serviceName: 'Wound Care', andwellMatch: 'Mobile Wound Care', offered: true, strength: 'moderate', positioning: 'Inpatient wound healing center' },
      { serviceName: 'Inpatient Therapy', andwellMatch: 'Adult Therapy', offered: true, strength: 'moderate', positioning: 'Inpatient PT/OT' },
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Hospice', andwellMatch: 'Hospice Home Care', offered: false, strength: 'none', positioning: 'Not offered' }
    ],
    gaps: ['No home health services', 'No hospice or palliative care', 'No behavioral health specialization', 'No ABA therapy', 'No dementia-specific programs', 'Acute hospital focus only', 'No dedicated rehabilitation facility'],
    overallStrength: 'Acute hospital and emergency care with solid wound care/healing center; accredited specialty services; regional acute care anchor',
    andwellDifferentiator: 'Minimal direct competition - different care settings (hospital vs. home-based). Potential complementary relationship: St. Joseph handles acute care; Andwell handles post-acute home recovery',
    leadService: 'Home Health',
    referralCta: 'St. Joseph handles acute hospital care; Andwell picks up post-acute home recovery and ongoing management - complementary referral relationship'
  },
  'Covenant Health': {
    name: 'Covenant Health',
    county: ['Androscoggin', 'Penobscot', 'York'],
    positioningLanguage: 'Innovative Catholic health care system emphasizing compassionate care; integrated hospital, primary care, specialty, and long-term care under shared mission',
    painPoints: [
      'Acute medical illness',
      'Mental health and behavioral issues',
      'Long-term care and memory care',
      'Senior care coordination',
      'Post-acute rehabilitation',
      'Wound care management'
    ],
    capabilities: [
      '3 major health facilities',
      '233-bed St. Mary\'s with extensive behavioral health',
      '112-bed St. Joseph with wound healing center',
      'Behavioral health services integrated throughout',
      'Memory care through d\'Youville Pavilion',
      'Rehabilitation center',
      'Long-term skilled nursing',
      'Employed primary care and specialty networks'
    ],
    services: [
      { serviceName: 'Acute Care', andwellMatch: 'Home Healthcare', offered: true, strength: 'strong', positioning: 'Hospital-based acute care' },
      { serviceName: 'Behavioral Health', andwellMatch: 'Community and Behavioral Health', offered: true, strength: 'strong', positioning: 'Integrated throughout system' },
      { serviceName: 'Memory Care', andwellMatch: 'Dementia Care Management through GUIDE', offered: true, strength: 'moderate', positioning: 'Facility-based memory care' },
      { serviceName: 'Wound Care', andwellMatch: 'Mobile Wound Care', offered: true, strength: 'moderate', positioning: 'Inpatient wound care' },
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: false, strength: 'none', positioning: 'Not offered' }
    ],
    gaps: ['No home health services', 'No hospice services', 'No palliative care focus', 'Hospital-system centric', 'No ABA therapy', 'No specialized dementia home programs', 'Limited telehealth emphasis'],
    overallStrength: 'Integrated health system with strong behavioral health and memory care focus; Catholic mission creates care philosophy; multi-facility regional presence',
    andwellDifferentiator: 'Minimal direct competition - hospital and facility-based care vs. home-based services. Potential complementary relationship: Covenant handles acute care and long-term facilities; Andwell handles home-based post-acute support',
    leadService: 'Behavioral Health',
    referralCta: 'Covenant handles acute care and facility-based memory care; Andwell complements with home-based post-acute and dementia management services'
  },
  'CenterWell Home Health': {
    name: 'CenterWell Home Health',
    county: ['Cumberland', 'Penobscot', 'York'],
    positioningLanguage: 'National home health brand emphasizing quick access and coordinated care teams; personalized care plans for chronic disease and recovery; 24-48 hour service availability',
    painPoints: [
      'Chronic disease management at home',
      'Post-surgery recovery',
      'Post-hospitalization support',
      'Post-injury rehabilitation',
      'Coordinated therapy services at home'
    ],
    capabilities: [
      'National company infrastructure',
      'Multiple Maine locations',
      'PT, OT, speech pathology on staff',
      'Medical social services',
      'Home health aides available',
      '24-48 hour service initiation',
      'Personalized care plans',
      'Therapy coordination model',
      'Established referral networks'
    ],
    services: [
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: true, strength: 'strong', positioning: 'Therapy-focused home health with quick access' },
      { serviceName: 'Rehabilitation Therapy', andwellMatch: 'Adult Therapy', offered: true, strength: 'strong', positioning: 'PT, OT, SLP coordination' },
      { serviceName: 'Hospice', andwellMatch: 'Hospice Home Care', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Palliative Care', andwellMatch: 'Palliative Medicine', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Behavioral Health', andwellMatch: 'Community and Behavioral Health', offered: false, strength: 'none', positioning: 'Not offered' }
    ],
    gaps: ['No hospice services', 'No palliative care focus', 'No behavioral health or ABA', 'No dementia-specific programs', 'No wound care specialization', 'No private duty care', 'Limited telehealth emphasis', 'National brand positioning'],
    overallStrength: 'National brand with local presence; reliable therapy-focused home health; quick service access (24-48 hours); coordinated multi-discipline teams',
    andwellDifferentiator: 'Direct competition on core home health services. Andwell differentiates through integrated palliative/hospice continuum, behavioral health and ABA specialization, dementia programs, wound care expertise, local/personalized boutique approach',
    leadService: 'Home Health',
    referralCta: 'CenterWell wins on quick therapy access and national infrastructure; Andwell differentiates through integrated palliative/hospice and behavioral health specialization'
  },
  'New England Cancer Specialists': {
    name: 'New England Cancer Specialists',
    county: ['Cumberland', 'York'],
    positioningLanguage: '18-physician comprehensive oncology and hematology practice (nearly 50% of Maine cancer specialists); innovative facility with advanced treatments and research; QOPI-certified quality focus',
    painPoints: [
      'Cancer diagnosis and treatment planning',
      'Chemotherapy administration',
      'Radiation therapy access',
      'Clinical trial participation',
      'Hematologic disease management',
      'Genetic counseling for cancer risk'
    ],
    capabilities: [
      '18 oncologists and hematologists',
      'Medical and radiation oncology under one roof',
      'Breast health programs',
      'State-of-the-art chemotherapy',
      'Clinical trials access',
      'Genetic counseling services',
      'QOPI-certified quality practices',
      'Established since 1978',
      'Comprehensive treatment and research facility'
    ],
    services: [
      { serviceName: 'Oncology', andwellMatch: 'Maternal and Child Health', offered: true, strength: 'strong', positioning: 'Comprehensive cancer and hematology' },
      { serviceName: 'Wound Care', andwellMatch: 'Mobile Wound Care', offered: false, strength: 'weak', positioning: 'Only as oncology side effect management' },
      { serviceName: 'Home Health', andwellMatch: 'Home Healthcare', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Hospice', andwellMatch: 'Hospice Home Care', offered: false, strength: 'none', positioning: 'Not offered' },
      { serviceName: 'Palliative Care', andwellMatch: 'Palliative Medicine', offered: false, strength: 'none', positioning: 'Not mentioned' }
    ],
    gaps: ['Oncology-focused', 'No home health, hospice, or palliative care', 'No behavioral health services', 'No ABA therapy', 'No dementia care', 'Wound care only as side effect management', 'Limited home-based services', 'Hospital/clinic-based care model'],
    overallStrength: 'Comprehensive oncology and hematology expertise with largest specialist concentration in Maine; integrated medical + radiation oncology; clinical trial access; quality-certified',
    andwellDifferentiator: 'Minimal direct competition - different focus (cancer treatment vs. post-acute home services). Potential complementary relationship for cancer patients needing palliative/home support',
    leadService: 'Behavioral Health',
    referralCta: 'NECS handles cancer treatment; Andwell could handle palliative and home support for cancer patients and post-treatment wound care - referral partnership'
  }
};

// Helper functions to access competitor intelligence
export function getCompetitorProfile(competitorName: string): CompetitorProfile | null {
  return mainCompetitorProfiles[competitorName] || null;
}

export function getAllCompetitors(): CompetitorProfile[] {
  return Object.values(mainCompetitorProfiles);
}

export function getCompetitorsByCounty(county: string): CompetitorProfile[] {
  return Object.values(mainCompetitorProfiles).filter(c =>
    c.county.some(co => co.toLowerCase() === county.toLowerCase())
  );
}

export function getCompetitorsByService(serviceName: string): CompetitorProfile[] {
  return Object.values(mainCompetitorProfiles).filter(c =>
    c.services.some(s => s.serviceName.toLowerCase().includes(serviceName.toLowerCase()) && s.offered)
  );
}

// Generate service-by-service comparison matrix
export function buildCompetitorComparison(andwellCatalog: ServiceLine[]): Record<string, Record<string, string>> {
  const matrix: Record<string, Record<string, string>> = {};

  const competitors = getAllCompetitors();
  competitors.forEach(competitor => {
    matrix[competitor.name] = {};
    andwellCatalog.forEach(service => {
      const competitorService = competitor.services.find(s =>
        s.andwellMatch.toLowerCase() === service.serviceLine.toLowerCase()
      );
      if (competitorService) {
        matrix[competitor.name][service.serviceLine] = competitorService.strength;
      } else {
        matrix[competitor.name][service.serviceLine] = 'none';
      }
    });
  });

  return matrix;
}
