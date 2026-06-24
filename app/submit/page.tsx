import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SubmitToolForm } from "@/components/submit-tool-form"
import { getCategories } from "@/actions/tools"

export default async function SubmitPage() {
  const categories = await getCategories()

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Submit an AI Tool</h1>
        <p className="text-muted-foreground mb-8">
          Know a great AI tool that should be listed? Submit it for review.
        </p>

        <SubmitToolForm categories={categories} />
      </main>
      <Footer />
    </>
  )
}
