import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search } from "@/components/search"
import { Sidebar } from "@/components/sidebar"
import { ToolGridWithLoadMore, ToolGridSkeleton } from "@/components/tool-grid"
import { HomepageSections, HomepageSectionsSkeleton } from "@/components/homepage-sections"
import { getLatestTools, searchTools, getCategories } from "@/actions/tools"

async function FilteredContent({
  searchQuery,
  period,
  pricing,
}: {
  searchQuery?: string
  period?: string
  pricing?: string
}) {
  if (searchQuery) {
    const { data, hasMore, nextCursor } = await searchTools(
      searchQuery,
      9999,
      null,
      period,
      pricing
    )
    return (
      <ToolGridWithLoadMore
        key={`search-${searchQuery}`}
        initialTools={data}
        initialHasMore={hasMore}
        initialCursor={nextCursor}
        searchQuery={searchQuery}
        period={period}
        pricing={pricing}
        emptyMessage={`No tools found for "${searchQuery}"`}
      />
    )
  }

  const { data, hasMore, nextCursor } = await getLatestTools(9999, null, period, pricing)
  return (
    <ToolGridWithLoadMore
      key="home"
      initialTools={data}
      initialHasMore={hasMore}
      initialCursor={nextCursor}
      period={period}
      pricing={pricing}
    />
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; period?: string; pricing?: string }>
}) {
  const { search, period, pricing } = await searchParams
  const categories = await getCategories()
  const hasFilters = search || period || pricing

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
            {hasFilters ? (
              <Suspense fallback={<ToolGridSkeleton />}>
                <FilteredContent searchQuery={search} period={period} pricing={pricing} />
              </Suspense>
            ) : (
              <Suspense fallback={<HomepageSectionsSkeleton />}>
                <HomepageSections />
              </Suspense>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
