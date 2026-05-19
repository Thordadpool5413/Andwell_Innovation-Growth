import { NextRequest, NextResponse } from "next/server"
import { crawlUrl } from "@/lib/crawler"
import { store } from "@/lib/store"

export async function POST(req: NextRequest) {
  try {
    const { url, competitorId } = await req.json()
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 })

    const { result, findings } = await crawlUrl(url, competitorId)

    for (const f of findings) {
      const existing = store.getFindings()
      const newFinding = {
        id: `crawl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        competitorId: competitorId || "",
        serviceId: f.serviceId,
        subServiceId: "",
        evidence: f.snippet,
        source: f.source,
        date: new Date().toISOString().split("T")[0],
        confidence: "likely" as const,
        reviewStatus: "pending" as const,
      }
      store.saveFindings([newFinding, ...existing])
    }

    return NextResponse.json({ crawl: result })
  } catch (err) {
    console.error("Crawl error:", err)
    return NextResponse.json({ error: "Crawl failed" }, { status: 500 })
  }
}
