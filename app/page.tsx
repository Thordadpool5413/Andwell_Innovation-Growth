'use client';

import { useMemo, useState } from 'react';
import { andwellCatalog } from '../lib/andwell';
import { expertPromptModules, fullCompetitiveIntelligenceInstruction } from '../lib/expert-prompts';
import { buildGrowthRows, buildStaffingPlan, growthDefaultScenario, launchTimeline, rollupGrowthByService, summarizeGrowth } from '../lib/growth-plan';
import type { CompetitorInput, IntelligenceReport } from '../lib/types';
import type { GrowthRow, GrowthScenario, GrowthTotals } from '../lib/growth-plan';

type View = 'dashboard' | 'growth' | 'board' | 'launch' | 'expert' | 'ai' | 'prompt' | 'intake' | 'matrix' | 'battlecards' | 'reports' | 'ask' | 'catalog' | 'diagnostics';
type RoleView = 'Executive' | 'Sales Leader' | 'Sales Rep' | 'Admin';
type MatrixFilter = 'all' | 'salesReady' | 'review' | 'advantage' | 'matched';
type ReportSummary = { id: string; generatedAt: string; competitorsAnalyzed: number; pagesReviewed: number; potentialAndwellAdvantages: number; humanReviewItems: number; competitors: string[]; executiveSummary: string };
type ApiCheck = { route: string; ok: boolean; status: number; message: string; preview?: string };
type AnyAnalysis = NonNullable<IntelligenceReport['analyses']>[number];
type AskEvidence = { type: string; smartScore?: number; competitorName: string; serviceLine: string; subservice?: string | null; status: string; confidence: string; sourceUrl?: string; sourceTitle?: string; evidenceExcerpt: string; safeSalesWording: string; reviewStatus: string; recommendedAction?: string };
type AskResponse = { answer: string; confidence: string; reportId?: string; questionTerms?: string[]; nextBestActions?: string[]; evidence?: AskEvidence[] };

const nav: { key: View; label: string; note: string }[] = [
  { key: 'dashboard', label: 'Command Center', note: 'Executive snapshot' },
  { key: 'growth', label: 'Growth Command', note: 'Scenario intelligence' },
  { key: 'board', label: 'Board Room', note: 'Operating plan' },
  { key: 'launch', label: 'Launch Plan', note: 'Staffing and timeline' },
  { key: 'expert', label: 'Foremost Expert', note: 'Strategy brain' },
  { key: 'ai', label: 'Extracted Intelligence', note: 'AI evidence output' },
  { key: 'prompt', label: 'Methodology', note: 'Governed logic' },
  { key: 'intake', label: 'Competitor Intake', note: 'Add up to 25 URLs' },
  { key: 'matrix', label: 'Evidence Matrix', note: 'Filter and compare' },
  { key: 'battlecards', label: 'Battlecards', note: 'Field coaching' },
  { key: 'reports', label: 'Reports', note: 'Stored intelligence' },
  { key: 'ask', label: 'Ask the Hub', note: 'Evidence based answers' },
  { key: 'catalog', label: 'Andwell Catalog', note: 'Baseline truth' },
  { key: 'diagnostics', label: 'System Check', note: 'Deployment proof' }
];

const roleGuidance: Record<RoleView, { headline: string; focus: string; action: string }> = {
  Executive: {
    headline: 'Leadership brief mode',
    focus: 'Prioritizes threat level, market signal, differentiation, and what needs a leadership decision.',
    action: 'Start with the Command Center, review the top threat, then export or share the executive readout.'
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
  Admin: {
    headline: 'Governance mode',
    focus: 'Prioritizes diagnostics, route health, review risk, data freshness, and evidence quality.',
    action: 'Run System Check, review risky findings, and confirm the app is returning JSON after every deployment.'
  }
};

function normalizeUrl(url: string) {
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}

function nameFromUrl(url: string) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '').split('.')[0].replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return 'Competitor';
  }
}

function parseJsonSafely<T>(text: string, url: string): T {
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<')) {
    throw new Error(`Hostinger returned HTML for ${url}, not JSON. Open System Check and test /api/version first.`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`The response from ${url} was not valid JSON. First characters: ${text.slice(0, 160).replace(/\s+/g, ' ')}`);
  }
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { accept: 'application/json', ...(options?.headers || {}) },
    cache: 'no-store'
  });
  const text = await response.text();
  const data = parseJsonSafely<{ error?: string } & T>(text, url);
  if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}.`);
  return data;
}

function toneForStatus(status?: string): 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark' {
  if (!status) return 'neutral';
  if (status.includes('Critical') || status.includes('Strategic') || status.includes('High') || status.includes('Needs human') || status.includes('Problem')) return 'red';
  if (status.includes('Medium') || status.includes('Moderate') || status.includes('Mentioned') || status.includes('Manager') || status.includes('Unclear')) return 'amber';
  if (status.includes('Clearly') || status.includes('Approved') || status.includes('Evidence') || status.includes('OK')) return 'green';
  if (status.includes('Low') || status.includes('Not found')) return 'blue';
  return 'neutral';
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`}><h3>{title}</h3>{children}</div>;
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return <div className="metricCard"><p>{label}</p><strong>{value}</strong>{hint ? <span>{hint}</span> : null}</div>;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat('en-US');
const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 });

function money(value: number) {
  return currencyFormatter.format(value);
}

function whole(value: number) {
  return numberFormatter.format(value);
}

function percent(value: number) {
  return percentFormatter.format(value);
}

function TagList({ items }: { items?: string[] }) {
  const safeItems = (items || []).filter(Boolean);
  if (!safeItems.length) return <p className="muted">No items returned yet.</p>;
  return <div className="tagCloud">{safeItems.map((item) => <span key={item}>{item}</span>)}</div>;
}

function ProgressSteps({ busy, phase }: { busy: boolean; phase: string }) {
  const steps = ['Validate URLs', 'Crawl pages', 'Extract evidence', 'Run AI', 'Build brief', 'Save report'];
  return <div className="progressRail">{steps.map((step) => <span key={step} className={busy && phase === step ? 'active' : ''}>{step}</span>)}</div>;
}

export default function Page() {
  const [view, setView] = useState<View>('dashboard');
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
    const urls = urlInput.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    const next = urls.slice(0, Math.max(0, 25 - competitors.length)).map((url) => ({ name: nameFromUrl(url), url: normalizeUrl(url), market: 'Needs review' }));
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

  return <div className="shell proShell">
    <aside className="side proSide">
      <div className="brand proBrand"><p>Andwell Innovation</p><h1>Intelligence Command Center</h1><span>Competitive evidence, growth planning, staffing logic, and board-ready strategy in one operating system.</span></div>
      <div className="roleBox">
        <label>Lens</label>
        <select className="select darkSelect" value={roleView} onChange={(event) => setRoleView(event.target.value as RoleView)}>
          {(Object.keys(roleGuidance) as RoleView[]).map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <p>{roleGuidance[roleView].headline}</p>
      </div>
      <nav className="nav proNav">{nav.map((item) => <button key={item.key} className={view === item.key ? 'active' : ''} onClick={() => setView(item.key)}><strong>{item.label}</strong><small>{item.note}</small></button>)}</nav>
      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem' }}>
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { window.location.href = '/growth-plan'; }}><strong>Growth Plan Dashboard</strong></button>
      </div>
    </aside>
    <main className="main proMain">
      <header className="head proHead"><div><small>{currentReport?.expertBrief ? `Foremost Expert | ${currentReport.expertBrief.expertScore}` : currentReport?.aiEnabled ? `AI Enhanced | ${currentReport.aiModel || 'OpenAI'}` : 'Stable Build'}</small><h2>{nav.find((item) => item.key === view)?.label || 'Andwell Innovation'}</h2></div><div className="row"><Badge tone={busy ? 'amber' : 'green'}>{phase}</Badge><button className="btn" disabled={busy} onClick={refreshServerState}>Load Server Data</button><button className="btn" onClick={() => setView('diagnostics')}>System Check</button></div></header>
      <div className="content proContent">
        {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}
        {notice && <div className="notice" style={{ marginBottom: 16 }}>{notice}</div>}
        {busy && <ProgressSteps busy={busy} phase={phase} />}
        {view === 'dashboard' && <Dashboard stats={stats} currentReport={currentReport} roleView={roleView} topThreat={topThreat} topOpportunity={topOpportunity} setView={setView} exportJson={exportJson} clearLegacyBrowserStorage={clearLegacyBrowserStorage} />}
        {view === 'growth' && <GrowthCommand rows={growthRows} totals={growthTotals} serviceRollup={growthServiceRollup} scenario={growthScenario} setScenario={setGrowthScenario} setView={setView} />}
        {view === 'board' && <BoardRoom currentReport={currentReport} totals={growthTotals} rows={growthRows} topThreat={topThreat} topOpportunity={topOpportunity} setView={setView} />}
        {view === 'launch' && <LaunchPlan rows={growthRows} totals={growthTotals} staffingPlan={staffingPlan} setView={setView} />}
        {view === 'expert' && <ExpertCenter currentReport={currentReport} setView={setView} />}
        {view === 'ai' && <AIIntelligence currentReport={currentReport} aiAnalyses={aiAnalyses} />}
        {view === 'prompt' && <PromptEngine />}
        {view === 'intake' && <Intake competitors={competitors} setCompetitors={setCompetitors} urlInput={urlInput} setUrlInput={setUrlInput} addUrls={addUrls} saveCompetitors={saveCompetitors} runAnalysis={runAnalysis} busy={busy} />}
        {view === 'matrix' && <Matrix currentReport={currentReport} matrixFilter={matrixFilter} setMatrixFilter={setMatrixFilter} matrixSearch={matrixSearch} setMatrixSearch={setMatrixSearch} />}
        {view === 'battlecards' && <Battlecards currentReport={currentReport} />}
        {view === 'reports' && <Reports reports={reports} currentReport={currentReport} loadReport={loadReport} exportJson={exportJson} refreshServerState={refreshServerState} busy={busy} />}
        {view === 'ask' && <AskHub question={question} setQuestion={setQuestion} askHub={askHub} askResponse={askResponse} busy={busy} currentReport={currentReport} />}
        {view === 'catalog' && <Catalog />}
        {view === 'diagnostics' && <Diagnostics diagnostics={diagnostics} runDiagnostics={runDiagnostics} busy={busy} />}
      </div>
    </main>
  </div>;
}

function Dashboard({ stats, currentReport, roleView, topThreat, topOpportunity, setView, exportJson, clearLegacyBrowserStorage }: { stats: Record<string, number>; currentReport: IntelligenceReport | null; roleView: RoleView; topThreat?: NonNullable<IntelligenceReport['competitorScores']>[number]; topOpportunity?: NonNullable<IntelligenceReport['competitorScores']>[number]; setView: (view: View) => void; exportJson: () => void; clearLegacyBrowserStorage: () => void }) {
  return <>
    <section className="hero proHero"><Badge tone="dark">{roleGuidance[roleView].headline}</Badge><h1>One command center for market evidence, growth strategy, board decisions, and field execution.</h1><p>{roleGuidance[roleView].focus}</p><div className="row"><button className="btn primary" onClick={() => setView('growth')}>Open Growth Command</button><button className="btn" onClick={() => setView('intake')}>Run Competitive Scan</button><button className="btn" onClick={() => setView('expert')}>Open Foremost Expert</button><button className="btn" onClick={() => setView('ask')}>Ask the Hub</button><button className="btn" onClick={clearLegacyBrowserStorage}>Clear browser cache keys</button></div></section>
    <div className="grid cols4"><Stat label="Expert score" value={stats.expertScore} hint="Foremost expert layer" /><Stat label="AI enhanced" value={stats.aiAnalyses} hint="OpenAI extraction" /><Stat label="Review items" value={stats.reviewItems} hint="Needs approval" /><Stat label="Advantages" value={stats.advantages} hint="Potential Andwell plays" /></div>
    {currentReport ? <div className="grid cols2 commandGrid"><Panel title="Executive Command Brief" className="featurePanel"><p>{currentReport.expertBrief?.expertSummary || currentReport.executiveSummary}</p>{currentReport.expertBrief ? <div className="notice"><strong>Leadership decision</strong><br />{currentReport.expertBrief.leadershipDecision}</div> : null}<div className="briefList">{currentReport.executiveInsights?.map((insight) => <div key={insight.title} className="briefItem"><Badge tone={toneForStatus(insight.priority)}>{insight.priority}</Badge><strong>{insight.title}</strong><p>{insight.summary}</p><span>{insight.action}</span></div>)}</div><div className="row"><Badge tone={currentReport.expertBrief ? 'green' : 'amber'}>{currentReport.expertBrief ? 'Expert brief ready' : 'Fresh scan needed for expert brief'}</Badge><Badge>{currentReport.pagesReviewed} pages reviewed</Badge><Badge>{stats.serviceFindings} service findings</Badge><Badge>{stats.subserviceFindings} subservice findings</Badge><button className="btn" onClick={exportJson}>Export JSON</button></div></Panel><Panel title="Top strategic signals"><div className="signalStack"><div><small>Highest threat</small><h2>{topThreat?.competitorName || 'No report loaded'}</h2><p>{topThreat?.executiveReadout || 'Run or load a report to see threat level, overlap, depth, and coaching priority.'}</p>{topThreat ? <Badge tone={toneForStatus(topThreat.threatLevel)}>{topThreat.threatLevel}</Badge> : null}</div><div><small>Best Andwell opportunity</small><h2>{topOpportunity?.competitorName || 'No report loaded'}</h2><p>{topOpportunity ? `Lead with ${topOpportunity.leadWith.slice(0, 4).join(', ')}. Differentiation score: ${topOpportunity.andwellDifferentiationScore}%.` : 'Opportunities appear after a scan is loaded.'}</p></div><div className="row"><button className="btn primary" onClick={() => setView('expert')}>View expert decisions</button><button className="btn" onClick={() => setView('battlecards')}>Coach reps</button></div></div></Panel></div> : <Panel title="No report loaded yet"><p>The app is ready. Add competitor URLs, then run a scan. If OPENAI_API_KEY is configured in Hostinger, AI extraction will run server side.</p></Panel>}
  </>;
}

function ScenarioControl({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return <label className="scenarioControl"><span>{label}</span><strong>{percent(value)}</strong><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><input className="input" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function GrowthCommand({ rows, totals, serviceRollup, scenario, setScenario, setView }: { rows: GrowthRow[]; totals: GrowthTotals; serviceRollup: ReturnType<typeof rollupGrowthByService>; scenario: GrowthScenario; setScenario: (value: GrowthScenario | ((current: GrowthScenario) => GrowthScenario)) => void; setView: (view: View) => void }) {
  const topRows = [...rows].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 8);
  const priorityOneCount = rows.filter((row) => row.launchGroup === 'Priority 1').length;
  const updateCapture = (key: 'hhCapture' | 'woundCapture' | 'therapyCapture', value: number) => {
    setScenario((current) => ({ ...current, [key]: [value, Math.min(value * 1.5, 0.75), Math.min(value * 2, 0.9)] as [number, number, number] }));
  };

  return <>
    <section className="hero growthHero">
      <div className="row spread"><Badge tone="dark">Merged app intelligence</Badge><Badge tone="green">{priorityOneCount} priority launches</Badge></div>
      <h1>Turn competitive evidence into a smarter growth plan before the field makes the first call.</h1>
      <p>The scenario engine from the growth-planning app is now fused with the competitive intelligence engine, so leadership can see county demand, service-line economics, referral volume, and execution priorities in the same place as competitor evidence.</p>
      <div className="row"><button className="btn primary" onClick={() => setView('board')}>Create Board View</button><button className="btn" onClick={() => setView('launch')}>View Launch Plan</button><button className="btn" onClick={() => setView('intake')}>Run Competitor Scan</button></div>
    </section>
    <div className="grid cols4">
      <Stat label="Year 1 revenue" value={money(totals.revenue[0])} hint={`${whole(totals.starts[0])} starts modeled`} />
      <Stat label="Year 3 revenue" value={money(totals.revenue[2])} hint={`${whole(totals.referrals[2])} referrals needed`} />
      <Stat label="3 year contribution" value={money(totals.totalContribution)} hint="Margin adjusted" />
      <Stat label="Priority counties" value={rows.length} hint="CMS modeled markets" />
    </div>
    <div className="grid cols3 commandGrid">
      <Panel title="Scenario Builder" className="scenarioPanel">
        <p className="muted">Change conversion and capture rates to pressure-test revenue, referrals, starts, and staffing demand.</p>
        <ScenarioControl label="Referral conversion" value={scenario.conversionRate} min={0.45} max={0.95} step={0.01} onChange={(value) => setScenario((current) => ({ ...current, conversionRate: value }))} />
        <ScenarioControl label="Home health Y1 capture" value={scenario.hhCapture[0]} min={0.03} max={0.25} step={0.01} onChange={(value) => updateCapture('hhCapture', value)} />
        <ScenarioControl label="Wound Y1 capture" value={scenario.woundCapture[0]} min={0.08} max={0.45} step={0.01} onChange={(value) => updateCapture('woundCapture', value)} />
        <ScenarioControl label="Therapy Y1 capture" value={scenario.therapyCapture[0]} min={0.08} max={0.45} step={0.01} onChange={(value) => updateCapture('therapyCapture', value)} />
      </Panel>
      <Panel title="Service Line Mix" className="span2">
        <div className="serviceMix">{serviceRollup.map((item) => <div className="serviceTile" key={item.service}><div className="serviceColor" style={{ backgroundColor: item.color }} /><div><strong>{item.service}</strong><span>{item.role}</span></div><div className="serviceNumbers"><b>{money(item.y1Revenue)}</b><small>Y1 revenue</small><b>{whole(item.y3Starts)}</b><small>Y3 starts</small></div></div>)}</div>
      </Panel>
    </div>
    <Panel title="County Opportunity Board" className="featurePanel">
      <div className="countyBoard">{topRows.map((row) => <div className="countyRow" key={`${row.county}-${row.service}`}><div><div className="row"><Badge tone={row.launchGroup === 'Priority 1' ? 'red' : row.launchGroup === 'Priority 2' ? 'amber' : 'blue'}>{row.launchGroup}</Badge><Badge>{row.service}</Badge></div><h3>{row.county}</h3><p>{row.reason}</p></div><div className="countyMetrics"><span>Opportunity</span><strong>{row.opportunityScore}</strong><div className="meter"><i style={{ width: `${Math.min(row.opportunityScore, 100)}%` }} /></div><small>{whole(row.demandPool)} demand pool | {money(row.revenue[0])} Y1 revenue | {whole(row.referrals[0])} referrals</small></div></div>)}</div>
    </Panel>
  </>;
}

function BoardRoom({ currentReport, totals, rows, topThreat, topOpportunity, setView }: { currentReport: IntelligenceReport | null; totals: GrowthTotals; rows: GrowthRow[]; topThreat?: NonNullable<IntelligenceReport['competitorScores']>[number]; topOpportunity?: NonNullable<IntelligenceReport['competitorScores']>[number]; setView: (view: View) => void }) {
  const topCounties = [...rows].sort((a, b) => b.revenue[0] - a.revenue[0]).slice(0, 4);
  const reviewItems = currentReport?.humanReviewItems || 0;
  return <>
    <section className="hero boardHero">
      <div className="row spread"><Badge tone="dark">Board-ready readout</Badge><Badge tone={currentReport ? 'green' : 'amber'}>{currentReport ? 'Competitive report loaded' : 'Growth plan only'}</Badge></div>
      <h1>The advanced view connects market upside, competitor risk, and the decisions leadership needs to make now.</h1>
      <p>{currentReport?.expertBrief?.expertSummary || currentReport?.executiveSummary || 'Run or load a competitor scan to add live competitive evidence to this board view. The growth engine is already modeling county opportunity and launch economics.'}</p>
      <div className="row"><button className="btn primary" onClick={() => setView('reports')}>Load Reports</button><button className="btn" onClick={() => setView('growth')}>Adjust Scenario</button><button className="btn" onClick={() => setView('expert')}>Open Expert Brief</button></div>
    </section>
    <div className="grid cols4">
      <Stat label="3 year revenue" value={money(totals.totalRevenue)} hint="Modeled opportunity" />
      <Stat label="3 year starts" value={whole(totals.starts.reduce((a, b) => a + b, 0))} hint="Across service lines" />
      <Stat label="Review risk" value={reviewItems} hint="Competitive evidence items" />
      <Stat label="Top counties" value={topCounties.length} hint="Board focus list" />
    </div>
    <div className="grid cols2 commandGrid">
      <Panel title="Leadership Investment Case" className="boardSheet">
        <div className="boardMemo"><strong>Why now</strong><p>Andwell can use its current serious illness footprint to move upstream into skilled home health, wound, and therapy demand before referral leakage becomes harder to unwind.</p></div>
        <div className="boardMemo"><strong>Financial signal</strong><p>Year 1 revenue models at {money(totals.revenue[0])}; year 3 reaches {money(totals.revenue[2])} with {money(totals.totalContribution)} in three-year contribution.</p></div>
        <div className="boardMemo"><strong>Decision needed</strong><p>Approve priority county validation, staffing thresholds, and service-line launch sequencing for the next 90 days.</p></div>
      </Panel>
      <Panel title="Competitive Risk Overlay">
        <div className="signalStack">
          <div><small>Highest threat loaded</small><h2>{topThreat?.competitorName || 'No competitor report loaded'}</h2><p>{topThreat?.executiveReadout || 'Run the competitive scanner to attach real competitor pressure to this growth plan.'}</p></div>
          <div><small>Best safe field play</small><h2>{topOpportunity?.competitorName || 'Pending evidence'}</h2><p>{topOpportunity ? `Use verified public evidence and lead with ${topOpportunity.leadWith.slice(0, 3).join(', ')}.` : 'Field coaching appears after a scan is loaded.'}</p></div>
        </div>
      </Panel>
    </div>
    <Panel title="Board Focus Counties" className="featurePanel">
      <div className="grid cols4">{topCounties.map((row) => <div className="briefItem" key={row.county}><Badge tone={row.launchGroup === 'Priority 1' ? 'red' : 'amber'}>{row.launchGroup}</Badge><strong>{row.county}</strong><p>{row.service}</p><span>{money(row.revenue[0])} Y1 revenue | {whole(row.starts[0])} starts | {row.basis}</span></div>)}</div>
    </Panel>
  </>;
}

function LaunchPlan({ rows, totals, staffingPlan, setView }: { rows: GrowthRow[]; totals: GrowthTotals; staffingPlan: ReturnType<typeof buildStaffingPlan>; setView: (view: View) => void }) {
  const priorityRows = rows.filter((row) => row.launchGroup === 'Priority 1');
  return <>
    <section className="hero launchHero">
      <div className="row spread"><Badge tone="dark">Execution system</Badge><Badge tone="green">{whole(totals.referrals[0])} Y1 referrals modeled</Badge></div>
      <h1>A cleaner launch plan for staffing, accounts, referral targets, and 90-day execution.</h1>
      <p>Use this view to turn the growth model into operating decisions: who needs to be hired, which accounts matter, and what should happen in each launch window.</p>
      <div className="row"><button className="btn primary" onClick={() => setView('growth')}>Tune Scenario</button><button className="btn" onClick={() => setView('battlecards')}>Open Battlecards</button></div>
    </section>
    <div className="grid cols3">
      {staffingPlan.map((item) => <Panel title={item.service} key={item.service}><Badge>{item.role}</Badge><div className="staffGrid"><span>Y1 FTE</span><strong>{item.fte[0]}</strong><span>Y2 FTE</span><strong>{item.fte[1]}</strong><span>Y3 FTE</span><strong>{item.fte[2]}</strong></div><p>{whole(item.starts[0])} first-year starts supported at about {whole(item.patientsPerFTE)} patients per FTE.</p><div className="notice"><strong>Year 1 staffing cost</strong><br />{money(item.cost[0])}</div></Panel>)}
    </div>
    <div className="grid cols2 commandGrid">
      <Panel title="90-Day Timeline" className="featurePanel">
        <div className="timeline">{launchTimeline.map((item) => <div className="timelineItem" key={item.window}><Badge tone="dark">{item.window}</Badge><strong>{item.title}</strong><p>{item.focus}</p></div>)}</div>
      </Panel>
      <Panel title="Priority Account Plays">
        <div className="briefList">{priorityRows.map((row) => <div className="briefItem" key={`${row.county}-${row.service}`}><div className="row"><Badge tone="red">{row.county}</Badge><Badge>{row.service}</Badge></div><strong>{row.action}</strong><TagList items={row.accounts.slice(0, 5)} /></div>)}</div>
      </Panel>
    </div>
  </>;
}

function ExpertCenter({ currentReport, setView }: { currentReport: IntelligenceReport | null; setView: (view: View) => void }) {
  const expert = currentReport?.expertBrief;
  if (!currentReport) return <Panel title="No report loaded"><p>Run or load a report to generate the foremost expert brief.</p><button className="btn primary" onClick={() => setView('intake')}>Run Competitive Scan</button></Panel>;
  if (!expert) return <Panel title="Fresh scan needed"><p>This report was created before the foremost expert engine was added. Run a fresh scan to generate expert recommendations, field plays, and watchlist items.</p><button className="btn primary" onClick={() => setView('intake')}>Run Fresh Scan</button></Panel>;
  return <>
    <section className="hero answerHero"><div className="row spread"><Badge tone="dark">{expert.expertVersion}</Badge><Badge tone={expert.expertScore >= 80 ? 'green' : expert.expertScore >= 60 ? 'amber' : 'blue'}>Expert score {expert.expertScore}</Badge></div><h1>{expert.marketPosture}</h1><p>{expert.expertSummary}</p><div className="row"><button className="btn" onClick={() => setView('battlecards')}>Open Battlecards</button><button className="btn" onClick={() => setView('matrix')}>Review Evidence</button><button className="btn" onClick={() => setView('ask')}>Ask Follow Up</button></div></section>
    <div className="grid cols3"><Panel title="Leadership decision"><p>{expert.leadershipDecision}</p></Panel><Panel title="Sales coaching priority"><p>{expert.salesCoachingPriority}</p></Panel><Panel title="Fastest field move"><p>{expert.fastestFieldMove}</p></Panel></div>
    <Panel title="Governance warning" className="featurePanel"><p>{expert.governanceWarning}</p></Panel>
    <Panel title="Expert recommendations"><div className="grid cols2">{expert.recommendations.map((item) => <div className="briefItem" key={item.id}><div className="row spread"><Badge tone={toneForStatus(item.priority)}>{item.priority}</Badge><Badge>{item.audience}</Badge></div><strong>{item.title}</strong><p>{item.reasoning}</p><div className="success"><strong>Action</strong><br />{item.action}</div><div className="notice"><strong>Safe language</strong><br />{item.safeLanguage}</div>{item.reviewRequired ? <Badge tone="amber">Review required</Badge> : <Badge tone="green">Ready for coaching</Badge>}</div>)}</div></Panel>
    <Panel title="Field plays"><div className="grid cols2">{expert.fieldPlays.map((play) => <div className="battleCard upgradedBattle" key={play.id}><div className="row spread"><h3>{play.competitorName}</h3><Badge>{play.serviceLine}</Badge></div><p>{play.scenario}</p><div className="battleSection"><strong>Lead with</strong><span>{play.leadWith}</span></div><div className="battleSection"><strong>Referral question</strong><span>{play.referralQuestion}</span></div><div className="battleSection"><strong>Objection response</strong><span>{play.objectionResponse}</span></div><div className="notice"><strong>Proof needed</strong><br />{play.proofNeeded}</div><div className="error"><strong>Avoid saying</strong><br />{play.avoidSaying}</div></div>)}</div></Panel>
    <div className="grid cols2"><Panel title="Strongest threats"><TagList items={expert.strongestThreats} /></Panel><Panel title="Best opportunities"><TagList items={expert.bestOpportunities} /></Panel></div>
    <Panel title="Watchlist"><div className="grid cols2">{expert.watchlist.map((item) => <div className="evidenceCard" key={item.id}><div className="row spread"><h3>{item.competitorName}</h3><Badge tone={toneForStatus(item.priority)}>{item.priority}</Badge></div><p><strong>Signal:</strong> {item.signal}</p><p>{item.whyItMatters}</p><div className="notice"><strong>Next check</strong><br />{item.nextCheck}</div></div>)}</div></Panel>
  </>;
}

function AIIntelligence({ currentReport, aiAnalyses }: { currentReport: IntelligenceReport | null; aiAnalyses: AnyAnalysis[] }) {
  if (!currentReport) return <Panel title="No report loaded"><p>Run or load a report to see AI extraction output.</p></Panel>;
  if (!currentReport.aiEnabled || !aiAnalyses.length) return <Panel title="AI extraction not available"><p>This report does not include AI extraction output. Confirm OPENAI_API_KEY is set in Hostinger, redeploy, then run analysis again.</p></Panel>;
  return <><section className="section"><div><h1>Extracted Intelligence</h1><p>Structured extraction from crawled public pages, including services, proof points, calls to action, advantages, review risk, and battlecards.</p></div><Badge tone="green">{currentReport.aiModel || 'OpenAI'} enabled</Badge></section>{currentReport.aiLeadershipSummary ? <section className="hero answerHero"><h2>Leadership Summary</h2><p>{currentReport.aiLeadershipSummary}</p></section> : null}<div className="grid">{aiAnalyses.map((analysis) => <Panel title={analysis.name} key={analysis.id}><div className="grid cols3"><Panel title="Services mentioned"><TagList items={analysis.aiExtraction?.servicesMentioned} /></Panel><Panel title="Proof points"><TagList items={analysis.aiExtraction?.proofPoints} /></Panel><Panel title="Review risks"><TagList items={analysis.aiExtraction?.reviewRisks} /></Panel></div></Panel>)}</div></>;
}

function PromptEngine() {
  return <><section className="section"><div><h1>Methodology</h1><p>The governed instruction layer for healthcare competitive intelligence, service extraction, sales positioning, and review governance.</p></div><Badge tone="blue">Governed intelligence</Badge></section><Panel title="Master Intelligence Instruction" className="featurePanel"><p>{fullCompetitiveIntelligenceInstruction}</p></Panel><div className="grid cols2">{expertPromptModules.map((module) => <div className="promptCard" key={module.id}><Badge tone="dark">{module.id}</Badge><h3>{module.title}</h3><p>{module.purpose}</p><div className="promptBlock"><strong>Instructions</strong>{module.instructions.map((item) => <span key={item}>{item}</span>)}</div><div className="promptBlock output"><strong>Required output</strong>{module.requiredOutput.map((item) => <span key={item}>{item}</span>)}</div></div>)}</div></>;
}

function Intake({ competitors, setCompetitors, urlInput, setUrlInput, addUrls, saveCompetitors, runAnalysis, busy }: { competitors: CompetitorInput[]; setCompetitors: (items: CompetitorInput[]) => void; urlInput: string; setUrlInput: (value: string) => void; addUrls: () => void; saveCompetitors: () => void; runAnalysis: () => void; busy: boolean }) {
  return <><section className="section"><div><h1>Competitor Intake</h1><p>Paste up to 25 competitor websites. The backend validates public URLs, crawls high value pages, applies rule based analysis, then uses OpenAI extraction when configured.</p></div><Badge>{competitors.length} of 25 selected</Badge></section><Panel title="Add Competitor URLs"><textarea className="textarea largeInput" value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder="https://competitorone.org\nhttps://competitortwo.org" /><div className="row"><button className="btn" onClick={addUrls}>Add URLs</button><button className="btn" disabled={busy} onClick={saveCompetitors}>Save library</button><button className="btn primary" disabled={busy} onClick={runAnalysis}>{busy ? 'Running competitive scan' : 'Run Competitive Scan'}</button></div></Panel><div className="grid cols2">{competitors.map((competitor, index) => <Panel key={`${competitor.url}${index}`} title={competitor.name || 'Competitor'}><p>{competitor.url}</p><Badge>{competitor.market || 'Needs review'}</Badge><br /><button className="btn danger" onClick={() => setCompetitors(competitors.filter((_, i) => i !== index))}>Remove</button></Panel>)}</div></>;
}

function Matrix({ currentReport, matrixFilter, setMatrixFilter, matrixSearch, setMatrixSearch }: { currentReport: IntelligenceReport | null; matrixFilter: MatrixFilter; setMatrixFilter: (filter: MatrixFilter) => void; matrixSearch: string; setMatrixSearch: (value: string) => void }) {
  const findings = currentReport?.allFindings || [];
  const filtered = findings.filter((finding) => {
    const search = matrixSearch.trim().toLowerCase();
    const matchesSearch = !search || `${finding.competitorName} ${finding.serviceLine} ${finding.safeSalesWording} ${finding.evidenceExcerpt}`.toLowerCase().includes(search);
    if (!matchesSearch) return false;
    if (matrixFilter === 'salesReady') return finding.reviewStatus === 'Sales usable with evidence' || finding.reviewStatus === 'Approved for sales use';
    if (matrixFilter === 'review') return finding.reviewStatus !== 'Sales usable with evidence' && finding.reviewStatus !== 'Approved for sales use';
    if (matrixFilter === 'advantage') return finding.competitorStatus !== 'Clearly offered';
    if (matrixFilter === 'matched') return finding.competitorStatus === 'Clearly offered';
    return true;
  });
  return <><section className="section"><div><h1>Evidence Matrix</h1><p>Filter service line evidence by competitor, status, review risk, and field usability.</p></div><Badge>{filtered.length} visible</Badge></section>{!currentReport ? <Panel title="No report loaded"><p>Run or load a report to populate the matrix.</p></Panel> : <><Panel title="Matrix controls"><div className="row"><input className="input searchInput" value={matrixSearch} onChange={(event) => setMatrixSearch(event.target.value)} placeholder="Search competitor, service line, evidence, or safe wording" />{(['all', 'salesReady', 'review', 'advantage', 'matched'] as MatrixFilter[]).map((filter) => <button key={filter} className={`btn ${matrixFilter === filter ? 'primary' : ''}`} onClick={() => setMatrixFilter(filter)}>{filter === 'all' ? 'All' : filter === 'salesReady' ? 'Sales ready' : filter === 'review' ? 'Needs review' : filter === 'advantage' ? 'Potential advantage' : 'Public matches'}</button>)}</div></Panel><div className="tableWrap proTable"><table><thead><tr><th>Competitor</th><th>Service line</th><th>Status</th><th>Depth</th><th>Review</th><th>Safe sales wording</th></tr></thead><tbody>{filtered.map((finding) => <tr key={finding.id}><td>{finding.competitorName}</td><td><strong>{finding.serviceLine}</strong><br /><span className="muted">{finding.sourceTitle || finding.sourceUrl || 'No source title'}</span></td><td><Badge tone={toneForStatus(finding.competitorStatus)}>{finding.competitorStatus}</Badge></td><td>{finding.subserviceDepthScore}%</td><td><Badge tone={toneForStatus(finding.reviewStatus)}>{finding.reviewStatus}</Badge></td><td>{finding.safeSalesWording}</td></tr>)}</tbody></table></div></>}</>;
}

function Battlecards({ currentReport }: { currentReport: IntelligenceReport | null }) {
  return <><section className="section"><div><h1>Battlecards</h1><p>Field usable positioning by competitor, including safe language, coaching priorities, and review warnings.</p></div></section>{!currentReport ? <Panel title="No report loaded"><p>Run or load a report to generate battlecards.</p></Panel> : <div className="grid cols2">{currentReport.analyses.map((analysis) => <div className="battleCard upgradedBattle" key={analysis.id}><div className="row spread"><h3>{analysis.name}</h3><Badge tone={analysis.aiEnhanced ? 'green' : toneForStatus(analysis.score.threatLevel)}>{analysis.aiEnhanced ? 'AI enhanced' : analysis.score.threatLevel}</Badge></div><p>{analysis.aiExtraction?.leadershipSummary || analysis.score.executiveReadout}</p><div className="battleSection"><strong>Lead with</strong>{(analysis.aiExtraction?.salesBattlecards?.slice(0, 4).map((item) => item.leadWith) || analysis.score.leadWith).map((item) => <span key={item}>{item}</span>)}</div><div className="battleSection"><strong>Needs review</strong>{analysis.score.needsReview.length ? analysis.score.needsReview.map((item) => <span key={item}>{item}</span>) : <span>No major review flags</span>}</div><div className="notice"><strong>Field rule</strong><br />Do not say they do not offer a service. Use not found publicly unless approved evidence confirms otherwise.</div></div>)}</div>}</>;
}

function Reports({ reports, currentReport, loadReport, exportJson, refreshServerState, busy }: { reports: ReportSummary[]; currentReport: IntelligenceReport | null; loadReport: (id: string) => void; exportJson: () => void; refreshServerState: () => void; busy: boolean }) {
  return <><section className="section"><div><h1>Reports</h1><p>Stored server side reports and exportable intelligence summaries.</p></div><div className="row"><button className="btn" disabled={busy} onClick={refreshServerState}>Load reports</button><button className="btn" disabled={!currentReport} onClick={exportJson}>Export current JSON</button></div></section><div className="grid">{reports.map((report) => <Panel key={report.id} title={report.competitors?.join(', ') || 'Stored report'}><p>{new Date(report.generatedAt).toLocaleString()} | {report.pagesReviewed} pages | {report.humanReviewItems} review items</p><p>{report.executiveSummary}</p><button className="btn primary" disabled={busy} onClick={() => loadReport(report.id)}>Load report</button></Panel>)}</div></>;
}

function AskHub({ question, setQuestion, askHub, askResponse, busy, currentReport }: { question: string; setQuestion: (value: string) => void; askHub: () => void; askResponse: AskResponse | null; busy: boolean; currentReport: IntelligenceReport | null }) {
  return <><section className="section"><div><h1>Ask the Hub</h1><p>Ask plain English questions against the latest stored intelligence report and get ranked evidence, safe language, and recommended next moves.</p></div><Badge tone={currentReport ? 'green' : 'amber'}>{currentReport ? 'Report loaded' : 'No report loaded'}</Badge></section><Panel title="Ask a competitive question"><textarea className="textarea largeInput" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should I lead with against this competitor?" /><button className="btn primary" disabled={busy || !question.trim()} onClick={askHub}>Ask the Hub</button></Panel>{askResponse ? <section className="hero answerHero"><div className="row spread"><h2>Answer</h2><Badge tone={toneForStatus(askResponse.confidence)}>{askResponse.confidence}</Badge></div><p>{askResponse.answer}</p>{askResponse.questionTerms?.length ? <div className="tagCloud lightTags">{askResponse.questionTerms.map((term) => <span key={term}>{term}</span>)}</div> : null}</section> : null}{askResponse?.nextBestActions?.length ? <Panel title="Recommended next moves"><div className="briefList">{askResponse.nextBestActions.map((action) => <div className="briefItem" key={action}><Badge tone="blue">Action</Badge><p>{action}</p></div>)}</div></Panel> : null}{askResponse?.evidence?.length ? <Panel title="Ranked evidence"><div className="grid cols2">{askResponse.evidence.slice(0, 8).map((item, index) => <div className="evidenceCard" key={`${item.competitorName}${item.serviceLine}${item.subservice}${index}`}><div className="row spread"><Badge tone="dark">Score {item.smartScore || 0}</Badge><Badge tone={toneForStatus(item.status)}>{item.status}</Badge></div><h3>{item.competitorName}</h3><p><strong>{item.serviceLine}</strong>{item.subservice ? ` | ${item.subservice}` : ''}</p><p>{item.evidenceExcerpt}</p><div className="notice"><strong>Safe wording</strong><br />{item.safeSalesWording}</div>{item.recommendedAction ? <div className="success"><strong>Recommended action</strong><br />{item.recommendedAction}</div> : null}</div>)}</div></Panel> : null}</>;
}

function Catalog() {
  return <><section className="section"><div><h1>Andwell Catalog</h1><p>Approved baseline service catalog with subservice capability depth and safe positioning guidance.</p></div></section><div className="grid cols2">{andwellCatalog.map((service) => <div className="catalogCard" key={service.serviceLine}><Badge>{service.category}</Badge><h3>{service.serviceLine}</h3><p>{service.description}</p><div className="tagCloud">{service.subservices.slice(0, 18).map((item) => <span key={item}>{item}</span>)}{service.subservices.length > 18 ? <span>More {service.subservices.length - 18}</span> : null}</div><div className="notice"><strong>Safe language</strong><br />{service.safeLanguage}</div><div className="error"><strong>Avoid saying</strong><br />{service.avoid}</div></div>)}</div></>;
}

function Diagnostics({ diagnostics, runDiagnostics, busy }: { diagnostics: ApiCheck[]; runDiagnostics: () => void; busy: boolean }) {
  const healthy = diagnostics.filter((item) => item.ok).length;
  return <><section className="section"><div><h1>System Check</h1><p>Confirms whether Hostinger is returning JSON or HTML for API routes, including runtime startup status after deployment.</p></div><button className="btn primary" disabled={busy} onClick={runDiagnostics}>Run System Check</button></section>{diagnostics.length ? <div className="grid cols3"><Stat label="Routes checked" value={diagnostics.length} /><Stat label="Healthy" value={healthy} /><Stat label="Needs attention" value={diagnostics.length - healthy} /></div> : null}<div className="grid">{diagnostics.map((item) => <Panel key={item.route} title={item.route}><div className="row"><Badge tone={item.ok ? 'green' : 'red'}>{item.ok ? 'OK' : 'Problem'}</Badge><Badge>{item.status}</Badge></div><p>{item.message}</p><p className="muted">{item.preview}</p></Panel>)}</div></>;
}
