import { runScraper } from "@/lib/scraper/runner"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const auth = request.headers.get("authorization")
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!auth || auth !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[cron] Starting scraper run...")

  const summaries = await runScraper()

  for (const s of summaries) {
    console.log(
      `[cron] ${s.source}: fetched=${s.fetched} deduped=${s.deduped} rejected=${s.rejectedByFilter} inserted=${s.inserted} errors=${s.errors.length}`
    )
    for (const err of s.errors) {
      console.error(`[cron]   error: ${err}`)
    }
  }

  return Response.json({ ok: true, summaries })
}
