import type { View, RoleView } from './types';

export const viewHelp: Record<View, string> = {
  home: 'Overview and role-based quick start. Shows your next recommended actions based on your role.',
  dashboard: 'Leadership summary: market posture, key risks, growth opportunities. Start here after loading intelligence.',
  decisions: 'Critical decisions flagged from competitive intelligence analysis. Requires loaded report.',
  scenarios: 'Create and compare growth scenarios. Adjust assumptions to model different strategic paths.',
  growth: 'Growth strategy analysis. Shows county opportunities, service line priorities, and revenue projections.',
  board: 'Executive summary for leadership. Combines competitive landscape with growth strategy.',
  launch: 'Implementation roadmap: timeline, staffing requirements, and launch checklist for growth initiatives.',
  expert: 'Full strategic brief with market analysis, threats, opportunities, and recommended actions.',
  ai: 'View the AI extraction evidence from competitor websites. See what was found vs. what was analyzed.',
  prompt: 'Advanced: Edit the extraction prompts used to analyze competitor websites.',
  intake: 'Add competitor URLs here. Max 25 per scan. Click "Run Scan" to crawl and analyze.',
  matrix: 'Service-by-service comparison matrix. Shows where Andwell wins, ties, or loses vs. each competitor.',
  governance: 'Claim governance and review. Safe language validation and competitive claim scoring.',
  battlecards: 'Pre-call field guidance. Safe language, positioning, and talking points for sales conversations.',
  heatmap: 'Geographic heat map of growth opportunities. Combines market size, competitor presence, and Andwell capability.',
  brief: 'Audience-ready strategy brief. Formatted for executive sharing or board presentation.',
  narrative: 'Leadership narrative: the story of competitive position and growth strategy.',
  'board-packet': 'Complete executive report: intelligence, strategy, financials, and recommendations.',
  coaching: 'Pre-call coaching plans. Select a competitor and account to get discovery questions and objection handlers.',
  'executive-view': 'High-level growth summary. Total upside, top opportunities, and implementation timeline.',
  'county-plan': 'Deep dive: growth strategy by county. Shows service mix, referral sources, and revenue per territory.',
  'referral-plan': 'Account targeting strategy. Which accounts to focus on and why, based on intelligence and growth model.',
  'competitive-view': 'Competitor analysis. Strengths, gaps, and strategic positioning by competitor.',
  'service-lines': 'Andwell service line catalog. Shows what Andwell offers and differentiators.',
  'cms-data': 'Public CMS claims data. Market signals from Medicare/Medicaid claims (educational reference).',
  'financial-model': 'Revenue projections under different growth scenarios. Adjust assumptions to see impact.',
  'staffing-model': 'Staffing requirements for growth. FTE projections and hiring timeline.',
  sensitivity: 'Sensitivity analysis. See which variables most impact growth outcomes.',
  'opportunity-score': 'Market opportunity scoring. Identifies highest-value growth targets.',
  'launch-timeline': 'Go-to-market timeline. Phasing for execution of growth strategy.',
  'board-report': 'Board-ready report. Print-friendly format with all supporting data.',
  'launch-checklist': 'Implementation checklist. Tasks needed to execute growth strategy.',
  builder: 'Create custom battlecards. Build field guidance for specific competitors and accounts.',
  referrals: 'Referral source templates and competitor intelligence. Prepare for account conversations.',
  reports: 'Intelligence report library. View, export, or delete previous scans and reports.',
  ask: 'Ask the AI system questions about loaded intelligence or growth plans. Requires loaded report.',
  catalog: 'Andwell service line catalog. Reference for what Andwell offers and service descriptions.',
  diagnostics: 'System health check. Verify API routes and backend connections (admin use).',
  audit: 'Activity log. See what actions have been taken in the system (admin use).'
};

export const nav: { key: View; label: string; note: string }[] = [
  { key: 'home', label: 'Home', note: 'Innovation and Growth' },
  { key: 'dashboard', label: 'Intelligence Overview', note: 'Leadership Signals' },
  { key: 'decisions', label: 'Decision Support', note: 'Leadership Actions' },
  { key: 'scenarios', label: 'Scenario Modeling', note: 'Planning Options' },
  { key: 'growth', label: 'Strategy', note: 'Growth Plays' },
  { key: 'board', label: 'Leadership Plan', note: 'Operating View' },
  { key: 'launch', label: 'Launch Planning', note: 'Timeline and Staffing' },
  { key: 'expert', label: 'Strategic Brief', note: 'Recommendations' },
  { key: 'ai', label: 'Source Intelligence', note: 'Evidence Extraction' },
  { key: 'prompt', label: 'Intelligence Method', note: 'Evidence Logic' },
  { key: 'intake', label: 'Build Intelligence', note: 'Enter Sources' },
  { key: 'matrix', label: 'Advantage Matrix', note: 'Capability Comparison' },
  { key: 'battlecards', label: 'Field Guidance', note: 'Safe Field Language' },
  { key: 'heatmap', label: 'Growth Map', note: 'Market Opportunity' },
  { key: 'brief', label: 'Strategy Brief', note: 'Audience Ready' },
  { key: 'narrative', label: 'Executive Narrative', note: 'Leadership Readout' },
  { key: 'board-packet', label: 'Executive Report', note: 'Leadership Output' },
  { key: 'coaching', label: 'Field Coaching', note: 'Pre Call Plans' },
  { key: 'executive-view', label: 'Executive View', note: 'Growth Summary' },
  { key: 'county-plan', label: 'Territory Plan', note: 'Market Area View' },
  { key: 'referral-plan', label: 'Referral Plan', note: 'Account Targets' },
  { key: 'competitive-view', label: 'Competitive View', note: 'Provider Analysis' },
  { key: 'service-lines', label: 'Service Lines', note: 'Capability Catalog' },
  { key: 'cms-data', label: 'Market Data', note: 'Public Data Signals' },
  { key: 'financial-model', label: 'Financial View', note: 'Revenue Projection' },
  { key: 'staffing-model', label: 'Staffing View', note: 'Capacity Planning' },
  { key: 'sensitivity', label: 'Sensitivity', note: 'Planning Variables' },
  { key: 'opportunity-score', label: 'Opportunity Score', note: 'Market Scoring' },
  { key: 'launch-timeline', label: 'Launch Timeline', note: 'Execution Sequence' },
  { key: 'board-report', label: 'Board Report', note: 'Print Ready' },
  { key: 'launch-checklist', label: 'Launch Checklist', note: 'Execution Tasks' },
  { key: 'governance', label: 'Claims Review', note: 'Admin Safe Language' },
  { key: 'builder', label: 'Guidance Builder', note: 'Field Language' },
  { key: 'referrals', label: 'Referral Sources', note: 'Account Views' },
  { key: 'reports', label: 'Intelligence Library', note: 'Built Outputs' },
  { key: 'ask', label: 'AI Coach', note: 'Ask the System' },
  { key: 'catalog', label: 'Andwell Catalog', note: 'Baseline Capabilities' },
  { key: 'diagnostics', label: 'System Health', note: 'Diagnostics' },
  { key: 'audit', label: 'Audit Log', note: 'Activity History' }
];

export const roleGuidance: Record<RoleView, { headline: string; focus: string; action: string }> = {
  Executive: {
    headline: 'Leadership intelligence view',
    focus: 'Prioritizes market signal, differentiation, strategic implications, and leadership ready next actions.',
    action: 'Use the intelligence overview, executive report, and growth strategy surfaces to move from evidence to decision.'
  },
  'Growth Leader': {
    headline: 'Growth strategy view',
    focus: 'Prioritizes opportunity geography, capability alignment, partnership value, referral access, and modeled upside.',
    action: 'Use Strategy and Growth Map to identify where Andwell can focus growth with evidence based positioning.'
  },
  'Sales Leader': {
    headline: 'Field guidance view',
    focus: 'Prioritizes field talk tracks, service line opportunities, safe positioning, and practical coaching.',
    action: 'Use Field Guidance and Advantage Matrix to coach safe, specific referral conversations.'
  },
  'Sales Rep': {
    headline: 'Field use view',
    focus: 'Prioritizes simple language, referral questions, safe boundaries, and what not to say.',
    action: 'Use AI Coach and Field Guidance before calls to stay source based and specific to referral needs.'
  },
  Board: {
    headline: 'Board intelligence view',
    focus: 'Prioritizes recommendation clarity, market signal, growth rationale, risk boundaries, and decision ready narrative.',
    action: 'Use Executive Report and Board Report to review the leadership package.'
  },
  Admin: {
    headline: 'Operational diagnostics view',
    focus: 'Prioritizes diagnostics, source processing, report services, storage service, and API health.',
    action: 'Use System Health to verify operational checks without exposing diagnostics to the normal product experience.'
  }
};
