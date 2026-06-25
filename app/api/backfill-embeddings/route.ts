import { getSupabase } from "@/lib/supabase"
import { processToolEmbedding } from "@/lib/embedding"

const BATCH_DELAY = 4000

export const maxDuration = 300

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret")
  if (secret !== process.env.GEMINI_API_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return Response.json({ error: "Supabase not available" }, { status: 500 })
  }

  const { data: tools, error } = await supabase
    .from("tools")
    .select("id, name, description, category, slug")
    .or("embedding_status.is.null,embedding_status.neq.done")
    .order("created_at", { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const results: { slug: string; status: string }[] = []
  let succeeded = 0
  let failed = 0

  for (const tool of tools) {
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))

    const ok = await processToolEmbedding(
      tool.id,
      tool.name,
      tool.description,
      tool.category
    )

    if (ok) {
      succeeded++
      results.push({ slug: tool.slug, status: "done" })
    } else {
      failed++
      results.push({ slug: tool.slug, status: "failed" })
    }
  }

  return Response.json({
    succeeded,
    failed,
    total: tools.length,
    failedSlugs: results.filter((r) => r.status === "failed").map((r) => r.slug),
    detail: results,
  })
}
