"use client"

import { useState, useCallback } from "react"
import { ToolCard, ToolCardSkeleton } from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import { getLatestTools, searchTools, getToolsByCategory } from "@/actions/tools"
import type { Tool } from "@/types"
import type { PaginatedResult } from "@/actions/tools"

interface ToolGridProps {
  initialTools: Tool[]
  initialHasMore: boolean
  initialCursor: string | null
  searchQuery?: string
  categorySlug?: string
  period?: string
  emptyMessage?: string
}

export function ToolGridWithLoadMore({
  initialTools,
  initialHasMore,
  initialCursor,
  searchQuery,
  categorySlug,
  period,
  emptyMessage = "No tools found.",
}: ToolGridProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      let result: PaginatedResult<Tool>
      if (categorySlug) {
        result = await getToolsByCategory(categorySlug, 20, cursor)
      } else if (searchQuery) {
        result = await searchTools(searchQuery, 20, cursor, period)
      } else {
        result = await getLatestTools(20, cursor, period)
      }

      setTools((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const newTools = result.data.filter((t) => !existingIds.has(t.id))
        return [...prev, ...newTools]
      })
      setHasMore(result.hasMore)
      setCursor(result.nextCursor)
    } catch {
      setError("Failed to load more tools. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, cursor, searchQuery, categorySlug, period])

  if (tools.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <ToolCardSkeleton key={`skel-${i}`} />
          ))}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive mt-4">{error}</p>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} variant="outline" size="lg">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

export function ToolGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
    </div>
  )
}
