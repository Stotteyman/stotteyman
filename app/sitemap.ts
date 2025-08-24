import type { MetadataRoute } from 'next'
import { getPostSlugs } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://stotteyman.com'

  const routes = ['', '/about', '/ventures', '/livestream', '/blog', '/contact']

  const blogRoutes = getPostSlugs().map((slug) => `/blog/${slug}`)

  return [...routes, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))
}
