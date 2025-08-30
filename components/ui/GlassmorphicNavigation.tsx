/**
 * Advanced glassmorphic navigation with adaptive blur and animations
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimationErrorBoundary } from '../animations/AnimationErrorBoundary'

interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
}

interface GlassmorphicNavigationProps {
  items: NavigationItem[]
  logo?: React.ReactNode
  actions?: React.ReactNode
  variant?: 'floating' | 'fixed' | 'sticky'
  blur?: number
  opacity?: number
  hideOnScroll?: boolean
  className?: string
}

export function GlassmorphicNavigation({
  items,
  logo,
  actions,
  variant = 'default',
  blur = 20,
  opacity = 0.1,
  className = ''
}: GlassmorphicNavigationProps) {
  const { prefersReducedMotion } = useReducedMotion()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  // Move useTransform hooks outside conditional rendering
  const dynamicOpacity = useTransform(scrollY, [0, 100], [opacity, opacity * 2])
  const dynamicBlur = useTransform(scrollY, [0, 100], [`blur(${blur}px)`, `blur(${blur + 10}px)`])
  const scrollProgressWidth = useTransform(
    scrollY,
    [0, typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 0],
    ['0%', '100%']
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getVariantStyles = () => {
    const baseStyles = {
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      background: `rgba(255, 255, 255, ${opacity})`,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }

    switch (variant) {
      case 'floating':
        return {
          ...baseStyles,
          borderRadius: '50px',
          margin: '16px',
          maxWidth: 'calc(100% - 32px)'
        }
      
      case 'fixed':
        return {
          ...baseStyles,
          borderRadius: '0',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none'
        }
      
      case 'sticky':
      default:
        return {
          ...baseStyles,
          borderRadius: '0',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none'
        }
    }
  }

  const navVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: 'easeOut'
      }
    },
    hidden: {
      y: -100,
      opacity: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.2,
        ease: 'easeIn'
      }
    }
  }

  return (
    <AnimationErrorBoundary>
      <motion.nav
        className={`glassmorphic-nav ${className}`}
        style={{
          backdropFilter: dynamicBlur,
          WebkitBackdropFilter: dynamicBlur,
          background: `rgba(255, 255, 255, ${dynamicOpacity})`,
          borderRadius: variant === 'floating' ? '50px' : '0'
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          transition: { 
            duration: prefersReducedMotion ? 0.1 : 0.4,
            ease: 'easeOut'
          }
        }}
      >
        {/* Enhanced blur effect based on scroll */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              backdropFilter: dynamicBlur,
              WebkitBackdropFilter: dynamicBlur,
              background: `rgba(255, 255, 255, ${dynamicOpacity})`,
              borderRadius: variant === 'floating' ? '50px' : '0'
            }}
          />
        )}

        <div className="relative z-10 flex items-center justify-between px-6 py-4">
          {/* Logo */}
          {logo && (
            <motion.div
              className="flex items-center"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            >
              {logo}
            </motion.div>
          )}

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {items.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${item.active 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }
                `}
                whileHover={prefersReducedMotion ? {} : { 
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: prefersReducedMotion ? 0 : index * 0.1,
                    duration: prefersReducedMotion ? 0.1 : 0.3
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  {item.icon && (
                    <span className="w-4 h-4">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </div>

                {/* Active indicator */}
                {item.active && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                    layoutId="activeTab"
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                  />
                )}

                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0"
                  whileHover={prefersReducedMotion ? {} : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </div>

          {/* Actions */}
          {actions && (
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { 
                  delay: prefersReducedMotion ? 0 : 0.2,
                  duration: prefersReducedMotion ? 0.1 : 0.3
                }
              }}
            >
              {actions}
            </motion.div>
          )}
        </div>

        {/* Scroll progress indicator */}
        {isScrolled && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            style={{
              width: scrollProgressWidth
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          />
        )}

        {/* Decorative gradient borders */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.nav>
    </AnimationErrorBoundary>
  )
}

// Mobile glassmorphic navigation
export function MobileGlassmorphicNavigation({
  items,
  blur = 15,
  opacity = 0.15,
  className = ''
}: Pick<GlassmorphicNavigationProps, 'items' | 'blur' | 'opacity' | 'className'>) {
  const { prefersReducedMotion } = useReducedMotion()

  return (
    <AnimationErrorBoundary>
      <motion.nav
        className={`glassmorphic-mobile-nav ${className}`}
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          background: `rgba(255, 255, 255, ${opacity})`,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '25px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          padding: '8px'
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          transition: { 
            duration: prefersReducedMotion ? 0.1 : 0.4,
            ease: 'easeOut'
          }
        }}
      >
        <div className="flex items-center space-x-2">
          {items.map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              className={`
                relative p-3 rounded-full transition-colors
                ${item.active 
                  ? 'text-blue-600 dark:text-blue-400 bg-white/20' 
                  : 'text-gray-700 dark:text-gray-300'
                }
              `}
              whileHover={prefersReducedMotion ? {} : { 
                scale: 1.1,
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: prefersReducedMotion ? 0 : index * 0.1,
                  duration: prefersReducedMotion ? 0.1 : 0.2
                }
              }}
            >
              {item.icon && (
                <span className="w-5 h-5 block">{item.icon}</span>
              )}

              {/* Active indicator */}
              {item.active && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30"
                  layoutId="mobileActiveTab"
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                />
              )}
            </motion.a>
          ))}
        </div>
      </motion.nav>
    </AnimationErrorBoundary>
  )
}