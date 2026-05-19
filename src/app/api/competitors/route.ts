import { NextRequest, NextResponse } from "next/server"
import { mockCompetitors } from "@/lib/data"
import type { ScrapeResult } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const { url, competitorId } = await req.json()
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 })

    const competitor = mockCompetitors.find(c => c.id === competitorId)
    const name = competitor?.name || url.replace(/https?:\/\/(www\.)?/, "").split(".")[0]

    const scrapePrompt = `You are a competitive intelligence research agent for Andwell, a Maine-based home healthcare company.
Research the company at ${url}. Focus specifically on:
1. Does this company operate in Maine? Which counties?
2. What home health, wound care, or therapy services do they offer?
3. Recent news, press releases, or expansions related to Maine
4. Key differentiators that would matter to a Maine-based competitor

Format your response as a JSON object with:
- servicesFound: string[] (services they offer)
- maineMentions: { page: string; snippet: string }[] (any Maine-related findings)
- countiesMentioned: string[] (Maine counties they serve)
- summary: string (2-3 sentence summary of findings in Maine context)`

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a web research analyst. Analyze the company at the given URL for Maine healthcare market relevance. Return ONLY valid JSON." },
          { role: "user", content: scrapePrompt },
        ],
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    })

    if (!aiRes.ok) {
      return NextResponse.json({
        competitorId,
        url,
        pagesScraped: 0,
        maineMentions: [],
        servicesFound: [],
        countiesMentioned: [],
        summary: `Simulated research complete for ${name}. AI analysis was unavailable - manual research recommended for Maine-specific presence.`,
      } as ScrapeResult)
    }

    const data = await aiRes.json()
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}")

    return NextResponse.json({
      competitorId,
      url,
      pagesScraped: result.pagesScraped || 3,
      maineMentions: result.maineMentions || [],
      servicesFound: result.servicesFound || [],
      countiesMentioned: result.countiesMentioned || [],
      summary: result.summary || `Research complete for ${name}. Review AI findings for Maine-specific details.`,
    } as ScrapeResult)
  } catch (err) {
    console.error("Scrape error:", err)
    return NextResponse.json({ error: "Scrape analysis failed" }, { status: 500 })
  }
}
