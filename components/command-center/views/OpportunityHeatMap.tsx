'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Panel, SectionGroup, ExpandableSection, Stat } from '../Shared';
import { computeCountyHeatMap, computeReadinessScores, computeStaffingAlerts, heatCategoryTone, readinessTone } from '../../../lib/opportunity-heatmap';
import { money, whole } from '../../../lib/command-center/utils';
import type { GrowthRow, GrowthTotals } from '../../../lib/growth-plan';
import type { HeatCategory } from '../../../lib/opportunity-heatmap';
import { useSortableTable } from '../../../lib/useSortableTable';
import { downloadCsv } from '../../../lib/command-center/csv';
import { useToast } from '../../../components/Toast';

export function OpportunityHeatMap({ rows, totals }: { rows: GrowthRow[]; totals: GrowthTotals }) {
  const { showToast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<HeatCategory | 'all'>('all');

  const heatMap = useMemo(() => computeCountyHeatMap(rows), [rows]);
  const readiness = useMemo(() => computeReadinessScores(rows), [rows]);
  const alerts = useMemo(() => computeStaffingAlerts(rows), [rows]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return heatMap;
    return heatMap.filter((h) => h.category === categoryFilter);
  }, [heatMap, categoryFilter]);

  const categories = [...new Set(heatMap.map((h) => h.category))] as HeatCategory[];

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  const tableData = useMemo(() => heatMap.map((h) => ({
    county: h.county,
    category: h.category,
    composite: h.composite,
    topService: h.topService,
    revenue: rows.filter((r) => r.county === h.county).reduce((s, r) => s + (r.revenue?.[0] ?? 0), 0),
  })), [heatMap, rows]);

  const { sorted: sortedTable, thProps, SortIndicator } = useSortableTable(tableData, 'composite', 'desc');

  const [drawerCounty, setDrawerCounty] = useState<string | null>(null);
  const drawerRows = useMemo(() => drawerCounty ? rows.filter(r => r.county === drawerCounty) : [], [drawerCounty, rows]);
  const drawerHeat = useMemo(() => heatMap.find(h => h.county === drawerCounty) ?? null, [heatMap, drawerCounty]);
  const drawerReadiness = useMemo(() => readiness.filter(r => r.county === drawerCounty), [readiness, drawerCounty]);

  function exportCsv() {
    downloadCsv('andwell-heatmap.csv',
      ['County', 'Category', 'Score', 'Top Service', 'Y1 Revenue'],
      sortedTable.map(r => [r.county, r.category, r.composite, r.topService, r.revenue])
    );
    showToast(`Exported ${sortedTable.length} counties to CSV.`, 'success');
  }

  return <>
    <section className="hero growthHero">
      <div className="row spread">
        <Badge tone="dark">Growth Intelligence</Badge>
        <Badge tone={criticalAlerts.length > 0 ? 'red' : warningAlerts.length > 0 ? 'amber' : 'green'}>
          {criticalAlerts.length > 0 ? `${criticalAlerts.length} critical alerts` : warningAlerts.length > 0 ? `${warningAlerts.length} warnings` : 'All clear'}
        </Badge>
      </div>
      <h1>Opportunity Heat Map &mdash; score every county across 8 dimensions.</h1>
      <p className="text-body">Counties are scored on market size, Andwell footprint, competitor density, revenue potential, staffing feasibility, referral access, service gap, and priority alignment.</p>
    </section>
    <div className="grid cols4">
      <Stat label="Year 1 revenue" value={money(totals.revenue[0])} hint={`${whole(totals.starts[0])} starts`} />
      <Stat label="3 year revenue" value={money(totals.totalRevenue)} hint={`${whole(totals.totalReferrals)} referrals`} />
      <Stat label="Counties scored" value={heatMap.length} hint="Across 3 service lines" />
      <Stat label="Critical alerts" value={criticalAlerts.length} hint="Staffing constraints" />
    </div>

    {alerts.length > 0 &&
      <SectionGroup title={`Staffing constraint alerts (${alerts.length})`}>
        <div style={{ display: 'grid', gap: '8px' }}>
          {alerts.slice(0, 6).map((alert, i) =>
            <div key={i} className="hover-card" style={{
              padding: '12px', borderRadius: 'var(--radius)',
              border: `1px solid ${alert.severity === 'critical' ? 'var(--color-danger)' : alert.severity === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'}`,
              background: alert.severity === 'critical' ? 'rgba(239,68,68,0.05)' : alert.severity === 'warning' ? 'rgba(245,158,11,0.05)' : 'rgba(59,130,246,0.05)'
            }}>
              <div className="row spread">
                <Badge tone={alert.severity === 'critical' ? 'red' : alert.severity === 'warning' ? 'amber' : 'blue'}>{alert.severity.toUpperCase()}</Badge>
                <span className="text-small" style={{ color: 'var(--color-text-tertiary)' }}>{alert.service} | {alert.county}</span>
              </div>
              <p className="text-small" style={{ margin: '8px 0 4px', fontWeight: 600 }}>{alert.message}</p>
              <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>{alert.detail}</p>
            </div>
          )}
        </div>
      </SectionGroup>
    }

    {drawerCounty && drawerHeat && (
      <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setDrawerCounty(null)} />
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401,
          width: 'min(480px, 92vw)', background: 'var(--color-bg-primary)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
          animation: 'drawerSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p className="text-xs text-overline" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>County Detail</p>
              <h2 style={{ margin: 0 }}>{drawerCounty}</h2>
              <div className="row" style={{ gap: '6px', marginTop: '8px' }}>
                <Badge tone={heatCategoryTone(drawerHeat.category as HeatCategory)}>{drawerHeat.category}</Badge>
                <Badge>{drawerHeat.composite}% composite</Badge>
                <Badge>{drawerHeat.topService}</Badge>
              </div>
            </div>
            <button className="btn" style={{ flexShrink: 0 }} onClick={() => setDrawerCounty(null)}>✕</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
            <div className="grid cols3" style={{ gap: '8px', marginBottom: '20px' }}>
              {drawerRows.map(r => (
                <div key={r.service} style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                  <p className="text-xs text-overline" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>{r.service}</p>
                  <strong style={{ fontSize: '15px', display: 'block' }}>{money(r.revenue[0])}</strong>
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Y1 · {whole(r.starts[0])} starts</span>
                </div>
              ))}
            </div>
            {drawerRows.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p className="text-xs text-overline" style={{ margin: '0 0 10px', color: 'var(--color-text-tertiary)' }}>Revenue by year</p>
                <div className="tableWrap" style={{ marginBottom: 0 }}>
                  <table style={{ minWidth: 'unset', fontSize: '13px' }}>
                    <thead><tr><th>Service</th><th style={{ textAlign: 'right' }}>Y1</th><th style={{ textAlign: 'right' }}>Y2</th><th style={{ textAlign: 'right' }}>Y3</th></tr></thead>
                    <tbody>
                      {drawerRows.map(r => (
                        <tr key={r.service}>
                          <td style={{ fontWeight: 600 }}>{r.service}</td>
                          <td style={{ textAlign: 'right' }}>{money(r.revenue[0])}</td>
                          <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>{money(r.revenue[1])}</td>
                          <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>{money(r.revenue[2])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div style={{ marginBottom: '20px' }}>
              <p className="text-xs text-overline" style={{ margin: '0 0 10px', color: 'var(--color-text-tertiary)' }}>Dimension scores</p>
              <div style={{ display: 'grid', gap: '6px' }}>
                {(Object.entries(drawerHeat.dimensions) as [string, { score: number; label: string; raw: number }][]).map(([, dim]) => (
                  <div key={dim.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '120px', fontSize: '12px', color: 'var(--color-text-secondary)', flexShrink: 0 }}>{dim.label}</span>
                    <div className="meter" style={{ flex: 1, height: '6px' }}><i style={{ width: `${dim.score}%`, background: dim.score >= 60 ? 'var(--color-success)' : dim.score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }} /></div>
                    <span style={{ fontSize: '12px', fontWeight: 700, width: '36px', textAlign: 'right' }}>{dim.score}%</span>
                  </div>
                ))}
              </div>
            </div>
            {drawerReadiness.length > 0 && (
              <div>
                <p className="text-xs text-overline" style={{ margin: '0 0 10px', color: 'var(--color-text-tertiary)' }}>Launch readiness</p>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {drawerReadiness.map(r => (
                    <div key={r.service} style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                      <div className="row spread" style={{ marginBottom: '6px' }}>
                        <Badge>{r.service}</Badge>
                        <Badge tone={readinessTone(r.readinessPercent)}>{r.readinessPercent}% ready</Badge>
                      </div>
                      <div className="meter" style={{ height: '4px', marginBottom: '6px' }}><i style={{ width: `${r.readinessPercent}%` }} /></div>
                      <p className="text-xs" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>{r.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: '20px' }}>
              <div className="notice" style={{ fontSize: '13px' }}><strong className="text-small">Recommendation</strong><br />{drawerHeat.recommendation}</div>
            </div>
          </div>
        </div>
      </>
    )}

    <Panel title="County summary — click row for detail, click headers to sort" action={<button className="btn btn-sm" onClick={exportCsv}>Export CSV</button>}>
      <div className="tableWrap" style={{ marginBottom: 0 }}>
        <table style={{ minWidth: 'unset', fontSize: '13px' }}>
          <thead>
            <tr>
              <th {...thProps('county')}>County <SortIndicator col="county" /></th>
              <th {...thProps('category')}>Category <SortIndicator col="category" /></th>
              <th {...thProps('composite')} style={{ ...thProps('composite').style, textAlign: 'right' }}>Score <SortIndicator col="composite" /></th>
              <th {...thProps('topService')}>Top service <SortIndicator col="topService" /></th>
              <th {...thProps('revenue')} style={{ ...thProps('revenue').style, textAlign: 'right' }}>Y1 revenue <SortIndicator col="revenue" /></th>
            </tr>
          </thead>
          <tbody>
            {sortedTable.map((row) => (
              <tr
                key={row.county}
                style={{ cursor: 'pointer' }}
                onClick={() => setDrawerCounty(row.county)}
              >
                <td style={{ fontWeight: row.county === drawerCounty ? 700 : 400 }}>{row.county}</td>
                <td><Badge tone={heatCategoryTone(row.category as HeatCategory)}>{row.category}</Badge></td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.composite}%</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{row.topService}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{money(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>

    <Panel title="Filter by category">
      <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
        <button className={`btn ${categoryFilter === 'all' ? 'primary' : ''}`} onClick={() => setCategoryFilter('all')}>All ({heatMap.length})</button>
        {categories.map((cat) => {
          const count = heatMap.filter((h) => h.category === cat).length;
          return <button key={cat} className={`btn ${categoryFilter === cat ? 'primary' : ''}`} onClick={() => setCategoryFilter(cat)}>{cat} ({count})</button>;
        })}
      </div>
    </Panel>

    <div style={{ display: 'grid', gap: '12px' }}>
      {filtered.map((county) =>
        <ExpandableSection key={county.county} title={`${county.county} — ${county.category}`} defaultOpen={false} badge={<Badge tone={heatCategoryTone(county.category)}>{county.topService}</Badge>}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="grid cols2" style={{ gap: '8px' }}>
              {(Object.entries(county.dimensions) as [string, { raw: number; score: number; label: string }][]).map(([key, dim]) =>
                <div key={key} className="hover-card" style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                  <p className="text-xs text-overline" style={{ margin: '0 0 4px', color: 'var(--color-text-tertiary)' }}>{dim.label}</p>
                  <div className="row spread">
                    <strong style={{ fontSize: '18px' }}>{dim.score}%</strong>
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>raw: {dim.raw}</span>
                  </div>
                  <div className="meter" style={{ height: '4px', marginTop: '4px' }}><i style={{ width: `${dim.score}%`, background: dim.score >= 60 ? 'var(--color-success)' : dim.score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }} /></div>
                </div>
              )}
            </div>
            <div className="notice" style={{ fontSize: '13px' }}>
              <strong className="text-small">Composite: {county.composite}%</strong>
              <br />{county.recommendation}
            </div>

            <div className="grid cols2">{readiness.filter((r) => r.county === county.county).map((r) =>
              <div key={`${r.county}-${r.service}`} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                <div className="row spread" style={{ marginBottom: '8px' }}>
                  <Badge tone={readinessTone(r.readinessPercent)}>{r.readinessPercent}% ready</Badge>
                  <Badge>{r.service}</Badge>
                </div>
                <div className="meter" style={{ height: '6px', marginBottom: '8px' }}><i style={{ width: `${r.readinessPercent}%` }} /></div>
                <div style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span>Revenue upside: {money(r.revenueUpside)}</span>
                  <span>Staffing: {r.staffingConfidence} | Referrals: {r.referralAccess} | Competition: {r.competitorPressure} | Risk: {r.governanceRisk}</span>
                </div>
                {r.gaps.length > 0 && <div style={{ marginTop: '8px' }}>{r.gaps.map((g, i) => <Badge key={i} tone="amber">{g}</Badge>)}</div>}
                <p className="text-xs" style={{ marginTop: '8px', color: 'var(--color-text-tertiary)' }}>{r.recommendation}</p>
              </div>
            )}</div>
          </div>
        </ExpandableSection>
      )}
    </div>
  </>;
}
