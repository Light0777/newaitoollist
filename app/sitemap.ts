import type { MetadataRoute } from "next"
import { getCategories, getAllToolSlugsForSitemap } from "@/actions/tools"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://newaitoollist.com"

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ]

  try {
    const [categories, tools] = await Promise.all([
      getCategories(),
      getAllToolSlugsForSitemap(),
    ])

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: new Date(tool.created_at),
      changeFrequency: "monthly",
      priority: 0.9,
    }))

    return [...staticRoutes, ...categoryRoutes, ...toolRoutes]
  } catch {
    return staticRoutes
  }
}
