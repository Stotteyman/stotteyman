'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import Link from 'next/link'

const CARD_WIDTH = 200

const collaborators = [
  { name: 'Hampton Brandon', role: 'IRL Streamer', impact: 'Hollywood Blvd Content' },
  { name: 'JakeFuture27', role: 'Streamer', impact: 'New Jersey Influence' },
  { name: '1xsboy', role: 'Livestreamer', impact: 'Atlanta Presence' },
  { name: 'Cracc_harlow', role: 'Music Collaborator', impact: 'Sound Branding' },
  { name: 'snackmoneybeatz', role: 'Music Producer', impact: 'West Texas Sound' },
  { name: 'yuber', role: 'IRL Streamer', impact: 'Hollywood Blvd Incident' },
  { name: 'EBZ', role: 'IRL Streamer', impact: 'Rapper Aspirations' },
  { name: 'itsmesaiman', role: 'Travel IRL Streamer', impact: 'Daily Travel Streams' },
  { name: 'iamtrevian', role: 'IRL Streamer', impact: 'Massachusetts Roots' },
  { name: 'treloquence', role: 'Content Strategist', impact: 'Narrative Development' },
]

export function LivestreamPreview() {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const MotionDiv: any = prefersReducedMotion ? 'div' : motion.div
  const iconClass =
    'inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 neon-glow'
  const linkClass =
    'inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-full neon-glow transition-all duration-300 hover:scale-105'

  return (
    <div className="relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />

      <MotionDiv
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 50 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.8 }}
        viewport={prefersReducedMotion ? undefined : { once: true }}
        className="relative glass rounded-3xl p-8 md:p-12 border border-white/10"
      >
        {/* Header */}
        <div className="text-center mb-12">
            <MotionDiv
              initial={prefersReducedMotion ? undefined : { scale: 0 }}
              whileInView={prefersReducedMotion ? undefined : { scale: 1 }}
              transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.2 }}
              viewport={prefersReducedMotion ? undefined : { once: true }}
              className={iconClass}
            >
            <Play size={32} className="text-white ml-1" />
          </MotionDiv>

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
            <MotionDiv
              animate={
                prefersReducedMotion
                  ? undefined
                  : { x: [0, -(collaborators.length * CARD_WIDTH)] }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: collaborators.length * 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }
              }
              className="flex space-x-6"
              style={{ width: `${collaborators.length * CARD_WIDTH * 2}px` }}
            >
              {[...collaborators, ...collaborators].map((collab, index) => (
                <MotionDiv
                  key={`${collab.name}-${index}`}
                  whileHover={
                    prefersReducedMotion ? undefined : { scale: 1.05, y: -5 }
                  }
                  className="flex-shrink-0 w-48 glass rounded-xl p-4 border border-white/10"
                >
                  <div className="text-lg font-semibold text-white mb-1">
                    {collab.name}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {collab.role}
                  </div>
                  <div className="text-xs text-purple-400">
                    {collab.impact}
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/livestream"
            className={linkClass}
          >
            Explore Livestream History
            <Play size={20} className="ml-2" />
          </Link>
        </div>
      </MotionDiv>
    </div>
  )
}
