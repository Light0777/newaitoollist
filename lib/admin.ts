import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAdmin(userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("email", userEmail)
    .single()

  return !!data
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("email", user.email)
    .single()

  if (!admin) {
    redirect("/")
  }

  return { supabase, user }
}
