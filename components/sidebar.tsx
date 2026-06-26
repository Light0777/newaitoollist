"use client"

import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/search"
import { FilterButtons } from "@/components/filter-buttons"
import { PricingButtons } from "@/components/pricing-buttons"
import { CategoryButtons } from "@/components/category-buttons"
import { useSidebar } from "@/lib/sidebar-context"
import type { Category } from "@/types"

export function Sidebar({ categories }: { categories: Category[] }) {
  const { open, setOpen } = useSidebar()
  const pathname = usePathname()
  const isAllActive = pathname === "/"
  const activeCategory = pathname.startsWith("/category/") ? pathname.replace("/category/", "") : null

  const linkClass = (isActive: boolean) =>
    `text-sm transition-colors px-2 py-1 rounded ${
      isActive
        ? "bg-primary text-primary-foreground font-medium"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Search</h3>
        <Search />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Categories</h3>
        <div className="flex flex-col gap-1.5">
          <a
            href="/"
            className={linkClass(isAllActive)}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={linkClass(cat.slug === activeCategory)}
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Pricing</h3>
        <PricingButtons />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Time</h3>
        <FilterButtons />
      </div>
    </div>
  )

  return (
    <>
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
            <div className="pt-4 border-t mt-6">
              <a
                href="/submit"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                Submit Tool
              </a>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-8 space-y-6">{content}</div>
      </aside>
    </>
  )
}
