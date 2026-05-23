'use client';

import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { useDarkMode } from "../components/DarkModeContext";
import { launchPlanData as launchPlan } from "../data/launchPlan";

const groupTone = (g: string) => g === "Priority 1" ? "red" : g === "Priority 2" ? "amber" : "blue";
const STORAGE_KEY = 'andwell:launchChecklist';

export default function LaunchChecklist() {
  const { dark } = useDarkMode();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(new Set(JSON.parse(saved) as string[]));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked])); } catch {}
  }, [checked]);

  function toggle(key: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const groups = [...new Set(launchPlan.map((item) => item.launchGroup))];
  const total = launchPlan.length;
  const doneCount = launchPlan.filter(item => checked.has(`${item.county}-${item.service}`)).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className={`rounded-3xl border p-5 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>Launch markets</p>
            <p className={`text-3xl font-black ${dark ? "text-white" : "text-slate-950"}`}>{total} counties planned</p>
          </div>
          <div className={`text-sm font-black ${dark ? "text-blue-400" : "text-blue-700"}`}>
            {groups.length} priority groups
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <p className={`text-xs font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>Progress</p>
            <p className={`text-xs font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>{doneCount} / {total} completed ({pct}%)</p>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b' }}
            />
          </div>
        </div>
      </div>

      {groups.map((group) => (
        <Card key={group} title={group} eyebrow="Launch group">
          <div className="space-y-3">
            {launchPlan.filter((item) => item.launchGroup === group).map((item) => {
              const key = `${item.county}-${item.service}`;
              const done = checked.has(key);
              return (
                <div
                  key={key}
                  className={`flex items-start justify-between gap-4 rounded-2xl border p-4 cursor-pointer transition-colors ${
                    done
                      ? dark ? "border-emerald-700 bg-emerald-900/20" : "border-emerald-200 bg-emerald-50"
                      : dark ? "border-slate-700 bg-slate-700/30" : "border-slate-100 bg-slate-50"
                  }`}
                  onClick={() => toggle(key)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      done
                        ? "border-emerald-500 bg-emerald-500"
                        : dark ? "border-slate-500" : "border-slate-300"
                    }`}>
                      {done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="flex-1">
                      <p className={`font-black ${done ? "line-through opacity-60" : ""} ${dark ? "text-white" : "text-slate-950"}`}>{item.county} — {item.service}</p>
                      <p className={`mt-1 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{item.action}</p>
                    </div>
                  </div>
                  <Badge tone={groupTone(group)}>{group}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
