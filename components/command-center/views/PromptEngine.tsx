'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Panel } from '../Shared';
import { expertPromptModules, fullCompetitiveIntelligenceInstruction } from '../../../lib/expert-prompts';
import type { PromptModule } from '../../../lib/expert-prompts';

const STORAGE_KEY = 'andwell:promptOverrides';

type Overrides = Record<string, { purpose?: string; instructions?: string; requiredOutput?: string }>;

function loadOverrides(): Overrides {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? (JSON.parse(v) as Overrides) : {};
  } catch { return {}; }
}

function saveOverrides(o: Overrides) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch {}
}

function ModuleCard({ module, override, onSave, onReset }: {
  module: PromptModule;
  override?: Overrides[string];
  onSave: (id: string, patch: Overrides[string]) => void;
  onReset: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [purpose, setPurpose] = useState(override?.purpose ?? module.purpose);
  const [instructions, setInstructions] = useState(override?.instructions ?? module.instructions.join('\n'));
  const [requiredOutput, setRequiredOutput] = useState(override?.requiredOutput ?? module.requiredOutput.join('\n'));

  const isCustomised = !!override;

  function handleSave() {
    onSave(module.id, { purpose, instructions, requiredOutput });
    setEditing(false);
  }

  function handleReset() {
    setPurpose(module.purpose);
    setInstructions(module.instructions.join('\n'));
    setRequiredOutput(module.requiredOutput.join('\n'));
    onReset(module.id);
    setEditing(false);
  }

  const displayPurpose = override?.purpose ?? module.purpose;
  const displayInstructions = override?.instructions ? override.instructions.split('\n').filter(Boolean) : module.instructions;
  const displayOutput = override?.requiredOutput ? override.requiredOutput.split('\n').filter(Boolean) : module.requiredOutput;

  return (
    <div className="promptCard">
      <div className="row spread" style={{ marginBottom: '8px' }}>
        <Badge tone="dark">{module.id}</Badge>
        <div className="row" style={{ gap: '6px' }}>
          {isCustomised && <Badge tone="amber">Customised</Badge>}
          <button className="btn btn-sm" onClick={() => setEditing((v) => !v)}>{editing ? 'Cancel' : 'Edit'}</button>
          {isCustomised && !editing && <button className="btn btn-sm" style={{ color: 'var(--color-text-tertiary)' }} onClick={handleReset}>Reset</button>}
        </div>
      </div>
      <h3>{module.title}</h3>

      {editing ? (
        <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
          <label>
            <span className="text-xs" style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Purpose</span>
            <textarea className="textarea" value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} />
          </label>
          <label>
            <span className="text-xs" style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Instructions (one per line)</span>
            <textarea className="textarea" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={6} style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} />
          </label>
          <label>
            <span className="text-xs" style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Required output (one per line)</span>
            <textarea className="textarea" value={requiredOutput} onChange={(e) => setRequiredOutput(e.target.value)} rows={4} style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} />
          </label>
          <div className="row" style={{ gap: '8px' }}>
            <button className="btn primary btn-sm" onClick={handleSave}>Save override</button>
            <button className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            {isCustomised && <button className="btn btn-sm" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleReset}>Reset to default</button>}
          </div>
        </div>
      ) : (
        <>
          <p>{displayPurpose}</p>
          <div className="promptBlock">
            <strong>Instructions</strong>
            {displayInstructions.map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="promptBlock output">
            <strong>Required output</strong>
            {displayOutput.map((item) => <span key={item}>{item}</span>)}
          </div>
        </>
      )}
    </div>
  );
}

export function PromptEngine() {
  const [overrides, setOverrides] = useState<Overrides>({});

  useEffect(() => {
    setOverrides(loadOverrides());
  }, []);

  function handleSave(id: string, patch: Overrides[string]) {
    const next = { ...overrides, [id]: patch };
    setOverrides(next);
    saveOverrides(next);
  }

  function handleReset(id: string) {
    const next = { ...overrides };
    delete next[id];
    setOverrides(next);
    saveOverrides(next);
  }

  const customCount = Object.keys(overrides).length;

  return (
    <>
      <section className="section">
        <div>
          <h1>Methodology</h1>
          <p>The governed instruction layer for healthcare competitive intelligence, service extraction, sales positioning, and review governance.</p>
        </div>
        <div className="row" style={{ gap: '8px' }}>
          <Badge tone="blue">Governed intelligence</Badge>
          {customCount > 0 && <Badge tone="amber">{customCount} customised</Badge>}
        </div>
      </section>
      <Panel title="Master Intelligence Instruction" className="featurePanel">
        <p>{fullCompetitiveIntelligenceInstruction}</p>
      </Panel>
      <div className="grid cols2">
        {expertPromptModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            override={overrides[module.id]}
            onSave={handleSave}
            onReset={handleReset}
          />
        ))}
      </div>
    </>
  );
}
