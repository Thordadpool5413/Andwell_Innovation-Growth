import type { IntelligenceReport, CompetitorAnalysis, Finding } from './types';
import type { GrowthRow } from './growth-plan';
import { andwellCatalog } from './andwell';
import { launchPlan } from './growth-plan';
import { generateDecisions } from './decision-queue';

export type SearchResultType = 'competitor' | 'service' | 'finding' | 'county' | 'claim' | 'decision' | 'referral' | 'growth';

export type SearchResult = {
  type: SearchResultType;
  label: string;
  description: string;
  view: string;
  detail?: string;
};

function fmtRevenue(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

export function globalSearch(query: string, report?: IntelligenceReport | null, growthRows?: GrowthRow[]): SearchResult[] {
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

  // Live growth plan: counties, services, revenue
  if (growthRows?.length) {
    const seen2 = new Set<string>();
    for (const row of growthRows) {
      const searchable = `${row.county} ${row.service} ${row.launchGroup} ${row.reason}`.toLowerCase();
      if (!searchable.includes(q)) continue;
      const key2 = `${row.county}:${row.service}`;
      if (seen2.has(key2)) continue;
      seen2.add(key2);
      const y1 = Array.isArray(row.revenue) ? (row.revenue[0] ?? 0) : 0;
      add('growth', `${row.county} — ${row.service}`, `${row.launchGroup} · Y1 revenue: ${fmtRevenue(y1)} · ${row.reason.slice(0, 100)}`, 'heatmap', row.launchGroup);
    }
  }

  // Decision queue items
  const decisions = generateDecisions(report, growthRows);
  const seenDecisions = new Set<string>();
  for (const d of decisions) {
    if (d.status !== 'Pending') continue;
    const searchable = `${d.title} ${d.evidence} ${d.recommendedAction} ${d.type} ${d.owner}`.toLowerCase();
    if (!searchable.includes(q)) continue;
    if (seenDecisions.has(d.title)) continue;
    seenDecisions.add(d.title);
    add('decision', d.title.slice(0, 100), `${d.type} · ${d.urgency} · ${d.risk} risk`, 'decisions', d.status);
  }

  return results.slice(0, 25);
}
