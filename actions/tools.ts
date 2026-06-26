"use server"

import { getSupabase } from "@/lib/supabase"
import type { Tool, Category } from "@/types"

import { PRICING_MAP } from "@/lib/pricing"

const TOOL_COLUMNS =
  "id, name, slug, description, website_url, category, pricing, tags, logo_url, created_at, embedding_status, shuffle_order"

export interface PaginatedResult<T> {
  data: T[]
  hasMore: boolean
  nextCursor: string | null
}

function getClient() {
  try {
    return getSupabase()
  } catch {
    return null
  }
}

function getDateFilter(period?: string): Date | null {
  if (!period) return null
  const now = new Date()
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

function encodeShuffleCursor(pos: number, id: string): string {
  return Buffer.from(JSON.stringify({ p: pos, i: id })).toString("base64")
}

function decodeShuffleCursor(cursor: string): { pos: number; id: string } {
  return JSON.parse(Buffer.from(cursor, "base64").toString())
}

function encodeDateCursor(created_at: string, id: string): string {
  return Buffer.from(JSON.stringify({ c: created_at, i: id })).toString("base64")
}

function decodeDateCursor(cursor: string): { created_at: string; id: string } {
  return JSON.parse(Buffer.from(cursor, "base64").toString())
}

async function runShufflePaginatedQuery(
  supabase: NonNullable<ReturnType<typeof getClient>>,
  filters: (query: any) => any,
  limit: number,
  cursor?: string | null
): Promise<PaginatedResult<Tool>> {
  const fetchLimit = limit + 1
  let query = supabase.from("tools").select(TOOL_COLUMNS)

  query = filters(query)

  if (cursor) {
    const { pos, id } = decodeShuffleCursor(cursor)
    query = query.or(
      `shuffle_order.gt.${pos},and(shuffle_order.eq.${pos},id.gt.${id})`
    )
  }

  const { data, error } = await query
    .order("shuffle_order", { ascending: true })
    .order("id", { ascending: true })
    .limit(fetchLimit)

  if (error) {
    console.error("Supabase query error:", error.message)
    return { data: [], hasMore: false, nextCursor: null }
  }

  if (!data) {
    return { data: [], hasMore: false, nextCursor: null }
  }

  const hasMore = data.length > limit
  const tools = data.slice(0, limit)

  let nextCursor: string | null = null
  if (hasMore && tools.length > 0) {
    const last = tools[tools.length - 1]
    nextCursor = encodeShuffleCursor(last.shuffle_order, last.id)
  }

  return { data: tools, hasMore, nextCursor }
}

async function runDatePaginatedQuery(
  supabase: NonNullable<ReturnType<typeof getClient>>,
  filters: (query: any) => any,
  limit: number,
  cursor?: string | null
): Promise<PaginatedResult<Tool>> {
  const fetchLimit = limit + 1
  let query = supabase.from("tools").select(TOOL_COLUMNS)

  query = filters(query)

  if (cursor) {
    const { created_at, id } = decodeDateCursor(cursor)
    query = query.or(
      `created_at.lt.${created_at},and(created_at.eq.${created_at},id.lt.${id})`
    )
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(fetchLimit)

  if (error) {
    console.error("Supabase query error:", error.message)
    return { data: [], hasMore: false, nextCursor: null }
  }

  if (!data) {
    return { data: [], hasMore: false, nextCursor: null }
  }

  const hasMore = data.length > limit
  const tools = data.slice(0, limit)

  let nextCursor: string | null = null
  if (hasMore && tools.length > 0) {
    const last = tools[tools.length - 1]
    nextCursor = encodeDateCursor(last.created_at, last.id)
  }

  return { data: tools, hasMore, nextCursor }
}

export async function getNewestTools(limit = 4): Promise<Tool[]> {
  const supabase = getClient()
  if (!supabase) return []

  const { data } = await supabase
    .from("tools")
    .select(TOOL_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit)

  return data || []
}

export async function getLatestTools(
  limit = 20,
  cursor?: string | null,
  period?: string,
  pricing?: string
): Promise<PaginatedResult<Tool>> {
  const supabase = getClient()
  if (!supabase) return { data: [], hasMore: false, nextCursor: null }

  const dateFilter = getDateFilter(period)
  const pricingValue = pricing ? PRICING_MAP[pricing] : null

  return runShufflePaginatedQuery(
    supabase,
    (query) => {
      let q = query
      if (dateFilter) {
        q = q.gte("created_at", dateFilter.toISOString())
      }
      if (pricingValue) {
        q = q.eq("pricing", pricingValue)
      }
      return q
    },
    limit,
    cursor
  )
}

export async function getToolsByCategory(
  slug: string,
  limit = 20,
  cursor?: string | null,
  pricing?: string,
  period?: string
): Promise<PaginatedResult<Tool>> {
  const supabase = getClient()
  if (!supabase) return { data: [], hasMore: false, nextCursor: null }

  const pricingValue = pricing ? PRICING_MAP[pricing] : null
  const dateFilter = getDateFilter(period)

  return runShufflePaginatedQuery(
    supabase,
    (query) => {
      let q = query.eq("category", slug)
      if (pricingValue) {
        q = q.eq("pricing", pricingValue)
      }
      if (dateFilter) {
        q = q.gte("created_at", dateFilter.toISOString())
      }
      return q
    },
    limit,
    cursor
  )
}

export async function searchTools(
  queryStr: string,
  limit = 20,
  cursor?: string | null,
  period?: string,
  pricing?: string
): Promise<PaginatedResult<Tool>> {
  const supabase = getClient()
  if (!supabase) return { data: [], hasMore: false, nextCursor: null }

  const dateFilter = getDateFilter(period)
  const pricingValue = pricing ? PRICING_MAP[pricing] : null

  return runDatePaginatedQuery(
    supabase,
    (query) => {
      let q = query.or(
        `name.ilike.%${queryStr}%,description.ilike.%${queryStr}%,tags.cs.{${queryStr}}`
      )
      if (dateFilter) {
        q = q.gte("created_at", dateFilter.toISOString())
      }
      if (pricingValue) {
        q = q.eq("pricing", pricingValue)
      }
      return q
    },
    limit,
    cursor
  )
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getClient()
  if (!supabase) return []

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return data || []
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const supabase = getClient()
  if (!supabase) return null

  const { data } = await supabase
    .from("tools")
    .select("id, name, slug, description, website_url, category, pricing, tags, logo_url, created_at, embedding_status")
    .eq("slug", slug)
    .single()

  return data as Tool | null
}

export async function getSimilarTools(
  toolId: string,
  category: string,
  limit = 6
): Promise<Tool[]> {
  const supabase = getClient()
  if (!supabase) return []

  // Try embedding-based similarity first
  const { data, error } = await supabase.rpc("find_similar_tools", {
    p_tool_id: toolId,
    p_limit: limit,
  })

  if (!error && data && data.length > 0) {
    return data as Tool[]
  }

  if (error) {
    console.error("getSimilarTools RPC error:", error.message)
  }

  // Fallback: same category, newest first
  const { data: categoryTools } = await supabase
    .from("tools")
    .select("id, name, slug, description, website_url, category, pricing, tags, logo_url, created_at, embedding_status")
    .eq("category", category)
    .neq("id", toolId)
    .order("created_at", { ascending: false })
    .limit(limit)

  return (categoryTools as Tool[]) || []
}

export async function getAllToolSlugsForSitemap(): Promise<
  { slug: string; created_at: string }[]
> {
  const supabase = getClient()
  if (!supabase) return []

  const all: { slug: string; created_at: string }[] = []
  const batchSize = 1000
  let offset = 0

  while (true) {
    const { data } = await supabase
      .from("tools")
      .select("slug, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + batchSize - 1)

    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < batchSize) break
    offset += batchSize
  }

  return all
}
