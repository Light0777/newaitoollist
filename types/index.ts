export interface Tool {
  id: string
  name: string
  slug: string
  description: string
  website_url: string
  category: string
  pricing: string
  tags: string[]
  logo_url: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
}
