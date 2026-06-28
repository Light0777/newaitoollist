export interface ScrapedCandidate {
  name: string
  url: string
  rawDescription: string
  sourcePostUrl: string
  source: "scraper_hn" | "scraper_ph"
}

export interface GeminiExtracted {
  name: string
  description: string
  category: string
  pricing: string
  websiteUrl: string
}

export interface ScraperRunSummary {
  source: string
  fetched: number
  deduped: number
  rejectedByFilter: number
  inserted: number
  errors: string[]
}
