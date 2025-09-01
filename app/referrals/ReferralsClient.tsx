'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, DollarSign, Clock, Tag, Filter, X } from 'lucide-react'

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
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)

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

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading referral deals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6"
          >
            Referral Deals
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4"
          >
            Discover exclusive opportunities to earn commissions by referring others to amazing products and services.
          </motion.p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            {/* Search Bar */}
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search referral deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="sm:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters && <X className="w-4 h-4" />}
              </button>
            </div>

            {/* Category Filter */}
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 640) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? 'bg-blue-500 text-white shadow-lg scale-105'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  
                  {/* Clear Filters Button */}
                  {(searchTerm || selectedCategory !== 'All') && (
                    <button
                      onClick={clearFilters}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear filters</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
                onClick={clearFilters}
                className="text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredReferrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group"
                  onClick={() => setSelectedReferral(referral)}
                >
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
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
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {referral.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-3 sm:mb-4 line-clamp-3">
                    {referral.description}
                  </p>

                  {/* Requirements */}
                  {referral.requirements && (
                    <div className="mb-3 sm:mb-4">
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
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 group-hover:scale-105 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
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

      {/* Referral Detail Modal */}
      <AnimatePresence>
        {selectedReferral && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReferral(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedReferral.title}</h2>
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
                    {selectedReferral.category}
                  </span>
                  <div className="flex items-center text-yellow-400">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span className="text-lg font-bold">
                      {selectedReferral.commission_rate}%
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  {selectedReferral.description}
                </p>
                
                {selectedReferral.requirements && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Requirements:</h4>
                    <p className="text-gray-300 text-sm">{selectedReferral.requirements}</p>
                  </div>
                )}
                
                <div className="flex items-center text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Added {formatDate(selectedReferral.created_at)}
                </div>
                
                <a
                  href={selectedReferral.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
                >
                  <span>Get Started with This Deal</span>
                  <ExternalLink className="w-5 h-5 ml-2" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}