import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          newaitoollist.com
        </Link>
        <Link href="/submit" className="hidden lg:block">
          <Button variant="outline" size="sm">
            Submit Tool
          </Button>
        </Link>
      </div>
    </header>
  )
}
