'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ArrowRight, Palette, Leaf, Users, Smartphone, Video } from 'lucide-react'
import Link from 'next/link'
import FocusTrap from 'focus-trap-react'

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

  useEffect(() => {
    if (!selectedCard) {
      document.body.classList.remove('overflow-hidden')
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCard(null)
      }
    }

    document.body.classList.add('overflow-hidden')
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('overflow-hidden')
    }
  }, [selectedCard])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {ventures.map((venture, index) => {
        const Icon = venture.icon
        return (
          <motion.div
            key={venture.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="venture-card group relative"
            onMouseEnter={() => setHoveredCard(venture.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.button
              type="button"
              whileHover={{ 
                y: -15, 
                scale: 1.03,
                rotateY: 5,
                rotateX: 5
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              className={`group relative h-80 glass-premium rounded-2xl p-6 border ${venture.borderColor} overflow-hidden card-hover-effect neon-border`}
              onClick={() => setSelectedCard(venture.id)}
              aria-label={`Learn more about ${venture.name}`}
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Animated Background Gradient */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${venture.color} opacity-5 group-hover:opacity-15 transition-opacity duration-500 morphing-bg`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 bg-gradient-to-r ${venture.color} rounded-full opacity-30`}
                    animate={{
                      x: [0, 100, 0],
                      y: [0, -50, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${30 + i * 20}%`,
                    }}
                  />
                ))}
              </div>
              
              {/* Icon with Enhanced Animation */}
              <motion.div
                whileHover={{ 
                  rotate: 360,
                  scale: 1.2,
                  y: -5
                }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 200
                }}
                className={`w-16 h-16 ${venture.bgColor} rounded-xl flex items-center justify-center mb-6 relative z-10 neon-glow-premium float-animation`}
              >
                <Icon size={32} className={`bg-gradient-to-r ${venture.color} bg-clip-text text-transparent`} aria-hidden="true" focusable="false" />
                
                {/* Icon Glow Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${venture.color} rounded-xl opacity-0 group-hover:opacity-30 blur-md`}
                  whileHover={{ opacity: 0.5 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              {/* Content with Staggered Animation */}
              <div className="relative z-10">
                <motion.h3 
                  className="text-2xl font-bold text-white mb-3 group-hover:text-shimmer transition-all duration-500"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {venture.name}
                </motion.h3>
                
                <motion.p 
                  className="text-gray-300 mb-4 leading-relaxed group-hover:text-gray-100 transition-colors duration-300"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {venture.description}
                </motion.p>
                
                {/* Enhanced Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {venture.tags.map((tag, tagIndex) => (
                    <motion.span
                      key={tag}
                      className={`px-3 py-1 text-xs font-medium ${venture.bgColor} ${venture.borderColor} border rounded-full group-hover:border-opacity-60 transition-all duration-300`}
                      whileHover={{ 
                        scale: 1.1,
                        y: -2,
                        backgroundColor: `rgba(59, 130, 246, 0.2)`
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: tagIndex * 0.1 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                {/* Enhanced Hover Arrow */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ 
                    x: hoveredCard === venture.id ? 0 : -20,
                    opacity: hoveredCard === venture.id ? 1 : 0
                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  className="flex items-center text-sm text-gray-400 group-hover:text-white"
                >
                  <span className="mr-2">Learn more</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <ArrowRight size={16} aria-hidden="true" focusable="false" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Enhanced Glow Effect */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-r ${venture.color} opacity-0 group-hover:opacity-25 blur-xl transition-all duration-500 -z-10`}
                whileHover={{ 
                  scale: 1.2,
                  opacity: 0.3
                }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
                style={{ transform: 'skewX(-20deg)' }}
              />
            </motion.button>
          </motion.div>
        )
      })}

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          >
            <FocusTrap active={!!selectedCard} focusTrapOptions={{ escapeDeactivates: false }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
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
                          <Icon size={32} className={`bg-gradient-to-r ${venture.color} bg-clip-text text-transparent`} aria-hidden="true" focusable="false" />
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
                          type="button"
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
            </FocusTrap>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
        className="col-span-full flex justify-center mt-12"
      >
        <Link
          href="/ventures"
          className="group flex items-center px-8 py-4 glass border border-white/20 text-white text-lg font-semibold rounded-full hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
        >
          Explore All Ventures
          <ExternalLink size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" focusable="false" />
        </Link>
      </motion.div>
    </div>
  )
}