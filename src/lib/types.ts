export type Lens = "executive" | "sales-leader" | "sales-rep" | "admin"

export interface Competitor {
  id: string
  name: string
  website: string
  url: string
  lastScraped: string
  status: "pending" | "scraping" | "complete" | "error"
  mainePresence: "yes" | "no" | "unknown"
  maineCounties?: string[]
}

export interface ServiceLine {
  id: string
  name: string
  category: "home-healthcare" | "mobile-wound" | "therapy-care"
  description: string
}

export interface Evidence {
  id: string
  competitorId: string
  source: string
  snippet: string
  date: string
  relevance: number
  maineRelevance: boolean
}

export interface Battlecard {
  id: string
  competitorId: string
  competitorName: string
  strengths: string[]
  weaknesses: string[]
  andwellAdvantage: string[]
  winRate: number
  lastUpdated: string
  maineMarketShare?: number
}

export interface Report {
  id: string
  title: string
  type: "competitive" | "growth" | "board"
  createdAt: string
  summary: string
}

export interface MaineCounty {
  name: string
  population: number
  over65Percent: number
  medianIncome: number
  ruralPercent: number
  homeHealthAgencies: number
}

export interface CountyDemand {
  county: string
  state: string
  population: number
  homeHealthDemand: number
  mobileWoundDemand: number
  therapyCareDemand: number
  competitionIntensity: "low" | "medium" | "high"
  priorityScore: number
}

export interface GrowthScenario {
  id: string
  name: string
  serviceLine: string
  counties: string[]
  projectedRevenue: number
  staffingRequired: number
  timelineMonths: number
  confidence: number
}

export interface LaunchPlanStep {
  week: number
  action: string
  owner: string
  status: "pending" | "in-progress" | "complete"
}

export interface CatalogItem {
  id: string
  name: string
  description: string
  category: string
  evidence: string[]
}

export type Message = {
  role: "user" | "assistant"
  content: string
}

export interface ScrapeResult {
  competitorId: string
  url: string
  pagesScraped: number
  maineMentions: { page: string; snippet: string }[]
  servicesFound: string[]
  countiesMentioned: string[]
  summary: string
}
