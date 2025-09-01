'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, ExternalLink, DollarSign, Clock, Tag } from 'lucide-react'

interface Referral {
  id: string
  title: string
  description: string
  url: string
  category: string
  commission_rate: number
  requirements: string
  status: 'active' | 'inactive' | 'expired'
  created_at: string
}

const categories = [
  'All',
  'Technology',
  'Finance',
  'Health & Wellness',
  'Education',
  'E-commerce',
  'SaaS',
  'Other'
]

export default function ReferralsClient() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchReferrals = async () => {
    try {
      const response = await fetch('/api/referrals')
      const data = await response.json()
      setReferrals(data)
    } catch (error) {
      console.error('Error fetching referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReferrals = useCallback(() => {
    let filtered = referrals.filter(referral => referral.status === 'active')

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(referral => referral.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(referral =>
        referral.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredReferrals(filtered)
  }, [referrals, selectedCategory, searchTerm])

  useEffect(() => {
    fetchReferrals()
  }, [])

  useEffect(() => {
    filterReferrals()
  }, [filterReferrals])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Referral Deals
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Discover exclusive opportunities to earn commissions by referring others to amazing products and services.
          </motion.p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search referral deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Referrals Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {filteredReferrals.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg mb-4">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'No referrals match your search criteria.'
                  : 'No active referrals available at the moment.'
                }
              </div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('All')
                }}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReferrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                      {referral.category}
                    </span>
                    <div className="flex items-center text-yellow-400">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {referral.commission_rate}%
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {referral.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {referral.description}
                  </p>

                  {/* Requirements */}
                  {referral.requirements && (
                    <div className="mb-4">
                      <div className="flex items-start">
                        <Tag className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-gray-400 text-xs">
                          {referral.requirements}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center text-gray-400 text-xs mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    Added {formatDate(referral.created_at)}
                  </div>

                  {/* CTA Button */}
                  <a
                    href={referral.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 group"
                  >
                    <span>View Deal</span>
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}