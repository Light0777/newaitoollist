import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ToolIcon } from "@/components/tool-icon"
import type { Tool } from "@/types"

export function SimilarTools({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Similar Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link key={tool.id} href={`/tools/${tool.slug}`}>
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-2">
                  <ToolIcon
                    websiteUrl={tool.website_url}
                    name={tool.name}
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {tool.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tool.pricing}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
