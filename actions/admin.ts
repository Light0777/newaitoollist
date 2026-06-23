"use server"

import { requireAdmin } from "@/lib/admin"
import type { Tool } from "@/types"

export interface AdminPaginatedResult {
  data: Tool[]
  hasMore: boolean
  nextCursor: string | null
}

function encodeCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ offset })).toString("base64")
}

export async function getAdminTools(
  cursor?: string | null
): Promise<AdminPaginatedResult> {
  const { supabase } = await requireAdmin()

  const limit = 50
  const fetchLimit = limit + 1

  let offset = 0
  if (cursor) {
    const decoded = JSON.parse(Buffer.from(cursor, "base64").toString())
    offset = decoded.offset
  }

  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + fetchLimit - 1)

  if (error || !data) {
    return { data: [], hasMore: false, nextCursor: null }
  }

  const hasMore = data.length > limit
  const tools = data.slice(0, limit)

  let nextCursor: string | null = null
  if (hasMore) {
    nextCursor = encodeCursor(offset + limit)
  }

  return { data: tools, hasMore, nextCursor }
}

export async function getAdminTool(id: string): Promise<Tool | null> {
  const { supabase } = await requireAdmin()
  const { data } = await supabase
    .from("tools")
    .select("*")
    .eq("id", id)
    .single()
  return data
}

export async function createTool(formData: FormData) {
  const { supabase } = await requireAdmin()

  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const website_url = formData.get("website_url") as string
  const category = formData.get("category") as string
  const pricing = formData.get("pricing") as string
  const tagsRaw = formData.get("tags") as string
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const { error } = await supabase.from("tools").insert({
    name,
    slug,
    description,
    website_url,
    category,
    pricing,
    tags,
  })

  if (error) throw new Error(error.message)
}

export async function updateTool(id: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const website_url = formData.get("website_url") as string
  const category = formData.get("category") as string
  const pricing = formData.get("pricing") as string
  const tagsRaw = formData.get("tags") as string
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const { error } = await supabase
    .from("tools")
    .update({
      name,
      slug,
      description,
      website_url,
      category,
      pricing,
      tags,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function deleteTool(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("tools").delete().eq("id", id)

  if (error) throw new Error(error.message)
}
