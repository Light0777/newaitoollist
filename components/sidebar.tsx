"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/search"
import { FilterButtons } from "@/components/filter-buttons"
import { CategoryButtons } from "@/components/category-buttons"
import type { Category } from "@/types"

export function Sidebar({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Search</h3>
        <Search />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Categories</h3>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Time</h3>
        <FilterButtons />
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-[18px] right-4 z-40 p-2 rounded-md border bg-background"
        aria-label="Open filters"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 max-w-[80vw] bg-background border-l overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-muted"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}

      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-8 space-y-6">{content}</div>
      </aside>
    </>
  )
}
