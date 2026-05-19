"use client"

import { DollarSign, Users, Calendar, MapPin } from "lucide-react"
import { mockScenarios, maineCounties } from "@/lib/data"

export default function GrowthCommandPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Growth Command</h2>
        <p className="text-zinc-500 text-sm mt-1">Maine county demand modeling, service-line opportunity, and launch sequencing</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Maine County Profile</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-800">
              <th className="pb-3 font-medium">County</th>
              <th className="pb-3 font-medium">Population</th>
              <th className="pb-3 font-medium">% 65+</th>
              <th className="pb-3 font-medium">% Rural</th>
              <th className="pb-3 font-medium">Home Health Demand</th>
              <th className="pb-3 font-medium">Agencies</th>
              <th className="pb-3 font-medium">Priority</th>
            </tr>
          </thead>
          <tbody>
            {maineCounties.map((c) => (
              <tr key={c.name} className="border-b border-zinc-800 last:border-0 text-zinc-300">
                <td className="py-3 font-medium">{c.name}</td>
                <td className="py-3">{c.population.toLocaleString()}</td>
                <td className="py-3">{c.over65Percent}%</td>
                <td className="py-3">{c.ruralPercent}%</td>
                <td className="py-3">{c.homeHealthAgencies} agencies</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className={`h-full rounded-full ${
                        c.ruralPercent >= 75 ? "bg-red-500" : c.ruralPercent >= 50 ? "bg-amber-500" : "bg-green-500"
                      }`} style={{ width: `${c.ruralPercent}%` }} />
                    </div>
                    <span className="text-xs">{c.ruralPercent}%</span>
                  </div>
                </td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.over65Percent >= 25 ? "bg-amber-900 text-amber-300" : "bg-blue-900 text-blue-300"
                  }`}>
                    {c.over65Percent >= 25 ? "High need" : "Growing"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mockScenarios.map((s) => (
          <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-3">{s.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-green-400" />
                  <span>Revenue</span>
                </div>
                <span className="text-white font-medium">${(s.projectedRevenue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Staffing</span>
                </div>
                <span className="text-white font-medium">{s.staffingRequired}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timeline</span>
                </div>
                <span className="text-white font-medium">{s.timelineMonths}mo</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Confidence</span>
                <span className={s.confidence >= 75 ? "text-green-400" : "text-amber-400"}>{s.confidence}%</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="flex items-start gap-1.5 text-xs text-zinc-600">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{s.counties.join(", ")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
