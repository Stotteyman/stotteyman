'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import FocusTrap from 'focus-trap-react'

interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove('overflow-hidden')
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.body.classList.add('overflow-hidden')
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen, onClose])

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
          <FocusTrap active={isOpen} focusTrapOptions={{ escapeDeactivates: false }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[80vh] glass rounded-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} aria-hidden="true" focusable="false" />
              </button>
              <iframe
                src="https://calendly.com/garymccullouch"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Schedule a meeting with Gary McCullouch"
                className="rounded-2xl"
                loading="lazy"
              />
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

