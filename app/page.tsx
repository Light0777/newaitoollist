import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search } from "@/components/search"
import { Sidebar } from "@/components/sidebar"
import { ToolGridWithLoadMore, ToolGridSkeleton } from "@/components/tool-grid"
import { getLatestTools, searchTools, getCategories } from "@/actions/tools"

async function ToolsGridContent({
  searchQuery,
  period,
}: {
  searchQuery?: string
  period?: string
}) {
  if (searchQuery) {
    const { data, hasMore, nextCursor } = await searchTools(
      searchQuery,
      20,
      null,
      period
    )
    return (
      <ToolGridWithLoadMore
        key={`search-${searchQuery}`}
        initialTools={data}
        initialHasMore={hasMore}
        initialCursor={nextCursor}
        searchQuery={searchQuery}
        period={period}
        emptyMessage={`No tools found for "${searchQuery}"`}
      />
    )
  }

  const { data, hasMore, nextCursor } = await getLatestTools(20, null, period)
  return (
    <ToolGridWithLoadMore
      key="home"
      initialTools={data}
      initialHasMore={hasMore}
      initialCursor={nextCursor}
      period={period}
    />
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; period?: string }>
}) {
  const { search, period } = await searchParams
  const categories = await getCategories()

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-xl font-semibold mb-6">
          Discover new AI tools
        </h1>
        <div className="lg:hidden mb-6">
          <Search />
        </div>
        <div className="flex gap-8">
          <Sidebar categories={categories} />
          <section className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold mb-4">
              {search ? `Results for "${search}"` : "Latest AI Tools"}
            </h2>
            <Suspense fallback={<ToolGridSkeleton />}>
              <ToolsGridContent searchQuery={search} period={period} />
            </Suspense>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
