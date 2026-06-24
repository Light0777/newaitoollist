export const runtime = "edge"

export async function GET() {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f0f0f" />
        <stop offset="50%" style="stop-color:#1a1a2e" />
        <stop offset="100%" style="stop-color:#16213e" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" />
    <text x="600" y="280" text-anchor="middle" font-family="sans-serif" font-size="64" font-weight="bold" fill="#ffffff">NewAIToolList</text>
    <text x="600" y="360" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#94a3b8">Discover the latest AI tools for every task</text>
  </svg>`

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
