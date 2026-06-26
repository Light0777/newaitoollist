"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu09Icon } from "@hugeicons/core-free-icons"
import { useSidebar } from "@/lib/sidebar-context"

export function Header() {
  const { open, setOpen } = useSidebar()

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          newaitoollist.com
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/submit" className="hidden lg:block">
            <Button variant="outline" size="sm">
              Submit Tool
            </Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 -mr-2 rounded-md hover:bg-muted"
            aria-label={open ? "Close filters" : "Open filters"}
          >
            {open ? <X className="h-5 w-5" /> : <HugeiconsIcon icon={Menu09Icon} size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
