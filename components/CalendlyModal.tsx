'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-[80vh] glass rounded-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <iframe
              src="https://calendly.com/garymccullouch"
              width="100%"
              height="100%"
              frameBorder="0"
              title="Schedule a meeting with Gary McCullouch"
              className="rounded-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

