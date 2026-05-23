import type { View, RoleView } from './types';

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
  { key: 'governance', label: 'Evidence Discipline', note: 'Safe Claims' },
  { key: 'builder', label: 'Guidance Builder', note: 'Field Language' },
  { key: 'referrals', label: 'Referral Sources', note: 'Account Views' },
  { key: 'reports', label: 'Intelligence Library', note: 'Built Outputs' },
  { key: 'ask', label: 'AI Coach', note: 'Ask the System' },
  { key: 'catalog', label: 'Andwell Catalog', note: 'Baseline Capabilities' },
  { key: 'diagnostics', label: 'System Health', note: 'Diagnostics' }
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
