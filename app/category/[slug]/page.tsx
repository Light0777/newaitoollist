import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"
import { ToolGridWithLoadMore } from "@/components/tool-grid"
import { ArrowLeft } from "lucide-react"
import { getToolsByCategory, getCategories } from "@/actions/tools"

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
  const categoryName = formatCategory(slug)

  return {
    title: `${categoryName} Tools | NewAIToolList`,
    description: `Browse the best ${categoryName.toLowerCase()} AI tools. Discover new AI tools for ${categoryName.toLowerCase()}.`,
    openGraph: {
      title: `${categoryName} Tools | NewAIToolList`,
      description: `Browse the best ${categoryName.toLowerCase()} AI tools. Discover new AI tools for ${categoryName.toLowerCase()}.`,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const categories = await getCategories()
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    notFound()
  }

  const { data, hasMore, nextCursor } = await getToolsByCategory(slug, 20)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All tools
        </Link>

        <div className="flex gap-8">
          <Sidebar categories={categories} />
          <section className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground mb-8">
              {data.length} tool{data.length !== 1 ? "s" : ""} in this category
            </p>

        <ToolGridWithLoadMore
          key={slug}
          initialTools={data}
          initialHasMore={hasMore}
          initialCursor={nextCursor}
          categorySlug={slug}
          emptyMessage="No tools in this category yet."
        />
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
