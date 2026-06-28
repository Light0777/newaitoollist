import Link from "next/link"
import { ToolCard, ToolCardSkeleton } from "@/components/tool-card"
import { ToolIcon } from "@/components/tool-icon"
import { getTrendingTools, getToolsInDateRange } from "@/actions/tools"
import type { Tool } from "@/types"

export async function HomepageSections() {
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const trending = await getTrendingTools(4)
  const excludedIds = new Set(trending.map((t) => t.id))
  const exclude = (ids: string[]) => [...excludedIds, ...ids]

  const todayTools = await getToolsInDateRange(dayAgo, undefined, 4, [...excludedIds])
  const fallbackTools = todayTools.length > 0 ? [] : await getToolsInDateRange(new Date(0), undefined, 4, [...excludedIds])
  const fallbackIds = fallbackTools.map((t) => t.id)

  const weekTools = await getToolsInDateRange(weekAgo, dayAgo, 4, exclude(fallbackIds))
  const weekIds = weekTools.map((t) => t.id)

  const monthTools = await getToolsInDateRange(monthAgo, weekAgo, 4, exclude([...fallbackIds, ...weekIds]))

  return (
    <div className="space-y-12">
      {trending.length > 0 && (
        <TrendingSection cards={trending} />
      )}

      <TodaySection tools={todayTools} fallback={fallbackTools} />

      {weekTools.length > 0 && (
        <Section title="This Week" cards={weekTools} href="/?period=week" />
      )}

      {monthTools.length > 0 && (
        <Section title="This Month" cards={monthTools} href="/?period=month" />
      )}
    </div>
  )
}

function TodaySection({ tools, fallback }: { tools: Tool[]; fallback: Tool[] }) {
  const hasTools = tools.length > 0
  const displayTools = hasTools ? tools : fallback
  const title = hasTools ? "Today" : "Latest Tools"
  const href = "/all"

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All &rarr;
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}

function TrendingSection({ cards }: { cards: Tool[] }) {
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Trending 🔥🔥</h2>
      {/* Mobile: icons row */}
      <div className="flex sm:hidden items-center justify-between">
        {cards.map((tool) => (
          <Link key={tool.id} href={`/tools/${tool.slug}`}>
            <ToolIcon websiteUrl={tool.website_url} name={tool.name} size="lg" />
          </Link>
        ))}
      </div>
      {/* Desktop: full cards */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}

function Section({
  title,
  cards,
  href,
}: {
  title: string
  cards: Tool[]
  href?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All &rarr;
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}

export function HomepageSectionsSkeleton() {
  return (
    <div className="space-y-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-8 w-32 bg-muted rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <ToolCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
