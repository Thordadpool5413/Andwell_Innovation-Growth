import { chromium } from "playwright"
import { DhhsFiling, Finding } from "../types"
import { store } from "../store"

const DHHS_CON_URL = "https://www.maine.gov/dhhs/mecdc/certificate-of-need"
const DHHS_LICENSE_URL = "https://www.maine.gov/dhhs/mecdc/home-health-licensing"

async function scrapeConFilings(): Promise<DhhsFiling[]> {
  const filings: DhhsFiling[] = []
  let browser

  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ userAgent: "AndwellIntelligence/1.0" })
    const page = await context.newPage()
    await page.goto(DHHS_CON_URL, { waitUntil: "domcontentloaded", timeout: 20000 })
    await page.waitForTimeout(3000)

    const text = await page.innerText("body")
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (
        (line.toLowerCase().includes("home health") || line.toLowerCase().includes("wound") || line.toLowerCase().includes("home care")) &&
        (line.toLowerCase().includes("notice") || line.toLowerCase().includes("application") || line.toLowerCase().includes("filing"))
      ) {
        const county = extractCounty(line) || "Unknown"
        filings.push({
          id: `con-${Date.now()}-${i}`,
          type: "certificate-of-need",
          filerName: extractFiler(line),
          description: line.slice(0, 200),
          county,
          date: new Date().toISOString().split("T")[0],
          status: "pending",
        })
      }
    }
  } catch {
  } finally {
    if (browser) await browser.close()
  }

  return filings
}

async function scrapeLicenseNotices(): Promise<DhhsFiling[]> {
  const filings: DhhsFiling[] = []
  let browser

  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ userAgent: "AndwellIntelligence/1.0" })
    const page = await context.newPage()
    await page.goto(DHHS_LICENSE_URL, { waitUntil: "domcontentloaded", timeout: 20000 })
    await page.waitForTimeout(3000)

    const text = await page.innerText("body")
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (
        (line.toLowerCase().includes("license") || line.toLowerCase().includes("certified") || line.toLowerCase().includes("approved")) &&
        (line.toLowerCase().includes("home health") || line.toLowerCase().includes("home care") || line.toLowerCase().includes("skilled nursing"))
      ) {
        const county = extractCounty(line) || "Unknown"
        filings.push({
          id: `lic-${Date.now()}-${i}`,
          type: "license",
          filerName: extractFiler(line),
          description: line.slice(0, 200),
          county,
          date: new Date().toISOString().split("T")[0],
          status: line.toLowerCase().includes("approved") ? "approved" : "pending",
        })
      }
    }
  } catch {
  } finally {
    if (browser) await browser.close()
  }

  return filings
}

const MAINE_COUNTIES = [
  "Cumberland", "York", "Penobscot", "Kennebec", "Androscoggin",
  "Oxford", "Hancock", "Somerset", "Aroostook", "Knox", "Waldo",
  "Washington", "Lincoln", "Sagadahoc", "Franklin", "Piscataquis",
]

function extractCounty(text: string): string | null {
  for (const c of MAINE_COUNTIES) {
    if (text.toLowerCase().includes(c.toLowerCase())) return c
  }
  return null
}

function extractFiler(text: string): string {
  const knownCompetitors = ["Northern Light", "MaineHealth", "Gentiva", "Amedisys", "Interim", "VNA"]
  for (const kc of knownCompetitors) {
    if (text.includes(kc)) return kc
  }
  const match = text.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/)
  return match ? match[1] : "Unknown"
}

export const dhhsScraper = {
  async scrape(): Promise<Finding[]> {
    const [conFilings, licenseFilings] = await Promise.all([
      scrapeConFilings(),
      scrapeLicenseNotices(),
    ])

    const allFilings = [...conFilings, ...licenseFilings]
    const findings: Finding[] = []

    const competitorMap: Record<string, string> = {
      "Northern Light": "c1",
      "MaineHealth": "c2",
      "Gentiva": "c3",
      "Amedisys": "c4",
      "Interim": "c5",
      "VNA": "c6",
    }

    for (const f of allFilings) {
      const compId = competitorMap[f.filerName] || ""
      findings.push({
        id: f.id,
        competitorId: compId,
        serviceId: "home-health",
        subServiceId: "hh-skilled-nursing",
        evidence: `${f.filerName} filed ${f.type.replace("-", " ")} in ${f.county} county: ${f.description}`,
        source: "Maine DHHS",
        date: f.date,
        confidence: "confirmed",
        reviewStatus: "pending",
      })
    }

    if (findings.length > 0) {
      const existing = store.getFindings()
      store.saveFindings([...findings, ...existing])
    }

    return findings
  },
}
