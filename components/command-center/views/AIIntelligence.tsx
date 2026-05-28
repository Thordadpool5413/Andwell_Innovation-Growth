'use client';

import React from 'react';
import { Badge, Panel, TagList, EmptyState } from '../Shared';
import type { AnyAnalysis } from '../../../lib/command-center/types';
import type { IntelligenceReport } from '../../../lib/types';

export function AIIntelligence({ currentReport, aiAnalyses, onRunScan }: { currentReport: IntelligenceReport | null; aiAnalyses: AnyAnalysis[]; onRunScan?: () => void }) {
  if (!currentReport) return (
    <EmptyState
      icon="🤖"
      title="No AI intelligence extracted yet"
      description="AI-extracted intelligence appears after running a competitive scan. It includes services mentioned, proof points, calls to action, and review risks for each competitor."
      action={onRunScan && <button className="btn primary" onClick={onRunScan}>Run Competitive Scan →</button>}
    />
  );
  if (!currentReport.aiEnabled || !aiAnalyses.length) return (
    <EmptyState
      icon="⚙️"
      title="AI extraction not configured"
      description="This report does not include AI-powered extraction. Make sure your OpenAI API key is set in your environment variables, then run a fresh scan to enable AI intelligence."
      action={onRunScan && <button className="btn primary" onClick={onRunScan}>Run Fresh Scan →</button>}
    />
  );
  return <><section className="section"><div><h1>Extracted Intelligence</h1><p className="text-body">Structured extraction from crawled public pages, including services, proof points, calls to action, advantages, review risk, and battlecards.</p></div><Badge tone="green">{currentReport.aiModel || 'OpenAI'} enabled</Badge></section>{currentReport.aiLeadershipSummary ? <section className="hero answerHero"><h2>Leadership Summary</h2><p>{currentReport.aiLeadershipSummary}</p></section> : null}<div className="grid">{aiAnalyses.map((analysis) => <Panel title={analysis.name} key={analysis.id}><div className="grid cols3"><Panel title="Services mentioned"><TagList items={analysis.aiExtraction?.servicesMentioned} /></Panel><Panel title="Proof points"><TagList items={analysis.aiExtraction?.proofPoints} /></Panel><Panel title="Review risks"><TagList items={analysis.aiExtraction?.reviewRisks} /></Panel></div></Panel>)}</div></>;
}
