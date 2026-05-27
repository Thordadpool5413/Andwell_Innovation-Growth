export type Status = 'Clearly offered' | 'Mentioned only' | 'Related but not equivalent' | 'Not found publicly' | 'Unclear' | 'Needs human review';
export type Confidence = 'High' | 'Moderate' | 'Low' | 'Not found' | 'Needs review';
export type ReviewStatus = 'Sales usable with evidence' | 'Manager review suggested' | 'Needs human review' | 'Approved for sales use' | 'Rejected';
export type ThreatLevel = 'Low overlap' | 'Moderate overlap' | 'High overlap' | 'Strategic threat';
export type ExpertPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type ExpertAudience = 'CEO' | 'COO' | 'Sales Leader' | 'Sales Rep' | 'Admin' | 'Marketing' | 'Clinical Leader';
export type CrawledPageType = 'Service page' | 'Program page' | 'Referral page' | 'Eligibility page' | 'Location page' | 'About page' | 'News or blog' | 'Low value' | 'General page';

export type TrustMetadata = {
  sourceCount: number;
  confidence: string;
  reviewStatus: string;
  approvedClaimsCount: number;
  scanDate?: string;
  model?: string;
  knowledgeVersion: string;
  publicEvidenceCount: number;
  aiInterpretationCount: number;
  warnings: string[];
};

export type ConfidenceDetails = {
  overall: Confidence;
  evidenceQuality: 'Strong' | 'Moderate' | 'Weak';
  sourceFreshness: 'Current' | 'Recent' | 'Stale';
  sourceCount: number;
  hasInternalValidation: boolean;
  hasCmsSupport: boolean;
  competitorOverlap: 'High' | 'Moderate' | 'Low';
  humanReviewed: boolean;
  reason: string;
};

export type CrawledPage = {
  url: string;
  title: string;
  siteName?: string;
  organizationName?: string;
  text: string;
  excerpt: string;
  pageType?: CrawledPageType;
  intelligenceScore?: number;
  evidenceSignals?: string[];
};

export type EvidenceSource = {
  url: string;
  title: string;
  pageType?: CrawledPageType;
  excerpt: string;
  matchedTerms: string[];
  score: number;
};

export type MatrixScore = {
  overall: number;
  evidenceStrength: number;
  sourceQuality: number;
  sourceCount: number;
  matchStrength: number;
  andwellDifferentiation: number;
  reviewRisk: number;
  rationale: string[];
};

export type CompetitorInput = {
  name?: string;
  url: string;
  market?: string;
  notes?: string;
  sourceScope?: string;
  preloaded?: boolean;
  lastScanDate?: string;
  sourceCount?: number;
  confidence?: string;
  reviewStatus?: string;
};

export type AIServiceLineDepth = {
  serviceLine: string;
  depthScore: number;
  evidenceStrength: 'Strong' | 'Moderate' | 'Weak' | 'Not found';
  status?: Status;
  sourceCount?: number;
  matchRationale?: string;
  summary: string;
  competitorAdvantages: string[];
  andwellAdvantages: string[];
  proofPoints: string[];
  referralCallsToAction: string[];
  reviewRisk: 'Low' | 'Medium' | 'High';
};

export type AISubserviceDepth = {
  serviceLine: string;
  subservice: string;
  status: Status;
  confidence: Confidence;
  evidenceStrength?: 'Strong' | 'Moderate' | 'Weak' | 'Not found';
  sourceCount?: number;
  matchRationale?: string;
  evidenceExcerpt: string;
  sourceUrl?: string;
  safeSalesLanguage: string;
  doNotSayLanguage: string;
};

export type AISalesBattlecard = {
  serviceLine: string;
  leadWith: string;
  referralQuestion: string;
  objectionResponse: string;
  proofPoint: string;
  safeSalesLanguage: string;
  doNotSayLanguage: string;
};

export type AICompetitorExtraction = {
  providerName: string;
  aiModel: string;
  generatedAt: string;
  servicesMentioned: string[];
  benefitsMentioned: string[];
  claimsMade: string[];
  programsOffered: string[];
  proofPoints: string[];
  referralCallsToAction: string[];
  serviceLineDepth: AIServiceLineDepth[];
  subserviceDepth: AISubserviceDepth[];
  competitorAdvantages: string[];
  andwellAdvantages: string[];
  safeSalesLanguage: string[];
  doNotSayLanguage: string[];
  reviewRisks: string[];
  leadershipSummary: string;
  salesBattlecards: AISalesBattlecard[];
  pageEvidence: {
    url: string;
    title: string;
    pageType: CrawledPageType;
    servicesFound: string[];
    proofPoints: string[];
    referralSignals: string[];
    limitations: string[];
  }[];
  rawConfidence: 'High' | 'Medium' | 'Low';
};

export type SubserviceFinding = {
  id: string;
  competitorId: string;
  competitorName: string;
  serviceLine: string;
  subservice: string;
  andwellStatus: Status;
  competitorStatus: Status;
  confidence: Confidence;
  sourceUrl?: string;
  sourceTitle?: string;
  evidenceExcerpt: string;
  evidenceSources?: EvidenceSource[];
  matrixScore?: MatrixScore;
  matchedTerms: string[];
  aiInterpretation: string;
  safeSalesWording: string;
  avoidSaying: string;
  reviewStatus: ReviewStatus;
};

export type Finding = {
  id: string;
  competitorId: string;
  competitorName: string;
  serviceLine: string;
  andwellStatus: Status;
  competitorStatus: Status;
  confidence: Confidence;
  sourceUrl?: string;
  sourceTitle?: string;
  evidenceExcerpt: string;
  evidenceSources?: EvidenceSource[];
  matrixScore?: MatrixScore;
  aiInterpretation: string;
  matchLevel: string;
  andwellAdvantage: string;
  competitorAdvantage: string;
  safeSalesWording: string;
  avoidSaying: string;
  reviewStatus: ReviewStatus;
  subserviceFindings: SubserviceFinding[];
  clearlyMatchedSubservices: number;
  totalSubservices: number;
  subserviceDepthScore: number;
};

export type CompetitorScore = {
  competitorId: string;
  competitorName: string;
  serviceLineMatchScore: number;
  subserviceDepthScore: number;
  andwellDifferentiationScore: number;
  competitorVisibilityScore: number;
  evidenceStrengthScore: number;
  reviewRiskScore: number;
  threatLevel: ThreatLevel;
  strongestMatches: string[];
  strongestAndwellAdvantages: string[];
  needsReview: string[];
  leadWith: string[];
  executiveReadout: string;
};

export type CompetitorAnalysis = {
  id: string;
  name: string;
  url: string;
  market: string;
  analyzedAt: string;
  pagesReviewed: CrawledPage[];
  findings: Finding[];
  subserviceFindings: SubserviceFinding[];
  score: CompetitorScore;
  aiExtraction?: AICompetitorExtraction;
  aiEnhanced?: boolean;
};

export type ExecutiveInsight = {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  audience: 'CEO' | 'COO' | 'Sales Leader' | 'Sales Rep' | 'Admin';
  summary: string;
  action: string;
};

export type ExpertRecommendation = {
  id: string;
  priority: ExpertPriority;
  audience: ExpertAudience;
  title: string;
  reasoning: string;
  action: string;
  safeLanguage: string;
  reviewRequired: boolean;
  trustMetadata?: TrustMetadata;
};

export type ExpertFieldPlay = {
  id: string;
  competitorName: string;
  serviceLine: string;
  scenario: string;
  leadWith: string;
  referralQuestion: string;
  objectionResponse: string;
  proofNeeded: string;
  avoidSaying: string;
};

export type ExpertWatchItem = {
  id: string;
  competitorName: string;
  signal: string;
  whyItMatters: string;
  nextCheck: string;
  priority: ExpertPriority;
};

export type ClaimStatus = 'Safe' | 'Needs review' | 'Do not use' | 'Internal only' | 'High risk';
export type ReferralSourceType = 'Hospital' | 'SNF' | 'Primary Care' | 'Specialist' | 'Assisted Living' | 'Home Health Referral' | 'Behavioral Health' | 'Community Partner' | 'Family Caregiver';

export type CategorizedClaim = {
  claim: string;
  category: ClaimStatus;
  reason: string;
  competitorName: string;
  sourceUrl?: string;
  serviceLine?: string;
};

export type BattlecardTemplate = {
  competitor: string;
  county: string;
  serviceLine: string;
  audience: string;
  objection: string;
  opening: string;
  discoveryQuestions: string[];
  positioning: string;
  objectionResponse: string;
  close: string;
};

export type ReferralSourceProfile = {
  sourceType: ReferralSourceType;
  leadService: string;
  painPoints: string[];
  discoveryQuestions: string[];
  positioningLanguage: string;
  referralCta: string;
  serviceLines: { name: string; relevance: 'High' | 'Medium' | 'Low'; reason: string }[];
};

export type ExpertBrief = {
  expertVersion: string;
  generatedAt: string;
  expertScore: number;
  marketPosture: string;
  expertSummary: string;
  leadershipDecision: string;
  salesCoachingPriority: string;
  fastestFieldMove: string;
  governanceWarning: string;
  strongestThreats: string[];
  bestOpportunities: string[];
  recommendations: ExpertRecommendation[];
  fieldPlays: ExpertFieldPlay[];
  watchlist: ExpertWatchItem[];
};

export type IntelligenceReport = {
  id: string;
  generatedAt: string;
  baselineProvider: 'Andwell Health Partners';
  competitorsAnalyzed: number;
  pagesReviewed: number;
  serviceLinesMapped: number;
  subservicesMapped: number;
  matchedServiceFindings: number;
  potentialAndwellAdvantages: number;
  humanReviewItems: number;
  executiveSummary: string;
  executiveInsights: ExecutiveInsight[];
  competitorScores: CompetitorScore[];
  analyses: CompetitorAnalysis[];
  allFindings: Finding[];
  allSubserviceFindings: SubserviceFinding[];
  crawlErrors: { url: string; error: string }[];
  aiEnabled?: boolean;
  aiModel?: string;
  aiLeadershipSummary?: string;
  expertBrief?: ExpertBrief;
  trustMetadata?: TrustMetadata;
  sourceLibraryMode?: string;
  geography?: string;
  andwellBaselineSources?: string[];
  analysisConcurrency?: number;
  crawlMaxPagesPerSite?: number;
  scanSummary?: {
    total: number;
    successes: number;
    errors: number;
    crawlFailures: number;
    aiFailures: number;
    errorBreakdown?: { url: string; type: string; message: string }[];
  };
};
