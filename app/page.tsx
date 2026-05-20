'use client';

import { useMemo, useState } from 'react';
import { LayoutDashboard, TrendingUp, Presentation, Rocket, Brain, Cpu, FileText, Upload, Table, Swords, FileBarChart, MessageSquare, BookOpen, Activity, Shield, Hammer, Users, Map, CheckSquare, Sliders, Search, FileSpreadsheet, ScrollText, GraduationCap, Globe, MapPin, Phone, Crosshair, Layers, Database, DollarSign, Target, Clock, ListChecks, Home as HomeIcon } from 'lucide-react';
import { LoadingState } from '../components/StateViews';
import { andwellCatalog } from '../lib/andwell';
import { buildGrowthRows, buildStaffingPlan, growthDefaultScenario, rollupGrowthByService, summarizeGrowth } from '../lib/growth-plan';
import { generateAndwellExpertBrief } from '../lib/andwell-expert';
import type { CompetitorInput, IntelligenceReport } from '../lib/types';
import type { GrowthScenario } from '../lib/growth-plan';
import type { View, RoleView, MatrixFilter, ReportSummary, ApiCheck, AskResponse } from '../lib/command-center/types';
import { nav, roleGuidance } from '../lib/command-center/data';
import { api, parseCompetitorEntries } from '../lib/command-center/utils';
import { Dashboard } from '../components/command-center/views/Dashboard';
import { Home } from '../components/command-center/views/Home';
import { GrowthCommand } from '../components/command-center/views/GrowthCommand';
import { BoardRoom } from '../components/command-center/views/BoardRoom';
import { LaunchPlan } from '../components/command-center/views/LaunchPlan';
import { ExpertCenter } from '../components/command-center/views/ExpertCenter';
import { AIIntelligence } from '../components/command-center/views/AIIntelligence';
import { PromptEngine } from '../components/command-center/views/PromptEngine';
import { Intake } from '../components/command-center/views/Intake';
import { Matrix } from '../components/command-center/views/Matrix';
import { Battlecards } from '../components/command-center/views/Battlecards';
import { Reports } from '../components/command-center/views/Reports';
import { AskHub } from '../components/command-center/views/AskHub';
import { Catalog } from '../components/command-center/views/Catalog';
import { Diagnostics } from '../components/command-center/views/Diagnostics';
import { ClaimGovernance } from '../components/command-center/views/ClaimGovernance';
import { OpportunityHeatMap } from '../components/command-center/views/OpportunityHeatMap';
import { DecisionQueue } from '../components/command-center/views/DecisionQueue';
import { ScenarioPresets } from '../components/command-center/views/ScenarioPresets';
import { CommandSearch } from '../components/command-center/views/CommandSearch';
import { BattlecardBuilder } from '../components/command-center/views/BattlecardBuilder';
import { ReferralSources } from '../components/command-center/views/ReferralSources';
import { StrategyBrief } from '../components/command-center/views/StrategyBrief';
import { ExecutiveNarrative } from '../components/command-center/views/ExecutiveNarrative';
import { BoardPacket } from '../components/command-center/views/BoardPacket';
import { CoachingMode } from '../components/command-center/views/CoachingMode';
import { GrowthExecutiveView } from '../components/command-center/views/GrowthExecutiveView';
import { GrowthCountyPlan } from '../components/command-center/views/GrowthCountyPlan';
import { GrowthReferralPlan } from '../components/command-center/views/GrowthReferralPlan';
import { GrowthCompetitiveView } from '../components/command-center/views/GrowthCompetitiveView';
import { GrowthServiceLines } from '../components/command-center/views/GrowthServiceLines';
import { GrowthCmsData } from '../components/command-center/views/GrowthCmsData';
import { GrowthFinancialModel } from '../components/command-center/views/GrowthFinancialModel';
import { GrowthStaffingModel } from '../components/command-center/views/GrowthStaffingModel';
import { GrowthSensitivity } from '../components/command-center/views/GrowthSensitivity';
import { GrowthOpportunityScore } from '../components/command-center/views/GrowthOpportunityScore';
import { GrowthLaunchTimeline } from '../components/command-center/views/GrowthLaunchTimeline';
import { GrowthBoardReport } from '../components/command-center/views/GrowthBoardReport';
import { GrowthLaunchChecklist } from '../components/command-center/views/GrowthLaunchChecklist';

const navIcons: Record<View, React.ComponentType<{ className?: string }>> = {
  home: HomeIcon, dashboard: LayoutDashboard, decisions: CheckSquare, scenarios: Sliders, growth: TrendingUp, board: Presentation, launch: Rocket, heatmap: Map,
  expert: Brain, ai: Cpu, prompt: FileText, intake: Upload, matrix: Table,
  battlecards: Swords, governance: Shield, builder: Hammer, referrals: Users, reports: FileBarChart, ask: MessageSquare, catalog: BookOpen, diagnostics: Activity,
  brief: FileSpreadsheet, narrative: ScrollText, 'board-packet': Presentation, coaching: GraduationCap,
  'executive-view': Globe, 'county-plan': MapPin, 'referral-plan': Phone, 'competitive-view': Crosshair,
  'service-lines': Layers, 'cms-data': Database, 'financial-model': DollarSign, 'staffing-model': Users,
  sensitivity: Activity, 'opportunity-score': Target, 'launch-timeline': Clock, 'board-report': FileText, 'launch-checklist': ListChecks
};

const navGroups: { label: string; keys: View[] }[] = [
  { label: 'Expert OS', keys: ['home', 'dashboard', 'ask'] },
  { label: 'Workspaces', keys: ['heatmap', 'growth', 'battlecards', 'board-packet'] },
  { label: 'Operations', keys: ['intake', 'reports', 'diagnostics'] }
];

const workspaceTools: Partial<Record<View, { label: string; keys: View[] }>> = {
  heatmap: { label: 'Intelligence tools', keys: ['heatmap', 'expert', 'ai', 'matrix', 'governance', 'brief', 'narrative'] },
  growth: { label: 'Growth tools', keys: ['growth', 'launch', 'scenarios', 'executive-view', 'county-plan', 'financial-model', 'staffing-model', 'sensitivity', 'launch-timeline'] },
  battlecards: { label: 'Field tools', keys: ['battlecards', 'builder', 'referrals', 'coaching', 'ask'] },
  'board-packet': { label: 'Board tools', keys: ['board-packet', 'board', 'narrative', 'board-report', 'launch-checklist', 'decisions'] }
};

function WorkspaceTools({ view, setView }: { view: View; setView: (view: View) => void }) {
  const tools = Object.values(workspaceTools).find((group) => group?.keys.includes(view));
  if (!tools) return null;
  return <div className="card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
    <div className="row spread" style={{ gap: '12px' }}>
      <strong className="text-small" style={{ color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tools.label}</strong>
      <div className="row" style={{ gap: '8px' }}>
        {tools.keys.map((key) => {
          const item = nav.find((entry) => entry.key === key);
          if (!item) return null;
          return <button key={key} className={`btn ${view === key ? 'primary' : ''}`} onClick={() => setView(key)}>{item.label}</button>;
        })}
      </div>
    </div>
  </div>;
}

export default function Page() {
  const [view, setView] = useState<View>('home');
  const [roleView, setRoleView] = useState<RoleView>('Executive');
  const [matrixFilter, setMatrixFilter] = useState<MatrixFilter>('all');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [competitors, setCompetitors] = useState<CompetitorInput[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [currentReport, setCurrentReport] = useState<IntelligenceReport | null>(null);
  const [question, setQuestion] = useState('');
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [diagnostics, setDiagnostics] = useState<ApiCheck[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('Ready');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [growthScenario, setGrowthScenario] = useState<GrowthScenario>(growthDefaultScenario);

  const aiAnalyses = currentReport?.analyses.filter((analysis) => Boolean(analysis.aiExtraction)) || [];
  const growthRows = useMemo(() => buildGrowthRows(growthScenario), [growthScenario]);
  const growthTotals = useMemo(() => summarizeGrowth(growthRows), [growthRows]);
  const growthServiceRollup = useMemo(() => rollupGrowthByService(growthRows), [growthRows]);
  const staffingPlan = useMemo(() => buildStaffingPlan(growthRows), [growthRows]);
  const expertBrief = useMemo(() => generateAndwellExpertBrief({ report: currentReport, growthRows, totals: growthTotals, staffingPlan }), [currentReport, growthRows, growthTotals, staffingPlan]);
  const stats = useMemo(() => ({
    competitors: competitors.length,
    reports: reports.length,
    serviceLines: andwellCatalog.length,
    subservices: andwellCatalog.reduce((sum, service) => sum + service.subservices.length, 0),
    pages: currentReport?.pagesReviewed || 0,
    serviceFindings: currentReport?.allFindings?.length || 0,
    subserviceFindings: currentReport?.allSubserviceFindings?.length || 0,
    reviewItems: currentReport?.humanReviewItems || 0,
    aiAnalyses: currentReport?.analyses.filter((analysis) => analysis.aiEnhanced).length || 0,
    advantages: currentReport?.potentialAndwellAdvantages || 0,
    expertScore: currentReport?.expertBrief?.expertScore || 0
  }), [competitors, reports, currentReport]);

  const topThreat = useMemo(() => {
    return [...(currentReport?.competitorScores || [])].sort((a, b) => (b.serviceLineMatchScore + b.subserviceDepthScore) - (a.serviceLineMatchScore + a.subserviceDepthScore))[0];
  }, [currentReport]);

  const topOpportunity = useMemo(() => {
    return [...(currentReport?.competitorScores || [])].sort((a, b) => b.andwellDifferentiationScore - a.andwellDifferentiationScore)[0];
  }, [currentReport]);

  function clearLegacyBrowserStorage() {
    try {
      ['andwellReports', 'andwellReport', 'andwellCompetitiveReports', 'competitiveIntelligenceReports'].forEach((key) => {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      });
      setNotice('Legacy browser report storage cleared.');
    } catch {
      setNotice('Browser storage was unavailable, but the app does not require local report storage.');
    }
  }

  async function refreshServerState() {
    setBusy(true);
    setPhase('Load data');
    setError('');
    setNotice('');
    try {
      const competitorResponse = await api<{ competitors: CompetitorInput[] }>('/api/competitors');
      const reportResponse = await api<{ reports: ReportSummary[] }>('/api/reports');
      setCompetitors(competitorResponse.competitors || []);
      setReports(reportResponse.reports || []);
      setNotice('Server state loaded successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load server state.');
    } finally {
      setBusy(false);
      setPhase('Ready');
    }
  }

  function addUrls() {
    const next = parseCompetitorEntries(urlInput).slice(0, Math.max(0, 25 - competitors.length));
    setCompetitors((current) => [...current, ...next]);
    setUrlInput('');
  }

  async function saveCompetitors() {
    setBusy(true); setPhase('Save library'); setError(''); setNotice('');
    try {
      const response = await api<{ competitors: CompetitorInput[] }>('/api/competitors', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ competitors }) });
      setCompetitors(response.competitors || []);
      setNotice('Competitor library saved on the server.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save competitors.'); } finally { setBusy(false); setPhase('Ready'); }
  }

  async function runAnalysis() {
    setBusy(true); setError(''); setNotice(''); setAskResponse(null);
    try {
      if (!competitors.length) throw new Error('Add at least one competitor URL first.');
      setPhase('Validate URLs');
      await new Promise((resolve) => setTimeout(resolve, 80));
      setPhase('Crawl pages');
      const report = await api<IntelligenceReport>('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ competitors, maxPagesPerSite: 8, save: true, useAI: true }) });
      setPhase('Build brief');
      setCurrentReport(report);
      setNotice(report.expertBrief ? 'Foremost expert analysis completed and saved on the server.' : 'Analysis completed. Run a fresh scan after deployment to generate the full expert brief.');
      setView(report.expertBrief ? 'expert' : 'dashboard');
    } catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed.'); } finally { setBusy(false); setPhase('Ready'); }
  }

  async function loadReport(id: string) {
    setBusy(true); setPhase('Load report'); setError(''); setNotice('');
    try {
      const response = await api<{ report: IntelligenceReport }>(`/api/reports?id=${encodeURIComponent(id)}`);
      setCurrentReport(response.report);
      setNotice('Stored report loaded.');
      setView(response.report.expertBrief ? 'expert' : 'dashboard');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load report.'); } finally { setBusy(false); setPhase('Ready'); }
  }

  async function askHub() {
    setBusy(true); setPhase('Ask the Hub'); setError(''); setAskResponse(null);
    try {
      const response = await api<AskResponse>('/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question, reportId: currentReport?.id }) });
      setAskResponse(response);
    } catch (err) { setError(err instanceof Error ? err.message : 'Ask the Hub failed.'); } finally { setBusy(false); setPhase('Ready'); }
  }

  async function runDiagnostics() {
    setBusy(true); setPhase('System Check'); setError(''); setDiagnostics([]);
    const routes = ['/api/version', '/api/health', '/api/diagnostics', '/api/analyze', '/api/expert', '/api/competitors', '/api/reports', '/api/reviews', '/api/catalog', '/api/ask', '/api/runtime'];
    const results: ApiCheck[] = [];
    for (const route of routes) {
      try {
        const response = await fetch(route, { headers: { accept: 'application/json' }, cache: 'no-store' });
        const text = await response.text();
        const trimmed = text.trim();
        const isHtml = trimmed.startsWith('<');
        results.push({ route, ok: response.ok && !isHtml, status: response.status, message: isHtml ? 'Returned HTML instead of JSON' : 'Returned JSON or text', preview: text.slice(0, 180).replace(/\s+/g, ' ') });
      } catch (err) { results.push({ route, ok: false, status: 0, message: err instanceof Error ? err.message : 'Request failed' }); }
    }
    setDiagnostics(results); setBusy(false); setPhase('Ready');
  }

  function exportJson() {
    if (!currentReport) return;
    const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'andwell-competitive-intelligence-report.json'; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="proShell">
    <aside className="side">
      <div className="brand proBrand"><p>Andwell Innovation</p><h1>Expert Operating System</h1><span>One expert layer for market evidence, growth strategy, staffing, field language, and board decisions.</span></div>
      <div className="roleBox">
        <label>Lens</label>
        <select className="select darkSelect" value={roleView} onChange={(event) => setRoleView(event.target.value as RoleView)}>
          {(Object.keys(roleGuidance) as RoleView[]).map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <p>{roleGuidance[roleView].headline}</p>
      </div>
      <nav className="nav proNav">{navGroups.map((group) => <div key={group.label} className="side-group"><div className="side-group-label">{group.label}</div>{group.keys.map((key) => { const item = nav.find((n) => n.key === key); if (!item) return null; const Icon = navIcons[item.key]; return <button key={item.key} className={view === item.key ? 'active' : ''} onClick={() => setView(item.key)}><Icon className="w-4 h-4 shrink-0" /><span><strong>{item.label}</strong><small>{item.note}</small></span></button>; })}</div>)}</nav>
    </aside>
    <main className={`main proMain ${view === 'home' ? 'homeMain' : ''}`}>
      {view !== 'home' && <header className="head proHead"><div><small>{currentReport?.expertBrief ? `Foremost Expert | ${currentReport.expertBrief.expertScore}` : currentReport?.aiEnabled ? `AI Enhanced | ${currentReport.aiModel || 'OpenAI'}` : 'Stable Build'}</small><h2>{nav.find((item) => item.key === view)?.label || 'Andwell Innovation'}</h2></div><div className="row"><span className={`badge ${busy ? 'amber' : 'green'}`}>{phase}</span><CommandSearch currentReport={currentReport} onNavigate={setView} /><button className="btn" disabled={busy} onClick={refreshServerState}>Load Server Data</button><button className="btn" onClick={() => setView('diagnostics')}>System Check</button></div></header>}
      <div className="content proContent">
        {error && <div className="error mb-4">{error}</div>}
        {notice && <div className="notice mb-4">{notice}</div>}
        {busy && <LoadingState message={phase} />}
        <WorkspaceTools view={view} setView={setView} />
        {view === 'home' && <Home roleView={roleView} />}
        {view === 'dashboard' && <Dashboard expertBrief={expertBrief} roleView={roleView} setView={setView} clearLegacyBrowserStorage={clearLegacyBrowserStorage} />}
        {view === 'growth' && <GrowthCommand rows={growthRows} totals={growthTotals} serviceRollup={growthServiceRollup} scenario={growthScenario} setScenario={setGrowthScenario} setView={setView} />}
        {view === 'board' && <BoardRoom currentReport={currentReport} totals={growthTotals} rows={growthRows} topThreat={topThreat} topOpportunity={topOpportunity} setView={setView} />}
        {view === 'launch' && <LaunchPlan rows={growthRows} totals={growthTotals} staffingPlan={staffingPlan} setView={setView} />}
        {view === 'heatmap' && <OpportunityHeatMap rows={growthRows} totals={growthTotals} />}
        {view === 'brief' && <StrategyBrief currentReport={currentReport} growthRows={growthRows} totals={growthTotals} />}
        {view === 'narrative' && <ExecutiveNarrative currentReport={currentReport} growthRows={growthRows} totals={growthTotals} />}
        {view === 'board-packet' && <BoardPacket currentReport={currentReport} growthRows={growthRows} totals={growthTotals} staffingPlan={staffingPlan} />}
        {view === 'coaching' && <CoachingMode currentReport={currentReport} />}
        {view === 'executive-view' && <GrowthExecutiveView />}
        {view === 'county-plan' && <GrowthCountyPlan />}
        {view === 'referral-plan' && <GrowthReferralPlan />}
        {view === 'competitive-view' && <GrowthCompetitiveView />}
        {view === 'service-lines' && <GrowthServiceLines />}
        {view === 'cms-data' && <GrowthCmsData />}
        {view === 'financial-model' && <GrowthFinancialModel />}
        {view === 'staffing-model' && <GrowthStaffingModel />}
        {view === 'sensitivity' && <GrowthSensitivity />}
        {view === 'opportunity-score' && <GrowthOpportunityScore />}
        {view === 'launch-timeline' && <GrowthLaunchTimeline />}
        {view === 'board-report' && <GrowthBoardReport />}
        {view === 'launch-checklist' && <GrowthLaunchChecklist />}
        {view === 'decisions' && <DecisionQueue currentReport={currentReport} growthRows={growthRows} />}
        {view === 'scenarios' && <ScenarioPresets scenario={growthScenario} setScenario={setGrowthScenario} growthRows={growthRows} />}
        {view === 'expert' && <ExpertCenter currentReport={currentReport} setView={setView} />}
        {view === 'ai' && <AIIntelligence currentReport={currentReport} aiAnalyses={aiAnalyses} />}
        {view === 'prompt' && <PromptEngine />}
        {view === 'intake' && <Intake competitors={competitors} setCompetitors={setCompetitors} urlInput={urlInput} setUrlInput={setUrlInput} addUrls={addUrls} saveCompetitors={saveCompetitors} runAnalysis={runAnalysis} busy={busy} />}
        {view === 'matrix' && <Matrix currentReport={currentReport} matrixFilter={matrixFilter} setMatrixFilter={setMatrixFilter} matrixSearch={matrixSearch} setMatrixSearch={setMatrixSearch} />}
        {view === 'battlecards' && <Battlecards currentReport={currentReport} />}
        {view === 'governance' && <ClaimGovernance currentReport={currentReport} />}
        {view === 'builder' && <BattlecardBuilder currentReport={currentReport} />}
        {view === 'referrals' && <ReferralSources currentReport={currentReport} />}
        {view === 'reports' && <Reports reports={reports} currentReport={currentReport} loadReport={loadReport} exportJson={exportJson} refreshServerState={refreshServerState} busy={busy} />}
        {view === 'ask' && <AskHub question={question} setQuestion={setQuestion} askHub={askHub} askResponse={askResponse} busy={busy} currentReport={currentReport} />}
        {view === 'catalog' && <Catalog />}
        {view === 'diagnostics' && <Diagnostics diagnostics={diagnostics} runDiagnostics={runDiagnostics} busy={busy} />}
      </div>
    </main>
  </div>;
}
