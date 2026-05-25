'use client';

import React from 'react';
import { Badge, Panel, TagList } from '../Shared';
import type { AnyAnalysis } from '../../../lib/command-center/types';
import type { IntelligenceReport } from '../../../lib/types';

export function AIIntelligence({ currentReport, aiAnalyses, onRunScan }: { currentReport: IntelligenceReport | null; aiAnalyses: AnyAnalysis[]; onRunScan?: () => void }) {
  if (!currentReport) return <Panel title="No report loaded"><p className="text-body">Run a competitive scan to populate AI-extracted intelligence including services mentioned, proof points, and review risks for each competitor.</p>{onRunScan && <button className="btn primary" style={{ marginTop: '12px' }} onClick={onRunScan}>Run Competitive Scan →</button>}</Panel>;
  if (!currentReport.aiEnabled || !aiAnalyses.length) return <Panel title="AI extraction not available"><p className="text-body">This report does not include AI extraction. Confirm your OpenAI API key is set in your environment, then run a fresh scan.</p>{onRunScan && <button className="btn" style={{ marginTop: '12px' }} onClick={onRunScan}>Run Fresh Scan →</button>}</Panel>;
  return <><section className="section"><div><h1>Extracted Intelligence</h1><p className="text-body">Structured extraction from crawled public pages, including services, proof points, calls to action, advantages, review risk, and battlecards.</p></div><Badge tone="green">{currentReport.aiModel || 'OpenAI'} enabled</Badge></section>{currentReport.aiLeadershipSummary ? <section className="hero answerHero"><h2>Leadership Summary</h2><p>{currentReport.aiLeadershipSummary}</p></section> : null}<div className="grid">{aiAnalyses.map((analysis) => <Panel title={analysis.name} key={analysis.id}><div className="grid cols3"><Panel title="Services mentioned"><TagList items={analysis.aiExtraction?.servicesMentioned} /></Panel><Panel title="Proof points"><TagList items={analysis.aiExtraction?.proofPoints} /></Panel><Panel title="Review risks"><TagList items={analysis.aiExtraction?.reviewRisks} /></Panel></div></Panel>)}</div></>;
}
