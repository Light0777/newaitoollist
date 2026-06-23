import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Category } from "@/types"

export function CategoryButtons({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Link key={cat.id} href={`/category/${cat.slug}`}>
          <Button variant="outline" size="sm">
            {cat.name}
          </Button>
        </Link>
      ))}
    </div>
  )
}
