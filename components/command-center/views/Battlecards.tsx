'use client';

import React, { useState, useMemo } from 'react';
import { Badge, Panel, ExpandableSection, SectionGroup } from '../Shared';
import { toneForStatus } from '../../../lib/command-center/utils';
import { categorizeClaims, filterApprovedClaims } from '../../../lib/claim-governance';
import { generateCoachingPlan } from '../../../lib/strategy-brief';
import { objectionLibrary, clinicalChecklist, phaseForScore, generateDiscoveryQuestions } from '../../../lib/sales-model-data';
import type { IntelligenceReport } from '../../../lib/types';

export function Battlecards({ currentReport }: { currentReport: IntelligenceReport | null }) {
  const [approvedOnly, setApprovedOnly] = useState(false);

  const claimMap = useMemo(() => {
    if (!currentReport) return {};
    const map: Record<string, ReturnType<typeof categorizeClaims>> = {};
    for (const analysis of currentReport.analyses) {
      map[analysis.id] = categorizeClaims(analysis);
    }
    return map;
  }, [currentReport]);

  const analyses = useMemo(() => {
    if (!currentReport) return [];
    let list = currentReport.analyses;
    if (approvedOnly) {
      list = list.filter((a) => {
        const claims = claimMap[a.id] || [];
        const approved = filterApprovedClaims(claims);
        return approved.length > 0;
      });
    }
    return list;
  }, [currentReport, approvedOnly, claimMap]);

  if (!currentReport) {
    return <Panel title="No report loaded"><p className="text-body">Run or load a report to generate field enablement cards.</p></Panel>;
  }

  return <>
    <section className="section">
      <div>
        <h1>Field Enablement</h1>
        <p className="text-body">Competitor positioning with conversation methodology — referral questions, objection responses, coaching plans, and clinical capture reminders per account.</p>
      </div>
      <Badge>{analyses.length} competitors</Badge>
    </section>
    <Panel title="Filters">
      <label className="row" style={{ gap: '6px', cursor: 'pointer' }}>
        <input type="checkbox" checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} />
        <span className="text-small">Show competitors with approved claims only</span>
      </label>
    </Panel>
    {analyses.length === 0
      ? <Panel title="No field enablement cards match"><p className="text-body">No competitors match the current filter. Try adjusting the filter or run a new report.</p></Panel>
      : <div className="grid cols2">{analyses.map((analysis) => {
          const claims = claimMap[analysis.id] || [];
          const approved = filterApprovedClaims(claims);
          const plan = generateCoachingPlan(analysis.name, currentReport);
          const phase = phaseForScore(analysis.score.serviceLineMatchScore);
          const battlecards = analysis.aiExtraction?.salesBattlecards || [];
          const questions = analysis.aiExtraction?.referralCallsToAction || [];
          const safeLang = analysis.aiExtraction?.safeSalesLanguage || [];
          const doNotSay = analysis.aiExtraction?.doNotSayLanguage || [];
          const advantages = analysis.score.strongestAndwellAdvantages || [];
          const objections = battlecards.map((bc) => bc.objectionResponse).filter(Boolean);
          const hasExtraction = analysis.aiEnhanced && analysis.aiExtraction;

          return <div className="battleCard upgradedBattle hover-card" key={analysis.id}>
            <div className="row spread" style={{ marginBottom: '8px' }}>
              <h3 className="text-heading" style={{ margin: 0 }}>{analysis.name}</h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge tone={phase === 'Discovery' ? 'blue' : phase === 'Connecting' ? 'amber' : phase === 'Guiding' ? 'green' : 'neutral'}>{phase}</Badge>
                <Badge tone={analysis.aiEnhanced ? 'green' : toneForStatus(analysis.score.threatLevel)}>{analysis.aiEnhanced ? 'AI enhanced' : analysis.score.threatLevel}</Badge>
              </div>
            </div>
            <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>{analysis.aiExtraction?.leadershipSummary || analysis.score.executiveReadout}</p>

            <ExpandableSection title="Sales positioning" defaultOpen>
              <div className="battleSection">
                <strong>Lead with</strong>
                <div className="tagCloud" style={{ marginTop: '4px' }}>
                  {(analysis.aiExtraction?.salesBattlecards?.slice(0, 4).map((item) => item.leadWith) || analysis.score.leadWith).map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
              <div className="battleSection" style={{ marginTop: '12px' }}>
                <strong>Field proof</strong>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>During {phase.toLowerCase()}, success sounds like: the referral source names a real need, clarifies a barrier, or confirms a next step tied to a patient or workflow.</p>
              </div>
            </ExpandableSection>

            <ExpandableSection title={battlecards.length > 0 || questions.length > 0 ? `Referral questions (${battlecards.length + questions.length})` : 'Referral questions'} defaultOpen={false}>
              {battlecards.length > 0
                ? <div style={{ display: 'grid', gap: '8px' }}>{battlecards.slice(0, 4).map((bc, i) =>
                    <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                      <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)', fontWeight: 600 }}>{bc.serviceLine}</p>
                      <p className="text-small" style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>{bc.referralQuestion || bc.leadWith}</p>
                    </div>
                  )}</div>
                : questions.length > 0
                ? <div style={{ display: 'grid', gap: '6px' }}>{questions.slice(0, 4).map((q, i) =>
                    <div key={i} className="hover-card" style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                      <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{q}</p>
                    </div>
                  )}</div>
                : <div style={{ display: 'grid', gap: '8px' }}>{generateDiscoveryQuestions(analysis.name).slice(0, 3).map((q, i) =>
                    <div key={i} className="hover-card" style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                      <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{q}</p>
                    </div>
                  )}</div>
              }
              <div className="battleSection" style={{ marginTop: '12px' }}>
                <strong style={{ color: 'var(--color-info)' }}>Phase questions to try</strong>
                <div style={{ display: 'grid', gap: '6px', marginTop: '6px' }}>{[
                  `Discovery: "Walk me through the last patient or situation that felt difficult."`,
                  `Connecting: "What I am hearing is that timing and readiness are the hard parts. Did I get that right?"`,
                  `Guiding: "Because you said X, hospice can help with Y. How would that fit your process?"`,
                  `Commitment: "What is the next right step from your workflow?"`
                ].map((q, i) =>
                  <p key={i} className="text-small" style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>{q}</p>
                )}</div>
              </div>
            </ExpandableSection>

            <ExpandableSection title={objections.length > 0 ? `Objection responses (${objections.length})` : 'Objection responses'} defaultOpen={false}>
              {hasExtraction && objections.length > 0
                ? <div style={{ display: 'grid', gap: '8px' }}>{objections.slice(0, 4).map((resp, i) =>
                    <div key={i} className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                      <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{resp}</p>
                    </div>
                  )}</div>
                : null
              }
              <div style={{ marginTop: objections.length > 0 ? '14px' : 0 }}>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: '12px' }}>Common hospice objections</strong>
                <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>{objectionLibrary.slice(0, 4).map((obj, i) =>
                  <div key={i} className="hover-card" style={{ padding: '11px', borderRadius: 'var(--radius)', border: '1px solid var(--color-warning)', background: 'rgba(245,158,11,0.06)' }}>
                    <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}><strong>Objection:</strong> {obj.objection}</p>
                    <p className="text-xs" style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}><strong>Response:</strong> {obj.response}</p>
                    <p className="text-xs" style={{ margin: '4px 0 0', color: 'var(--color-info)' }}>→ {obj.returnQuestion}</p>
                  </div>
                )}</div>
              </div>
            </ExpandableSection>

            <ExpandableSection title={approved.length > 0 ? `Approved claims (${approved.length})` : 'No approved claims'} defaultOpen={false}>
              {approved.length > 0
                ? <div style={{ display: 'grid', gap: '6px' }}>{approved.slice(0, 6).map((c, i) =>
                    <div key={i} style={{ padding: '8px', borderRadius: 'var(--radius)', border: '1px solid var(--color-success)', background: 'rgba(34, 197, 94, 0.05)' }}>
                      <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{c.claim}</p>
                      <p className="text-xs" style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)' }}>{c.reason}</p>
                    </div>
                  )}</div>
                : <p className="text-small" style={{ color: 'var(--color-text-tertiary)' }}>No approved claims. Use Claim Governance view to review.</p>
              }
            </ExpandableSection>

            <ExpandableSection title="Pre-call coaching plan" defaultOpen={false}>
              <div className="card" style={{ marginBottom: '12px', background: 'var(--color-bg-secondary)' }}>
                <div className="row spread" style={{ marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px' }}>{plan.competitor}</h4>
                  <Badge>{plan.serviceLine}</Badge>
                </div>
                <div className="notice" style={{ fontSize: '12px' }}>
                  <strong className="text-xs">Safe language</strong><br />{plan.safeLanguage}
                </div>
              </div>
              <SectionGroup title="Pre-Call Plan">
                <div className="card" style={{ background: 'var(--color-bg-secondary)' }}>
                  <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{plan.preCallPlan}</p>
                </div>
              </SectionGroup>
              <div style={{ marginTop: '10px' }}>
                <SectionGroup title="Discovery Questions">
                  <div style={{ display: 'grid', gap: '6px' }}>{plan.discoveryQuestions.map((q, i) =>
                    <div key={i} className="hover-card" style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                      <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{i + 1}. {q}</p>
                    </div>
                  )}</div>
                </SectionGroup>
              </div>
              <div style={{ marginTop: '10px' }}>
                <SectionGroup title="Follow-Up Draft">
                  <div className="card" style={{ background: 'var(--color-bg-secondary)' }}>
                    <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{plan.followUpDraft}</p>
                  </div>
                </SectionGroup>
              </div>
              {plan.doNotSay.length > 0 && <div style={{ marginTop: '10px' }}>
                <strong className="text-xs" style={{ color: 'var(--color-danger)' }}>Do not say</strong>
                <div className="row" style={{ gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>{plan.doNotSay.map((d, i) =>
                  <Badge key={i} tone="red">{d}</Badge>
                )}</div>
              </div>}
            </ExpandableSection>

            <ExpandableSection title="Suggested next step" defaultOpen={false}>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div className="hover-card" style={{ padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-info)', background: 'rgba(6,182,212,0.06)' }}>
                  <p className="text-small" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                    <strong>Next action:</strong> Schedule a conversation to explore {advantages.slice(0, 2).join(' and ').toLowerCase() || 'how Andwell depth aligns with your workflow needs'}.
                  </p>
                  <p className="text-small" style={{ margin: '6px 0 0', color: 'var(--color-text-secondary)' }}>
                    <strong>Owner:</strong> You · <strong>Timing:</strong> This week · <strong>Outcome:</strong> Confirm fit or identify the real barrier
                  </p>
                </div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  <strong style={{ color: 'var(--color-text-primary)', fontSize: '12px' }}>Commitment questions to close with</strong>
                  <div className="hover-card" style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                    <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>What is the best way to start for this patient today?</p>
                  </div>
                  <div className="hover-card" style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                    <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Who needs to be involved on your side to move this forward?</p>
                  </div>
                  <div className="hover-card" style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                    <p className="text-small" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>How do you want updates after the visit so you have clarity?</p>
                  </div>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="Clinical signal reminder" defaultOpen={false}>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginBottom: '10px' }}>When discussing {analysis.name}, listen for these clinical signals to capture a safe handoff:</p>
              <div className="tagCloud" style={{ marginTop: '4px' }}>{clinicalChecklist.map((item) =>
                <span key={item.id} title={item.help} style={{ borderColor: 'var(--color-info)', color: 'var(--color-info)', cursor: 'help' }}>{item.label}</span>
              )}</div>
            </ExpandableSection>

            <ExpandableSection title="Review flags" defaultOpen={analysis.score.needsReview.length > 0}>
              {analysis.score.needsReview.length
                ? <div className="battleSection"><strong>Items needing review</strong><div className="tagCloud" style={{ marginTop: '4px' }}>{analysis.score.needsReview.map((item) => <span key={item} style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>{item}</span>)}</div></div>
                : <p className="text-small" style={{ color: 'var(--color-text-tertiary)' }}>No major review flags</p>
              }
            </ExpandableSection>

            <div className="notice" style={{ fontSize: '13px', marginTop: '8px' }}>
              <strong className="text-small">Field rule</strong><br />{doNotSay.slice(0, 3).join('; ') || safeLang.slice(0, 2).join('; ') || analysis.score.leadWith.slice(0, 2).join('; ') || 'Do not represent competitor capabilities beyond what is publicly confirmed.'}
            </div>
          </div>;
      })}</div>
    }
  </>;
}
