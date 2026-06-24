"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitTool } from "@/actions/submissions"
import type { Category } from "@/types"
import type { SubmitResult } from "@/actions/submissions"

const initialState: SubmitResult = { success: false, error: undefined }

async function wrappedSubmit(_prev: SubmitResult, formData: FormData): Promise<SubmitResult> {
  return submitTool(formData)
}

export function SubmitToolForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(wrappedSubmit, initialState)

  if (state.success) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
        <p className="text-muted-foreground">
          Your tool has been submitted for review. We will review it shortly.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6 max-w-lg">
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="_website">Website</Label>
        <Input id="_website" name="_website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Tool Name</Label>
        <Input id="name" name="name" required placeholder="e.g. ChatGPT" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          name="website_url"
          type="url"
          required
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
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
          required
          defaultValue=""
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
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          placeholder="e.g. chat, gpt, writing"
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit Tool"}
      </Button>
    </form>
  )
}
