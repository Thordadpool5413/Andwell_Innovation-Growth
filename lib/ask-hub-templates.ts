import type { RoleView } from './command-center/types';

export interface AskTemplate {
  category: string;
  question: string;
  hint?: string;
}

export const askHubTemplates: Record<RoleView, AskTemplate[]> = {
  Executive: [
    {
      category: 'Market Strategy',
      question: 'What is our market position relative to competitors and what strategic moves should the executive team prioritize?',
      hint: 'Get market intelligence for leadership decisions'
    },
    {
      category: 'Risk Assessment',
      question: 'What are the biggest competitive threats we should be monitoring and how should we respond?',
      hint: 'Identify threats and risk mitigation strategies'
    },
    {
      category: 'Growth Opportunity',
      question: 'Where are the greatest growth opportunities for Andwell and how can we differentiate in those markets?',
      hint: 'Discover growth markets and differentiation'
    },
    {
      category: 'M&A / Partnerships',
      question: 'Based on competitive analysis, which competitors or partners should we consider for strategic partnerships or acquisition?',
      hint: 'Evaluate partnership and acquisition targets'
    },
    {
      category: 'Financial Impact',
      question: 'What is the financial impact of our competitive positioning and which service lines have the highest margin opportunity?',
      hint: 'Assess revenue and margin implications'
    }
  ],
  'Growth Leader': [
    {
      category: 'Territory Expansion',
      question: 'Which geographic territories have the best growth potential and what service lines should we expand there?',
      hint: 'Identify best territories for expansion'
    },
    {
      category: 'Market Penetration',
      question: 'What referral source types are most receptive to our services and where should we focus our growth efforts?',
      hint: 'Find receptive referral sources'
    },
    {
      category: 'Competitor Response',
      question: 'How are competitors positioned in our target growth markets and how should we differentiate our pitch?',
      hint: 'Understand competitor positioning'
    },
    {
      category: 'Service Line Strategy',
      question: 'Which service lines are underutilized in our growth markets and what untapped demand exists?',
      hint: 'Identify service line opportunities'
    },
    {
      category: 'Partner Development',
      question: 'What are the pain points of hospital and SNF partners that we could address with new service offerings?',
      hint: 'Discover partner pain points'
    }
  ],
  'Sales Leader': [
    {
      category: 'Account Strategy',
      question: 'What is the competitive landscape for this account and what is our best entry strategy?',
      hint: 'Develop account-specific strategy'
    },
    {
      category: 'Competitive Positioning',
      question: 'How should we position against this specific competitor and what are our key differentiators?',
      hint: 'Build your competitive message'
    },
    {
      category: 'Field Coaching',
      question: 'What should my sales team emphasize when speaking with this type of referral source?',
      hint: 'Coach your team on messaging'
    },
    {
      category: 'Objection Handling',
      question: 'What objections should we anticipate from this competitor and what is the best response?',
      hint: 'Prepare objection responses'
    },
    {
      category: 'Sales Playbook',
      question: 'What is the proven playbook for winning business in this referral source type?',
      hint: 'Get the winning sales approach'
    }
  ],
  'Sales Rep': [
    {
      category: 'Call Preparation',
      question: 'I have a call with [competitor name] - what should I know about them and what should I ask?',
      hint: 'Prep for your upcoming call'
    },
    {
      category: 'Discovery Questions',
      question: 'What discovery questions should I ask a hospital discharge coordinator to identify their pain points?',
      hint: 'Get proven discovery questions'
    },
    {
      category: 'Competitive Comparison',
      question: 'How does Andwell compare to [competitor name] on [service line]?',
      hint: 'Understand your competitive advantage'
    },
    {
      category: 'Referral Opportunity',
      question: 'What services should I lead with when talking to this type of referral source?',
      hint: 'Know what to lead with'
    },
    {
      category: 'Safe Language',
      question: 'What safe language can I use to talk about our services without overstating?',
      hint: 'Stay compliant and credible'
    }
  ],
  Board: [
    {
      category: 'Strategic Report',
      question: 'What is the strategic intelligence the board needs to know about our competitive position?',
      hint: 'Generate board-ready intelligence'
    },
    {
      category: 'Risk Reporting',
      question: 'What are the material risks to our business from competitive threats and how should we mitigate them?',
      hint: 'Report on key business risks'
    },
    {
      category: 'Financial Strategy',
      question: 'Based on competitive analysis, what are the financial implications for our growth plan?',
      hint: 'Assess financial implications'
    },
    {
      category: 'Market Outlook',
      question: 'What is the long-term market outlook and how should we position for the next 3-5 years?',
      hint: 'Get forward-looking strategy'
    },
    {
      category: 'Performance Benchmarking',
      question: 'How do our financial metrics and operational performance compare to competitors?',
      hint: 'Benchmark against competition'
    }
  ],
  Admin: [
    {
      category: 'System Health',
      question: 'What data quality issues should we address in our intelligence system?',
      hint: 'Diagnose data problems'
    },
    {
      category: 'Coverage Analysis',
      question: 'Which competitor categories or service lines have the least coverage in our intelligence system?',
      hint: 'Identify coverage gaps'
    },
    {
      category: 'Report Status',
      question: 'What is the status of our saved intelligence reports and which ones need updating?',
      hint: 'Check report inventory'
    },
    {
      category: 'Integration Check',
      question: 'Are our external data sources properly integrated and up to date?',
      hint: 'Verify data integrations'
    },
    {
      category: 'Audit Trail',
      question: 'What activities have occurred in the system and are there any anomalies to investigate?',
      hint: 'Review system activity'
    }
  ]
};

export function getAskTemplatesForRole(role: RoleView): AskTemplate[] {
  return askHubTemplates[role] || askHubTemplates.Executive;
}

export function getCategories(role: RoleView): string[] {
  const templates = getAskTemplatesForRole(role);
  return Array.from(new Set(templates.map(t => t.category))).sort();
}

export function getTemplatesByCategory(role: RoleView, category: string): AskTemplate[] {
  return getAskTemplatesForRole(role).filter(t => t.category === category);
}
