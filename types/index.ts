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

export interface Submission {
  id: string
  name: string
  slug: string
  description: string
  website_url: string
  category: string
  pricing: string
  tags: string[]
  status: "pending" | "approved" | "rejected"
  submitter_ip: string | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}
