"use client"

import { useState } from "react"
import { Search, ExternalLink, Star, MapPin } from "lucide-react"
import { mockEvidence, mockCompetitors } from "@/lib/data"

export default function EvidenceMatrixPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [maineOnly, setMaineOnly] = useState(false)

  const filtered = mockEvidence.filter((e) => {
    const matchSearch = e.snippet.toLowerCase().includes(search.toLowerCase()) || e.source.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || e.competitorId === filter
    const matchMaine = !maineOnly || e.maineRelevance
    return matchSearch && matchFilter && matchMaine
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Evidence Matrix</h2>
        <p className="text-zinc-500 text-sm mt-1">Structured Maine market intelligence from competitor monitoring</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evidence..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Competitors</option>
          {mockCompetitors.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={maineOnly}
            onChange={(e) => setMaineOnly(e.target.checked)}
            className="rounded border-zinc-600"
          />
          <span className="text-zinc-400">Maine only</span>
          <MapPin className="w-3 h-3 text-blue-400" />
        </label>
      </div>
      <div className="space-y-3">
        {filtered.map((ev) => {
          const comp = mockCompetitors.find((c) => c.id === ev.competitorId)
          return (
            <div key={ev.id} className={`bg-zinc-900 border rounded-xl p-5 ${ev.maineRelevance ? "border-blue-900" : "border-zinc-800"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{comp?.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">{ev.source}</span>
                  {ev.maineRelevance && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">Maine</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs">{ev.relevance}/10</span>
                </div>
              </div>
              <p className="text-sm text-zinc-300">{ev.snippet}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-zinc-600">
                <span>{ev.date}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-zinc-600">{filtered.length} of {mockEvidence.length} evidence items</p>
    </div>
  )
}
