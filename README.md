# newaitoollist.com

A curated directory of AI tools. Discover, browse, and submit the best AI tools for every task.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI**: [Base UI](https://base-ui.com) + custom components
- **Analytics**: [Vercel Web Analytics](https://vercel.com/analytics)
- **Deployment**: [Vercel](https://vercel.com)

## Features

- Browse latest AI tools with infinite scroll / load more
- Filter by category (AI Agents, Image AI, Video AI, etc.)
- Filter by time period (Today, This Week, This Month)
- Full-text search across name, description, and tags
- Individual tool pages with metadata
- Public tool submission with spam protection
- Admin dashboard for managing tools and submissions
- SEO optimized with sitemap and metadata
- Responsive design (mobile + desktop)

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)

### Setup

1. Clone the repo:

```bash
git clone https://github.com/your-username/newaitoollist.com.git
cd newaitoollist.com
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (admin only) |

4. Run database migrations:

Open your Supabase dashboard → **SQL Editor** → run each file in `supabase/migrations/` in order.

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The app uses three tables:

- **`tools`** — Published AI tools
- **`categories`** — Tool categories (AI Agents, Image AI, etc.)
- **`submissions`** — User-submitted tools awaiting review
- **`admins`** — Admin user emails

All database queries are paginated using cursor-based pagination. The app never loads the full dataset into memory and scales to thousands of tools without redesign.

## How to Submit a Tool

Anyone can submit an AI tool for listing:

1. Go to [newaitoollist.com/submit](https://newaitoollist.com/submit)
2. Fill in the tool name, website URL, description, category, pricing, and tags
3. Click **Submit Tool**

Your submission will be reviewed by an admin before being published.

### Anti-spam measures

- **Honeypot field**: Hidden field that bots fill but humans don't see
- **IP rate limit**: One submission per IP every 5 minutes
- **URL deduplication**: Checks if the tool's domain is already listed

## Admin Guide

Admin features are available at `/admin`. To become an admin, add your email to the `admins` table in Supabase.

### Managing tools

- **Add**: Use the "Add Tool" form at `/admin/tools/new`
- **Edit**: Click the edit icon next to any tool
- **Delete**: Click the trash icon (with confirmation dialog)

### Reviewing submissions

1. Go to `/admin/submissions`
2. Review each submission's name, URL, and description
3. Click **Approve** to publish the tool to the directory
4. Click **Reject** to decline the submission

Approved tools are automatically inserted into the `tools` table with a unique slug. If a slug collision is detected, a suffix is appended (e.g., `my-tool-2`).

## Project Structure

```
app/
  page.tsx              Homepage
  submit/               Public submission page
  category/[slug]/      Category listing page
  tools/[slug]/         Individual tool page
  admin/                Admin dashboard
    submissions/        Submission review page
    tools/new/          Add tool form
    tools/[id]/edit/    Edit tool form
actions/
  tools.ts              Public server actions (paginated queries)
  admin.ts              Admin server actions
  submissions.ts        Public submission action
components/
  tool-grid.tsx         Client-side tool grid with load more
  tool-card.tsx         Tool card component
  search.tsx            Debounced search
  submit-tool-form.tsx  Public submission form
  admin/                Admin-specific components
    submission-list.tsx Submission review list
    tool-form.tsx       Shared tool form (add/edit)
  ui/                   Reusable UI primitives
supabase/migrations/    Database migrations
types/                  TypeScript interfaces
```

## Performance

- Every database query is bounded with `LIMIT` (max 21 rows for public queries)
- Cursor-based pagination using `(created_at, id)` prevents full table scans
- Search uses Supabase filters with `ILIKE` on indexed columns
- All list pages support "Load More" with deduplication
- Sitemap generation batches 1000 rows at a time

## Contributing

Contributions are welcome! If you'd like to improve the project:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-idea`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-idea`)
5. Open a pull request

Or simply submit a tool via the form — every submission helps grow the directory.

## License

[MIT](LICENSE)

---

Thanks for taking the time to read this. If you find this project useful, consider starring the repo or sharing it with others. Happy tool hunting!
