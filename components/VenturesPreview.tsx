'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ArrowRight, Palette, Leaf, Users, Smartphone, Video, Eye, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import FocusTrap from 'focus-trap-react'
import { GlassmorphicCard } from './ui/GlassmorphicCard'
import { InteractiveButton } from './ui/InteractiveButton'
import { MagneticElement } from './animations/MagneticCursor'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const ventures = [
  {
    id: 'orange-duck',
    name: 'Orange Duck Studios',
    description: 'Creative studio for media & production',
    fullDescription: 'A full-service creative studio specializing in cutting-edge media production, brand development, and digital experiences. We create compelling visual narratives that drive engagement and build lasting brand connections.',
    icon: Palette,
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    tags: ['Media', 'Production', 'Creative'],
    metrics: { growth: '+150%', clients: '50+', projects: '200+' },
    status: 'Active',
    founded: '2022'
  },
  {
    id: 'hella-fkn-gas',
    name: 'Hella Fkn Gas',
    description: 'Legal hemp products and lifestyle brand',
    fullDescription: 'Premium hemp products and lifestyle brand focused on quality, innovation, and community building in the legal cannabis space. Pioneering sustainable practices and cutting-edge product development.',
    icon: Leaf,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    tags: ['Hemp', 'Lifestyle', 'Wellness'],
    metrics: { growth: '+200%', products: '25+', customers: '10K+' },
    status: 'Scaling',
    founded: '2021'
  },
  {
    id: 'wage-society',
    name: 'Wage Society',
    description: 'Community and lifestyle platform',
    fullDescription: 'A revolutionary platform connecting communities through shared experiences, lifestyle content, and social engagement. Building the future of digital community interaction and content creation.',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    tags: ['Community', 'Social', 'Platform'],
    metrics: { growth: '+300%', users: '25K+', engagement: '85%' },
    status: 'Growing',
    founded: '2023'
  },
  {
    id: 'everyday-stoner-tech',
    name: 'Everyday Stoner Tech',
    description: 'Cannabis tech-inspired gear',
    fullDescription: 'Innovative technology products and accessories designed for the modern cannabis enthusiast and tech-savvy consumer. Merging lifestyle with cutting-edge technology solutions.',
    icon: Smartphone,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    tags: ['Tech', 'Cannabis', 'Innovation'],
    metrics: { growth: '+180%', products: '15+', reviews: '4.8★' },
    status: 'Expanding',
    founded: '2022'
  },
  {
    id: 'irl-history',
    name: 'IRL History',
    description: 'Archive and ranking hub for IRL livestream culture',
    fullDescription: 'Comprehensive archive and ranking platform documenting the evolution and impact of IRL livestreaming culture. Preserving digital culture and creating valuable insights for the streaming community.',
    icon: Video,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    tags: ['Livestream', 'Archive', 'Culture'],
    metrics: { growth: '+250%', archives: '1M+', visitors: '100K+' },
    status: 'Innovating',
    founded: '2023'
  },
]

export function VenturesPreview() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [previewCard, setPreviewCard] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

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
            onMouseEnter={() => {
              setHoveredCard(venture.id)
              setPreviewCard(venture.id)
            }}
            onMouseLeave={() => {
              setHoveredCard(null)
              setPreviewCard(null)
            }}
          >
            <GlassmorphicCard
              variant="premium"
              hoverEffect="magnetic"
              borderGradient={[
                venture.color.split(' ')[1] || '#f97316', 
                venture.color.split(' ')[3] || '#eab308'
              ]}
              className="h-96 cursor-pointer group"
              onClick={() => setSelectedCard(venture.id)}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className={`px-3 py-1 text-xs font-bold rounded-full ${venture.bgColor} ${venture.borderColor} border backdrop-blur-sm`}
                >
                  {venture.status}
                </motion.div>
              </div>

              {/* Animated Background Gradient */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${venture.color} opacity-5 group-hover:opacity-20 transition-opacity duration-500 morphing-bg`}
                whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Enhanced Floating Particles */}
              {!prefersReducedMotion && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1 h-1 bg-gradient-to-r ${venture.color} rounded-full opacity-40`}
                      animate={{
                        x: [0, 120, 0],
                        y: [0, -80, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 6 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeInOut"
                      }}
                      style={{
                        left: `${10 + i * 20}%`,
                        top: `${20 + i * 15}%`,
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Enhanced Icon with Magnetic Effect */}
              <MagneticElement strength={0.1}>
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { 
                    rotate: 360,
                    scale: 1.3,
                    y: -8
                  }}
                  transition={{ 
                    duration: 0.8,
                    type: "spring",
                    stiffness: 200
                  }}
                  className={`w-20 h-20 ${venture.bgColor} rounded-2xl flex items-center justify-center mb-6 relative z-10 neon-glow-premium float-animation shadow-2xl`}
                >
                  <Icon size={36} className={`bg-gradient-to-r ${venture.color} bg-clip-text text-transparent drop-shadow-lg`} aria-hidden="true" focusable="false" />
                  
                  {/* Enhanced Icon Glow Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${venture.color} rounded-2xl opacity-0 group-hover:opacity-40 blur-lg`}
                    whileHover={{ opacity: 0.6, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Pulsing ring */}
                  <motion.div
                    animate={prefersReducedMotion ? {} : { 
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 border-2 border-gradient-to-r ${venture.color} rounded-2xl`}
                  />
                </motion.div>
              </MagneticElement>

              {/* Enhanced Content */}
              <div className="relative z-10 space-y-4">
                <motion.h3 
                  className="text-2xl font-bold text-white mb-2 group-hover:text-shimmer transition-all duration-500"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {venture.name}
                </motion.h3>
                
                <motion.p 
                  className="text-gray-300 mb-4 leading-relaxed group-hover:text-gray-100 transition-colors duration-300 text-sm"
                  whileHover={prefersReducedMotion ? {} : { y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {venture.description}
                </motion.p>

                {/* Metrics Display */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Object.entries(venture.metrics).map(([key, value], metricIndex) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + metricIndex * 0.05 }}
                      className="text-center"
                    >
                      <div className={`text-sm font-bold bg-gradient-to-r ${venture.color} bg-clip-text text-transparent`}>
                        {value}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">{key}</div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Enhanced Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {venture.tags.map((tag, tagIndex) => (
                    <motion.span
                      key={tag}
                      className={`px-3 py-1 text-xs font-medium ${venture.bgColor} ${venture.borderColor} border rounded-full group-hover:border-opacity-80 transition-all duration-300 backdrop-blur-sm`}
                      whileHover={prefersReducedMotion ? {} : { 
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

                {/* Enhanced Action Area */}
                <div className="flex items-center justify-between">
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
                    <Eye size={14} className="mr-2" />
                    <span className="mr-2">View Details</span>
                    <motion.div
                      animate={prefersReducedMotion ? {} : { x: [0, 5, 0] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowRight size={14} aria-hidden="true" focusable="false" />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="text-xs text-gray-500 flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredCard === venture.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Calendar size={12} className="mr-1" />
                    Est. {venture.founded}
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Glow Effect */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-r ${venture.color} opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-500 -z-10`}
                whileHover={prefersReducedMotion ? {} : { 
                  scale: 1.3,
                  opacity: 0.4
                }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Enhanced Shine Effect */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-in-out"
                  style={{ transform: 'skewX(-15deg)' }}
                />
              )}
            </GlassmorphicCard>
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

                      {/* Enhanced Metrics Section */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {Object.entries(venture.metrics).map(([key, value]) => (
                          <div key={key} className="text-center p-3 glass rounded-lg">
                            <div className={`text-2xl font-bold bg-gradient-to-r ${venture.color} bg-clip-text text-transparent mb-1`}>
                              {value}
                            </div>
                            <div className="text-sm text-gray-400 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {venture.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-4 py-2 text-sm font-medium ${venture.bgColor} ${venture.borderColor} border rounded-full backdrop-blur-sm`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <InteractiveButton
                          variant="primary"
                          size="lg"
                          animation="magnetic"
                          onClick={() => { window.open('/ventures', '_blank') }}
                          className="flex-1"
                        >
                          <TrendingUp size={20} className="mr-2" />
                          View All Ventures
                        </InteractiveButton>
                        
                        <InteractiveButton
                          variant="secondary"
                          size="lg"
                          animation="ripple"
                          onClick={() => setSelectedCard(null)}
                        >
                          Close
                        </InteractiveButton>
                      </div>
                    </>
                  )
                })()}
              </motion.div>
            </FocusTrap>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
        className="col-span-full flex justify-center mt-16"
      >
        <MagneticElement strength={0.2}>
          <InteractiveButton
            variant="primary"
            size="lg"
            animation="magnetic"
            onClick={() => { window.location.href = '/ventures' }}
            className="px-12 py-5 text-xl"
          >
            <TrendingUp size={24} className="mr-3" />
            Explore All Ventures
            <ExternalLink size={20} className="ml-3" />
          </InteractiveButton>
        </MagneticElement>
      </motion.div>
    </div>
  )
}