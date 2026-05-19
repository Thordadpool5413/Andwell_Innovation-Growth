"use client"

import { useState } from "react"
import { BarChart3, Crosshair, TrendingUp, Building2, Rocket, Activity } from "lucide-react"
import { mockCompetitors, maineOverview } from "@/lib/data"

export default function DashboardPage() {
  const [maineData] = useState(maineOverview)
  const stats = [
    { label: "Maine Competitors Tracked", value: `${mockCompetitors.length}`, change: "All with Maine presence", icon: Crosshair, color: "text-blue-400" },
    { label: "Avg Win Rate", value: "59%", change: "Across all Maine competitors", icon: BarChart3, color: "text-green-400" },
    { label: "Unserved Rural Patients", value: "12,400+", change: "Addressable in 6 priority counties", icon: TrendingUp, color: "text-purple-400" },
    { label: "Maine Counties Covered", value: "16/16", change: "Full state coverage", icon: Building2, color: "text-amber-400" },
    { label: "Growth Pipeline", value: "$9.2M", change: "4 active expansion scenarios", icon: Rocket, color: "text-cyan-400" },
    { label: "System Health", value: "All OK", change: "8/8 API services", icon: Activity, color: "text-emerald-400" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Andwell Command Center</h2>
          <p className="text-zinc-500 text-sm mt-1">Maine-focused competitive intelligence and growth planning</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm">
          <span className="text-zinc-500">Maine Market</span>
          <span className="text-white ml-2 font-semibold">{maineData.population.toLocaleString()} residents</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-xs text-zinc-600">Maine</span>
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-zinc-500 mt-1">{s.label}</div>
              <div className="text-xs text-zinc-600 mt-2">{s.change}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-3">Maine Intelligence Feed</h3>
          <div className="space-y-3">
            {[
              { title: "Amedisys entering Maine market", source: "Investor Day", time: "Today", priority: "high" },
              { title: "MaineHealth wound pilot in 5 coastal counties", source: "Press Release", time: "1d ago", priority: "high" },
              { title: "Northern Light expands telehealth in Aroostook", source: "Annual Report", time: "2d ago", priority: "medium" },
              { title: "Gentiva restructures Maine operations", source: "Internal", time: "3d ago", priority: "medium" },
              { title: "CMS releases Maine home health star ratings", source: "CMS Data", time: "5d ago", priority: "low" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-zinc-800 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  item.priority === "high" ? "bg-red-500" : item.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                }`} />
                <div className="min-w-0">
                  <p className="text-sm text-zinc-300 truncate">{item.title}</p>
                  <p className="text-xs text-zinc-600">{item.source} · {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-3">Maine Demographics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Population 65+</span>
              <span className="text-sm text-white font-medium">{maineData.over65Percent}%</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Rural Population</span>
              <span className="text-sm text-white font-medium">{maineData.ruralPercent}%</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Home Health Patients/yr</span>
              <span className="text-sm text-white font-medium">{maineData.homeHealthPatients.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Unserved Rural Need</span>
              <span className="text-sm text-white font-medium">{maineData.unservedRuralPatients.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">State Agencies</span>
              <span className="text-sm text-white font-medium">{maineData.stateAgencies}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
