/**
 * Advanced glassmorphic modal with backdrop blur and animations
 */

'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimationErrorBoundary } from '../animations/AnimationErrorBoundary'

interface GlassmorphicModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  blur?: number
  opacity?: number
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function GlassmorphicModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  blur = 20,
  opacity = 0.1,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}: GlassmorphicModalProps) {
  const [mounted, setMounted] = useState(false)
  const { prefersReducedMotion } = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { maxWidth: '400px', maxHeight: '300px' }
      case 'md':
        return { maxWidth: '600px', maxHeight: '500px' }
      case 'lg':
        return { maxWidth: '800px', maxHeight: '700px' }
      case 'xl':
        return { maxWidth: '1200px', maxHeight: '900px' }
      case 'full':
        return { width: '95vw', height: '95vh' }
      default:
        return { maxWidth: '600px', maxHeight: '500px' }
    }
  }

  const overlayVariants = {
    hidden: { 
      opacity: 0,
      backdropFilter: 'blur(0px)'
    },
    visible: { 
      opacity: 1,
      backdropFilter: `blur(${blur}px)`,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.2,
        ease: 'easeIn'
      }
    }
  }

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.8,
      y: prefersReducedMotion ? 0 : 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.4,
        ease: 'easeOut',
        delay: prefersReducedMotion ? 0 : 0.1
      }
    },
    exit: { 
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.9,
      y: prefersReducedMotion ? 0 : 30,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.2,
        ease: 'easeIn'
      }
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimationErrorBoundary>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              background: `rgba(0, 0, 0, ${opacity * 3})`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              backdropFilter: `blur(${blur}px)`
            }}
            onClick={closeOnOverlayClick ? onClose : undefined}
          >
            <motion.div
              className={`glassmorphic-modal ${className}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                ...getSizeStyles(),
                background: `rgba(255, 255, 255, ${opacity})`,
                backdropFilter: `blur(${blur * 0.8}px)`,
                WebkitBackdropFilter: `blur(${blur * 0.8}px)`,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-6 overflow-auto max-h-full">
                {children}
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimationErrorBoundary>,
    document.body
  )
}