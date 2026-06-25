"use client"

import { useState, useCallback } from "react"
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
import { getSubmissions, approveSubmission, rejectSubmission } from "@/actions/admin"
import type { Submission } from "@/types"
import type { AdminSubmissionResult } from "@/actions/admin"

const statusColors: Record<string, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
}

interface SubmissionListProps {
  initialSubmissions: Submission[]
  initialHasMore: boolean
  initialCursor: string | null
}

export function SubmissionList({
  initialSubmissions,
  initialHasMore,
  initialCursor,
}: SubmissionListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null)

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setError(null)

    try {
      const result: AdminSubmissionResult = await getSubmissions(cursor)
      setSubmissions((prev) => {
        const existingIds = new Set(prev.map((s) => s.id))
        const newItems = result.data.filter((s) => !existingIds.has(s.id))
        return [...prev, ...newItems]
      })
      setHasMore(result.hasMore)
      setCursor(result.nextCursor)
    } catch {
      setError("Failed to load more submissions.")
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, cursor])

  const handleConfirm = useCallback(async () => {
    if (!confirmId || !confirmAction) return
    setProcessingId(confirmId)
    setError(null)

    try {
      if (confirmAction === "approve") {
        await approveSubmission(confirmId)
      } else {
        await rejectSubmission(confirmId)
      }
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === confirmId
            ? {
                ...s,
                status: confirmAction === "approve" ? "approved" : "rejected",
                reviewed_at: new Date().toISOString(),
              }
            : s
        )
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process submission.")
    } finally {
      setProcessingId(null)
      setConfirmId(null)
      setConfirmAction(null)
    }
  }, [confirmId, confirmAction])

  if (submissions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No submissions yet.
      </p>
    )
  }

  return (
    <div>
      <div className="space-y-3">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{sub.name}</span>
                <Badge
                  variant={statusColors[sub.status] || "secondary"}
                  className="text-xs"
                >
                  {sub.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {sub.website_url}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {sub.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {sub.category} &middot; {sub.pricing} &middot;{" "}
                {new Date(sub.created_at).toLocaleDateString("en-US")}
              </p>
            </div>

            {sub.status === "pending" && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <Button
                  variant="default"
                  size="sm"
                  disabled={processingId === sub.id}
                  onClick={() => {
                    setConfirmId(sub.id)
                    setConfirmAction("approve")
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={processingId === sub.id}
                  onClick={() => {
                    setConfirmId(sub.id)
                    setConfirmAction("reject")
                  }}
                >
                  Reject
                </Button>
              </div>
            )}
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
        open={!!confirmId}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmId(null)
            setConfirmAction(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve" ? "Approve" : "Reject"} Submission
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "approve"
                ? "This will publish the tool to the public directory."
                : "This will reject the submission. The submitter will not be notified."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === "approve" ? "default" : "destructive"}
              onClick={handleConfirm}
            >
              {confirmAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
