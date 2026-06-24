import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { requireAdmin } from "@/lib/admin"
import { getSubmissions } from "@/actions/admin"
import { SubmissionList } from "@/components/admin/submission-list"

export default async function AdminSubmissionsPage() {
  await requireAdmin()
  const { data, hasMore, nextCursor } = await getSubmissions()

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">Submissions</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionList
            initialSubmissions={data}
            initialHasMore={hasMore}
            initialCursor={nextCursor}
          />
        </CardContent>
      </Card>
    </div>
  )
}
