'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import Link from 'next/link'

const collaborators = [
  { name: 'itsmesaiman', role: 'Content Creator', impact: 'Strategic Partnership' },
  { name: 'hamptonbrandon', role: 'IRL Pioneer', impact: 'Cultural Influence' },
  { name: 'ebz', role: 'Community Builder', impact: 'Audience Development' },
  { name: 'yuber', role: 'Tech Innovator', impact: 'Platform Integration' },
  { name: 'iamtrevian', role: 'Creative Director', impact: 'Brand Development' },
  { name: 'jakefuture27', role: 'Growth Strategist', impact: 'Market Expansion' },
  { name: '1xsboy', role: 'Community Manager', impact: 'Engagement Optimization' },
]

export function LivestreamPreview() {
  return (
    <div className="relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative glass rounded-3xl p-8 md:p-12 border border-white/10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 neon-glow"
          >
            <Play size={32} className="text-white ml-1" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
            Livestream Legacy
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Pioneering the future of IRL livestreaming through strategic collaborations 
            and innovative community building initiatives.
          </p>
        </div>

        {/* Collaborators Carousel */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Key Collaborators</h3>
          <div className="relative overflow-hidden">
            <motion.div
              animate={{ x: [0, -100 * collaborators.length] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="flex space-x-6"
              style={{ width: `${collaborators.length * 200}px` }}
            >
              {[...collaborators, ...collaborators].map((collab, index) => (
                <motion.div
                  key={`${collab.name}-${index}`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex-shrink-0 w-48 glass rounded-xl p-4 border border-white/10"
                >
                  <div className="text-lg font-semibold text-white mb-1">
                    @{collab.name}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {collab.role}
                  </div>
                  <div className="text-xs text-purple-400">
                    {collab.impact}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/livestream"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-full neon-glow transition-all duration-300 hover:scale-105"
          >
            Explore Livestream History
            <Play size={20} className="ml-2" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}