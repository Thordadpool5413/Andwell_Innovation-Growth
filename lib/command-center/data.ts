import type { View, RoleView } from './types';

export const nav: { key: View; label: string; note: string }[] = [
  { key: 'home', label: 'Home', note: 'Why, how, what' },
  { key: 'dashboard', label: 'Expert Command', note: 'What to do next' },
  { key: 'decisions', label: 'Decision Queue', note: 'Action items' },
  { key: 'scenarios', label: 'Scenario Presets', note: 'Model compare' },
  { key: 'growth', label: 'Growth Strategy', note: 'Markets and staffing' },
  { key: 'board', label: 'Board Room', note: 'Operating plan' },
  { key: 'launch', label: 'Launch Plan', note: 'Staffing and timeline' },
  { key: 'expert', label: 'Foremost Expert', note: 'Strategy brain' },
  { key: 'ai', label: 'Extracted Intelligence', note: 'AI evidence output' },
  { key: 'prompt', label: 'Methodology', note: 'Governed logic' },
  { key: 'intake', label: 'Competitor Intake', note: 'Add up to 25 URLs' },
  { key: 'matrix', label: 'Evidence Matrix', note: 'Filter and compare' },
  { key: 'battlecards', label: 'Field Enablement', note: 'Safe coaching' },
  { key: 'heatmap', label: 'Market Intelligence', note: 'County and competitor signal' },
  { key: 'brief', label: 'AI Strategy Brief', note: 'Multi-audience' },
  { key: 'narrative', label: 'Executive Narrative', note: 'Leadership readout' },
  { key: 'board-packet', label: 'Board Packet', note: 'Export layout' },
  { key: 'coaching', label: 'Coaching Mode', note: 'Sales plans' },
  { key: 'executive-view', label: 'Executive View', note: 'Growth summary' },
  { key: 'county-plan', label: 'County Plan', note: 'Maine map view' },
  { key: 'referral-plan', label: 'Referral Plan', note: 'Referral targets' },
  { key: 'competitive-view', label: 'Competitive View', note: 'Provider analysis' },
  { key: 'service-lines', label: 'Service Lines', note: 'Service catalog' },
  { key: 'cms-data', label: 'CMS Data', note: 'Market data' },
  { key: 'financial-model', label: 'Financial Model', note: 'Revenue projection' },
  { key: 'staffing-model', label: 'Staffing Model', note: 'FTE planning' },
  { key: 'sensitivity', label: 'Sensitivity', note: 'What-if analysis' },
  { key: 'opportunity-score', label: 'Opportunity Score', note: 'County scoring' },
  { key: 'launch-timeline', label: 'Launch Timeline', note: 'Gantt view' },
  { key: 'board-report', label: 'Board Report', note: 'Print-ready' },
  { key: 'launch-checklist', label: 'Launch Checklist', note: 'Task tracking' },
  { key: 'governance', label: 'Claim Governance', note: 'Safety review' },
  { key: 'builder', label: 'Battlecard Builder', note: 'Dynamic generator' },
  { key: 'referrals', label: 'Referral Sources', note: 'Account-type views' },
  { key: 'reports', label: 'Reports', note: 'Stored intelligence' },
  { key: 'ask', label: 'Ask Andwell Expert', note: 'Evidence based answers' },
  { key: 'catalog', label: 'Andwell Catalog', note: 'Baseline truth' },
  { key: 'diagnostics', label: 'System Check', note: 'Deployment proof' }
];

export const roleGuidance: Record<RoleView, { headline: string; focus: string; action: string }> = {
  Executive: {
    headline: 'Leadership brief mode',
    focus: 'Prioritizes threat level, market signal, differentiation, and what needs a leadership decision.',
    action: 'Start with the Command Center, review the top threat, then export or share the executive readout.'
  },
  'Growth Leader': {
    headline: 'Growth strategy mode',
    focus: 'Prioritizes county sequencing, staffing feasibility, referral access, launch readiness, and modeled upside.',
    action: 'Start with the top recommended action, validate staffing, then open Growth Strategy for scenario and launch detail.'
  },
  'Sales Leader': {
    headline: 'Coaching mode',
    focus: 'Prioritizes rep talk tracks, service line opportunities, manager review items, and practical follow up.',
    action: 'Use Battlecards and the Evidence Matrix to coach around safe positioning and specific referral situations.'
  },
  'Sales Rep': {
    headline: 'Field mode',
    focus: 'Prioritizes simple language, referral questions, objection responses, and what not to say.',
    action: 'Use Ask the Hub before calls and lead with verified Andwell depth rather than broad competitor claims.'
  },
  Board: {
    headline: 'Board brief mode',
    focus: 'Prioritizes recommendation clarity, ROI, launch risk, staffing constraints, and decision-ready narrative.',
    action: 'Review the board narrative, open Board Packet, then resolve any governance or staffing risks before distribution.'
  },
  Admin: {
    headline: 'Governance mode',
    focus: 'Prioritizes diagnostics, route health, review risk, data freshness, and evidence quality.',
    action: 'Run System Check, review risky findings, and confirm the app is returning JSON after every deployment.'
  }
};
