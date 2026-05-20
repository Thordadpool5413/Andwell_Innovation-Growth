'use client';

import React from 'react';
import type { RoleView } from '../../../lib/command-center/types';

const systemNodes = [
  { label: 'High-Acuity Care', className: 'nodeIntake' },
  { label: 'Partnerships', className: 'nodeReports' },
  { label: 'Market Intel', className: 'nodeMarket' },
  { label: 'Growth', className: 'nodeGrowth' },
  { label: 'Technology', className: 'nodeField' },
  { label: 'Board', className: 'nodeBoard' },
  { label: 'Value-Based', className: 'nodeOps' }
];

const strategicPillars = [
  {
    title: 'High-acuity community care',
    body: 'Build care models capable of supporting complex patients in the community instead of defaulting to institutional settings.'
  },
  {
    title: 'Post-acute partnerships',
    body: 'Create partnerships across Maine that make Andwell essential to hospitals, payers, providers, referral sources, and families.'
  },
  {
    title: 'Connected complex services',
    body: 'Use technology and operating discipline to connect services that are difficult to coordinate manually.'
  },
  {
    title: 'Value-based contracting',
    body: 'Develop the model to take risk, improve outcomes, save payers money, and grow from the complexity Andwell is built to manage.'
  }
];

const commandRoles = [
  {
    title: 'Market Intelligence',
    body: 'Understand where Andwell should compete, which markets are underdeveloped, and where external signals support action.'
  },
  {
    title: 'Growth Strategy',
    body: 'Model county, service-line, revenue, referral, staffing, and launch-readiness assumptions before committing resources.'
  },
  {
    title: 'Field Enablement',
    body: 'Translate strategy into governed referral language, battlecards, coaching, and safe positioning for the field.'
  },
  {
    title: 'Board-Ready Decisions',
    body: 'Convert intelligence and growth logic into leadership-ready recommendations, risks, and decision framing.'
  }
];

const trustPillars = [
  { title: 'Evidence-backed', body: 'Recommendations are grounded in report evidence, market data, growth assumptions, and Andwell service logic.' },
  { title: 'Governed language', body: 'Field-facing language is separated from internal planning assumptions and routed through claim governance.' },
  { title: 'Risk-aware', body: 'Staffing, launch readiness, review items, and competitive pressure are surfaced before action is taken.' },
  { title: 'Built for complexity', body: 'The system supports Andwell because the strategy depends on managing what fragmented providers cannot.' }
];

export function Home({ roleView: _roleView }: { roleView?: RoleView }) {
  return <article className="homeExperience missionHome">
    <section className="homeHeroStage missionHero">
      <div className="homeHeroCopy missionCopy">
        <p className="homeOverline">Andwell Innovation &amp; Growth</p>
        <h1>Innovation and Growth is where Andwell Health Partners <strong>turns vision into infrastructure.</strong></h1>
        <p className="homeHeroLead">We are building the <strong>future of high acuity community care</strong>, creating post acute partnerships that make us essential to Maine, connecting complex services through technology, and developing the <strong>value based contracting model</strong> that allows us to take risk, deliver better outcomes, save payers money, and grow because we are <strong>built for the complexity others cannot manage.</strong></p>
      </div>
      <div className="homeSystemMap missionSystemMap" aria-label="Andwell Innovation Command system map">
        <div className="homeMapGrid" />
        <div className="homeOrbit orbitOuter" />
        <div className="homeOrbit orbitInner" />
        <div className="homeOrbit orbitMiddle" />
        <div className="homeConnector connectTop" />
        <div className="homeConnector connectUpperLeft" />
        <div className="homeConnector connectUpperRight" />
        <div className="homeConnector connectLeft" />
        <div className="homeConnector connectRight" />
        <div className="homeConnector connectLowerLeft" />
        <div className="homeConnector connectLowerRight" />
        <div className="homeCore"><strong>AIC</strong></div>
        {systemNodes.map((node) => <div key={node.label} className={`homeMapNode ${node.className}`}>{node.label}</div>)}
      </div>
    </section>

    <section className="missionStatementBand">
      <p className="homeOverline">Strategic Thesis</p>
      <h2>Andwell grows by building the infrastructure required to manage complex care in the community.</h2>
      <p>The Command Center exists to turn that strategy into operating intelligence: where to grow, how to partner, what capacity is required, what language is safe, and what decisions leaders need to make.</p>
    </section>

    <section className="missionPillars">
      <div className="homeSectionHead compact">
        <p className="homeOverline">Strategic Pillars</p>
        <h2>The strategic pillars behind Innovation and Growth.</h2>
      </div>
      <div className="missionPillarGrid">
        {strategicPillars.map((pillar, index) => <div key={pillar.title}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <h3>{pillar.title}</h3>
          <p>{pillar.body}</p>
        </div>)}
      </div>
    </section>

    <section className="missionCommandRole">
      <div className="homeSectionHead compact">
        <p className="homeOverline">Role of the Command Center</p>
        <h2>How the Command Center operationalizes the strategy.</h2>
      </div>
      <div className="missionRoleRows">
        {commandRoles.map((role) => <div key={role.title}>
          <h3>{role.title}</h3>
          <p>{role.body}</p>
        </div>)}
      </div>
    </section>

    <section className="homeTrustPillars missionTrust">
      <div className="homeSectionHead compact">
        <p className="homeOverline">Trust Model</p>
        <h2>Strategic ambition still needs evidence, governance, and operational realism.</h2>
      </div>
      <div className="homeTrustGrid">
        {trustPillars.map((pillar) => <div key={pillar.title}>
          <h3>{pillar.title}</h3>
          <p>{pillar.body}</p>
        </div>)}
      </div>
    </section>
  </article>;
}
