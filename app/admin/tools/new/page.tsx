import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireAdmin } from "@/lib/admin"
import { ToolForm } from "@/components/admin/tool-form"
import { createTool } from "@/actions/admin"
import { getCategories } from "@/actions/tools"

export default async function NewToolPage() {
  await requireAdmin()
  const categories = await getCategories()

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">Add New Tool</h1>

      <ToolForm
        categories={categories}
        action={createTool}
        submitLabel="Add Tool"
      />
    </div>
  )
}
