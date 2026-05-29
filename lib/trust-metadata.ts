import type { Finding, IntelligenceReport, SubserviceFinding, TrustMetadata } from './types';

export const KNOWLEDGE_VERSION = 'andwell-expert-2026.05';

type EvidenceItem = Pick<Finding | SubserviceFinding, 'sourceUrl' | 'evidenceSources' | 'reviewStatus' | 'confidence'> & {
  competitorStatus?: string;
};

function uniqueSourceCount(items: EvidenceItem[]) {
  const urls = new Set<string>();
  for (const item of items) {
    if (item.sourceUrl) urls.add(item.sourceUrl);
    for (const source of item.evidenceSources || []) {
      if (source.url) urls.add(source.url);
    }
  }
  return urls.size;
}

function approvedClaimCount(items: EvidenceItem[]) {
  return items.filter((item) => item.reviewStatus === 'Approved for sales use' || item.reviewStatus === 'Sales usable with evidence').length;
}

function confidenceLabel(report: IntelligenceReport, sourceCount: number) {
  if (report.humanReviewItems > Math.max(20, report.allFindings.length)) return 'Needs review';
  if (report.crawlErrors.length > 0 && sourceCount < report.allFindings.length) return 'Moderate';
  if (sourceCount >= Math.max(1, report.analyses.length * 4)) return 'High';
  return 'Moderate';
}

function reviewLabel(report: IntelligenceReport, approved: number) {
  if (report.humanReviewItems === 0) return 'Ready for field use';
  if (approved > report.humanReviewItems) return 'Partially approved';
  if (report.crawlErrors.length > 0) return 'Evidence needs review';
  return 'Manager review suggested';
}

function warningList(report: IntelligenceReport) {
  const warnings: string[] = [];
  if (report.crawlErrors.length) warnings.push(`${report.crawlErrors.length} scan issue${report.crawlErrors.length === 1 ? '' : 's'} captured`);
  if (report.humanReviewItems) warnings.push(`${report.humanReviewItems} review item${report.humanReviewItems === 1 ? '' : 's'} before broad field use`);
  const lowConfidence = report.analyses.filter((analysis) => analysis.aiExtraction?.rawConfidence === 'Low');
  if (lowConfidence.length) warnings.push(`${lowConfidence.length} low-confidence AI extraction${lowConfidence.length === 1 ? '' : 's'}`);
  const scanErrors = report.scanSummary?.errors || 0;
  if (scanErrors > report.crawlErrors.length) warnings.push(`${scanErrors} scan workflow error${scanErrors === 1 ? '' : 's'} reported`);
  return warnings.slice(0, 5);
}

export function buildReportTrustMetadata(report: IntelligenceReport): TrustMetadata {
  const evidenceItems: EvidenceItem[] = [...(report.allFindings || []), ...(report.allSubserviceFindings || [])];
  const sourceCount = uniqueSourceCount(evidenceItems);
  const approvedClaimsCount = approvedClaimCount(evidenceItems);
  const aiInterpretationCount = report.analyses.filter((analysis) => analysis.aiExtraction || analysis.aiEnhanced).length;
  return {
    sourceCount,
    confidence: confidenceLabel(report, sourceCount),
    reviewStatus: reviewLabel(report, approvedClaimsCount),
    approvedClaimsCount,
    scanDate: report.generatedAt,
    model: report.aiModel || report.analyses.find((analysis) => analysis.aiExtraction?.aiModel)?.aiExtraction?.aiModel || 'rules + public evidence',
    knowledgeVersion: KNOWLEDGE_VERSION,
    publicEvidenceCount: sourceCount,
    aiInterpretationCount,
    warnings: warningList(report)
  };
}

export function buildAskTrustMetadata(params: {
  evidence: EvidenceItem[];
  report?: IntelligenceReport | null;
  source?: string;
  confidence: string;
  growthOnly?: boolean;
}): TrustMetadata {
  const sourceCount = uniqueSourceCount(params.evidence);
  const approvedClaimsCount = approvedClaimCount(params.evidence);
  const report = params.report || null;
  const reviewItems = params.evidence.filter((item) => item.reviewStatus !== 'Approved for sales use' && item.reviewStatus !== 'Sales usable with evidence').length;
  const warnings = [
    params.growthOnly ? 'Growth model only: no competitive scan loaded' : '',
    reviewItems ? `${reviewItems} evidence item${reviewItems === 1 ? '' : 's'} need review before field use` : '',
    ...(report?.crawlErrors.length ? [`${report.crawlErrors.length} scan issue${report.crawlErrors.length === 1 ? '' : 's'} in source report`] : [])
  ].filter(Boolean).slice(0, 5);

  return {
    sourceCount,
    confidence: params.confidence,
    reviewStatus: params.growthOnly ? 'Growth model only' : reviewItems ? 'Evidence needs review' : 'Ready for field use',
    approvedClaimsCount,
    scanDate: report?.generatedAt || new Date().toISOString(),
    model: params.source === 'ai' ? (report?.aiModel || process.env.OPENAI_MODEL || 'OpenAI') : 'template + ranking',
    knowledgeVersion: KNOWLEDGE_VERSION,
    publicEvidenceCount: sourceCount,
    aiInterpretationCount: params.source === 'ai' ? 1 : 0,
    warnings
  };
}
