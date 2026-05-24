'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, TrendingUp, Presentation, Rocket, Brain, Cpu, FileText, Upload, Table, Swords, FileBarChart, MessageSquare, BookOpen, Activity, Shield, Hammer, Users, Map, CheckSquare, Sliders, Search, FileSpreadsheet, ScrollText, GraduationCap, Globe, MapPin, Phone, Crosshair, Layers, Database, DollarSign, Target, Clock, ListChecks, Home as HomeIcon, Menu, X, ClipboardList } from 'lucide-react';
import { ToastProvider, useToast } from '../components/Toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
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
import { AuditLog } from '../components/command-center/views/AuditLog';
import { generateDecisions } from '../lib/decision-queue';
import { appendAuditEvent } from '../lib/audit-log';

const navIcons: Record<View, React.ComponentType<{ className?: string }>> = {
  home: HomeIcon, dashboard: LayoutDashboard, decisions: CheckSquare, scenarios: Sliders, growth: TrendingUp, board: Presentation, launch: Rocket, heatmap: Map,
  expert: Brain, ai: Cpu, prompt: FileText, intake: Upload, matrix: Table,
  battlecards: Swords, governance: Shield, builder: Hammer, referrals: Users, reports: FileBarChart, ask: MessageSquare, catalog: BookOpen, diagnostics: Activity,
  brief: FileSpreadsheet, narrative: ScrollText, 'board-packet': Presentation, coaching: GraduationCap,
  'executive-view': Globe, 'county-plan': MapPin, 'referral-plan': Phone, 'competitive-view': Crosshair,
  'service-lines': Layers, 'cms-data': Database, 'financial-model': DollarSign, 'staffing-model': Users,
  sensitivity: Activity, 'opportunity-score': Target, 'launch-timeline': Clock, 'board-report': FileText, 'launch-checklist': ListChecks,
  audit: ClipboardList
};

const navGroups: { label: string; keys: View[] }[] = [
  { label: 'Home', keys: ['home', 'dashboard'] },
  { label: 'Workspaces', keys: ['heatmap', 'growth', 'battlecards', 'board-packet'] },
  { label: 'Operations', keys: ['intake', 'reports'] }
];

const workspaceTools: Partial<Record<View, { label: string; keys: View[] }>> = {
  heatmap: { label: 'Intelligence', keys: ['heatmap', 'expert', 'matrix', 'governance', 'brief'] },
  growth: { label: 'Growth', keys: ['growth', 'scenarios', 'financial-model', 'staffing-model', 'launch-checklist'] },
  battlecards: { label: 'Field', keys: ['battlecards', 'builder', 'referrals', 'coaching'] },
  'board-packet': { label: 'Board', keys: ['board-packet', 'board', 'narrative', 'board-report', 'decisions'] },
  reports: { label: 'Operations', keys: ['reports', 'ask', 'audit', 'diagnostics'] },
};

function AnalysisProgress({ items, busy, onDismiss }: { items: { name: string; status: 'queued' | 'crawling' | 'ai' | 'done' | 'error'; pages?: number; error?: string }[]; busy: boolean; onDismiss?: () => void }) {
  const scanDone = !busy && items.length > 0;
  const errorCount = items.filter((item) => item.status === 'error').length;

  useEffect(() => {
    if (!scanDone || errorCount > 0) return;
    const timer = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(timer);
  }, [scanDone, errorCount, onDismiss]);

  if (!items.length) return null;
  const statusLabel: Record<string, string> = { queued: 'Queued', crawling: 'Crawling…', ai: 'AI extraction…', done: 'Done', error: 'Failed' };
  const statusColor: Record<string, string> = { queued: 'var(--color-text-tertiary)', crawling: 'var(--color-info)', ai: 'var(--color-accent)', done: 'var(--color-success)', error: 'var(--color-danger)' };
  const headerLabel = scanDone
    ? errorCount > 0 ? `Scan complete — ${errorCount} error${errorCount > 1 ? 's' : ''}` : 'Scan complete — closing…'
    : 'Analysis in progress';
  const headerColor = scanDone ? (errorCount > 0 ? 'var(--color-danger)' : 'var(--color-success)') : 'var(--color-text-tertiary)';
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '340px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px', zIndex: 300, boxShadow: 'var(--color-shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: headerColor }}>{headerLabel}</p>
        {scanDone && onDismiss && <button className="btn btn-sm" onClick={onDismiss}>✕</button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: statusColor[item.status] || 'var(--color-text-tertiary)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</span>
              <span style={{ color: statusColor[item.status] || 'var(--color-text-tertiary)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                {statusLabel[item.status] || item.status}
                {item.pages && item.status !== 'queued' ? ` · ${item.pages}p` : ''}
              </span>
            </div>
            {item.error && <p style={{ margin: '0 0 0 18px', fontSize: '11px', color: 'var(--color-danger)', lineHeight: 1.3 }}>{item.error}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

const SHORTCUTS: { key: string; label: string; view?: View; action?: string }[] = [
  { key: 'G', label: 'Growth command center', view: 'growth' },
  { key: 'D', label: 'Decision queue', view: 'decisions' },
  { key: 'B', label: 'Battlecards', view: 'battlecards' },
  { key: 'H', label: 'Opportunity heat map', view: 'heatmap' },
  { key: 'A', label: 'Ask Andwell Expert', view: 'ask' },
  { key: 'R', label: 'Reports', view: 'reports' },
  { key: 'E', label: 'Expert center', view: 'expert' },
  { key: 'Ctrl+K', label: 'Command search', action: 'search' },
  { key: '?', label: 'Toggle this overlay', action: 'shortcuts' },
];

function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px 28px', minWidth: '360px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Keyboard shortcuts</h3>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'grid', gap: '8px' }}>
          {SHORTCUTS.map((s) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{s.label}</span>
              <kbd style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{s.key}</kbd>
            </div>
          ))}
        </div>
        <p style={{ margin: '16px 0 0', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Shortcuts only fire when focus is not in a text field.</p>
      </div>
    </div>
  );
}

function WorkspaceTools({ view, setView }: { view: View; setView: (view: View) => void }) {
  const tools = Object.values(workspaceTools).find((group) => group?.keys.includes(view));
  if (!tools) return null;
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', overflowX: 'auto', flexShrink: 0 }}>
      {tools.keys.map((key) => {
        const item = nav.find((entry) => entry.key === key);
        if (!item) return null;
        const active = view === key;
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
              marginBottom: '-1px',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              fontSize: '13px',
              fontWeight: active ? 700 : 400,
              cursor: 'pointer',
              transition: 'color 150ms ease, border-color 150ms ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function PageContent() {
  const { showToast } = useToast();
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
  const [growthScenario, setGrowthScenario] = useState<GrowthScenario>(growthDefaultScenario);
  const [navOpen, setNavOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [progressItems, setProgressItems] = useState<{ name: string; status: 'queued' | 'crawling' | 'ai' | 'done' | 'error'; pages?: number; error?: string }[]>([]);
  const dismissProgress = useCallback(() => setProgressItems([]), []);

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

  const urgentDecisionCount = useMemo(() => {
    const decisions = generateDecisions(currentReport, growthRows);
    return decisions.filter(d => d.status === 'Pending' && (d.urgency === 'Immediate' || d.urgency === 'Today')).length;
  }, [currentReport, growthRows]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case '?': setShowShortcuts(v => !v); break;
        case 'Escape': setShowShortcuts(false); break;
        case 'g': setView('growth'); break;
        case 'd': setView('decisions'); break;
        case 'b': setView('battlecards'); break;
        case 'h': setView('heatmap'); break;
        case 'a': setView('ask'); break;
        case 'r': setView('reports'); break;
        case 'e': setView('expert'); break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('andwell:view', view); } catch {}
  }, [view]);

  useEffect(() => {
    try { localStorage.setItem('andwell:growthScenario', JSON.stringify(growthScenario)); } catch {}
  }, [growthScenario]);

  useEffect(() => {
    try {
      if (currentReport?.id) localStorage.setItem('andwell:reportId', currentReport.id);
    } catch {}
  }, [currentReport]);

  useEffect(() => {
    // Restore persisted state after mount to avoid SSR/client hydration mismatch
    try {
      const savedView = localStorage.getItem('andwell:view') as View;
      if (savedView && nav.some(n => n.key === savedView)) setView(savedView);
    } catch {}
    try {
      const savedScenario = localStorage.getItem('andwell:growthScenario');
      if (savedScenario) setGrowthScenario(JSON.parse(savedScenario) as GrowthScenario);
    } catch {}
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      await refreshServerState();
      try {
        const savedId = localStorage.getItem('andwell:reportId');
        if (savedId) {
          setBusy(true);
          setPhase('Restore session');
          const response = await api<{ report: IntelligenceReport }>(`/api/reports?id=${encodeURIComponent(savedId)}`);
          setCurrentReport(response.report);
        }
      } catch {}
      finally { setBusy(false); setPhase('Ready'); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearLegacyBrowserStorage() {
    try {
      ['andwellReports', 'andwellReport', 'andwellCompetitiveReports', 'competitiveIntelligenceReports'].forEach((key) => {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      });
      showToast('Legacy browser report storage cleared.', 'success');
    } catch {
      showToast('Browser storage was unavailable, but the app does not require local report storage.', 'info');
    }
  }

  async function refreshServerState() {
    setBusy(true);
    setPhase('Load data');
    try {
      const competitorResponse = await api<{ competitors: CompetitorInput[] }>('/api/competitors');
      const reportResponse = await api<{ reports: ReportSummary[] }>('/api/reports');
      setCompetitors(competitorResponse.competitors || []);
      setReports(reportResponse.reports || []);
      showToast('Server state loaded.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to load server state.', 'error');
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
    setBusy(true); setPhase('Save library');
    try {
      const response = await api<{ competitors: CompetitorInput[] }>('/api/competitors', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ competitors }) });
      setCompetitors(response.competitors || []);
      showToast('Competitor library saved.', 'success');
    } catch (err) { showToast(err instanceof Error ? err.message : 'Unable to save competitors.', 'error'); } finally { setBusy(false); setPhase('Ready'); }
  }

  async function runAnalysis() {
    setBusy(true); setAskResponse(null); setProgressItems([]);
    appendAuditEvent({ type: 'analysis_started', actor: roleView, description: `Scan started for ${competitors.length} competitor${competitors.length !== 1 ? 's' : ''}` });
    try {
      if (!competitors.length) throw new Error('Add at least one competitor URL first.');
      setPhase('Validate URLs');
      try {
        const validation = await api<{ results: { url: string; ok: boolean; error?: string }[] }>(
          '/api/validate-urls',
          { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ urls: competitors.map(c => c.url) }) }
        );
        const failed = validation.results.filter(r => !r.ok);
        if (failed.length === competitors.length) throw new Error('No competitor URLs are reachable. Check your list and try again.');
        if (failed.length > 0) showToast(`${failed.length} URL(s) appear unreachable and may be skipped.`, 'warning');
      } catch (validationErr) {
        if (validationErr instanceof Error && validationErr.message.startsWith('No competitor')) throw validationErr;
      }
      setPhase('Starting scan');
      const streamRes = await fetch('/api/analyze-stream', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ competitors, maxPagesPerSite: 8, save: true, useAI: true })
      });
      if (!streamRes.ok || !streamRes.body) throw new Error('Analysis request failed to start.');
      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';
      let report: IntelligenceReport | null = null;
      let streamError: string | null = null;
      streamLoop: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const parts = sseBuffer.split('\n\n');
        sseBuffer = parts.pop() ?? '';
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as Record<string, unknown>;
            if (ev.type === 'start') {
              const total = Number(ev.total);
              setProgressItems(Array.from({ length: total }, (_, i) => ({ name: competitors[i]?.name || String(competitors[i]?.url || `Site ${i + 1}`), status: 'queued' as const })));
            } else if (ev.type === 'crawl_start') {
              const idx = Number(ev.index);
              setPhase(`Crawling ${ev.name} (${idx + 1}/${ev.total})`);
              setProgressItems(prev => prev.map((item, i) => i === idx ? { ...item, name: String(ev.name), status: 'crawling' } : item));
            } else if (ev.type === 'crawl_done') {
              const idx = Number(ev.index);
              setPhase(`Crawled ${ev.name} — ${ev.pages} pages`);
              setProgressItems(prev => prev.map((item, i) => i === idx ? { ...item, pages: Number(ev.pages), status: 'ai' } : item));
            } else if (ev.type === 'ai_start') {
              setPhase(`AI extraction: ${ev.name}`);
            } else if (ev.type === 'ai_done') {
              const idx = Number(ev.index);
              setPhase(`AI done: ${ev.name}`);
              setProgressItems(prev => prev.map((item, i) => i === idx ? { ...item, status: 'done' } : item));
            } else if (ev.type === 'ai_error') {
              const idx = Number(ev.index);
              setProgressItems(prev => prev.map((item, i) => i === idx ? { ...item, status: 'error', error: String(ev.error || 'AI extraction failed') } : item));
            } else if (ev.type === 'crawl_error') {
              const idx = Number(ev.index);
              setProgressItems(prev => prev.map((item, i) => i === idx ? { ...item, status: 'error', error: String(ev.error) } : item));
            } else if (ev.type === 'building') {
              setPhase(String(ev.message));
            } else if (ev.type === 'complete') {
              report = ev.report as IntelligenceReport; break streamLoop;
            } else if (ev.type === 'error') {
              streamError = String(ev.message); break streamLoop;
            }
          } catch { /* malformed SSE event, continue */ }
        }
      }
      if (streamError) throw new Error(streamError);
      if (!report) throw new Error('Analysis ended without returning a report.');
      setPhase('Build brief');
      setCurrentReport(report);
      appendAuditEvent({ type: 'analysis_complete', actor: roleView, description: `Scan complete — ${report.competitorsAnalyzed} competitors analyzed`, detail: `${report.pagesReviewed} pages reviewed` });
      showToast(report.expertBrief ? 'Expert analysis complete.' : 'Analysis complete.', 'success');
      setView(report.expertBrief ? 'expert' : 'dashboard');
    } catch (err) { showToast(err instanceof Error ? err.message : 'Analysis failed.', 'error'); } finally {
      setProgressItems(prev => prev.map((item) => item.status !== 'done' && item.status !== 'error' ? { ...item, status: 'done' } : item));
      setBusy(false); setPhase('Ready');
    }
  }

  async function loadReport(id: string) {
    setBusy(true); setPhase('Load report');
    try {
      const response = await api<{ report: IntelligenceReport }>(`/api/reports?id=${encodeURIComponent(id)}`);
      setCurrentReport(response.report);
      appendAuditEvent({ type: 'report_loaded', actor: roleView, description: `Loaded report from ${new Date(response.report.generatedAt).toLocaleDateString()}`, detail: `${response.report.competitorsAnalyzed} competitors, ${response.report.pagesReviewed} pages` });
      showToast('Report loaded.', 'success');
      setView(response.report.expertBrief ? 'expert' : 'dashboard');
    } catch (err) { showToast(err instanceof Error ? err.message : 'Unable to load report.', 'error'); } finally { setBusy(false); setPhase('Ready'); }
  }

  async function deleteReports(ids: string[]) {
    try {
      await api<{ deleted: number }>('/api/reports', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (currentReport && ids.includes(currentReport.id)) setCurrentReport(null);
      appendAuditEvent({ type: 'report_deleted', actor: roleView, description: `Deleted ${ids.length} report${ids.length !== 1 ? 's' : ''}` });
      await refreshServerState();
      showToast(`${ids.length} report${ids.length !== 1 ? 's' : ''} deleted.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  }

  async function runSingleAnalysis(competitor: CompetitorInput) {
    if (busy) return;
    setBusy(true); setPhase(`Scanning ${competitor.name || competitor.url}`);
    try {
      const streamRes = await fetch('/api/analyze-stream', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ competitors: [competitor], maxPagesPerSite: 8, save: false, useAI: true }),
      });
      if (!streamRes.ok || !streamRes.body) throw new Error('Re-scan request failed.');
      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';
      let freshReport: IntelligenceReport | null = null;
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const parts = sseBuffer.split('\n\n');
        sseBuffer = parts.pop() ?? '';
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as Record<string, unknown>;
            if (ev.type === 'complete') { freshReport = ev.report as IntelligenceReport; break outer; }
            if (ev.type === 'error') throw new Error(String(ev.message));
          } catch (e) { if (e instanceof Error && e.message !== 'Unexpected token') throw e; }
        }
      }
      if (!freshReport) throw new Error('Re-scan ended without a result.');
      // Merge updated analysis back into current report
      if (currentReport && freshReport.analyses[0]) {
        const updatedAnalysis = freshReport.analyses[0];
        const merged: IntelligenceReport = {
          ...currentReport,
          analyses: currentReport.analyses.map((a) =>
            a.name.toLowerCase() === updatedAnalysis.name.toLowerCase() || a.url === updatedAnalysis.url
              ? updatedAnalysis
              : a
          ),
        };
        setCurrentReport(merged);
        appendAuditEvent({ type: 'rescan_complete', actor: roleView, description: `Re-scan complete for ${updatedAnalysis.name}` });
        showToast(`Re-scan complete for ${updatedAnalysis.name}.`, 'success');
      } else {
        setCurrentReport(freshReport);
        showToast(`Re-scan complete.`, 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Re-scan failed.', 'error');
    } finally {
      setBusy(false); setPhase('Ready');
    }
  }

  async function askHub() {
    setBusy(true); setPhase('Ask the Hub'); setAskResponse(null);
    try {
      const response = await api<AskResponse>('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question,
          reportId: currentReport?.id,
          growthContext: {
            y1Revenue: growthTotals.revenue[0],
            y3Revenue: growthTotals.revenue[2],
            totalRevenue: growthTotals.totalRevenue,
            totalContribution: growthTotals.totalContribution,
            y1Starts: growthTotals.starts[0],
            counties: [...new Set(growthRows.map(r => r.county))],
            services: [...new Set(growthRows.map(r => r.service))],
            topCounties: [...growthRows].sort((a, b) => (b.revenue[0] ?? 0) - (a.revenue[0] ?? 0)).slice(0, 3).map(r => ({ county: r.county, service: r.service, y1Revenue: r.revenue[0] })),
          },
        }),
      });
      setAskResponse(response);
    } catch (err) { showToast(err instanceof Error ? err.message : 'Ask the Hub failed.', 'error'); } finally { setBusy(false); setPhase('Ready'); }
  }

  async function runDiagnostics() {
    setBusy(true); setPhase('System Check'); setDiagnostics([]);
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

  return <>
    <button className="mobileToggle" onClick={() => setNavOpen(v => !v)} aria-label={navOpen ? 'Close menu' : 'Open menu'}>
      {navOpen ? <X size={18} /> : <Menu size={18} />}
    </button>
    {navOpen && <div className="sideOverlay" onClick={() => setNavOpen(false)} />}
    {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
    {progressItems.length > 0 && <AnalysisProgress items={progressItems} busy={busy} onDismiss={dismissProgress} />}
    <div className="proShell">
    <aside className={`side${navOpen ? ' open' : ''}`}>
      <div className="brand proBrand" style={{ marginBottom: '12px' }}><p>Andwell Innovation</p><h1>Intelligence Platform</h1></div>
      <div className="roleBox" style={{ marginBottom: '8px' }}>
        <label>View as</label>
        <select className="select darkSelect" value={roleView} onChange={(event) => setRoleView(event.target.value as RoleView)}>
          {(Object.keys(roleGuidance) as RoleView[]).map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      </div>
      <nav className="nav proNav">{navGroups.map((group) => <div key={group.label} className="side-group"><div className="side-group-label">{group.label}</div>{group.keys.map((key) => { const item = nav.find((n) => n.key === key); if (!item) return null; const Icon = navIcons[item.key]; const badge = key === 'decisions' && urgentDecisionCount > 0 ? urgentDecisionCount : null; return <button key={item.key} className={view === item.key ? 'active' : ''} onClick={() => setView(item.key)}><Icon className="w-4 h-4 shrink-0" /><span><strong>{item.label}</strong><small>{item.note}</small></span>{badge !== null && <span className="nav-badge">{badge}</span>}</button>; })}</div>)}</nav>
    </aside>
    <main className={`main proMain ${view === 'home' ? 'homeMain' : ''}`}>
      <div className="sticky-top-group">
        {view !== 'home' && <header className="head proHead"><div><small>{nav.find((item) => item.key === view)?.note || ''}</small><h2>{nav.find((item) => item.key === view)?.label || 'Andwell Innovation'}</h2></div><div className="row" style={{ gap: '8px', alignItems: 'center' }}>{currentReport ? <span className="badge green">Report loaded</span> : <span className="badge amber">No report</span>}{busy && <span className="badge amber">{phase}</span>}<button className="btn btn-sm no-print" onClick={() => setView('ask')}>Ask AI</button><CommandSearch currentReport={currentReport} growthRows={growthRows} onNavigate={setView} /></div></header>}
        <WorkspaceTools view={view} setView={setView} />
      </div>
      <div className="content proContent">
        <ErrorBoundary label={view} key={view}>
        <div className="view-enter">
        {view === 'home' && <Home roleView={roleView} setView={setView} currentReport={currentReport} competitors={competitors} busy={busy} onRefresh={refreshServerState} />}
        {view === 'dashboard' && <Dashboard expertBrief={expertBrief} roleView={roleView} setView={setView} clearLegacyBrowserStorage={clearLegacyBrowserStorage} rows={growthRows} totals={growthTotals} />}
        {view === 'growth' && <GrowthCommand rows={growthRows} totals={growthTotals} serviceRollup={growthServiceRollup} scenario={growthScenario} setScenario={setGrowthScenario} setView={setView} currentReport={currentReport} />}
        {view === 'board' && <BoardRoom currentReport={currentReport} totals={growthTotals} rows={growthRows} topThreat={topThreat} topOpportunity={topOpportunity} setView={setView} scenario={growthScenario} />}
        {view === 'launch' && <LaunchPlan rows={growthRows} totals={growthTotals} staffingPlan={staffingPlan} setView={setView} />}
        {view === 'heatmap' && <OpportunityHeatMap rows={growthRows} totals={growthTotals} />}
        {view === 'brief' && <StrategyBrief currentReport={currentReport} growthRows={growthRows} totals={growthTotals} />}
        {view === 'narrative' && <ExecutiveNarrative currentReport={currentReport} growthRows={growthRows} totals={growthTotals} />}
        {view === 'board-packet' && <BoardPacket currentReport={currentReport} growthRows={growthRows} totals={growthTotals} staffingPlan={staffingPlan} />}
        {view === 'coaching' && <CoachingMode currentReport={currentReport} onRunScan={() => setView('intake')} />}
        {view === 'executive-view' && <GrowthExecutiveView scenario={growthScenario} />}
        {view === 'county-plan' && <GrowthCountyPlan scenario={growthScenario} />}
        {view === 'referral-plan' && <GrowthReferralPlan scenario={growthScenario} />}
        {view === 'competitive-view' && <GrowthCompetitiveView scenario={growthScenario} />}
        {view === 'service-lines' && <GrowthServiceLines />}
        {view === 'cms-data' && <GrowthCmsData />}
        {view === 'financial-model' && <GrowthFinancialModel scenario={growthScenario} />}
        {view === 'staffing-model' && <GrowthStaffingModel scenario={growthScenario} />}
        {view === 'sensitivity' && <GrowthSensitivity scenario={growthScenario} />}
        {view === 'opportunity-score' && <GrowthOpportunityScore scenario={growthScenario} />}
        {view === 'launch-timeline' && <GrowthLaunchTimeline scenario={growthScenario} />}
        {view === 'board-report' && <GrowthBoardReport scenario={growthScenario} />}
        {view === 'launch-checklist' && <GrowthLaunchChecklist />}
        {view === 'decisions' && <DecisionQueue currentReport={currentReport} growthRows={growthRows} />}
        {view === 'scenarios' && <ScenarioPresets scenario={growthScenario} setScenario={setGrowthScenario} growthRows={growthRows} />}
        {view === 'expert' && <ExpertCenter currentReport={currentReport} setView={setView} />}
        {view === 'ai' && <AIIntelligence currentReport={currentReport} aiAnalyses={aiAnalyses} onRunScan={() => setView('intake')} />}
        {view === 'prompt' && <PromptEngine />}
        {view === 'intake' && <Intake competitors={competitors} setCompetitors={setCompetitors} urlInput={urlInput} setUrlInput={setUrlInput} addUrls={addUrls} saveCompetitors={saveCompetitors} runAnalysis={runAnalysis} runSingleAnalysis={runSingleAnalysis} busy={busy} />}
        {view === 'matrix' && <Matrix currentReport={currentReport} matrixFilter={matrixFilter} setMatrixFilter={setMatrixFilter} matrixSearch={matrixSearch} setMatrixSearch={setMatrixSearch} onRunScan={() => setView('intake')} />}
        {view === 'battlecards' && <Battlecards currentReport={currentReport} onRunScan={() => setView('intake')} />}
        {view === 'governance' && <ClaimGovernance currentReport={currentReport} onRunScan={() => setView('intake')} />}
        {view === 'builder' && <BattlecardBuilder currentReport={currentReport} onRunScan={() => setView('intake')} />}
        {view === 'referrals' && <ReferralSources currentReport={currentReport} />}
        {view === 'reports' && <Reports reports={reports} currentReport={currentReport} loadReport={loadReport} exportJson={exportJson} refreshServerState={refreshServerState} deleteReports={deleteReports} busy={busy} />}
        {view === 'ask' && <AskHub question={question} setQuestion={setQuestion} askHub={askHub} askResponse={askResponse} busy={busy} currentReport={currentReport} hasGrowthPlan={growthRows.length > 0} />}
        {view === 'catalog' && <Catalog />}
        {view === 'audit' && <AuditLog />}
        {view === 'diagnostics' && <Diagnostics diagnostics={diagnostics} runDiagnostics={runDiagnostics} busy={busy} />}
        </div>
        </ErrorBoundary>
      </div>
    </main>
  </div>
  </>;
}

export default function Page() {
  return (
    <ToastProvider>
      <PageContent />
    </ToastProvider>
  );
}
