import type { MetadataRoute } from 'next'
import { blogPosts } from './blog/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://stotteyman.com'

  const routes = ['', '/about', '/ventures', '/livestream', '/blog', '/contact']

  const blogRoutes = blogPosts.map((post) => `/blog/${post.id}`)

  return [...routes, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))
}
