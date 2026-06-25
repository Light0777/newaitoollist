"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { processToolEmbedding } from "@/lib/embedding"
import type { Tool, Submission } from "@/types"

export interface AdminPaginatedResult {
  data: Tool[]
  hasMore: boolean
  nextCursor: string | null
}

export interface AdminSubmissionResult {
  data: Submission[]
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

export interface ActionResult {
  success: boolean
  error?: string
}

export async function createTool(formData: FormData): Promise<ActionResult> {
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

  const { data: inserted, error } = await supabase
    .from("tools")
    .insert({ name, slug, description, website_url, category, pricing, tags })
    .select("id")

  if (error) {
    if (error.message.includes("duplicate key") && error.message.includes("tools_slug_key")) {
      return { success: false, error: "A tool with this slug already exists." }
    }
    return { success: false, error: "Something went wrong. Please try again." }
  }

  if (inserted?.[0]?.id) {
    processToolEmbedding(inserted[0].id, name, description, category).catch(console.error)
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function updateTool(
  id: string,
  formData: FormData
): Promise<ActionResult> {
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

  if (error) {
    if (error.message.includes("duplicate key") && error.message.includes("tools_slug_key")) {
      return { success: false, error: "A tool with this slug already exists." }
    }
    return { success: false, error: "Something went wrong. Please try again." }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function deleteTool(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("tools").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}

export async function getSubmissions(
  cursor?: string | null,
  status?: string
): Promise<AdminSubmissionResult> {
  const { supabase } = await requireAdmin()

  const limit = 50
  const fetchLimit = limit + 1

  let offset = 0
  if (cursor) {
    const decoded = JSON.parse(Buffer.from(cursor, "base64").toString())
    offset = decoded.offset
  }

  let query = supabase
    .from("submissions")
    .select("*")

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + fetchLimit - 1)

  if (error || !data) {
    return { data: [], hasMore: false, nextCursor: null }
  }

  const hasMore = data.length > limit
  const items = data.slice(0, limit)

  let nextCursor: string | null = null
  if (hasMore) {
    nextCursor = encodeCursor(offset + limit)
  }

  return { data: items, hasMore, nextCursor }
}

export async function approveSubmission(id: string) {
  const { supabase, user } = await requireAdmin()

  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !submission) {
    throw new Error("Submission not found.")
  }

  if (submission.status !== "pending") {
    throw new Error("Submission is already processed.")
  }

  let slug = submission.slug
  const { data: existing } = await supabase
    .from("tools")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle()

  if (existing) {
    let counter = 2
    while (true) {
      const newSlug = `${slug}-${counter}`
      const { data: dup } = await supabase
        .from("tools")
        .select("slug")
        .eq("slug", newSlug)
        .maybeSingle()
      if (!dup) {
        slug = newSlug
        break
      }
      counter++
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("tools")
    .insert({
      name: submission.name,
      slug,
      description: submission.description,
      website_url: submission.website_url,
      category: submission.category,
      pricing: submission.pricing,
      tags: submission.tags,
    })
    .select("id")

  if (insertError) {
    if (
      insertError.message.includes("duplicate key") &&
      insertError.message.includes("tools_slug_key")
    ) {
      throw new Error("A tool with this name or URL already exists in the directory.")
    }
    throw new Error(insertError.message)
  }

  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", id)

  if (updateError) throw new Error(updateError.message)

  if (inserted?.[0]?.id) {
    processToolEmbedding(
      inserted[0].id,
      submission.name,
      submission.description,
      submission.category
    ).catch(console.error)
  }

  revalidatePath("/admin")
  revalidatePath("/admin/submissions")
}

export async function rejectSubmission(id: string) {
  const { supabase, user } = await requireAdmin()

  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("id", id)
    .single()

  if (fetchError || !submission) {
    throw new Error("Submission not found.")
  }

  if (submission.status !== "pending") {
    throw new Error("Submission is already processed.")
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/submissions")
}
