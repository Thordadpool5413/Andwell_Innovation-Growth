'use client';

import React from 'react';
import { Badge } from '../Shared';
import { andwellCatalog } from '../../../lib/andwell';

export function Catalog() {
  return <><section className="section"><div className="row spread"><div><h1>Andwell Catalog</h1><p>Official source of truth for Andwell service positioning, safe language, and field guidance. Every recommendation in this platform traces back to this catalog and claim governance review.</p></div><span className="expert-badge governed">Andwell Expert Layer • Single Source of Truth</span></div></section><div className="grid cols2">{andwellCatalog.map((service) => <div className="catalogCard" key={service.serviceLine}><div className="row spread"><Badge>{service.category}</Badge><span className="expert-badge">Official</span></div><h3>{service.serviceLine}</h3><p>{service.description}</p><div className="tagCloud">{service.subservices.slice(0, 18).map((item) => <span key={item}>{item}</span>)}{service.subservices.length > 18 ? <span>More {service.subservices.length - 18}</span> : null}</div><div className="notice"><strong>Safe language</strong><br />{service.safeLanguage}<div className="provenance" style={{marginTop:6}}>{service.evidence}</div></div><div className="error"><strong>Avoid saying</strong><br />{service.avoid}</div></div>)}</div></>;
}
