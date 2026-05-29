'use client';

import React from 'react';
import { Badge, Panel, SectionGroup, TrustPanel } from '../Shared';
import React, { useState, useMemo } from 'react';
import { Badge, Panel, ConfidenceBadge, SectionGroup } from '../Shared';
import { toneForStatus } from '../../../lib/command-center/utils';
import { getAskTemplatesForRole, getCategories, getTemplatesByCategory } from '../../../lib/ask-hub-templates';
import type { AskResponse } from '../../../lib/command-center/types';
import type { RoleView } from '../../../lib/command-center/types';
import type { IntelligenceReport } from '../../../lib/types';

const questionBanks = [
  {
    group: 'Executive',
    questions: [
      'What is the single most important decision leadership should make from the current Maine intelligence?',
      'Which competitor creates the highest strategic risk for Andwell, and what should we do next?',
      'What is ready for a board packet and what still needs evidence?',
    ],
  },
  {
    group: 'Growth',
    questions: [
      'Which Maine counties should Andwell prioritize first, and why?',
      'Where does the growth model show revenue upside but staffing risk?',
      'Which service line has the best three-year growth case in Maine?',
    ],
  },
  {
    group: 'Sales',
    questions: [
      'What should a sales leader coach before a referral source call?',
      'What safe language should we use against the most relevant competitor?',
      'Which referral source type should we target first for this opportunity?',
    ],
  },
  {
    group: 'Evidence',
    questions: [
      'What public evidence was used for the answer, and what is AI interpretation?',
      'Which findings are not found publicly versus confirmed competitor services?',
      'What should the field team avoid saying?',
    ],
  },
];

export function AskHub({ question, setQuestion, askHub, askResponse, busy, currentReport, hasGrowthPlan }: { question: string; setQuestion: (value: string) => void; askHub: (questionOverride?: string) => void | Promise<void>; askResponse: AskResponse | null; busy: boolean; currentReport: IntelligenceReport | null; hasGrowthPlan?: boolean }) {
export function AskHub({ question, setQuestion, askHub, askResponse, busy, currentReport, hasGrowthPlan, roleView = 'Executive' }: { question: string; setQuestion: (value: string) => void; askHub: () => void; askResponse: AskResponse | null; busy: boolean; currentReport: IntelligenceReport | null; hasGrowthPlan?: boolean; roleView?: RoleView }) {
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const templates = useMemo(() => getAskTemplatesForRole(roleView), [roleView]);
  const categories = useMemo(() => getCategories(roleView), [roleView]);

  if (!selectedCategory && categories.length > 0) {
    setSelectedCategory(categories[0]);
  }

  const selectedTemplates = useMemo(() => {
    return selectedCategory ? getTemplatesByCategory(roleView, selectedCategory) : templates;
  }, [roleView, selectedCategory, templates]);

  const applyTemplate = (templateQuestion: string) => {
    setQuestion(templateQuestion);
    setShowTemplates(false);
  };

  return <>
    <section className="section">
      <div>
        <h1>Ask the Hub</h1>
        <p className="text-body">Ask plain English questions against competitive intelligence and your growth plan. Get ranked evidence, safe language, and recommended next moves.</p>
      </div>
      <div className="row" style={{ gap: '6px' }}>
        {hasGrowthPlan && <Badge tone="green">Growth plan connected</Badge>}
        <Badge tone={currentReport ? 'green' : 'amber'}>{currentReport ? 'Report loaded' : 'No report loaded'}</Badge>
      </div>
    </section>

    <section className="askPromptLibrary">
      <div>
        <span className="text-overline">Questions to start from</span>
        <h2>Ask from a role or a task</h2>
        <p className="text-body">Use these prebuilt questions to get expert answers from the stored Maine intelligence, growth model, and source-backed evidence.</p>
      </div>
      <div className="askPromptGrid">
        {questionBanks.map((bank) => (
          <article key={bank.group}>
            <h3>{bank.group}</h3>
            <div>
              {bank.questions.map((prompt) => (
                <button
                  key={prompt}
                  className="askPromptButton"
                  disabled={busy}
                  onClick={() => askHub(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
    {showTemplates && (
      <Panel title={`${roleView} Question Templates`}>
        <div className="row" style={{ gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn ${selectedCategory === cat ? 'primary' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid cols1" style={{ gap: '12px' }}>
          {selectedTemplates.map((template, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(template.question)}
              style={{
                textAlign: 'left',
                padding: '16px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-info)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{template.question}</p>
              {template.hint && <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-tertiary)' }}>💡 {template.hint}</p>}
            </button>
          ))}
        </div>
      </Panel>
    )}

    <Panel title="Ask a competitive question">
      <textarea
        className="textarea largeInput"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="What should I lead with against this competitor? Which counties are our best Y1 opportunity? Where is Andwell differentiated in wound care?"
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && question.trim()) askHub(); }}
      />
      <div className="row" style={{ marginTop: '8px', gap: '8px' }}>
        <button className="btn primary" disabled={busy || !question.trim()} onClick={() => askHub()}>
          {busy ? 'Thinking…' : 'Ask the Hub'}
        </button>
        <button className="btn" onClick={() => setShowTemplates(!showTemplates)} style={{ fontSize: '13px', padding: '8px 14px' }}>
          {showTemplates ? 'Hide' : 'Show'} Templates
        </button>
        {!currentReport && <span className="text-small" style={{ color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>Run a competitor scan first to load intelligence data.</span>}
      </div>
    </Panel>

    {askResponse && (
      <section className="askAnswerLayout">
        <div className="askAnswerMain">
          <div className="answerBlock direct">
            <div className="row spread" style={{ marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>Direct answer</h2>
              <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
                {askResponse.source === 'ai' && <Badge tone="green">AI synthesized</Badge>}
                {askResponse.source === 'template' && <Badge tone="dark">Template</Badge>}
                <Badge tone={toneForStatus(askResponse.confidence)}>{askResponse.confidence}</Badge>
              </div>
            </div>
            <p>{askResponse.answer}</p>
            {askResponse.questionTerms?.length ? (
              <div className="tagCloud lightTags">
                {askResponse.questionTerms.map((term) => <span key={term}>{term}</span>)}
              </div>
            ) : null}
          </div>
          <div className="askSections">
            <article className="answerBlock">
              <h3>Confidence explanation</h3>
              <p>{askResponse.trustMetadata?.warnings?.length ? askResponse.trustMetadata.warnings.join(' ') : `${askResponse.trustMetadata?.sourceCount ?? 0} sources were used with ${askResponse.trustMetadata?.reviewStatus || 'no review status'} review status.`}</p>
            </article>
            <article className="answerBlock">
              <h3>Safe language</h3>
              <p>{askResponse.evidence?.find((item) => item.safeSalesWording)?.safeSalesWording || 'Use evidence-based language and avoid definitive competitor absence claims unless approved.'}</p>
            </article>
            <article className="answerBlock guardrail">
              <h3>Do-not-say guardrail</h3>
              <p>{askResponse.evidence?.find((item) => item.avoidSaying)?.avoidSaying || 'Do not say a competitor does not offer a service when the system only found that it was not visible in reviewed public pages.'}</p>
            </article>
          </div>
        </div>
        <TrustPanel metadata={askResponse.trustMetadata} />
      </section>
    )}

    {askResponse?.nextBestActions?.length ? (
      <SectionGroup title="Recommended next actions">
        <div className="decisionStack compact">
          {askResponse.nextBestActions.map((action, i) => (
            <div className="decisionStackItem" key={i}>
              <div className="decisionRank">{i + 1}</div>
              <div>
                <h3>Next move</h3>
                <p>{action}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionGroup>
    ) : null}

    {askResponse?.evidence?.length ? (
      <SectionGroup title={`Ranked evidence (${askResponse.evidence.length} items)`}>
        <div className="grid cols2">
          {askResponse.evidence.slice(0, 8).map((item, index) => (
            <div className="evidenceCard hover-card" key={`${item.competitorName}${item.serviceLine}${item.subservice}${index}`} style={{ padding: '16px' }}>
              <div className="row spread" style={{ marginBottom: '6px' }}>
                <Badge tone="dark">Score {item.smartScore || 0}</Badge>
                <Badge tone={toneForStatus(item.status)}>{item.status}</Badge>
              </div>
              <h3 className="text-subhead" style={{ margin: '0 0 4px' }}>{item.competitorName}</h3>
              <p className="text-small" style={{ margin: '0 0 4px' }}>
                <strong>{item.serviceLine}</strong>{item.subservice ? ` | ${item.subservice}` : ''}
              </p>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>{item.evidenceExcerpt}</p>
              <div className="notice" style={{ fontSize: '12px', padding: '8px', marginTop: '6px' }}>
                <strong>Safe wording</strong><br />{item.safeSalesWording}
              </div>
              {item.avoidSaying ? (
                <div className="notice danger-soft" style={{ fontSize: '12px', padding: '8px', marginTop: '6px' }}>
                  <strong>Do not say</strong><br />{item.avoidSaying}
                </div>
              ) : null}
              {item.recommendedAction ? (
                <div className="success" style={{ fontSize: '12px', padding: '8px', marginTop: '6px' }}>
                  <strong>Action</strong><br />{item.recommendedAction}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </SectionGroup>
    ) : null}
  </>;
}
