'use client'

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const categories = ['All', 'Livestreaming', 'Cannabis Tech', 'Community Building', 'Creative Industry', 'Investment', 'Hemp Industry']

export default function BlogPageClient({ posts }: { posts: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPosts, setFilteredPosts] = useState(posts)
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    let filtered = posts

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredPosts(filtered)
  }, [selectedCategory, searchTerm, posts])

  const featuredPost = posts.find(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured)

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFeedback(null)
    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setFeedback({ type: 'success', message: 'Thanks for subscribing!' })
        setEmail('')
      } else {
        const data = await res.json().catch(() => ({}))
        setFeedback({ type: 'error', message: data.message || 'Subscription failed. Please try again.' })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Subscription failed. Please try again.' })
    }
  }

  return (
    <div className="relative min-h-screen pt-16">
      <div className="fixed inset-0 -z-10 animated-bg" />

      <section className="py-32 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-6 font-serif">
              Insights & Ideas
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              Thoughts on entrepreneurship, innovation, and building the future
            </p>
            <div className="text-lg text-gray-400 max-w-3xl mx-auto">
              Exploring the intersection of creativity, technology, and business strategy
              through real-world experiences and industry insights.
            </div>
          </motion.div>
        </div>
      </section>

      <section aria-label="Blog search and filters" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                aria-label="Search articles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass rounded-full border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white neon-glow'
                      : 'glass border border-white/20 text-gray-300 hover:border-blue-500/50'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {featuredPost && selectedCategory === 'All' && !searchTerm && (
        <section className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass rounded-3xl overflow-hidden border border-white/10 group hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-full">
                      {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-gradient transition-all duration-300">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar size={16} className="mr-2" />
                      {new Date(featuredPost.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock size={16} className="mr-2" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {featuredPost.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center text-blue-400 hover:text-white transition-colors duration-300 group"
                  >
                    Read Full Article
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center min-h-[400px]">
                  <TrendingUp size={64} className="text-white/30" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {regularPosts.map((post) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="glass rounded-3xl overflow-hidden border border-white/10 hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock size={16} className="mr-2" />
                        {post.readTime}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gradient transition-all duration-300">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 flex-grow leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar size={16} className="mr-2" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-blue-400 hover:text-white transition-colors duration-300 group"
                      >
                        Read
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-16 relative">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Subscribe for Updates</h2>
          <p className="text-gray-300 text-lg mb-8">Get the latest articles delivered straight to your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-3 glass rounded-full border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full neon-glow transition-all duration-300 hover:scale-105"
            >
              Subscribe
            </button>
          </form>
          {feedback && (
            <p
              className={`mt-4 text-sm ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
            >
              {feedback.message}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
