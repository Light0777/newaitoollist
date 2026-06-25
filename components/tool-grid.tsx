"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ToolCard, ToolCardSkeleton } from "@/components/tool-card"
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

function interleaveBatch(
  tools: Tool[],
  preferredCategories: Set<string>
): Tool[] {
  if (tools.length <= 2) return tools

  const groups = new Map<string, Tool[]>()
  for (const t of tools) {
    const g = groups.get(t.category) || []
    g.push(t)
    groups.set(t.category, g)
  }

  const entries = [...groups.entries()]
  const result: Tool[] = []
  let lastCat = ""
  let sameCount = 0

  while (entries.some(([, v]) => v.length > 0)) {
    let advanced = false

    const preferred = entries.filter(
      ([cat, items]) =>
        items.length > 0 &&
        preferredCategories.has(cat) &&
        !(cat === lastCat && sameCount >= 3)
    )

    const other = entries.filter(
      ([cat, items]) =>
        items.length > 0 &&
        !preferredCategories.has(cat) &&
        !(cat === lastCat && sameCount >= 2)
    )

    const candidates = preferred.length > 0 ? preferred : other

    for (const [cat, items] of candidates) {
      if (items.length === 0) continue
      if (cat === lastCat) {
        const max = preferredCategories.has(cat) ? 3 : 2
        if (sameCount >= max) continue
      }
      result.push(items.shift()!)
      if (cat === lastCat) {
        sameCount++
      } else {
        lastCat = cat
        sameCount = 1
      }
      advanced = true
      break
    }

    if (!advanced) break
  }

  for (const [, items] of entries) {
    result.push(...items)
  }

  return result
}

function getRecentCategories(): Set<string> {
  try {
    const stored = localStorage.getItem("recentCategories")
    if (!stored) return new Set()
    const cats = JSON.parse(stored) as string[]
    return new Set(cats.slice(0, 5))
  } catch {
    return new Set()
  }
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
  const [batchIndex, setBatchIndex] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const hasMoreRef = useRef(initialHasMore)
  const initialCountRef = useRef(initialTools.length)
  const generationRef = useRef(0)

  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return

    const gen = generationRef.current
    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      let result: PaginatedResult<Tool>
      if (categorySlug) {
        result = await getToolsByCategory(categorySlug, 12, cursor)
      } else if (searchQuery) {
        result = await searchTools(searchQuery, 12, cursor, period)
      } else {
        result = await getLatestTools(12, cursor, period)
      }

      if (gen !== generationRef.current) return

      if (result.data.length > 0 && !categorySlug) {
        const preferred = getRecentCategories()
        result.data = interleaveBatch(result.data, preferred)
      }

      setTools((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const newTools = result.data.filter((t) => !existingIds.has(t.id))
        return [...prev, ...newTools]
      })
      setHasMore(result.hasMore)
      hasMoreRef.current = result.hasMore
      setCursor(result.nextCursor)
      setBatchIndex((i) => i + 1)
    } catch {
      setError("Failed to load more tools. Please try again.")
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [cursor, searchQuery, categorySlug, period])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          handleLoadMore()
        }
      },
      { rootMargin: "600px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMore])

  // reset when filters change
  useEffect(() => {
    generationRef.current++
    setTools(initialTools)
    setHasMore(initialHasMore)
    hasMoreRef.current = initialHasMore
    setCursor(initialCursor)
    setError(null)
    setBatchIndex(0)
    initialCountRef.current = initialTools.length
  }, [initialTools, initialHasMore, initialCursor, searchQuery, categorySlug, period])

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
        {tools.map((tool, i) => {
          const isClientBatch = i >= initialCountRef.current
          return (
            <div
              key={tool.id}
              style={
                isClientBatch
                  ? {
                      animation: `fade-up 200ms ease-out ${(i - initialCountRef.current) * 50}ms backwards`,
                    }
                  : undefined
              }
            >
              <ToolCard tool={tool} />
            </div>
          )
        })}
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <ToolCardSkeleton key={`skel-${batchIndex}-${i}`} />
          ))}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive mt-4">{error}</p>
      )}

      {hasMore && <div ref={sentinelRef} className="h-1" />}
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
