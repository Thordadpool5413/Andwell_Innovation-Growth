import type { ClaimStatus, CategorizedClaim, CompetitorAnalysis } from './types';
import { andwellCatalog } from './andwell';

const highRiskPatterns = [
  /guarantee/i, /100[%]/i, /best/i, /leading/i, /number one/i, /top rated/i,
  /only (provider|company|organization)/i, /exclusive/i, /unmatched/i,
  /lowest (price|cost|rate)/i, /cheaper/i, /free/i, /no (cost|charge|fee)/i,
  /covers? everything/i, /all (insurance|plans)/i, /accept everyone/i,
  /immediate (admission|enroll|start)/i, /same day (admission|service|start)/i,
  /24\/7 (admission|enroll)/i, /no (wait|waiting) list/i
];

const doNotUsePatterns = [
  /competitor.*doesn'?t (offer|have|provide)/i, /they (don'?t|do not) (offer|have|provide)/i,
  /competitor.*lacks/i, /competitor.*fails/i, /competitor.*(behind|inferior)/i,
  /we'?re better/i, /we (beat|win|dominate)/i
];

const internalOnlyPatterns = [
  /pricing/i, /contract/i, /reimbursement/i, /margin/i, /revenue/i,
  /internal (data|metric|score)/i, /proprietary/i, /confidential/i,
  /negotiated/i, /rate (sheet|card)/i, /fee schedule/i
];

const needsReviewPatterns = [
  /may (offer|have|provide)/i, /might/i, /could/i, /possibly/i, /appears? to/i,
  /seems?/i, /reportedly/i, /according to (an? )?(unconfirmed|unofficial)/i,
  /unclear/i, /unverified/i, /not yet (confirmed|verified)/i
];

function classifyClaim(claim: string, competitorName: string, analysis?: CompetitorAnalysis): ClaimStatus {
  if (highRiskPatterns.some((p) => p.test(claim))) return 'High risk';
  if (doNotUsePatterns.some((p) => p.test(claim))) return 'Do not use';
  if (internalOnlyPatterns.some((p) => p.test(claim))) return 'Internal only';
  if (needsReviewPatterns.some((p) => p.test(claim))) return 'Needs review';
  const catalogMatch = andwellCatalog.find((s) => claim.toLowerCase().includes(s.serviceLine.toLowerCase()));
  if (catalogMatch && !claim.toLowerCase().includes(competitorName.toLowerCase())) {
    if (!analysis?.aiExtraction?.benefitsMentioned.some((b) => claim.toLowerCase().includes(b.toLowerCase()))) {
      return 'Needs review';
    }
  }
  return 'Safe';
}

function classifyReason(claim: string, status: ClaimStatus): string {
  if (status === 'High risk') return 'Contains absolute, superlative, or exclusive language — not safe for field use without legal review.';
  if (status === 'Do not use') return 'Negative or comparative language about a competitor — may create legal exposure.';
  if (status === 'Internal only') return 'References confidential business information — not for external use.';
  if (status === 'Needs review') return 'Language is speculative or may conflate Andwell service lines — requires human confirmation.';
  return 'Claim is factual, specific, and free of superlative, negative, or confidential language.';
}

export function categorizeClaims(analysis: CompetitorAnalysis): CategorizedClaim[] {
  const claims: CategorizedClaim[] = [];
  const all = [
    ...(analysis.aiExtraction?.claimsMade || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
    ...(analysis.aiExtraction?.benefitsMentioned || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
    ...(analysis.aiExtraction?.proofPoints || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
    ...(analysis.aiExtraction?.competitorAdvantages || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
    ...(analysis.aiExtraction?.safeSalesLanguage || []).map((c) => ({ claim: c, serviceLine: undefined as string | undefined })),
  ];
  const seen = new Set<string>();
  for (const entry of all) {
    const normalized = entry.claim.trim().toLowerCase();
    if (!normalized || seen.has(normalized) || normalized.length < 10) continue;
    seen.add(normalized);
    const status = classifyClaim(entry.claim, analysis.name, analysis);
    claims.push({
      claim: entry.claim,
      category: status,
      reason: classifyReason(entry.claim, status),
      competitorName: analysis.name,
      sourceUrl: analysis.url,
      serviceLine: entry.serviceLine || analysis.aiExtraction?.serviceLineDepth?.[0]?.serviceLine
    });
  }
  return claims;
}

export function categorizeAllClaims(report: { analyses: CompetitorAnalysis[] }): CategorizedClaim[] {
  return report.analyses.flatMap((a) => categorizeClaims(a));
}

export function claimId(claim: string): string {
  return claim.trim().slice(0, 100);
}

export function filterApprovedClaims(claims: CategorizedClaim[], approvedIds?: Set<string>): CategorizedClaim[] {
  if (approvedIds && approvedIds.size > 0) {
    return claims.filter((c) => approvedIds.has(claimId(c.claim)));
  }
  return claims.filter((c) => c.category === 'Safe');
}

export function claimStatusTone(status: ClaimStatus): 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark' {
  if (status === 'Safe') return 'green';
  if (status === 'Needs review') return 'amber';
  if (status === 'Do not use') return 'red';
  if (status === 'Internal only') return 'blue';
  return 'red';
}
