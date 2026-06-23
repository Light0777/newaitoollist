"use client"

import { useState } from "react"

function getDomain(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

export function ToolIcon({
  websiteUrl,
  name,
  size = "md",
}: {
  websiteUrl: string
  name: string
  size?: "sm" | "md" | "lg"
}) {
  const [failed, setFailed] = useState(false)
  const domain = getDomain(websiteUrl)

  const sizeClass =
    size === "lg" ? "w-16 h-16 text-3xl rounded-xl" : "w-10 h-10 text-lg rounded-lg"

  if (!domain || failed) {
    return (
      <div
        className={`${sizeClass} bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 border border-black/20`}
      >
        {name.charAt(0)}
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-black/20`}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt={`${name} icon`}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
