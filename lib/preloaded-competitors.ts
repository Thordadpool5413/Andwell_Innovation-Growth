import type { CompetitorInput } from './types';

export const MAINE_COMPETITOR_LIBRARY: CompetitorInput[] = [
  {
    name: 'Northern Light Health',
    url: 'https://northernlighthealth.org/',
    market: 'Maine',
    notes: 'Preloaded Maine competitor source. Full public website scan target.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'Northern Light Home Care and Hospice',
    url: 'https://northernlighthealth.org/homecare-hospice',
    market: 'Maine home care and hospice',
    notes: 'Preloaded Maine competitor source. Compare home care, hospice, palliative, referral, and location evidence.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'MaineHealth Home Health and Hospice',
    url: 'https://www.mainehealth.org/mainehealth-home-health-and-hospice',
    market: 'Maine home health and hospice',
    notes: 'Preloaded Maine competitor source. Compare home health, hospice, palliative, referral, and location evidence.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'Beacon Hospice / Amedisys South Portland',
    url: 'https://locations.amedisys.com/me/south-portland/hospice-4806/',
    market: 'South Portland, Maine hospice',
    notes: 'Preloaded Maine competitor source for Beacon Hospice / Amedisys.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'Beacon Hospice / Amedisys Bangor',
    url: 'https://locations.amedisys.com/me/bangor/hospice-4804/',
    market: 'Bangor, Maine hospice',
    notes: 'Preloaded Maine competitor source for Beacon Hospice / Amedisys.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'Beacon Hospice / Amedisys Augusta',
    url: 'https://locations.amedisys.com/me/augusta/hospice-4803/',
    market: 'Augusta, Maine hospice',
    notes: 'Preloaded Maine competitor source for Beacon Hospice / Amedisys.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'Bristol Hospice Bangor',
    url: 'https://bristolhospice.com/location/bristol-hospice-bangor/',
    market: 'Bangor, Maine hospice',
    notes: 'Preloaded Maine competitor source.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'Constellation Health Services Maine',
    url: 'https://constellationhs.com/location/maine/',
    market: 'Maine home health and hospice',
    notes: 'Preloaded Maine competitor source.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: "Martin's Point HealthCare Palliative Care",
    url: 'https://martinspoint.org/Primary-Care/Learn-About-Our-Services/Palliative',
    market: 'Maine palliative care',
    notes: 'Preloaded Maine competitor source focused on palliative care evidence.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'St. Joseph Healthcare Homecare and Hospice',
    url: 'https://stjosephbangor.org/services/homecare-and-hospice/',
    market: 'Bangor, Maine homecare and hospice',
    notes: 'Preloaded Maine competitor source.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'Covenant Health Maine Service Area',
    url: 'https://covenanthealth.net/where-we-serve/',
    market: 'Maine service area',
    notes: 'Preloaded Maine competitor source. Scan for Maine service-area evidence.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'CenterWell Home Health Bangor',
    url: 'https://www.centerwell.com/find-care/home-health/location?hcode=H004&location=CenterWell+Home+Health+-+Bangor',
    market: 'Bangor, Maine home health',
    notes: 'Preloaded Maine competitor source.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'CenterWell Home Health Portland',
    url: 'https://www.centerwell.com/find-care/home-health/location?hcode=H005&location=CenterWell+Home+Health+-+Portland',
    market: 'Portland, Maine home health',
    notes: 'Preloaded Maine competitor source.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'New England Cancer Specialists Palliative Care',
    url: 'https://newenglandcancerspecialists.com/service/palliative-care/',
    market: 'Maine palliative care',
    notes: 'Preloaded Maine competitor source.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
  {
    name: 'New England Cancer Specialists Care Locations',
    url: 'https://newenglandcancerspecialists.com/care-locations/',
    market: 'Maine oncology and palliative care locations',
    notes: 'Preloaded Maine competitor source for location and access evidence.',
    sourceScope: 'Full public website scan',
    preloaded: true,
  },
];

export const ANDWELL_BASELINE_SOURCES = [
  'https://andwell.org/',
  'https://andwell.org/health-services/at-home-care/home-healthcare/',
  'https://andwell.org/health-services/at-home-care/wound-care/',
  'https://andwell.org/health-services/hospice-palliative-care/hospice-home-care/',
  'https://andwell.org/health-services/hospice-palliative-care/palliative-medicine/',
  'https://andwell.org/health-services/therapycare-specialty-services/adult-therapy/',
  'https://andwell.org/health-services/therapycare-specialty-services/pediatric-therapy/',
];

export const SOURCE_LIBRARY_MODE = 'Preloaded + Admin';
export const SOURCE_LIBRARY_GEOGRAPHY = 'Maine';
export const FULL_SCAN_MAX_PAGES_PER_SITE = 35;

export function mergeMaineCompetitorLibrary(competitors: CompetitorInput[] = []): CompetitorInput[] {
  const byUrl = new Map<string, CompetitorInput>();
  for (const competitor of MAINE_COMPETITOR_LIBRARY) {
    byUrl.set(competitor.url, competitor);
  }
  for (const competitor of competitors) {
    if (!competitor.url) continue;
    const seed = byUrl.get(competitor.url);
    byUrl.set(competitor.url, {
      ...seed,
      ...competitor,
      preloaded: seed?.preloaded ?? competitor.preloaded,
      sourceScope: competitor.sourceScope || seed?.sourceScope || 'Admin managed source',
    });
  }
  return [...byUrl.values()];
}
