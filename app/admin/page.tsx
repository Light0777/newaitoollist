import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Admin Dashboard | NewAIToolList",
  robots: { index: false, follow: false },
}
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireAdmin } from "@/lib/admin"
import { getAdminTools } from "@/actions/admin"
import { AdminToolList } from "@/components/admin-tool-list"
import { AdminSearch } from "@/components/admin-search"
import { Plus, Inbox } from "lucide-react"

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { supabase, user } = await requireAdmin()
  const { q } = await searchParams
  const { data, hasMore, nextCursor } = await getAdminTools(null, q)

  const { count } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Signed in as {user.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">View Site</Button>
          </Link>
          <Link href="/admin/submissions">
            <Button variant="secondary" size="sm">
              <Inbox className="h-4 w-4 mr-1" />
              Submissions
            </Button>
          </Link>
          <Link href="/admin/tools/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Tool
            </Button>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <Button variant="outline" size="sm" type="submit">Logout</Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tools {count !== null && <span className="text-muted-foreground font-normal text-lg">({count})</span>}</CardTitle>
          <div className="mt-2">
            <Suspense>
              <AdminSearch />
            </Suspense>
          </div>
        </CardHeader>
        <CardContent>
          <AdminToolList
            key={q || ""}
            searchQuery={q || ""}
            initialTools={data}
            initialHasMore={hasMore}
            initialCursor={nextCursor}
          />
        </CardContent>
      </Card>
    </div>
  )
}
