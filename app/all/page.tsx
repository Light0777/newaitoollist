import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Sidebar } from "@/components/sidebar"
import { ToolGridWithLoadMore, ToolGridSkeleton } from "@/components/tool-grid"
import { getTrendingTools, getDateOrderedTools, getCategories } from "@/actions/tools"

export const dynamic = "force-dynamic"

async function AllToolsContent() {
  const [latestTools, { data, hasMore, nextCursor }] = await Promise.all([
    getTrendingTools(4),
    getDateOrderedTools(24),
  ])

  return (
    <ToolGridWithLoadMore
      key="all"
      latestTools={latestTools}
      initialTools={data}
      initialHasMore={hasMore}
      initialCursor={nextCursor}
    />
  )
}

export default async function AllToolsPage() {
  const categories = await getCategories()

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-xl font-semibold mb-6">
          All AI Tools
        </h1>
        <div className="flex gap-8">
          <Sidebar categories={categories} />
          <section className="flex-1 min-w-0">
            <Suspense fallback={<ToolGridSkeleton />}>
              <AllToolsContent />
            </Suspense>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
