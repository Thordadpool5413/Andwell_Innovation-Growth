import type { IntelligenceReport, CompetitorAnalysis, Finding } from './types';
import { andwellCatalog } from './andwell';
import { launchPlan } from './growth-plan';

export type SearchResultType = 'competitor' | 'service' | 'finding' | 'county' | 'claim' | 'decision' | 'referral';

export type SearchResult = {
  type: SearchResultType;
  label: string;
  description: string;
  view: string;
  detail?: string;
};

export function globalSearch(query: string, report?: IntelligenceReport | null): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  function add(type: SearchResultType, label: string, description: string, view: string, detail?: string) {
    const key = `${type}:${label}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push({ type, label, description, view, detail });
  }

  for (const service of andwellCatalog) {
    if (service.serviceLine.toLowerCase().includes(q) || service.category.toLowerCase().includes(q)) {
      add('service', service.serviceLine, service.description, 'catalog', service.category);
    }
    for (const sub of service.subservices) {
      if (sub.toLowerCase().includes(q)) {
        add('service', `${service.serviceLine} > ${sub}`, service.description, 'catalog', service.category);
      }
    }
  }

  for (const plan of launchPlan) {
    if (plan.county.toLowerCase().includes(q) || plan.service.toLowerCase().includes(q)) {
      add('county', `${plan.county} — ${plan.service}`, plan.reason, 'launch', plan.launchGroup);
    }
    if (plan.current.toLowerCase().includes(q) || plan.missing.toLowerCase().includes(q)) {
      add('county', `${plan.county} service gap`, `Current: ${plan.current} | Missing: ${plan.missing}`, 'launch', plan.launchGroup);
    }
  }

  if (report) {
    for (const analysis of report.analyses) {
      if (analysis.name.toLowerCase().includes(q) || analysis.url.toLowerCase().includes(q)) {
        add('competitor', analysis.name, analysis.url, 'battlecards', analysis.score.threatLevel);
      }
      if (analysis.aiExtraction) {
        const ext = analysis.aiExtraction;
        for (const claim of [...(ext.claimsMade || []), ...(ext.benefitsMentioned || []), ...(ext.proofPoints || [])]) {
          if (claim.toLowerCase().includes(q)) {
            add('claim', claim.slice(0, 120), analysis.name, 'governance');
          }
        }
      }
    }

    for (const finding of report.allFindings || []) {
      const searchable = `${finding.competitorName} ${finding.serviceLine} ${finding.safeSalesWording} ${finding.evidenceExcerpt}`;
      if (searchable.toLowerCase().includes(q)) {
        add('finding', `${finding.competitorName} / ${finding.serviceLine}`, finding.safeSalesWording.slice(0, 150), 'matrix', finding.reviewStatus);
      }
    }

    for (const score of report.competitorScores || []) {
      for (const lead of score.leadWith) {
        if (lead.toLowerCase().includes(q)) {
          add('competitor', `${score.competitorName} — ${lead}`, score.executiveReadout.slice(0, 150), 'battlecards', score.threatLevel);
        }
      }
    }
  }

  return results.slice(0, 25);
}
