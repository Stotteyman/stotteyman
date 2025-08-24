import BlogPageClient from './BlogPageClient'
import { getAllPosts } from '@/lib/posts'

export default async function BlogPage() {
  try {
    const posts = await getAllPosts()
    return <BlogPageClient posts={posts} />
  } catch (error) {
    console.error('Error loading blog posts:', error)
    return <BlogPageClient posts={[]} />
  }
}
