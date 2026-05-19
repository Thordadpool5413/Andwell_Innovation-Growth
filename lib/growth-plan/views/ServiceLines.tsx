'use client';

import React from "react";
import Card from "../components/Card";
import ServiceBadge from "../components/ServiceBadge";
import { useDarkMode } from "../components/DarkModeContext";
import services from "../data/services";
import { currency, percent } from "../utils/formatters";

export default function ServiceLines() {
  const { dark } = useDarkMode();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Object.entries(services).map(([service, meta]) => (
        <Card key={service} title={service} eyebrow={meta.role}>
          <div className="space-y-3">
            <ServiceBadge service={service} />
            <p className={`text-sm leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}>Modeled reimbursement: {meta.reimbursement ? currency(meta.reimbursement) : "Validation only"}</p>
            <p className={`text-sm leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}>Margin: {meta.margin ? percent(meta.margin) : "Validate"}</p>
            <p className={`text-sm leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}>Unit: {meta.unit}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
