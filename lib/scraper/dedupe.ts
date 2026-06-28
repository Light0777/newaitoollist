import { getSupabase } from "@/lib/supabase"
import type { ScrapedCandidate } from "./types"

function normalizeUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return url.toLowerCase().replace(/https?:\/\//, "").replace(/\/$/, "").trim()
  }
}

export async function filterNew(candidates: ScrapedCandidate[]): Promise<ScrapedCandidate[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const results: ScrapedCandidate[] = []

  for (const c of candidates) {
    const domain = normalizeUrl(c.url)
    if (!domain) continue

    // Check live tools table
    const { data: existingTool } = await supabase
      .from("tools")
      .select("id")
      .ilike("website_url", `%${domain}%`)
      .maybeSingle()

    if (existingTool) continue

    // Check existing pending submissions
    const { data: existingSubmission } = await supabase
      .from("submissions")
      .select("id")
      .ilike("website_url", `%${domain}%`)
      .maybeSingle()

    if (existingSubmission) continue

    results.push(c)
  }

  return results
}
