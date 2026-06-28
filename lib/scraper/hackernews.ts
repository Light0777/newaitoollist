import type { ScrapedCandidate } from "./types"

const HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search"

const KEYWORDS = [
  "AI coding",
  "AI agent",
  "code generation",
  "AI IDE",
  "code editor",
  "debugging",
  "code review",
  "developer tool",
  "dev tool",
  "coding assistant",
  "AI pair programmer",
]

export async function fetchHackerNews(): Promise<ScrapedCandidate[]> {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).getTime() / 1000

  const candidates: ScrapedCandidate[] = []

  for (const keyword of KEYWORDS) {
    const url = `${HN_SEARCH_URL}?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${cutoff}&hitsPerPage=20`

    let response: Response
    try {
      response = await fetch(url, {
        headers: { "User-Agent": "newaitoollist-scraper/1.0" },
      })
    } catch {
      continue
    }

    if (!response.ok) continue

    const body = await response.json()
    const hits = body.hits ?? []

    for (const hit of hits) {
      if (!hit.url && !hit.story_url) continue

      const storyUrl = hit.url || hit.story_url

      candidates.push({
        name: hit.title || hit.story_title || "Untitled",
        url: storyUrl,
        rawDescription: hit.points
          ? `${hit.title} — ${hit.points} points on HN`
          : hit.title || "",
        sourcePostUrl: hit.story_url
          ? `https://news.ycombinator.com/item?id=${hit.objectID}`
          : `https://news.ycombinator.com/item?id=${hit.objectID}#${hit.objectID}`,
        source: "scraper_hn",
      })
    }
  }

  // Dedupe by URL within the batch
  const seen = new Set<string>()
  return candidates.filter((c) => {
    const key = c.url.toLowerCase().replace(/https?:\/\//, "").replace(/\/$/, "")
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
