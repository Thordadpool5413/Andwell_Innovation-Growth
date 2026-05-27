import { buildScore } from './analysis';
import { categorizeClaims } from './claim-governance';
import type { CompetitorAnalysis, Confidence, ReviewStatus, Status, SubserviceFinding } from './types';

function confidenceFromEvidence(value?: string): Confidence {
  if (value === 'Strong') return 'High';
  if (value === 'Moderate') return 'Moderate';
  if (value === 'Weak') return 'Low';
  if (value === 'Not found') return 'Not found';
  return 'Needs review';
}

function computeReviewStatus(status: Status, confidence: Confidence): ReviewStatus {
  if (status === 'Clearly offered' && confidence === 'High') return 'Sales usable with evidence';
  if (status === 'Not found publicly' || status === 'Unclear' || status === 'Needs human review') return 'Needs human review';
  return 'Manager review suggested';
}

function statusFromDepth(depthScore: number, fallback: Status): Status {
  if (depthScore >= 60) return 'Clearly offered';
  if (depthScore >= 35) return 'Mentioned only';
  if (depthScore >= 15) return 'Related but not equivalent';
  return fallback;
}

function matrixWithAI<T extends { matrixScore?: NonNullable<SubserviceFinding['matrixScore']> }>(item: T, params: { sourceCount?: number; rationale?: string; evidenceStrength?: string; status?: Status; confidence?: Confidence; matchStrength?: number }) {
  if (!item.matrixScore) return item.matrixScore;
  const sourceCount = Math.max(item.matrixScore.sourceCount, params.sourceCount || 0);
  const evidenceStrength = params.evidenceStrength === 'Strong' ? 92 : params.evidenceStrength === 'Moderate' ? 68 : params.evidenceStrength === 'Weak' ? 38 : params.evidenceStrength === 'Not found' ? 8 : item.matrixScore.evidenceStrength;
  const matchStrength = params.matchStrength ?? item.matrixScore.matchStrength;
  const reviewRisk = params.status === 'Clearly offered' && params.confidence === 'High' ? 10 : params.status === 'Not found publicly' ? 72 : item.matrixScore.reviewRisk;
  const andwellDifferentiation = params.status === 'Clearly offered' ? Math.max(0, 100 - matchStrength) : params.status === 'Not found publicly' ? 94 : item.matrixScore.andwellDifferentiation;
  const overall = Math.round((evidenceStrength * 0.34) + (item.matrixScore.sourceQuality * 0.14) + (matchStrength * 0.22) + (andwellDifferentiation * 0.18) + ((100 - reviewRisk) * 0.12));
  return {
    ...item.matrixScore,
    overall: Math.max(0, Math.min(100, overall)),
    evidenceStrength,
    sourceCount,
    matchStrength,
    andwellDifferentiation,
    reviewRisk,
    rationale: [...new Set([...(item.matrixScore.rationale || []), params.rationale || 'AI reviewed website evidence against Andwell taxonomy.'].filter(Boolean))].slice(0, 6)
  };
}

export function applyAIEnhancement(analysis: CompetitorAnalysis, aiExtraction: NonNullable<CompetitorAnalysis['aiExtraction']>): CompetitorAnalysis {
  const enhanceSubservice = (finding: SubserviceFinding): SubserviceFinding => {
    const aiSub = aiExtraction.subserviceDepth.find((item) => item.serviceLine.toLowerCase() === finding.serviceLine.toLowerCase() && item.subservice.toLowerCase() === finding.subservice.toLowerCase());
    if (!aiSub) return finding;
    const confidence = aiSub.confidence || confidenceFromEvidence(aiSub.evidenceStrength);
    return {
      ...finding,
      competitorStatus: aiSub.status,
      confidence,
      evidenceExcerpt: aiSub.evidenceExcerpt || finding.evidenceExcerpt,
      sourceUrl: aiSub.sourceUrl || finding.sourceUrl,
      aiInterpretation: `${finding.aiInterpretation} AI extraction: ${aiSub.matchRationale || `classified this subservice as ${aiSub.status}`}.`,
      safeSalesWording: aiSub.safeSalesLanguage || finding.safeSalesWording,
      avoidSaying: aiSub.doNotSayLanguage || finding.avoidSaying,
      reviewStatus: computeReviewStatus(aiSub.status, confidence),
      matrixScore: matrixWithAI(finding, { sourceCount: aiSub.sourceCount, rationale: aiSub.matchRationale, evidenceStrength: aiSub.evidenceStrength, status: aiSub.status, confidence, matchStrength: aiSub.status === 'Clearly offered' ? 100 : aiSub.status === 'Not found publicly' ? 0 : finding.matrixScore?.matchStrength })
    };
  };

  const findings = analysis.findings.map((finding) => {
    const aiService = aiExtraction.serviceLineDepth.find((item) => item.serviceLine.toLowerCase() === finding.serviceLine.toLowerCase());
    const subserviceFindings = finding.subserviceFindings.map(enhanceSubservice);
    if (!aiService) return { ...finding, subserviceFindings };
    const competitorStatus = aiService.status || statusFromDepth(aiService.depthScore, finding.competitorStatus);
    const evidenceConfidence = confidenceFromEvidence(aiService.evidenceStrength);
    const confidence = evidenceConfidence === 'Needs review' ? finding.confidence : evidenceConfidence;
    const clearlyMatchedSubservices = subserviceFindings.filter((item) => item.competitorStatus === 'Clearly offered').length;
    const subserviceDepthScore = Math.max(finding.subserviceDepthScore, aiService.depthScore, Math.round((clearlyMatchedSubservices / Math.max(subserviceFindings.length, 1)) * 100));
    return {
      ...finding,
      competitorStatus,
      confidence,
      aiInterpretation: `${finding.aiInterpretation} AI extraction: ${aiService.matchRationale || aiService.summary}`,
      andwellAdvantage: aiService.andwellAdvantages.length ? aiService.andwellAdvantages.join(' ') : finding.andwellAdvantage,
      competitorAdvantage: aiService.competitorAdvantages.length ? aiService.competitorAdvantages.join(' ') : finding.competitorAdvantage,
      safeSalesWording: aiExtraction.safeSalesLanguage[0] || finding.safeSalesWording,
      avoidSaying: aiExtraction.doNotSayLanguage[0] || finding.avoidSaying,
      reviewStatus: computeReviewStatus(competitorStatus, confidence),
      subserviceFindings,
      clearlyMatchedSubservices,
      subserviceDepthScore,
      matrixScore: matrixWithAI(finding, { sourceCount: aiService.sourceCount, rationale: aiService.matchRationale, evidenceStrength: aiService.evidenceStrength, status: competitorStatus, confidence, matchStrength: subserviceDepthScore })
    };
  });

  const subserviceFindings = findings.flatMap((finding) => finding.subserviceFindings);
  const nextAnalysis = {
    ...analysis,
    findings,
    subserviceFindings,
    aiExtraction,
    aiEnhanced: true
  };
  const enhancedWithScore = {
    ...nextAnalysis,
    score: buildScore(nextAnalysis)
  };

  try {
    (enhancedWithScore as CompetitorAnalysis & { categorizedClaims?: unknown }).categorizedClaims = categorizeClaims(enhancedWithScore);
  } catch {}

  return enhancedWithScore;
}
