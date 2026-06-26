"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PRICING_MAP } from "@/lib/pricing"

export function PricingButtons() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get("pricing") || ""

  function setPricing(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("pricing", value)
    } else {
      params.delete("pricing")
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!active ? "default" : "outline"}
        size="sm"
        onClick={() => setPricing("")}
      >
        All
      </Button>
      {Object.entries(PRICING_MAP).map(([value, label]) => (
        <Button
          key={value}
          variant={active === value ? "default" : "outline"}
          size="sm"
          onClick={() => setPricing(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
