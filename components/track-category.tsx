"use client"

import { useEffect } from "react"

export function TrackCategoryView({ category }: { category: string }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentCategories")
      const categories = stored ? JSON.parse(stored) : []
      categories.unshift(category)
      const trimmed = categories.slice(0, 10)
      localStorage.setItem("recentCategories", JSON.stringify(trimmed))
    } catch {
      // localStorage not available
    }
  }, [category])

  return null
}
