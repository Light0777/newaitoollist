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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-2">Add New Tool</h1>
      <p className="text-muted-foreground mb-8">
        Add a new AI tool to the directory.
      </p>

      <ToolForm
        categories={categories}
        action={createTool}
        submitLabel="Add Tool"
      />
    </div>
  )
}
