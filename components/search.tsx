"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function Search() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    const trimmed = query.trim()
    if (!trimmed) {
      router.push("/")
      return
    }

    timerRef.current = setTimeout(() => {
      router.push(`/?search=${encodeURIComponent(trimmed)}`)
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, router])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search AI tools..."
        className="pl-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}
