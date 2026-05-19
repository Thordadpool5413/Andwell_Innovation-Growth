import { store } from "./store"
import { RagDocument } from "./types"

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean)
}

function tfidfVector(tokens: string[], allTerms: string[]): number[] {
  const freq: Record<string, number> = {}
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1
  return allTerms.map(t => (freq[t] || 0) / tokens.length)
}

let documents: RagDocument[] = []
let allTerms: string[] = []

function buildDocuments(): RagDocument[] {
  const docs: RagDocument[] = []
  const seen = new Set<string>()

  const findings = store.getFindings()
  for (const f of findings) {
    const key = `find-${f.id}`
    if (seen.has(key)) continue
    seen.add(key)
    const comp = store.getCompetitors().find(c => c.id === f.competitorId)
    docs.push({
      id: key, content: f.evidence,
      source: f.source,
      competitorId: f.competitorId, competitorName: comp?.name,
      date: f.date, type: "evidence",
    })
  }

  const battlecards = store.getBattlecards()
  for (const b of battlecards) {
    const key = `bc-${b.competitorId}`
    if (seen.has(key)) continue
    seen.add(key)
    docs.push({
      id: key,
      content: `${b.competitorName}: ${b.leadWith.join(". ")}. Safe wording: ${b.safeWording.join(". ")}. Win rate: ${b.winRate}%, Maine share: ${b.maineMarketShare}%`,
      source: `Battlecard for ${b.competitorName}`,
      competitorId: b.competitorId, competitorName: b.competitorName,
      type: "battlecard",
    })
  }

  const competitors = store.getCompetitors()
  for (const c of competitors) {
    const key = `comp-${c.id}`
    if (seen.has(key)) continue
    seen.add(key)
    docs.push({
      id: key,
      content: `${c.name}: Maine presence in ${c.maineCounties?.join(", ") || "unknown counties"}. Threat level: ${c.threatLevel}. Status: ${c.status}`,
      source: c.website || "Competitor profile",
      competitorId: c.id, competitorName: c.name,
      type: "competitor",
    })
  }

  const reports = store.getReports()
  for (const r of reports) {
    const key = `rep-${r.id}`
    if (seen.has(key)) continue
    seen.add(key)
    docs.push({
      id: key, content: `${r.title}: ${r.summary}`,
      source: r.title, date: r.createdAt,
      type: "report",
    })
  }

  return docs
}

function buildTerms(docs: RagDocument[]): string[] {
  const termSet = new Set<string>()
  for (const d of docs) {
    for (const t of tokenize(d.content)) termSet.add(t)
  }
  return Array.from(termSet)
}

function embedOpenAI(text: string): Promise<number[]> {
  return fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  })
    .then(r => r.json())
    .then(d => d.data?.[0]?.embedding || keywordEmbed(text))
    .catch(() => keywordEmbed(text))
}

function keywordEmbed(text: string): number[] {
  const tokens = tokenize(text)
  return tfidfVector(tokens, allTerms)
}

let embedded = false

async function ensureEmbeddings() {
  if (!process.env.OPENAI_API_KEY) return
  if (embedded) return
  embedded = true
  for (const doc of documents) {
    if (!doc.embedding) {
      doc.embedding = await embedOpenAI(doc.content)
    }
  }
}

export async function retrieveRelevant(query: string, topK = 8): Promise<{ doc: RagDocument; score: number }[]> {
  documents = buildDocuments()
  allTerms = buildTerms(documents)
  const queryTokens = tokenize(query)

  let queryVec: number[]

  if (process.env.OPENAI_API_KEY) {
    await ensureEmbeddings()
    queryVec = await embedOpenAI(query)
    const scored = documents
      .filter(d => d.embedding)
      .map(d => ({ doc: d, score: cosineSimilarity(queryVec!, d.embedding!) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    if (scored.length > 0) return scored
  }

  queryVec = tfidfVector(queryTokens, allTerms)
  const scored = documents
    .map(d => ({ doc: d, score: cosineSimilarity(queryVec!, keywordEmbed(d.content)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return scored.filter(s => s.score > 0.01)
}

export function buildContextFromDocs(results: { doc: RagDocument; score: number }[]): string {
  let context = ""
  for (const r of results) {
    const name = r.doc.competitorName ? ` [${r.doc.competitorName}]` : ""
    context += `- ${r.doc.source}${name}: ${r.doc.content}\n`
  }
  return context
}

export function extractSources(results: { doc: RagDocument; score: number }[]): { competitor: string; snippet: string }[] {
  return results.map(r => ({
    competitor: r.doc.competitorName || "General",
    snippet: r.doc.content.slice(0, 200),
  }))
}
