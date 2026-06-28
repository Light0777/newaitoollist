import { getSupabase } from "@/lib/supabase"
import { fetchHackerNews } from "./hackernews"
import { fetchProductHunt } from "./producthunt"
import { filterNew } from "./dedupe"
import { filterAndExtract } from "./gemini-filter"
import type { ScraperRunSummary, ScrapedCandidate } from "./types"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
}

async function generateUniqueSlug(base: string): Promise<string> {
  const supabase = getSupabase()
  let slug = slugify(base)

  const { data: existing } = await supabase!
    .from("tools")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle()

  if (!existing) return slug

  let counter = 2
  while (true) {
    const newSlug = `${slug}-${counter}`
    const { data: dup } = await supabase!
      .from("tools")
      .select("slug")
      .eq("slug", newSlug)
      .maybeSingle()
    if (!dup) return newSlug
    counter++
  }
}

async function processSource(
  candidates: ScrapedCandidate[]
): Promise<ScraperRunSummary> {
  const source = candidates.length > 0 ? candidates[0].source : "unknown"
  const summary: ScraperRunSummary = {
    source,
    fetched: candidates.length,
    deduped: 0,
    rejectedByFilter: 0,
    inserted: 0,
    errors: [],
  }

  const supabase = getSupabase()
  if (!supabase) {
    summary.errors.push("Supabase client unavailable")
    return summary
  }

  // Step 3: Dedupe
  const newCandidates = await filterNew(candidates)
  summary.deduped = summary.fetched - newCandidates.length

  if (newCandidates.length === 0) return summary

  // Step 4: Gemini filter & extract
  for (let i = 0; i < newCandidates.length; i++) {
    const c = newCandidates[i]
    // 1.5s delay between calls to avoid per-minute rate limits
    if (i > 0) await new Promise((r) => setTimeout(r, 1500))
    const { extracted, rejected } = await filterAndExtract(c)
    if (rejected) {
      summary.rejectedByFilter++
      continue
    }
    if (!extracted) {
      summary.errors.push(`Extraction failed for: ${c.name}`)
      continue
    }

    // Step 5: Insert as pending
    const slug = await generateUniqueSlug(extracted.name)

    const { error } = await supabase.from("submissions").insert({
      name: extracted.name,
      slug,
      description: extracted.description,
      website_url: extracted.websiteUrl,
      category: extracted.category,
      pricing: extracted.pricing,
      tags: [],
      status: "pending",
      source: c.source,
      submitter_ip: "scraper",
    })

    if (error) {
      summary.errors.push(`Insert failed for ${extracted.name}: ${error.message}`)
    } else {
      summary.inserted++
    }
  }

  return summary
}

export async function runScraper(): Promise<ScraperRunSummary[]> {
  const summaries: ScraperRunSummary[] = []

  // Hacker News
  try {
    const hnCandidates = await fetchHackerNews()
    const hnSummary = await processSource(hnCandidates)
    summaries.push(hnSummary)
  } catch (err) {
    summaries.push({
      source: "scraper_hn",
      fetched: 0,
      deduped: 0,
      rejectedByFilter: 0,
      inserted: 0,
      errors: [`HN scraper crashed: ${err}`],
    })
  }

  // Product Hunt
  try {
    const phCandidates = await fetchProductHunt()
    const phSummary = await processSource(phCandidates)
    summaries.push(phSummary)
  } catch (err) {
    summaries.push({
      source: "scraper_ph",
      fetched: 0,
      deduped: 0,
      rejectedByFilter: 0,
      inserted: 0,
      errors: [`PH scraper crashed: ${err}`],
    })
  }

  return summaries
}
