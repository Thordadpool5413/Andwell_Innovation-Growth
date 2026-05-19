export interface ApiReport {
  id: string;
  generatedAt: string;
  competitorsAnalyzed: number;
  pagesReviewed: number;
  potentialAndwellAdvantages: number;
  humanReviewItems: number;
  competitors: string[];
  executiveSummary: string;
}

export interface ApiCompetitor {
  name: string;
  url: string;
  market: string;
}

export interface GrowthPlanApiData {
  reports: ApiReport[];
  competitors: ApiCompetitor[];
  loading: boolean;
  error: string | null;
}

export async function fetchReports(): Promise<ApiReport[]> {
  try {
    const res = await fetch('/api/reports', { headers: { accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.reports || [];
  } catch {
    return [];
  }
}

export async function fetchCompetitors(): Promise<ApiCompetitor[]> {
  try {
    const res = await fetch('/api/competitors', { headers: { accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.competitors || [];
  } catch {
    return [];
  }
}
