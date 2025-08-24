'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette, Leaf, Users, Smartphone, Video,
  ExternalLink,
  Calendar, ArrowRight, Filter
} from 'lucide-react'
import { CalendlyModal } from '@/components/CalendlyModal'



const ventures = [
  {
    id: 'orange-duck',
    name: 'Orange Duck Studios',
    tagline: 'Creative Excellence in Media Production',
    description: 'A full-service creative studio specializing in cutting-edge media production, brand development, and digital experiences.',
    fullDescription: 'Orange Duck Studios represents the pinnacle of creative media production, combining artistic vision with technical expertise to deliver exceptional results for clients across industries. Our comprehensive services include video production, brand development, digital marketing, and creative consulting.',
    icon: Palette,
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    category: 'Creative',
    stage: 'Growth',
    tags: ['Media Production', 'Brand Development', 'Digital Marketing', 'Creative Consulting'],
    highlights: [
      'Award-winning creative campaigns',
      'Fortune 500 client portfolio',
      'Industry-leading production quality',
      'Innovative digital solutions'
    ]
  },
  {
    id: 'hella-fkn-gas',
    name: 'Hella Fkn Gas',
    tagline: 'Premium Hemp Lifestyle Brand',
    description: 'Premium hemp products and lifestyle brand focused on quality, innovation, and community building in the legal cannabis space.',
    fullDescription: 'Hella Fkn Gas has established itself as a premium lifestyle brand in the rapidly expanding legal hemp market. We focus on high-quality products, innovative formulations, and building authentic community connections with our customers.',
    icon: Leaf,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    category: 'Lifestyle',
    stage: 'Expansion',
    tags: ['Hemp Products', 'Lifestyle Brand', 'E-commerce', 'Community Building'],
    highlights: [
      'Premium product line',
      'Strong brand recognition',
      'Loyal customer community',
      'Expanding market presence'
    ]
  },
  {
    id: 'wage-society',
    name: 'Wage Society',
    tagline: 'Community-Driven Lifestyle Platform',
    description: 'A revolutionary platform connecting communities through shared experiences, lifestyle content, and social engagement.',
    fullDescription: 'Wage Society is pioneering the future of community engagement through innovative platform features, curated lifestyle content, and meaningful social connections. Our platform serves as a hub for like-minded individuals to connect, share, and grow together.',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    category: 'Technology',
    stage: 'Growth',
    tags: ['Social Platform', 'Community Building', 'Content Creation', 'User Engagement'],
    highlights: [
      'High user engagement',
      'Viral content features',
      'Strong community bonds',
      'Scalable platform architecture'
    ]
  },
  {
    id: 'everyday-stoner-tech',
    name: 'Everyday Stoner Tech',
    tagline: 'Cannabis Tech Innovation',
    description: 'Innovative technology products and accessories designed for the modern cannabis enthusiast and tech-savvy consumer.',
    fullDescription: 'Everyday Stoner Tech bridges the gap between cannabis culture and cutting-edge technology, creating innovative products that enhance the modern cannabis experience while appealing to tech-savvy consumers.',
    icon: Smartphone,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    category: 'Technology',
    stage: 'Launch',
    tags: ['Cannabis Tech', 'Product Innovation', 'Consumer Electronics', 'Lifestyle Tech'],
    highlights: [
      'Innovative product designs',
      'Strong market demand',
      'Tech-forward approach',
      'Growing customer base'
    ]
  },
  {
    id: 'irl-history',
    name: 'IRL History',
    tagline: 'Livestream Culture Archive',
    description: 'Comprehensive archive and ranking platform documenting the evolution and impact of IRL livestreaming culture.',
    fullDescription: 'IRL History serves as the definitive archive and ranking platform for IRL livestreaming culture, documenting key moments, influential creators, and cultural impact while providing valuable insights for the industry.',
    icon: Video,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    category: 'Media',
    stage: 'Growth',
    tags: ['Content Archive', 'Cultural Documentation', 'Livestream Analytics', 'Community Rankings'],
    highlights: [
      'Comprehensive content archive',
      'Cultural significance',
      'Growing user base',
      'Industry recognition'
    ]
  },
]

const categories = ['All', 'Creative', 'Lifestyle', 'Technology', 'Media']

export default function VenturesPageClient() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedVenture, setSelectedVenture] = useState<string | null>(null)
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredVentures = selectedCategory === 'All' 
    ? ventures 
    : ventures.filter(venture => venture.category === selectedCategory)

  useEffect(() => {
    let ctx: any
    const run = async () => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const { gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        ctx = gsap.context(() => {
          gsap.fromTo('.venture-card',
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              scrollTrigger: {
                trigger: '.ventures-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          )
        }, containerRef)
      }
    }
    run()
    return () => ctx && ctx.revert()
  }, [selectedCategory])

  return (
    <div ref={containerRef} className="relative min-h-screen pt-16">
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
              Our Ventures
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              A diverse portfolio of innovative companies shaping the future across multiple industries
            </p>
            <div className="text-lg text-gray-400 max-w-3xl mx-auto">
              From creative studios to cannabis tech, each venture represents a unique opportunity 
              for growth and market disruption.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section aria-label="Venture categories" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <motion.button
                type="button"
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white neon-glow'
                    : 'glass border border-white/20 text-gray-300 hover:border-blue-500/50'
                }`}
              >
                <Filter size={16} className="inline mr-2" aria-hidden="true" focusable="false" />
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Ventures Grid */}
      <section aria-label="Ventures list" className="ventures-grid py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {filteredVentures.map((venture, index) => {
                const Icon = venture.icon
                return (
                  <motion.div
                    key={venture.id}
                    className="venture-card group"
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => setSelectedVenture(venture.id)}
                  >
                    <div className={`relative glass rounded-3xl p-8 border ${venture.borderColor} overflow-hidden cursor-pointer transition-all duration-300 group-hover:border-blue-500/50`}>
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${venture.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      {/* Header */}
                      <div className="relative z-10 flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 ${venture.bgColor} rounded-xl flex items-center justify-center`}>
                          <Icon size={32} className={`bg-gradient-to-r ${venture.color} bg-clip-text text-transparent`} aria-hidden="true" focusable="false" />
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${venture.bgColor} ${venture.borderColor} border px-3 py-1 rounded-full mb-2`}>
                            {venture.stage}
                          </div>
                          <div className="text-xs text-gray-400">{venture.category}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-gradient transition-all duration-300">
                          {venture.name}
                        </h3>
                        <p className={`text-lg font-medium bg-gradient-to-r ${venture.color} bg-clip-text text-transparent mb-4`}>
                          {venture.tagline}
                        </p>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          {venture.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {venture.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className={`px-3 py-1 text-xs font-medium ${venture.bgColor} ${venture.borderColor} border rounded-full`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-end">
                          <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{
                              x: 0,
                              opacity: 1
                            }}
                            className="flex items-center text-sm text-gray-400 group-hover:text-white"
                          >
                            Learn more <ArrowRight size={16} className="ml-2" aria-hidden="true" focusable="false" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${venture.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedVenture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedVenture(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto glass rounded-3xl p-8 border border-white/10"
            >
              {(() => {
                const venture = ventures.find(v => v.id === selectedVenture)!
                const Icon = venture.icon
                return (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <div className={`w-20 h-20 ${venture.bgColor} rounded-xl flex items-center justify-center mr-6`}>
                          <Icon size={40} className={`bg-gradient-to-r ${venture.color} bg-clip-text text-transparent`} aria-hidden="true" focusable="false" />
                        </div>
                        <div>
                          <h2 className="text-4xl font-bold text-gradient mb-2">
                            {venture.name}
                          </h2>
                          <p className={`text-xl font-medium bg-gradient-to-r ${venture.color} bg-clip-text text-transparent`}>
                            {venture.tagline}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedVenture(null)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Description */}
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Overview</h3>
                        <p className="text-gray-300 leading-relaxed mb-6">
                          {venture.fullDescription}
                        </p>
                        
                        <h4 className="text-xl font-bold text-white mb-3">Key Highlights</h4>
                        <ul className="space-y-2">
                          {venture.highlights.map((highlight) => (
                            <li key={highlight} className="flex items-center text-gray-300">
                              <div className={`w-2 h-2 bg-gradient-to-r ${venture.color} rounded-full mr-3`} />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>

                        {/* Info */}
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {venture.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`px-3 py-1 text-sm font-medium ${venture.bgColor} ${venture.borderColor} border rounded-full`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-4 justify-center">
                      <motion.button
                        type="button"
                        onClick={() => setIsCalendlyOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium neon-glow transition-all duration-300"
                      >
                        <Calendar size={20} className="mr-2" aria-hidden="true" focusable="false" />
                        Discuss Investment
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => setSelectedVenture(null)}
                        className="px-8 py-4 glass border border-white/20 text-white rounded-full font-medium hover:border-blue-500/50 transition-all duration-300"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
              Ready to Invest?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Explore investment opportunities in our growing portfolio of innovative ventures.
            </p>
            
            <motion.button
              type="button"
              onClick={() => setIsCalendlyOpen(true)}
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-semibold rounded-full neon-glow transition-all duration-300"
            >
              Schedule Investment Call
              <Calendar size={24} className="ml-3" aria-hidden="true" focusable="false" />
            </motion.button>
          </motion.div>
        </div>
      </section>
      <CalendlyModal
        isOpen={isCalendlyOpen}
        onClose={() => setIsCalendlyOpen(false)}
      />
    </div>
  )
}