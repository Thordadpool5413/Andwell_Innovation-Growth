import { CompetitorInput } from './types';

export type PreloadedCompetitor = CompetitorInput & {
  id: string;
  isPreloaded: true;
  preloadedAt: string;
};

export const MAINE_COMPETITORS: PreloadedCompetitor[] = [
  {
    id: 'nlh-homecare',
    name: 'Northern Light Health',
    url: 'https://northernlighthealth.org/',
    market: 'Maine',
    notes: 'Primary homecare page',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'nlh-hospice',
    name: 'Northern Light Health',
    url: 'https://northernlighthealth.org/homecare-hospice',
    market: 'Maine',
    notes: 'Homecare and hospice services',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'mainehealth-home',
    name: 'MaineHealth Home Health and Hospice',
    url: 'https://www.mainehealth.org/mainehealth-home-health-and-hospice',
    market: 'Maine',
    notes: 'Home health and hospice services',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'beacon-southportland',
    name: 'Beacon Hospice / Amedisys',
    url: 'https://locations.amedisys.com/me/south-portland/hospice-4806/',
    market: 'Maine',
    notes: 'South Portland location',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'beacon-bangor',
    name: 'Beacon Hospice / Amedisys',
    url: 'https://locations.amedisys.com/me/bangor/hospice-4804/',
    market: 'Maine',
    notes: 'Bangor location',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'beacon-augusta',
    name: 'Beacon Hospice / Amedisys',
    url: 'https://locations.amedisys.com/me/augusta/hospice-4803/',
    market: 'Maine',
    notes: 'Augusta location',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'bristol-bangor',
    name: 'Bristol Hospice Bangor',
    url: 'https://bristolhospice.com/location/bristol-hospice-bangor/',
    market: 'Maine',
    notes: 'Bangor hospice services',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'constellation-maine',
    name: 'Constellation Health Services Maine',
    url: 'https://constellationhs.com/location/maine/',
    market: 'Maine',
    notes: 'Maine service area',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'martinspoint-palliative',
    name: "Martin's Point HealthCare Palliative Care",
    url: 'https://martinspoint.org/Primary-Care/Learn-About-Our-Services/Palliative',
    market: 'Maine',
    notes: 'Palliative care services',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'stjoseph-homecare',
    name: 'St. Joseph Healthcare Homecare and Hospice',
    url: 'https://stjosephbangor.org/services/homecare-and-hospice/',
    market: 'Maine',
    notes: 'Homecare and hospice services',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'covenant-maine',
    name: 'Covenant Health Maine Service Area',
    url: 'https://covenanthealth.net/where-we-serve/',
    market: 'Maine',
    notes: 'Maine service area coverage',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'centerwell-bangor',
    name: 'CenterWell Home Health',
    url: 'https://www.centerwell.com/find-care/home-health/location?hcode=H004&location=CenterWell+Home+Health+-+Bangor',
    market: 'Maine',
    notes: 'Bangor location',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'centerwell-portland',
    name: 'CenterWell Home Health',
    url: 'https://www.centerwell.com/find-care/home-health/location?hcode=H005&location=CenterWell+Home+Health+-+Portland',
    market: 'Maine',
    notes: 'Portland location',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'necs-palliative',
    name: 'New England Cancer Specialists',
    url: 'https://newenglandcancerspecialists.com/service/palliative-care/',
    market: 'Maine',
    notes: 'Palliative care services',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
  {
    id: 'necs-locations',
    name: 'New England Cancer Specialists',
    url: 'https://newenglandcancerspecialists.com/care-locations/',
    market: 'Maine',
    notes: 'Care locations',
    isPreloaded: true,
    preloadedAt: '2026-05-27',
  },
];

export function getPreloadedCompetitors(): PreloadedCompetitor[] {
  return MAINE_COMPETITORS;
}

export function isPreloadedCompetitor(
  competitor: CompetitorInput & { isPreloaded?: boolean }
): competitor is PreloadedCompetitor {
  return competitor.isPreloaded === true;
}
