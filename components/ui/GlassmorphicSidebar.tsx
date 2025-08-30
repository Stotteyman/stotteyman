/**
 * Advanced glassmorphic sidebar with depth layers and animations
 */

'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimationErrorBoundary } from '../animations/AnimationErrorBoundary'

interface SidebarItem {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  children?: SidebarItem[]
  badge?: string | number
  active?: boolean
}

interface GlassmorphicSidebarProps {
  items: SidebarItem[]
  isOpen: boolean
  onToggle: () => void
  header?: ReactNode
  footer?: ReactNode
  width?: number
  blur?: number
  opacity?: number
  position?: 'left' | 'right'
  overlay?: boolean
  className?: string
}

export function GlassmorphicSidebar({
  items,
  isOpen,
  onToggle,
  header,
  footer,
  width = 280,
  blur = 20,
  opacity = 0.1,
  position = 'left',
  overlay = true,
  className = ''
}: GlassmorphicSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { prefersReducedMotion } = useReducedMotion()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = overlay ? 'hidden' : 'unset'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, overlay])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: 'easeOut',
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: prefersReducedMotion ? 0 : 0.1
      }
    },
    closed: {
      x: position === 'left' ? -width : width,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.2,
        ease: 'easeIn'
      }
    }
  }

  const overlayVariants = {
    open: {
      opacity: 1,
      backdropFilter: `blur(${blur * 0.5}px)`,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.2 }
    },
    closed: {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: { duration: prefersReducedMotion ? 0.1 : 0.15 }
    }
  }

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.2 }
    },
    closed: {
      opacity: 0,
      x: position === 'left' ? -20 : 20,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.1 }
    }
  }

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const paddingLeft = 16 + (level * 12)

    return (
      <motion.div key={item.id} variants={itemVariants}>
        <motion.div
          className={`
            relative flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors group
            ${item.active 
              ? 'bg-white/20 text-blue-600 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/10'
            }
          `}
          style={{ paddingLeft }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id)
            } else if (item.href) {
              window.location.href = item.href
            }
          }}
          whileHover={prefersReducedMotion ? {} : { 
            x: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            {item.icon && (
              <motion.span 
                className="w-5 h-5 flex-shrink-0"
                whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              >
                {item.icon}
              </motion.span>
            )}
            <span className="font-medium truncate">{item.label}</span>
          </div>

          <div className="flex items-center space-x-2">
            {item.badge && (
              <motion.span
                className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {item.badge}
              </motion.span>
            )}
            
            {hasChildren && (
              <motion.svg
                className="w-4 h-4 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            )}
          </div>

          {/* Active indicator */}
          {item.active && (
            <motion.div
              className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full`}
              layoutId="sidebarActiveIndicator"
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
            />
          )}

          {/* Hover glow */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              className="mt-1 space-y-1"
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: 'auto', 
                opacity: 1,
                transition: { 
                  duration: prefersReducedMotion ? 0.1 : 0.3,
                  ease: 'easeOut'
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: { 
                  duration: prefersReducedMotion ? 0.1 : 0.2,
                  ease: 'easeIn'
                }
              }}
              style={{ overflow: 'hidden' }}
            >
              {item.children?.map(child => renderSidebarItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <AnimationErrorBoundary>
      <AnimatePresence>
        {isOpen && overlay && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{
              background: 'rgba(0, 0, 0, 0.3)'
            }}
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`glassmorphic-sidebar ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          [position]: 0,
          bottom: 0,
          width,
          zIndex: 50,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          background: `rgba(255, 255, 255, ${opacity})`,
          border: `1px solid rgba(255, 255, 255, 0.2)`,
          borderLeft: position === 'right' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
          borderRight: position === 'left' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
          boxShadow: position === 'left' 
            ? '8px 0 32px rgba(0, 0, 0, 0.1)' 
            : '-8px 0 32px rgba(0, 0, 0, 0.1)'
        }}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          {header && (
            <motion.div
              className="p-6 border-b border-white/10"
              variants={itemVariants}
            >
              {header}
            </motion.div>
          )}

          {/* Navigation Items */}
          <motion.div 
            className="flex-1 overflow-y-auto p-4 space-y-2"
            variants={itemVariants}
          >
            {items.map(item => renderSidebarItem(item))}
          </motion.div>

          {/* Footer */}
          {footer && (
            <motion.div
              className="p-6 border-t border-white/10"
              variants={itemVariants}
            >
              {footer}
            </motion.div>
          )}
        </div>

        {/* Decorative elements */}
        <div className={`absolute top-0 ${position === 'left' ? 'right-0' : 'left-0'} bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent`} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.aside>
    </AnimationErrorBoundary>
  )
}

// Compact glassmorphic sidebar for mobile
export function CompactGlassmorphicSidebar({
  items,
  isOpen,
  onToggle,
  blur = 15,
  opacity = 0.15
}: Pick<GlassmorphicSidebarProps, 'items' | 'isOpen' | 'onToggle' | 'blur' | 'opacity'>) {
  const { prefersReducedMotion } = useReducedMotion()

  return (
    <AnimationErrorBoundary>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 left-4 right-4 z-50"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              background: `rgba(255, 255, 255, ${opacity})`,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              maxHeight: '60vh',
              overflow: 'hidden'
            }}
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              transition: { 
                duration: prefersReducedMotion ? 0.1 : 0.3,
                ease: 'easeOut'
              }
            }}
            exit={{ 
              y: 100, 
              opacity: 0, 
              scale: 0.9,
              transition: { 
                duration: prefersReducedMotion ? 0.1 : 0.2,
                ease: 'easeIn'
              }
            }}
          >
            <div className="p-4 space-y-2 overflow-y-auto max-h-full">
              {items.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-colors
                    ${item.active 
                      ? 'bg-white/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/10'
                    }
                  `}
                  onClick={onToggle}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { 
                      delay: prefersReducedMotion ? 0 : index * 0.05,
                      duration: prefersReducedMotion ? 0.1 : 0.2
                    }
                  }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  {item.icon && (
                    <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                  )}
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimationErrorBoundary>
  )
}