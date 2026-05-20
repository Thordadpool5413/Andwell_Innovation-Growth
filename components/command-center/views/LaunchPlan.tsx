'use client';

import React, { useMemo } from 'react';
import { Badge, Panel, TagList, SectionGroup } from '../Shared';
import { money, whole } from '../../../lib/command-center/utils';
import { computeStaffingAlerts } from '../../../lib/opportunity-heatmap';
import type { View } from '../../../lib/command-center/types';
import type { GrowthRow, GrowthTotals, StaffingPlanItem } from '../../../lib/growth-plan';
import { launchTimeline } from '../../../lib/growth-plan';

export function LaunchPlan({ rows, totals, staffingPlan, setView }: { rows: GrowthRow[]; totals: GrowthTotals; staffingPlan: StaffingPlanItem[]; setView: (view: View) => void }) {
  const priorityRows = rows.filter((row) => row.launchGroup === 'Priority 1');
  const alerts = useMemo(() => computeStaffingAlerts(rows), [rows]);
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  return <>
    <section className="hero launchHero">
      <div className="row spread" style={{ marginBottom: '8px' }}>
        <Badge tone="dark">Execution system</Badge>
        <div className="row" style={{ gap: '6px' }}>
          <Badge tone="green">{whole(totals.referrals[0])} Y1 referrals modeled</Badge>
          {criticalAlerts.length > 0 && <Badge tone="red">{criticalAlerts.length} critical alerts</Badge>}
        </div>
      </div>
      <h1>A cleaner launch plan for staffing, accounts, referral targets, and 90-day execution.</h1>
      <p className="text-body">Use this view to turn the growth model into operating decisions: who needs to be hired, which accounts matter, and what should happen in each launch window.</p>
      <div className="row" style={{ gap: '8px' }}>
        <button className="btn primary" onClick={() => setView('growth')}>Tune Scenario</button>
        <button className="btn" onClick={() => setView('heatmap')}>View Heat Map</button>
        <button className="btn" onClick={() => setView('battlecards')}>Open Battlecards</button>
      </div>
    </section>

    {alerts.length > 0 &&
      <SectionGroup title={`Staffing constraint alerts (${alerts.length})`}>
        <div style={{ display: 'grid', gap: '8px' }}>{alerts.slice(0, 8).map((alert, i) =>
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
        )}</div>
      </SectionGroup>
    }

    <SectionGroup title="Staffing plan">
      <div className="grid cols3">{staffingPlan.map((item) => {
        const alertsForService = alerts.filter((a) => a.service === item.service);
        const severity = alertsForService.some((a) => a.severity === 'critical') ? 'critical' : alertsForService.some((a) => a.severity === 'warning') ? 'warning' : null;
        return <Panel title={item.service} key={item.service}>
          <Badge>{item.role}</Badge>
          {severity && <Badge tone={severity === 'critical' ? 'red' : 'amber'}>{severity === 'critical' ? 'Critical gap' : 'Warning'}</Badge>}
          <div className="staffGrid">
            <span>Y1 FTE</span><strong>{item.fte[0]}</strong>
            <span>Y2 FTE</span><strong>{item.fte[1]}</strong>
            <span>Y3 FTE</span><strong>{item.fte[2]}</strong>
          </div>
          <p className="text-small">{whole(item.starts[0])} first-year starts supported at about {whole(item.patientsPerFTE)} patients per FTE.</p>
          <div className="notice" style={{ fontSize: '13px' }}><strong>Year 1 staffing cost</strong><br />{money(item.cost[0])}</div>
          {alertsForService.length > 0 && <div style={{ marginTop: '8px' }}>{alertsForService.slice(0, 2).map((a, i) =>
            <p key={i} className="text-xs" style={{ color: a.severity === 'critical' ? 'var(--color-danger)' : 'var(--color-warning)', margin: '4px 0' }}>{a.message}</p>
          )}</div>}
        </Panel>;
      })}</div>
    </SectionGroup>

    <div className="grid cols2 commandGrid">
      <Panel title="90-Day Timeline" className="featurePanel">
        <div className="timeline">{launchTimeline.map((item) =>
          <div className="timelineItem hover-card" key={item.window} style={{ padding: '14px' }}>
            <Badge tone="dark">{item.window}</Badge>
            <strong className="text-subhead" style={{ display: 'block', margin: '8px 0 4px' }}>{item.title}</strong>
            <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{item.focus}</p>
          </div>
        )}</div>
      </Panel>
      <Panel title="Priority Account Plays">
        <div className="briefList">{priorityRows.length === 0
          ? <p className="text-small" style={{ color: 'var(--color-text-tertiary)' }}>No priority rows found. Adjust scenario to populate.</p>
          : priorityRows.map((row) =>
            <div className="briefItem hover-card" key={`${row.county}-${row.service}`} style={{ padding: '14px', marginBottom: '8px' }}>
              <div className="row" style={{ gap: '6px', marginBottom: '6px' }}>
                <Badge tone="red">{row.county}</Badge>
                <Badge>{row.service}</Badge>
              </div>
              <strong className="text-small">{row.action}</strong>
              <TagList items={row.accounts.slice(0, 5)} />
            </div>
          )}</div>
      </Panel>
    </div>
  </>;
}
