"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Tool, Category } from "@/types"
import type { ActionResult } from "@/actions/admin"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  )
}

export function ToolForm({
  categories,
  tool,
  action,
  submitLabel,
}: {
  categories: Category[]
  tool?: Tool | null
  action: (formData: FormData) => Promise<ActionResult>
  submitLabel: string
}) {
  const router = useRouter()

  const wrappedAction = async (
    _prev: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> => {
    return action(formData)
  }

  const [state, formAction] = useActionState(wrappedAction, null)

  if (state?.success) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Tool Saved</h2>
        <p className="text-muted-foreground mb-4">
          The tool has been saved successfully.
        </p>
        <Button onClick={() => router.push("/admin")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={tool?.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={tool?.slug}
          required
          placeholder="e.g. my-ai-tool"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          name="website_url"
          type="url"
          defaultValue={tool?.website_url}
          required
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={tool?.description}
          required
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Describe what this AI tool does..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={tool?.category || ""}
          required
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricing">Pricing</Label>
        <select
          id="pricing"
          name="pricing"
          defaultValue={tool?.pricing || "Free"}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option>Free</option>
          <option>Freemium</option>
          <option>Paid</option>
          <option>Free Trial</option>
          <option>Contact for Pricing</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={tool?.tags?.join(", ") || ""}
          placeholder="e.g. chat, gpt, writing"
        />
      </div>

      {state && !state.success && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  )
}
