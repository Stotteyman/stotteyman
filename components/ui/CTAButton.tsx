'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { MagneticElement } from '../animations/MagneticCursor'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface CTAButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'premium'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: React.ReactNode
  showArrow?: boolean
  hapticFeedback?: boolean
  className?: string
  disabled?: boolean
}

export function CTAButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  icon,
  showArrow = true,
  hapticFeedback = true,
  className = '',
  disabled = false
}: CTAButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const prefersReducedMotion = useReducedMotion()
  let rippleId = 0

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return

    // Haptic feedback
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }

    // Ripple effect
    if (!prefersReducedMotion) {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        setRipples(prev => [...prev, { x, y, id: rippleId++ }])
        
        setTimeout(() => {
          setRipples(prev => prev.slice(1))
        }, 600)
      }
    }

    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)

    if (onClick) {
      onClick()
    } else if (href) {
      window.location.href = href
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 neon-glow-premium'
      case 'secondary':
        return 'glass border border-white/20 text-white hover:border-blue-500/50 hover:bg-white/5'
      case 'premium':
        return 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 neon-glow-premium shadow-2xl'
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'lg':
        return 'px-8 py-4 text-lg'
      case 'xl':
        return 'px-12 py-6 text-xl'
      default:
        return 'px-6 py-3 text-base'
    }
  }

  const Component = href ? 'a' : 'button'
  const componentProps = href ? { href } : { type: 'button' as const }

  return (
    <MagneticElement strength={0.2}>
      <motion.div
        className="relative inline-block"
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Component
          ref={buttonRef as any}
          {...componentProps}
          onClick={handleClick}
          disabled={disabled}
          className={`
            relative inline-flex items-center justify-center
            font-semibold rounded-full
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-black
            overflow-hidden group
            ${getVariantStyles()}
            ${getSizeStyles()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isPressed ? 'animate-pulse' : ''}
            ${className}
          `}
        >
          {/* Ripple effects */}
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ width: 0, height: 0, opacity: 0.8 }}
              animate={{ 
                width: 300, 
                height: 300, 
                opacity: 0 
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}

          {/* Background animations */}
          {variant === 'premium' && !prefersReducedMotion && (
            <>
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/40 rounded-full"
                    animate={{
                      x: [0, 50, 0],
                      y: [0, -30, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${50}%`,
                    }}
                  />
                ))}
              </div>

              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          )}

          {/* Shine effect */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              style={{ transform: 'skewX(-20deg)' }}
            />
          )}

          {/* Content */}
          <span className="relative z-10 flex items-center gap-2">
            {icon && (
              <motion.span
                animate={prefersReducedMotion ? {} : { rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {icon}
              </motion.span>
            )}
            
            {children}
            
            {showArrow && (
              <motion.span
                animate={prefersReducedMotion ? {} : { x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={size === 'sm' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 28 : 20} />
              </motion.span>
            )}
          </span>

          {/* Premium variant extras */}
          {variant === 'premium' && (
            <>
              {/* Corner sparkles */}
              <motion.div
                className="absolute top-2 right-2"
                animate={prefersReducedMotion ? {} : {
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles size={12} className="text-white/60" />
              </motion.div>
              
              <motion.div
                className="absolute bottom-2 left-2"
                animate={prefersReducedMotion ? {} : {
                  rotate: -360,
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              >
                <Zap size={10} className="text-white/60" />
              </motion.div>
            </>
          )}
        </Component>

        {/* External glow for premium variant */}
        {variant === 'premium' && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-2xl -z-10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
    </MagneticElement>
  )
}