'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ArrowRight, Palette, Leaf, Users, Smartphone, Video } from 'lucide-react'
import Link from 'next/link'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const ventures = [
  {
    id: 'orange-duck',
    name: 'Orange Duck Studios',
    description: 'Creative studio for media & production',
    fullDescription: 'A full-service creative studio specializing in cutting-edge media production, brand development, and digital experiences.',
    icon: Palette,
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    tags: ['Media', 'Production', 'Creative'],
  },
  {
    id: 'hella-fkn-gas',
    name: 'Hella Fkn Gas',
    description: 'Legal hemp products and lifestyle brand',
    fullDescription: 'Premium hemp products and lifestyle brand focused on quality, innovation, and community building in the legal cannabis space.',
    icon: Leaf,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    tags: ['Hemp', 'Lifestyle', 'Wellness'],
  },
  {
    id: 'wage-society',
    name: 'Wage Society',
    description: 'Community and lifestyle platform',
    fullDescription: 'A revolutionary platform connecting communities through shared experiences, lifestyle content, and social engagement.',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    tags: ['Community', 'Social', 'Platform'],
  },
  {
    id: 'everyday-stoner-tech',
    name: 'Everyday Stoner Tech',
    description: 'Cannabis tech-inspired gear',
    fullDescription: 'Innovative technology products and accessories designed for the modern cannabis enthusiast and tech-savvy consumer.',
    icon: Smartphone,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    tags: ['Tech', 'Cannabis', 'Innovation'],
  },
  {
    id: 'irl-history',
    name: 'IRL History',
    description: 'Archive and ranking hub for IRL livestream culture',
    fullDescription: 'Comprehensive archive and ranking platform documenting the evolution and impact of IRL livestreaming culture.',
    icon: Video,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    tags: ['Livestream', 'Archive', 'Culture'],
  },
]

export function VenturesPreview() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {ventures.map((venture, index) => {
        const Icon = venture.icon
        return (
          <motion.div
            key={venture.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: index * 0.1 }}
            viewport={prefersReducedMotion ? undefined : { once: true }}
            className="venture-card group relative"
            onMouseEnter={() => setHoveredCard(venture.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.button
              type="button"
              whileHover={prefersReducedMotion ? undefined : { y: -10, scale: 1.02 }}
              className={`relative h-80 glass rounded-2xl p-6 border ${venture.borderColor} overflow-hidden transition-all duration-300`}
              onClick={() => setSelectedCard(venture.id)}
              aria-label={`Learn more about ${venture.name}`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${venture.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon */}
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { rotate: 360 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.6 }}
                className={`w-16 h-16 ${venture.bgColor} rounded-xl flex items-center justify-center mb-6 relative z-10`}
              >
                <Icon size={32} className={`bg-gradient-to-r ${venture.color} bg-clip-text text-transparent`} />
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gradient transition-all duration-300">
                  {venture.name}
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {venture.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {venture.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 text-xs font-medium ${venture.bgColor} ${venture.borderColor} border rounded-full`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Hover Arrow */}
                <motion.div
                  initial={prefersReducedMotion ? false : { x: -10, opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : {
                    x: hoveredCard === venture.id ? 0 : -10,
                    opacity: hoveredCard === venture.id ? 1 : 0
                  }}
                  className="flex items-center text-sm text-gray-400 group-hover:text-white"
                >
                  Learn more <ArrowRight size={16} className="ml-2" />
                </motion.div>
              </div>

              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${venture.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
            </motion.button>
          </motion.div>
        )
      })}

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full glass rounded-2xl p-8"
            >
              {(() => {
                const venture = ventures.find(v => v.id === selectedCard)!
                const Icon = venture.icon
                return (
                  <>
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 ${venture.bgColor} rounded-xl flex items-center justify-center mr-4`}>
                        <Icon size={32} className={`bg-gradient-to-r ${venture.color} bg-clip-text text-transparent`} />
                      </div>
                      <h3 className="text-3xl font-bold text-gradient">
                        {venture.name}
                      </h3>
                    </div>
                    
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {venture.fullDescription}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {venture.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-4 py-2 text-sm font-medium ${venture.bgColor} ${venture.borderColor} border rounded-full`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-4">
                      <Link
                        href="/ventures"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center rounded-full font-medium neon-glow transition-all duration-300 hover:scale-105"
                      >
                        View All Ventures
                      </Link>
                      <button
                        onClick={() => setSelectedCard(null)}
                        className="px-6 py-3 glass border border-white/20 text-white rounded-full font-medium hover:border-blue-500/50 transition-all duration-300"
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

      {/* View All Button */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.5 }}
        viewport={prefersReducedMotion ? undefined : { once: true }}
        className="col-span-full flex justify-center mt-12"
      >
        <Link
          href="/ventures"
          className="group flex items-center px-8 py-4 glass border border-white/20 text-white text-lg font-semibold rounded-full hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
        >
          Explore All Ventures
          <ExternalLink size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </motion.div>
    </div>
  )
}