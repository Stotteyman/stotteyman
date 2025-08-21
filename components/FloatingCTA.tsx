'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, X } from 'lucide-react'

export function FloatingCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg neon-glow flex items-center justify-center text-white"
        aria-label="Book a call"
      >
        <Calendar size={24} />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[80vh] glass rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
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
    </>
  )
}