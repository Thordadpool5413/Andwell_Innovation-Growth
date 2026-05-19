'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useMemo, useState } from "react";
import { Sun, Moon, Circle, CheckCircle } from "lucide-react";
import { TABS, DEFAULT_SCENARIO } from "../../lib/growth-plan/data/constants";
import type { Scenario } from "../../lib/growth-plan/data/constants";
import { buildRows } from "../../lib/growth-plan/utils/calculations";
import { fetchReports, fetchCompetitors } from "../../lib/growth-plan/utils/api-data";
import type { ApiReport, ApiCompetitor } from "../../lib/growth-plan/utils/api-data";
import { DarkModeProvider, useDarkMode } from "../../lib/growth-plan/components/DarkModeContext";
import { ToastProvider, useToast } from "../../lib/growth-plan/components/ToastContainer";
import ScenarioPanel from "../../lib/growth-plan/components/ScenarioPanel";
import ScenarioCompare from "../../lib/growth-plan/components/ScenarioCompare";
import ScenarioManager from "../../lib/growth-plan/components/ScenarioManager";
import ExportButton from "../../lib/growth-plan/components/ExportButton";
import InsightsPanel from "../../lib/growth-plan/components/InsightsPanel";
import { InsightsEngine } from "../../lib/growth-plan/utils/insights";
import ExecutiveView from "../../lib/growth-plan/views/ExecutiveView";
import CountyPlan from "../../lib/growth-plan/views/CountyPlan";
import ReferralPlan from "../../lib/growth-plan/views/ReferralPlan";
import CompetitiveView from "../../lib/growth-plan/views/CompetitiveView";
import ServiceLines from "../../lib/growth-plan/views/ServiceLines";
import CmsData from "../../lib/growth-plan/views/CmsData";
import FinancialModel from "../../lib/growth-plan/views/FinancialModel";
import StaffingModel from "../../lib/growth-plan/views/StaffingModel";
import SensitivityAnalysis from "../../lib/growth-plan/views/SensitivityAnalysis";
import OpportunityScore from "../../lib/growth-plan/views/OpportunityScore";
import LaunchTimeline from "../../lib/growth-plan/views/LaunchTimeline";
import BoardReport from "../../lib/growth-plan/views/BoardReport";
import LaunchChecklist from "../../lib/growth-plan/views/LaunchChecklist";

function Dashboard() {
  const { dark, toggle } = useDarkMode();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("Executive View");
  const [selectedCounty, setSelectedCounty] = useState("York");
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const [showScenario, setShowScenario] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [apiReports, setApiReports] = useState<ApiReport[]>([]);
  const [apiCompetitors, setApiCompetitors] = useState<ApiCompetitor[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    setApiLoading(true);
    Promise.all([fetchReports(), fetchCompetitors()]).then(([reports, competitors]) => {
      setApiReports(reports);
      setApiCompetitors(competitors);
    }).catch(() => {}).finally(() => setApiLoading(false));
  }, []);

  const rows = useMemo(() => buildRows(scenario), [scenario]);
  const totals = useMemo(() => ({
    y1Revenue: rows.reduce((sum, row) => sum + row.revenue[0], 0),
    y2Revenue: rows.reduce((sum, row) => sum + row.revenue[1], 0),
    y3Revenue: rows.reduce((sum, row) => sum + row.revenue[2], 0),
    y1Referrals: rows.reduce((sum, row) => sum + row.referrals[0], 0),
    y2Referrals: rows.reduce((sum, row) => sum + row.referrals[1], 0),
    y3Referrals: rows.reduce((sum, row) => sum + row.referrals[2], 0),
    y1Starts: rows.reduce((sum, row) => sum + row.starts[0], 0),
    y2Starts: rows.reduce((sum, row) => sum + row.starts[1], 0),
    y3Starts: rows.reduce((sum, row) => sum + row.starts[2], 0),
    totalContribution: rows.reduce((sum, row) => sum + row.totalContribution, 0),
  }), [rows]);

  const insightsEngine = useMemo(() => new InsightsEngine(rows, totals), [rows, totals]);
  const insights = useMemo(() => insightsEngine.getAllInsights(), [insightsEngine]);

  return (
    <div className="container-page" style={{ minHeight: "calc(100vh - 56px)" }}>
      <aside className="container-sidebar">
        <div style={{ padding: "2rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>Andwell</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", margin: "0.5rem 0 0 0" }}>Growth Plan</p>
          </div>
          <button onClick={toggle} className="p-2 rounded-lg cursor-pointer transition-all duration-250" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", color: dark ? "#fbbf24" : "#94a3b8" }} title={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "1.5rem 0.75rem" }}>
          <h6 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 1rem", marginBottom: "1rem", margin: 0 }}>Views</h6>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`nav-item w-full text-left ${activeTab === tab ? "active" : ""}`}
                style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: activeTab === tab ? 500 : 400, borderRadius: "0.5rem" }}>
                {tab}
              </button>
            ))}
          </div>
        </nav>
        <div style={{ borderTop: "1px solid var(--color-border)", padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button onClick={() => { setShowScenario((p) => !p); if (showCompare) setShowCompare(false); }}
            className={`nav-item w-full text-left gap-2 ${showScenario ? "active" : ""}`}>
            {showScenario ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />} Scenario Model
          </button>
          <button onClick={() => { setShowCompare((p) => !p); if (showScenario) setShowScenario(false); }}
            className={`nav-item w-full text-left gap-2 ${showCompare ? "active" : ""}`}>
            {showCompare ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />} Compare
          </button>
          <button onClick={() => setShowInsights((p) => !p)}
            className={`nav-item w-full text-left gap-2 ${showInsights ? "active" : ""}`}>
            {showInsights ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />} Insights
          </button>
        </div>
      </aside>
      <div className="container-main">
        <header className="container-header">
          <div>
            <h1 className="text-3xl font-bold m-0" style={{ color: "var(--color-text-primary)" }}>{activeTab}</h1>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-tertiary)" }}>Professional healthcare analytics & insights</p>
          </div>
          <ExportButton targetId="tab-content" filename={`Andwell - ${activeTab}`} />
        </header>
        <div className="container-content">
          <div className="content-area">
            {showScenario && (
              <div className="mb-8 grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                <ScenarioPanel scenario={scenario} setScenario={setScenario} />
                <ScenarioManager />
              </div>
            )}
            {showCompare && (
              <div className="mb-8">
                <ScenarioCompare currentScenario={scenario} />
              </div>
            )}
            {showInsights && (
              <div className="mb-8">
                <InsightsPanel insights={insights} onActionClick={(county: string) => setSelectedCounty(county)} />
              </div>
            )}
            <div id="tab-content" className="flex flex-col gap-8">
              {activeTab === "Executive View" && <ExecutiveView rows={rows} totals={totals} apiReports={apiReports} apiCompetitors={apiCompetitors} />}
              {activeTab === "County Plan" && <CountyPlan rows={rows} selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty} />}
              {activeTab === "Referral Plan" && <ReferralPlan rows={rows} />}
              {activeTab === "Competitive View" && <CompetitiveView selectedCounty={selectedCounty} setSelectedCounty={setSelectedCounty} apiCompetitors={apiCompetitors} />}
              {activeTab === "Service Lines" && <ServiceLines />}
              {activeTab === "CMS Data" && <CmsData />}
              {activeTab === "Financial Model" && <FinancialModel rows={rows} />}
              {activeTab === "Staffing Model" && <StaffingModel rows={rows} />}
              {activeTab === "Sensitivity" && <SensitivityAnalysis rows={rows} />}
              {activeTab === "Opportunity Score" && <OpportunityScore rows={rows} />}
              {activeTab === "Launch Timeline" && <LaunchTimeline rows={rows} />}
              {activeTab === "Board Report" && <BoardReport rows={rows} totals={totals} />}
              {activeTab === "Launch Checklist" && <LaunchChecklist />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GrowthPlanPage() {
  return (
    <DarkModeProvider>
      <ToastProvider>
        <Dashboard />
      </ToastProvider>
    </DarkModeProvider>
  );
}
