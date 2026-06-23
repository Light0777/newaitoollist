import Link from "next/link"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          newaitoollist.com
        </Link>
        <div />
      </div>
    </header>
  )
}
