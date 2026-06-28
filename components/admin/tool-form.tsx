"use client"

import { useState, useCallback } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
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
  const [formKey, setFormKey] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const wrappedAction = useCallback(
    async (
      _prev: ActionResult | null,
      formData: FormData
    ): Promise<ActionResult> => {
      const result = await action(formData)
      if (result.success) {
        setFormKey((k) => k + 1)
        setSuccessMessage("Tool saved successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
      return result
    },
    [action]
  )

  const [state, formAction] = useActionState(wrappedAction, null)

  return (
    <div>
      {successMessage && (
        <p className="text-sm text-green-600 mb-4">{successMessage}</p>
      )}

      <form key={formKey} action={formAction} className="space-y-6 max-w-lg">
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

        <fieldset className="border rounded-lg p-4 space-y-3">
          <legend className="text-sm font-medium px-1">Trending</legend>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="trending"
              defaultChecked={tool?.trending === true}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm">Mark as trending</span>
          </label>
          <div className="space-y-2">
            <Label>Position</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((pos) => (
                <label
                  key={pos}
                  className="flex items-center justify-center h-10 w-10 rounded-md border border-input bg-transparent text-sm font-medium cursor-pointer has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="trending_position"
                    value={pos}
                    defaultChecked={tool?.trending_position === pos}
                    className="sr-only"
                  />
                  {pos}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        {state && !state.success && state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <SubmitButton label={submitLabel} />
      </form>
    </div>
  )
}
