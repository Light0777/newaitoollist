import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToolIcon } from "@/components/tool-icon"
import { SimilarTools } from "@/components/similar-tools"
import { TrackCategoryView } from "@/components/track-category"
import { ExternalLink, ArrowLeft, Calendar } from "lucide-react"
import { getToolBySlug, getToolEmbedding, getSimilarTools } from "@/actions/tools"

function formatCategory(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\bAi\b/g, "AI")
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = await getToolBySlug(slug)

  if (!tool) {
    return { title: "Tool not found | NewAIToolList" }
  }

  const categoryDisplay = formatCategory(tool.category)

  const baseUrl = "https://newaitoollist.com"

  return {
    title: `${tool.name} - ${categoryDisplay} | NewAIToolList`,
    description: `Discover ${tool.name}, an ${categoryDisplay.toLowerCase()} tool. ${tool.description}`,
    openGraph: {
      title: `${tool.name} - ${categoryDisplay} | NewAIToolList`,
      description: `Discover ${tool.name}, an ${categoryDisplay.toLowerCase()} tool. ${tool.description}`,
      type: "article",
      publishedTime: tool.created_at,
      tags: tool.tags,
      images: [
        {
          url: `${baseUrl}/tools/${tool.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} - ${categoryDisplay} | NewAIToolList`,
      description: `Discover ${tool.name}, an ${categoryDisplay.toLowerCase()} tool. ${tool.description}`,
      images: [`${baseUrl}/tools/${tool.slug}/opengraph-image`],
    },
  }
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)

  if (!tool) {
    notFound()
  }

  let similarTools: Awaited<ReturnType<typeof getSimilarTools>> = []
  if (tool.embedding_status === "done") {
    const embedding = await getToolEmbedding(tool.id)
    if (embedding) {
      similarTools = await getSimilarTools(tool.id, embedding)
    }
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tools
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <ToolIcon websiteUrl={tool.website_url} name={tool.name} size="lg" />
            <div>
              <h1 className="text-3xl font-bold">{tool.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Added {new Date(tool.created_at).toLocaleDateString("en-US")}
              </div>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            {tool.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">{formatCategory(tool.category)}</Badge>
            <Badge variant="outline">{tool.pricing}</Badge>
          </div>

          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <a
            href={tool.website_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>
              Visit Website
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </a>

          <SimilarTools tools={similarTools} />
        </div>

        <TrackCategoryView category={tool.category} />
      </main>
      <Footer />
    </>
  )
}
