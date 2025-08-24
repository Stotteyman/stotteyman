'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { CalendlyModal } from './CalendlyModal'

const buttonClass =
  'fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg neon-glow flex items-center justify-center text-white'

export function FloatingCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <>
      {/* Floating Button */}
      {prefersReducedMotion ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className={buttonClass}
          aria-label="Book a call"
        >
          <Calendar size={24} />
        </button>
      ) : (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className={buttonClass}
          aria-label="Book a call"
        >
          <Calendar size={24} />
        </motion.button>
      )}

      <CalendlyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
