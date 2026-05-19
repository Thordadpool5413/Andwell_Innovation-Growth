import { NextRequest, NextResponse } from "next/server"
import { retrieveRelevant, buildContextFromDocs, extractSources } from "@/lib/rag"

const SYSTEM_PROMPT = `You are Andwell's competitive intelligence analyst for Maine's home healthcare market.
Answer using ONLY the intelligence data provided below. Never fabricate information.
Use "Not found publicly" when the data doesn't support a claim.
Be specific — mention competitor names, Maine counties, and data points when available.
Andwell covers all 16 Maine counties with Home Healthcare, Mobile Wound Care, and Therapy Care.`

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query) return NextResponse.json({ answer: "Please provide a question." })

    const relevant = await retrieveRelevant(query)
    const context = buildContextFromDocs(relevant)
    const sources = extractSources(relevant)

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      const answer = context
        ? `Based on stored intelligence:\n\n${context}\n\nSet OPENAI_API_KEY for AI-powered analysis.`
        : "No relevant intelligence found for your question. Try asking about a specific competitor (Northern Light, MaineHealth, Gentiva, Amedisys), a Maine county, or a service line."
      return NextResponse.json({ answer, sources })
    }

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `## Intelligence Data\n${context || "No specific data found."}\n\n## Question\n${query}\n\nAnswer based on the intelligence data above. Use "Not found publicly" for unsupported claims. Cite specific competitors and counties.`,
        },
      ],
      max_tokens: 800,
      temperature: 0.2,
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return NextResponse.json({
        answer: context
          ? `Based on stored intelligence:\n\n${context}`
          : "No relevant intelligence found. Try a different question.",
        sources,
      })
    }

    const data = await res.json()
    return NextResponse.json({
      answer: data.choices?.[0]?.message?.content || "Analysis complete.",
      sources,
    })
  } catch {
    return NextResponse.json({ answer: "Analysis unavailable. Using stored intelligence.", sources: [] })
  }
}
