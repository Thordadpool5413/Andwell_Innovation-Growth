'use client';

import React, { useState, useMemo } from 'react';
import { Badge, Panel, ConfidenceBadge, SectionGroup } from '../Shared';
import { toneForStatus } from '../../../lib/command-center/utils';
import { getAskTemplatesForRole, getCategories, getTemplatesByCategory } from '../../../lib/ask-hub-templates';
import type { AskResponse } from '../../../lib/command-center/types';
import type { RoleView } from '../../../lib/command-center/types';
import type { IntelligenceReport } from '../../../lib/types';

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
        <button className="btn primary" disabled={busy || !question.trim()} onClick={askHub}>
          {busy ? 'Thinking…' : 'Ask the Hub'}
        </button>
        <button className="btn" onClick={() => setShowTemplates(!showTemplates)} style={{ fontSize: '13px', padding: '8px 14px' }}>
          {showTemplates ? 'Hide' : 'Show'} Templates
        </button>
        {!currentReport && <span className="text-small" style={{ color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>Run a competitor scan first to load intelligence data.</span>}
      </div>
    </Panel>

    {askResponse && (
      <section className="hero answerHero">
        <div className="row spread" style={{ marginBottom: '12px' }}>
          <div className="row" style={{ gap: '8px', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Answer</h2>
            {askResponse.source === 'ai' && <Badge tone="green">AI synthesized</Badge>}
            {askResponse.source === 'template' && <Badge tone="dark">Template (add OpenAI key for AI)</Badge>}
          </div>
          <Badge tone={toneForStatus(askResponse.confidence)}>{askResponse.confidence}</Badge>
        </div>
        <p style={{ margin: '0 0 12px', lineHeight: 1.75, fontSize: '15px' }}>{askResponse.answer}</p>
        {askResponse.questionTerms?.length ? (
          <div className="tagCloud lightTags">
            {askResponse.questionTerms.map((term) => <span key={term}>{term}</span>)}
          </div>
        ) : null}
      </section>
    )}

    {askResponse?.nextBestActions?.length ? (
      <SectionGroup title="Recommended next moves">
        <div className="briefList">
          {askResponse.nextBestActions.map((action, i) => (
            <div className="briefItem hover-card" key={i} style={{ padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Badge tone="blue">Action</Badge>
              <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>{action}</span>
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
