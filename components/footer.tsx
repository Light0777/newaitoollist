import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            newaitoollist.com
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/submit" className="hover:text-foreground transition-colors">
              Submit Tool
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} newaitoollist.com
          </p>
        </div>
      </div>
    </footer>
  )
}
