import { getToolBySlug } from "@/actions/tools"

export const runtime = "edge"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)

  if (!tool) {
    const fallback = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f0f0f" />
        <stop offset="50%" style="stop-color:#1a1a2e" />
        <stop offset="100%" style="stop-color:#16213e" />
      </linearGradient></defs>
      <rect width="1200" height="630" fill="url(#bg)" />
      <text x="600" y="320" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="bold" fill="#ffffff">NewAIToolList</text>
    </svg>`

    return new Response(fallback, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  }

  const categoryDisplay = tool.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace(/\bAi\b/g, "AI")

  const escapedName = escapeXml(tool.name)
  const escapedDesc = escapeXml(
    tool.description.length > 120
      ? tool.description.slice(0, 120) + "..."
      : tool.description
  )

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f0f0f" />
        <stop offset="50%" style="stop-color:#1a1a2e" />
        <stop offset="100%" style="stop-color:#16213e" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" />
    <text x="80" y="100" font-family="sans-serif" font-size="24" fill="#64748b">NewAIToolList</text>
    <text x="80" y="280" font-family="sans-serif" font-size="56" font-weight="bold" fill="#ffffff">${escapedName}</text>
    <text x="80" y="360" font-family="sans-serif" font-size="24" fill="#94a3b8">${escapedDesc}</text>
    <rect x="80" y="420" width="160" height="40" rx="20" fill="#1e293b" />
    <text x="160" y="446" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#e2e8f0">${escapeXml(categoryDisplay)}</text>
    <rect x="260" y="420" width="120" height="40" rx="20" fill="#1e293b" />
    <text x="320" y="446" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#e2e8f0">${escapeXml(tool.pricing)}</text>
  </svg>`

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
