"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { ToolCard, ToolCardSkeleton } from "@/components/tool-card"
import { ToolIcon } from "@/components/tool-icon"
import { getLatestTools, searchTools, getToolsByCategory } from "@/actions/tools"
import type { Tool } from "@/types"
import type { PaginatedResult } from "@/actions/tools"

interface ToolGridProps {
  latestTools?: Tool[]
  initialTools: Tool[]
  initialHasMore: boolean
  initialCursor: string | null
  searchQuery?: string
  categorySlug?: string
  period?: string
  pricing?: string
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
  latestTools,
  initialTools,
  initialHasMore,
  initialCursor,
  searchQuery,
  categorySlug,
  period,
  pricing,
  emptyMessage = "No tools found.",
}: ToolGridProps) {
  const latestToolIds = useMemo(
    () => new Set((latestTools || []).map((t) => t.id)),
    [latestTools]
  )
  // Filter out any latestTools from initialTools to avoid duplicates
  const filteredInitial = initialTools.filter((t) => !latestToolIds.has(t.id))
  const [tools, setTools] = useState<Tool[]>(filteredInitial)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [batchIndex, setBatchIndex] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const hasMoreRef = useRef(initialHasMore)
  const initialCountRef = useRef(filteredInitial.length)
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
        result = await getToolsByCategory(categorySlug, 9999, cursor, pricing, period)
      } else if (searchQuery) {
        result = await searchTools(searchQuery, 9999, cursor, period, pricing)
      } else {
        result = await getLatestTools(9999, cursor, period, pricing)
      }

      if (gen !== generationRef.current) return

      if (result.data.length > 0 && !categorySlug) {
        const preferred = getRecentCategories()
        result.data = interleaveBatch(result.data, preferred)
      }

      setTools((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        // Also exclude latestToolIds to avoid duplicates from pagination
        const newTools = result.data.filter(
          (t) => !existingIds.has(t.id) && !latestToolIds.has(t.id)
        )
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
  }, [cursor, searchQuery, categorySlug, period, pricing])

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
    const filtered = initialTools.filter((t) => !latestToolIds.has(t.id))
    setTools(filtered)
    setHasMore(initialHasMore)
    hasMoreRef.current = initialHasMore
    setCursor(initialCursor)
    setError(null)
    setBatchIndex(0)
    initialCountRef.current = filtered.length
  }, [initialTools, initialHasMore, initialCursor, searchQuery, categorySlug, period, pricing])

  const hasTools = (latestTools && latestTools.length > 0) || tools.length > 0
  if (!hasTools && !loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  const restLabel = searchQuery
    ? `Search Results`
    : categorySlug
      ? categorySlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
          .replace(/\bAi\b/g, "AI")
      : "All"

  return (
    <div>
      {latestTools && latestTools.length > 0 && (
        <div className="mb-10 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Latest AI Tools</h2>

          {/* Mobile: icons row */}
          <div className="flex sm:hidden items-center justify-between">
            {latestTools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.slug}`}>
                <ToolIcon websiteUrl={tool.website_url} name={tool.name} size="lg" />
              </Link>
            ))}
          </div>

          {/* Desktop/tablet: full cards */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {latestTools.map((tool) => (
              <div key={tool.id}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tools.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">{restLabel}</h2>
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
