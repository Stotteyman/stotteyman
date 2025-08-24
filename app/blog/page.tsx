'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Search, Tag, TrendingUp } from 'lucide-react'
import Link from 'next/link'

import { blogPosts } from './posts'


const categories = ['All', 'Livestreaming', 'Cannabis Tech', 'Community Building', 'Creative Industry', 'Investment', 'Hemp Industry']

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPosts, setFilteredPosts] = useState(blogPosts)

  useEffect(() => {
    let filtered = blogPosts

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredPosts(filtered)
  }, [selectedCategory, searchTerm])

  const featuredPost = blogPosts.find(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured)

  return (
    <div className="relative min-h-screen pt-16">
      {/* Background */}
      <div className="fixed inset-0 -z-10 animated-bg" />

      {/* Hero Section */}
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

      {/* Search and Filter */}
      <section aria-label="Blog search and filters" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <label htmlFor="blog-search" className="sr-only">
                Search articles
              </label>
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="blog-search"
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass rounded-full border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
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

      {/* Featured Post */}
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
                {/* Content */}
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
                    {featuredPost.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center text-blue-400 hover:text-white transition-colors duration-300 group"
                  >
                    Read Full Article
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
                
                {/* Visual Placeholder */}
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center min-h-[400px]">
                  <TrendingUp size={64} className="text-white/30" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section aria-label="Blog posts" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${searchTerm}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {regularPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <div className="glass rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col">
                    {/* Visual Placeholder */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-48 flex items-center justify-center">
                      <Tag size={32} className="text-gray-600" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-full">
                          {post.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient transition-all duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-300 leading-relaxed mb-4 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <Link
                        href={`/blog/${post.id}`}
                        className="inline-flex items-center text-blue-400 hover:text-white transition-colors duration-300 group/link"
                      >
                        Read More
                        <ArrowRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
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
              Stay Updated
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get the latest insights on entrepreneurship, innovation, and industry trends
              delivered directly to your inbox.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 glass rounded-full border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full neon-glow transition-all duration-300"
              >
                Subscribe
              </motion.button>
            </form>
            
            <p className="text-gray-400 text-sm">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
