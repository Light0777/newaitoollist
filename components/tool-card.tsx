import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToolIcon } from "@/components/tool-icon"
import type { Tool } from "@/types"

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-1 pt-6">
        <div className="flex items-start gap-3 mb-3">
          <ToolIcon websiteUrl={tool.website_url} name={tool.name} />
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{tool.name}</h3>
            <p className="text-xs text-muted-foreground">
              Added {new Date(tool.created_at).toLocaleDateString("en-US")}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {tool.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="secondary" className="text-xs">
            {tool.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tool.pricing}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/tools/${tool.slug}`} className="w-full">
          <Button variant="default" size="sm" className="w-full">
            View Tool
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export function ToolCardSkeleton() {
  return (
    <Card className="flex flex-col h-full animate-pulse">
      <CardContent className="flex-1 pt-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-14" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="h-9 bg-muted rounded w-full" />
      </CardFooter>
    </Card>
  )
}
