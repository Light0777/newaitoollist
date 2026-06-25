"use server"

import { headers } from "next/headers"
import { getSupabase } from "@/lib/supabase"

export interface SubmitResult {
  success: boolean
  error?: string
}

function getClient() {
  try {
    return getSupabase()
  } catch {
    return null
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url.toLowerCase().trim()
  }
}

async function checkDuplicateDomain(domain: string): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false

  const { data: existingTool } = await supabase
    .from("tools")
    .select("id")
    .ilike("website_url", `%${domain}%`)
    .maybeSingle()

  if (existingTool) return true

  const { data: existingSubmission } = await supabase
    .from("submissions")
    .select("id")
    .eq("status", "pending")
    .ilike("website_url", `%${domain}%`)
    .maybeSingle()

  return !!existingSubmission
}

async function generateUniqueSlug(name: string): Promise<string> {
  const supabase = getClient()
  if (!supabase) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const { data: existing } = await supabase
    .from("tools")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle()

  if (!existing) return slug

  let counter = 2
  while (true) {
    const newSlug = `${slug}-${counter}`
    const { data: dup } = await supabase
      .from("tools")
      .select("slug")
      .eq("slug", newSlug)
      .maybeSingle()
    if (!dup) return newSlug
    counter++
  }
}

async function checkCooldown(ip: string): Promise<boolean> {
  const supabase = getClient()
  if (!supabase) return false

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from("submissions")
    .select("id")
    .eq("submitter_ip", ip)
    .gte("created_at", fiveMinAgo)
    .maybeSingle()

  return !!data
}

export async function submitTool(formData: FormData): Promise<SubmitResult> {
  const honeypot = formData.get("_website") as string
  if (honeypot) {
    return { success: true }
  }

  const headerStore = await headers()
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"

  const isOnCooldown = await checkCooldown(ip)
  if (isOnCooldown) {
    return {
      success: false,
      error: "Please wait at least 5 minutes between submissions.",
    }
  }

  const name = (formData.get("name") as string)?.trim()
  const website_url = (formData.get("website_url") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const category = formData.get("category") as string
  const pricing = formData.get("pricing") as string
  const tagsRaw = formData.get("tags") as string

  if (!name || !website_url || !description || !category) {
    return { success: false, error: "Please fill in all required fields." }
  }

  const domain = extractDomain(website_url)
  const isDuplicate = await checkDuplicateDomain(domain)
  if (isDuplicate) {
    return {
      success: false,
      error: "This tool has already been submitted or is already listed.",
    }
  }

  const slug = await generateUniqueSlug(name)
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const supabase = getClient()
  if (!supabase) {
    return { success: false, error: "Service unavailable. Please try again." }
  }

  const { error } = await supabase.from("submissions").insert({
    name,
    slug,
    description,
    website_url,
    category,
    pricing: pricing || "Free",
    tags,
    submitter_ip: ip,
  })

  if (error) {
    return { success: false, error: "This tool appears to already exist. Please try a different name or URL." }
  }

  return { success: true }
}
