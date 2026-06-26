import { getSupabase } from "@/lib/supabase"
import { seededShuffle, applyRecencyBoost } from "@/lib/shuffle"

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
    .select("id, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!tools || tools.length === 0) {
    return Response.json({ count: 0 })
  }

  const seed = new Date().toISOString().slice(0, 10)
  const shuffled = seededShuffle(tools, seed)
  const boosted = applyRecencyBoost(shuffled)

  for (let i = 0; i < boosted.length; i++) {
    await supabase
      .from("tools")
      .update({ shuffle_order: i })
      .eq("id", boosted[i].id)
  }

  return Response.json({ count: boosted.length, seed })
}
