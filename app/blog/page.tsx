import BlogPageClient from './BlogPageClient'
import { getAllPosts } from '@/lib/posts'

export default async function BlogPage() {
  const posts = await getAllPosts()
  return <BlogPageClient posts={posts} />
}
