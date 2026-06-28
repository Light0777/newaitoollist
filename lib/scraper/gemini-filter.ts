import type { GeminiExtracted, ScrapedCandidate } from "./types"

const ALLOWED_CATEGORIES = [
  "ai-agents",
  "coding-ai",
  "productivity-ai",
  "ai-coding-agents",
  "ai-code-editors",
  "code-generation",
  "debugging",
  "code-review",
  "testing",
]

const API_KEY = process.env.GEMINI_API_KEY

function buildPrompt(name: string, description: string, url: string): string {
  return `You are a curator for a directory of AI developer tools. Given the following tool info, decide if it is a developer-focused AI coding tool (code editors, coding agents, code generation, code review, debugging, testing, dev infrastructure). If it is NOT (e.g. it's a generic chatbot, image generator, video tool, marketing tool, or non-AI tool), respond with: {"rejected": true}

If it IS relevant, extract structured data and respond with valid JSON only (no prose, no markdown fences):

{
  "name": "Tool name",
  "description": "1-2 sentence description of what this AI coding tool does",
  "category": "one of: ${ALLOWED_CATEGORIES.join(", ")}",
  "pricing": "Free, Freemium, Paid, Free Trial, or Contact for Pricing — infer from the text if possible, default Freemium",
  "websiteUrl": "${url}"
}

Tool name: ${name}
Tool description: ${description}
Tool URL: ${url}`
}

function parseJson(text: string): Record<string, unknown> | null {
  // Strip code fences if present
  const cleaned = text.replace(/```(?:json)?\s*/gi, "").trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

export async function filterAndExtract(
  candidate: ScrapedCandidate
): Promise<{ extracted: GeminiExtracted | null; rejected: boolean }> {
  if (!API_KEY) {
    console.error("[gemini-filter] GEMINI_API_KEY is not set")
    return { extracted: null, rejected: true }
  }

  const prompt = buildPrompt(candidate.name, candidate.rawDescription, candidate.url)

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
        },
      }),
    })
  } catch (err) {
    console.error(`[gemini-filter] Fetch error for "${candidate.name}":`, err)
    return { extracted: null, rejected: true }
  }

  if (!response.ok) {
    const body = await response.text()
    console.error(`[gemini-filter] API error ${response.status} for "${candidate.name}":`, body)
    return { extracted: null, rejected: true }
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    console.error(`[gemini-filter] Empty response for "${candidate.name}"`)
    return { extracted: null, rejected: true }
  }

  const parsed = parseJson(text)
  if (!parsed) {
    console.error(`[gemini-filter] Failed to parse Gemini response for "${candidate.name}": ${text}`)
    return { extracted: null, rejected: true }
  }

  if (parsed.rejected === true) {
    return { extracted: null, rejected: true }
  }

  const name = String(parsed.name || "").trim()
  const description = String(parsed.description || "").trim()
  const category = String(parsed.category || "").trim()
  const pricing = String(parsed.pricing || "Freemium").trim()
  const websiteUrl = String(parsed.websiteUrl || "").trim()

  if (!name || !description || !category || !websiteUrl) {
    console.error(`[gemini-filter] Missing required fields for "${candidate.name}":`, parsed)
    return { extracted: null, rejected: true }
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    console.error(`[gemini-filter] Invalid category "${category}" for "${candidate.name}"`)
    return { extracted: null, rejected: true }
  }

  return { extracted: { name, description, category, pricing, websiteUrl }, rejected: false }
}
