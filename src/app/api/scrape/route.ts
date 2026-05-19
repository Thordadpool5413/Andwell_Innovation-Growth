import { NextRequest, NextResponse } from "next/server"
import { cmsScraper } from "@/lib/scrapers/cms"
import { dhhsScraper } from "@/lib/scrapers/dhhs"
import { scheduler } from "@/lib/scraper-scheduler"

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json()

    if (!source || source === "cms") {
      const findings = await cmsScraper.scrape()
      if (!source) {
        const dhhsFindings = await dhhsScraper.scrape()
        return NextResponse.json({
          message: "All sources scraped successfully",
          cmsFindings: findings.length,
          dhhsFindings: dhhsFindings.length,
        })
      }
      return NextResponse.json({ message: "CMS data scraped", findings: findings.length })
    }

    if (source === "dhhs") {
      const findings = await dhhsScraper.scrape()
      return NextResponse.json({ message: "DHHS data scraped", findings: findings.length })
    }

    return NextResponse.json({ error: "Unknown source. Use 'cms', 'dhhs', or omit for all." }, { status: 400 })
  } catch (err) {
    console.error("Scrape error:", err)
    return NextResponse.json({ error: "Scrape failed" }, { status: 500 })
  }
}

export async function GET() {
  const jobs = scheduler.getJobs()
  return NextResponse.json({ scheduler: jobs })
}
