'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { CalendlyModal } from './CalendlyModal'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export function FloatingCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={prefersReducedMotion ? false : { scale: 0 }}
        animate={prefersReducedMotion ? undefined : { scale: 1 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg neon-glow flex items-center justify-center text-white"
        aria-label="Book a call"
      >
        <Calendar size={24} />
      </motion.button>

      <CalendlyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}