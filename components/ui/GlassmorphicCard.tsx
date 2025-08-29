'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { GlassmorphicCardProps } from '@/types/components'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimationErrorBoundary } from '../animations/AnimationErrorBoundary'

export function GlassmorphicCard({
  variant = 'standard',
  blur = 10,
  opacity = 0.1,
  borderGradient = ['#3b82f6', '#8b5cf6', '#ec4899'],
  hoverEffect = 'lift',
  children,
  className = ''
}: GlassmorphicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Mouse position for magnetic effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Spring animations for smooth movement
  const springConfig = { damping: 25, stiffness: 700 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)
  
  // Transform values for 3D effect
  const rotateX = useTransform(y, [-0.5, 0.5], [7.5, -7.5])
  const rotateY = useTransform(x, [-0.5, 0.5], [-7.5, 7.5])

  useEffect(() => {
    if (prefersReducedMotion || hoverEffect !== 'magnetic') return

    const handleMouseMove = (event: MouseEvent) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const mouseXPos = (event.clientX - centerX) / (rect.width / 2)
      const mouseYPos = (event.clientY - centerY) / (rect.height / 2)
      
      mouseX.set(mouseXPos)
      mouseY.set(mouseYPos)
    }

    const handleMouseLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
      setIsHovered(false)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
      card.addEventListener('mouseleave', handleMouseLeave)
      card.addEventListener('mouseenter', handleMouseEnter)

      return () => {
        card.removeEventListener('mousemove', handleMouseMove)
        card.removeEventListener('mouseleave', handleMouseLeave)
        card.removeEventListener('mouseenter', handleMouseEnter)
      }
    }
    
    return undefined
  }, [mouseX, mouseY, hoverEffect, prefersReducedMotion])

  const getVariantStyles = () => {
    const baseStyles = {
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      background: `rgba(255, 255, 255, ${opacity})`,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }

    switch (variant) {
      case 'premium':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, rgba(255, 255, 255, ${opacity + 0.05}), rgba(255, 255, 255, ${opacity}))`,
          border: `1px solid transparent`,
          backgroundClip: 'padding-box',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          borderRadius: '20px'
        }
      
      case 'minimal':
        return {
          ...baseStyles,
          backdropFilter: `blur(${blur / 2}px)`,
          WebkitBackdropFilter: `blur(${blur / 2}px)`,
          background: `rgba(255, 255, 255, ${opacity / 2})`,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
        }
      
      default:
        return baseStyles
    }
  }

  const getHoverAnimation = () => {
    if (prefersReducedMotion) return {}

    switch (hoverEffect) {
      case 'lift':
        return {
          whileHover: {
            y: -8,
            scale: 1.02,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            transition: { duration: 0.3, ease: 'easeOut' }
          }
        }
      
      case 'glow':
        return {
          whileHover: {
            boxShadow: `0 0 40px ${borderGradient[0]}40, 0 8px 32px rgba(0, 0, 0, 0.1)`,
            transition: { duration: 0.3 }
          }
        }
      
      case 'magnetic':
        return {
          style: {
            rotateX: prefersReducedMotion ? 0 : rotateX,
            rotateY: prefersReducedMotion ? 0 : rotateY,
            transformStyle: 'preserve-3d' as const
          }
        }
      
      default:
        return {}
    }
  }

  const getBorderGradient = () => {
    if (borderGradient.length === 0) return 'transparent'
    
    const gradientString = borderGradient.join(', ')
    return `linear-gradient(135deg, ${gradientString})`
  }

  if (prefersReducedMotion) {
    return (
      <div
        ref={cardRef}
        className={`glassmorphic-card static ${className}`}
        style={{
          ...getVariantStyles(),
          position: 'relative'
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <AnimationErrorBoundary>
      <motion.div
        ref={cardRef}
        className={`glassmorphic-card ${variant} ${className}`}
        style={{
          ...getVariantStyles(),
          position: 'relative'
        }}
        {...getHoverAnimation()}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated border gradient */}
        {variant === 'premium' && (
          <motion.div
            className="absolute inset-0 rounded-[20px] p-[1px]"
            style={{
              background: getBorderGradient(),
              opacity: isHovered ? 0.8 : 0.4
            }}
            animate={{
              background: isHovered 
                ? `conic-gradient(from 0deg, ${borderGradient.join(', ')}, ${borderGradient[0]})`
                : getBorderGradient()
            }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="w-full h-full rounded-[19px]"
              style={{
                background: 'rgba(0, 0, 0, 0.9)'
              }}
            />
          </motion.div>
        )}

        {/* Content */}
        <div className="relative z-10 p-6">
          {children}
        </div>

        {/* Shine effect */}
        {hoverEffect === 'glow' && (
          <motion.div
            className="absolute inset-0 rounded-[16px] pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 0%, ${borderGradient[0]}20 50%, transparent 100%)`,
              opacity: 0
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? '100%' : '-100%'
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        )}

        {/* Floating particles for premium variant */}
        {variant === 'premium' && isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: borderGradient[i % borderGradient.length],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimationErrorBoundary>
  )
}

// Specialized card variants
export function PremiumGlassCard({ children, className = '', ...props }: Omit<GlassmorphicCardProps, 'variant'>) {
  return (
    <GlassmorphicCard
      variant="premium"
      hoverEffect="magnetic"
      borderGradient={['#3b82f6', '#8b5cf6', '#ec4899', '#3b82f6']}
      className={`premium-glass ${className}`}
      {...props}
    >
      {children}
    </GlassmorphicCard>
  )
}

export function MinimalGlassCard({ children, className = '', ...props }: Omit<GlassmorphicCardProps, 'variant'>) {
  return (
    <GlassmorphicCard
      variant="minimal"
      hoverEffect="lift"
      opacity={0.05}
      blur={5}
      className={`minimal-glass ${className}`}
      {...props}
    >
      {children}
    </GlassmorphicCard>
  )
}

export function GlowingGlassCard({ children, className = '', ...props }: Omit<GlassmorphicCardProps, 'variant'>) {
  return (
    <GlassmorphicCard
      variant="standard"
      hoverEffect="glow"
      borderGradient={['#06d6a0', '#3b82f6', '#8b5cf6']}
      className={`glowing-glass ${className}`}
      {...props}
    >
      {children}
    </GlassmorphicCard>
  )
}