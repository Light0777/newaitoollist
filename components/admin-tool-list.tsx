"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { getAdminTools, deleteTool } from "@/actions/admin"
import { ExternalLink, Edit, Trash2 } from "lucide-react"
import type { Tool } from "@/types"
import type { AdminPaginatedResult } from "@/actions/admin"

interface AdminToolListProps {
  initialTools: Tool[]
  initialHasMore: boolean
  initialCursor: string | null
}

export function AdminToolList({
  initialTools,
  initialHasMore,
  initialCursor,
}: AdminToolListProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setError(null)

    try {
      const result: AdminPaginatedResult = await getAdminTools(cursor)
      setTools((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const newTools = result.data.filter((t) => !existingIds.has(t.id))
        return [...prev, ...newTools]
      })
      setHasMore(result.hasMore)
      setCursor(result.nextCursor)
    } catch {
      setError("Failed to load more tools.")
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, cursor])

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    setError(null)
    try {
      await deleteTool(id)
      setTools((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setError("Failed to delete tool.")
    }
  }, [])

  if (tools.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No tools yet. Add your first tool.
      </p>
    )
  }

  return (
    <div>
      <div className="space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{tool.name}</span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {tool.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {tool.description}
              </p>
            </div>
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <Link href={`/tools/${tool.slug}`} target="_blank">
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/admin/tools/${tool.id}/edit`}>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeletingId(tool.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive mt-4">{error}</p>
      )}

      {loading && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Loading...
        </p>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}

      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => { if (!open) setDeletingId(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tool</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {tools.find((t) => t.id === deletingId)?.name}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingId) handleDelete(deletingId)
                setDeletingId(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
