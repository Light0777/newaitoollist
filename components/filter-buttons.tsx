"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

const periods = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
] as const

export function FilterButtons() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get("period") || ""

  function setPeriod(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("period", value)
    } else {
      params.delete("period")
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!active ? "default" : "outline"}
        size="sm"
        onClick={() => setPeriod("")}
      >
        All Time
      </Button>
      {periods.map((p) => (
        <Button
          key={p.value}
          variant={active === p.value ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}
