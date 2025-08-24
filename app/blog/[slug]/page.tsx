import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, BookOpen, Tag } from 'lucide-react'
import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import { sanitizeHtml } from '@/lib/sanitizeHtml'

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug).catch(() => null)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug).catch(() => null)
  if (!post) notFound()

  return (
    <div className="relative min-h-screen pt-16">
      <div className="fixed inset-0 -z-10 animated-bg" />
      <section aria-label="Back navigation" className="py-8 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Blog
          </Link>
        </div>
      </section>
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="glass rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium rounded-full">
                {post.category}
              </span>
              {post.tags?.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="w-full h-64 mb-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center rounded-xl">
              <Tag size={64} className="text-white/30" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-400">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                {post.readTime}
              </div>
              <div className="flex items-center">
                <BookOpen size={16} className="mr-2" />
                By {post.author}
              </div>
            </div>
            <div
              className="prose prose-lg prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />
          </article>
        </div>
      </section>
    </div>
  )
}
