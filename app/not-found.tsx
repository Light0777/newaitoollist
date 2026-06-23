import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Page not found
        </p>
        <Link href="/">
          <Button>Go home</Button>
        </Link>
      </main>
      <Footer />
    </>
  )
}
