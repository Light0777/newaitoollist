import type { ScrapedCandidate } from "./types"

const PH_API_URL = "https://api.producthunt.com/v2/api/graphql"

const QUERY = `
{
  posts(
    first: 50
    after: null
    topic: {slug: "developer-tools"}
    postedAfter: "%CUTOFF%"
    order: {direction: DESC, field: VOTES}
  ) {
    edges {
      node {
        id
        name
        tagline
        url
        website
        topics {
          edges {
            node {
              name
              slug
            }
          }
        }
      }
    }
  }
}
`

export async function fetchProductHunt(): Promise<ScrapedCandidate[]> {
  const token = process.env.PRODUCT_HUNT_TOKEN
  if (!token) {
    console.warn("[scraper_ph] PRODUCT_HUNT_TOKEN not set, skipping")
    return []
  }

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const query = QUERY.replace("%CUTOFF%", cutoff)

  let response: Response
  try {
    response = await fetch(PH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })
  } catch {
    return []
  }

  if (!response.ok) return []

  const body = await response.json()
  const edges = body?.data?.posts?.edges ?? []

  const candidates: ScrapedCandidate[] = []

  for (const edge of edges) {
    const node = edge.node
    if (!node) continue

    const topics = (node.topics?.edges ?? []).map((e: any) => e.node?.slug)
    const isAiOrDev =
      topics.includes("developer-tools") ||
      topics.includes("artificial-intelligence") ||
      topics.includes("ai") ||
      topics.includes("open-source")

    if (!isAiOrDev) continue

    candidates.push({
      name: node.name,
      url: node.website || "",
      rawDescription: node.tagline || "",
      sourcePostUrl: node.url || "",
      source: "scraper_ph",
    })
  }

  return candidates
}
