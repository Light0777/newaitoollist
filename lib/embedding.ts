import { getSupabase } from "@/lib/supabase"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getEmbeddingInput(
  name: string,
  description: string,
  category: string
): string {
  return `${name}\n${category}\n${description}`
}

async function callGeminiEmbedding(input: string): Promise<{
  embedding: number[] | null
  rateLimited: boolean
}> {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set")
    return { embedding: null, rateLimited: false }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text: input }] },
      outputDimensionality: 768,
    }),
  })

  if (response.status === 429) {
    return { embedding: null, rateLimited: true }
  }

  if (!response.ok) {
    const body = await response.text()
    console.error(`Gemini API error (${response.status}):`, body)
    return { embedding: null, rateLimited: false }
  }

  const data = await response.json()
  return { embedding: data.embedding?.values as number[] | null, rateLimited: false }
}

export async function generateEmbedding(
  name: string,
  description: string,
  category: string
): Promise<number[] | null> {
  const input = getEmbeddingInput(name, description, category)
  const label = `${name} (${category})`
  const retryDelays = [5000, 15000, 40000]

  for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
    const { embedding, rateLimited } = await callGeminiEmbedding(input)

    if (embedding) return embedding

    if (!rateLimited) {
      console.error(`[${label}] Non-retryable error, giving up`)
      return null
    }

    if (attempt < retryDelays.length) {
      const delay = retryDelays[attempt]
      console.log(`[${label}] Rate limited, retry ${attempt + 1}/${retryDelays.length} after ${delay}ms`)
      await sleep(delay)
    }
  }

  console.error(`[${label}] All retry attempts exhausted`)
  return null
}

export async function processToolEmbedding(
  toolId: string,
  name: string,
  description: string,
  category: string
): Promise<boolean> {
  const embedding = await generateEmbedding(name, description, category)

  const supabase = getSupabase()
  if (!supabase) return false

  if (embedding) {
    const { error } = await supabase
      .from("tools")
      .update({
        embedding: embedding as any,
        embedding_status: "done",
      })
      .eq("id", toolId)

    if (error) {
      console.error(`Failed to save embedding for tool ${toolId}:`, error.message)
      await supabase
        .from("tools")
        .update({ embedding_status: "failed" })
        .eq("id", toolId)
      return false
    }

    return true
  }

  await supabase
    .from("tools")
    .update({ embedding_status: "failed" })
    .eq("id", toolId)

  return false
}
