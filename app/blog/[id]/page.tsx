'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, Tag } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts } from "../posts"
import { sanitizeHtml } from '@/lib/sanitizeHtml'



export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = blogPosts.find(p => p.id === parseInt(params.id))

  if (!post) {
    notFound()
  }

  return (
    <div className="relative min-h-screen pt-16">
      {/* Background */}
      <div className="fixed inset-0 -z-10 animated-bg" />

      {/* Back Button */}
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

      {/* Article Header */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-8 md:p-12 border border-white/10"
          >
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium rounded-full">
                {post.category}
              </span>
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Visual Placeholder */}
            <div className="w-full h-64 mb-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center rounded-xl">
              <Tag size={64} className="text-white/30" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-400">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
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

            {/* Share Button */}
            <div className="flex justify-end mb-8">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 glass border border-white/20 text-gray-300 hover:text-white hover:border-blue-500/50 rounded-full transition-all duration-300"
              >
                <Share2 size={16} className="mr-2" />
                Share Article
              </motion.button>
            </div>

            {/* Content */}
            <div
              className="prose prose-lg prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />

            {/* Author Bio */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">GM</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Gary Lee McCullouch Jr.</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Visionary entrepreneur and strategic investor building the future across multiple industries. 
                    Founder of Stotteyman Enterprises LLC and creator of innovative ventures spanning creative studios, 
                    cannabis tech, and livestream culture.
                  </p>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              Continue Reading
            </h2>
            <p className="text-xl text-gray-300">
              Explore more insights and ideas from our blog.
            </p>
          </motion.div>

          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-full neon-glow transition-all duration-300 hover:scale-105"
            >
              View All Articles
              <ArrowLeft size={20} className="ml-2 rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              Let&apos;s Discuss
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Interested in exploring investment opportunities or discussing the ideas in this article?
            </p>
            
            <motion.a
              href="https://calendly.com/garymccullouch"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-semibold rounded-full neon-glow transition-all duration-300"
            >
              Schedule a Call
              <Calendar size={24} className="ml-3" />
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}