/**
 * Advanced cursor system with multiple effects and interactions
 */

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'

interface CursorState {
  variant: 'default' | 'hover' | 'click' | 'text' | 'drag' | 'loading' | 'disabled'
  text?: string
  color?: string
  size?: number
}

interface AdvancedCursorProps {
  showRipples?: boolean
  showParticles?: boolean
  magneticStrength?: number
  trailLength?: number
  className?: string
}

export function AdvancedCursor({
  showRipples = true,
  showParticles = true,
  magneticStrength = 0.3,
  trailLength = 8,
  className = ''
}: AdvancedCursorProps) {
  const [cursorState, setCursorState] = useState<CursorState>({ variant: 'default' })
  const [isVisible, setIsVisible] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([])
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; life: number }>>([])
  
  const { prefersReducedMotion } = useReducedMotion()
  const { canUseAdvancedEffects } = useAdaptiveQuality()

  // Mouse tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Spring configuration based on cursor state
  const getSpringConfig = () => {
    switch (cursorState.variant) {
      case 'drag':
        return { damping: 15, stiffness: 400 }
      case 'loading':
        return { damping: 30, stiffness: 800 }
      default:
        return { damping: 25, stiffness: 700 }
    }
  }

  const cursorX = useSpring(mouseX, getSpringConfig())
  const cursorY = useSpring(mouseY, getSpringConfig())

  // Cursor transformations
  const cursorScale = useTransform(
    [cursorX, cursorY],
    ([x, y]) => {
      switch (cursorState.variant) {
        case 'hover':
          return 1.5
        case 'click':
          return 0.8
        case 'text':
          return 0.6
        case 'drag':
          return 1.2
        case 'disabled':
          return 0.5
        default:
          return 1
      }
    }
  )

  const cursorOpacity = useTransform(
    [cursorX, cursorY],
    ([x, y]) => {
      switch (cursorState.variant) {
        case 'disabled':
          return 0.3
        case 'loading':
          return 0.8
        default:
          return 0.6
      }
    }
  )

  // Ripple effect on click
  const createRipple = useCallback((x: number, y: number) => {
    if (!showRipples || !canUseAdvancedEffects) return
    
    const rippleId = Date.now() + Math.random()
    setRipples(prev => [...prev, { id: rippleId, x, y, timestamp: Date.now() }])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId))
    }, 1000)
  }, [showRipples, canUseAdvancedEffects])

  // Particle burst effect
  const createParticleBurst = useCallback((x: number, y: number) => {
    if (!showParticles || !canUseAdvancedEffects) return
    
    const particleCount = 6
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1
    }))
    
    setParticles(prev => [...prev, ...newParticles])
  }, [showParticles, canUseAdvancedEffects])

  // Mouse event handlers
  useEffect(() => {
    if (prefersReducedMotion) return

    let animationFrame: number

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setIsVisible(true)

      // Detect cursor context
      const target = e.target as HTMLElement
      const newState: CursorState = { variant: 'default' }

      if (target.matches('button, a, [role="button"], .cursor-hover')) {
        newState.variant = 'hover'
      } else if (target.matches('input, textarea, [contenteditable], .cursor-text')) {
        newState.variant = 'text'
      } else if (target.matches('.cursor-disabled, :disabled')) {
        newState.variant = 'disabled'
      } else if (target.matches('.cursor-drag, [draggable="true"]')) {
        newState.variant = 'drag'
      }

      // Get custom cursor data
      const cursorData = target.getAttribute('data-cursor')
      if (cursorData) {
        try {
          const data = JSON.parse(cursorData)
          Object.assign(newState, data)
        } catch {
          newState.text = cursorData
        }
      }

      setCursorState(newState)
    }

    const handleMouseDown = (e: MouseEvent) => {
      setCursorState(prev => ({ ...prev, variant: 'click' }))
      createRipple(e.clientX, e.clientY)
      createParticleBurst(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      setCursorState(prev => ({ 
        ...prev, 
        variant: prev.variant === 'click' ? 'default' : prev.variant 
      }))
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    // Particle animation
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98,
        vy: particle.vy * 0.98 + 0.1, // gravity
        life: particle.life - 0.02
      })).filter(particle => particle.life > 0))

      animationFrame = requestAnimationFrame(animateParticles)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    
    if (showParticles) {
      animateParticles()
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [mouseX, mouseY, prefersReducedMotion, createRipple, createParticleBurst, showParticles])

  if (prefersReducedMotion || !canUseAdvancedEffects) {
    return null
  }

  const getCursorColor = () => {
    return cursorState.color || (cursorState.variant === 'text' ? '#3b82f6' : '#ffffff')
  }

  const getCursorSize = () => {
    return cursorState.size || 20
  }

  return (
    <div className={`advanced-cursor-system ${className}`}>
      {/* Main cursor */}
      <motion.div
        className="cursor-main"
        style={{
          position: 'fixed',
          left: cursorX,
          top: cursorY,
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: cursorState.variant === 'text' ? 'normal' : 'difference'
        }}
        animate={{
          scale: isVisible ? cursorScale : 0,
          opacity: isVisible ? cursorOpacity : 0
        }}
        transition={{ duration: 0.15 }}
      >
        {/* Cursor dot */}
        <motion.div
          className="cursor-dot"
          style={{
            width: getCursorSize(),
            height: getCursorSize(),
            background: getCursorColor(),
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            rotate: cursorState.variant === 'loading' ? 360 : 0
          }}
          transition={{
            rotate: {
              duration: 1,
              repeat: cursorState.variant === 'loading' ? Infinity : 0,
              ease: 'linear'
            }
          }}
        />

        {/* Cursor ring */}
        <motion.div
          className="cursor-ring"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: getCursorSize() * 2.5,
            height: getCursorSize() * 2.5,
            border: `1px solid ${getCursorColor()}`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: cursorState.variant === 'hover' ? 1 : 0.8,
            opacity: cursorState.variant === 'hover' ? 0.5 : 0.2
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Text cursor indicator */}
        {cursorState.variant === 'text' && (
          <motion.div
            className="cursor-text-indicator"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 2,
              height: getCursorSize(),
              background: getCursorColor(),
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Custom text */}
        {cursorState.text && (
          <motion.div
            className="cursor-text"
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              padding: '4px 8px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {cursorState.text}
          </motion.div>
        )}
      </motion.div>

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="cursor-ripple"
          style={{
            position: 'fixed',
            left: ripple.x,
            top: ripple.y,
            pointerEvents: 'none',
            zIndex: 9998,
            border: `2px solid ${getCursorColor()}`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ 
            width: 100, 
            height: 100, 
            opacity: 0,
            borderWidth: 0
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Particle effects */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="cursor-particle"
          style={{
            position: 'fixed',
            left: particle.x,
            top: particle.y,
            width: 4,
            height: 4,
            background: getCursorColor(),
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9997,
            transform: 'translate(-50%, -50%)',
            opacity: particle.life
          }}
        />
      ))}
    </div>
  )
}

// Enhanced magnetic element with more sophisticated attraction
export function EnhancedMagneticElement({
  children,
  strength = 0.3,
  distance = 100,
  className = '',
  as: Component = 'div',
  attractionType = 'pull'
}: {
  children: React.ReactNode
  strength?: number
  distance?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
  attractionType?: 'pull' | 'repel' | 'orbit'
}) {
  const elementRef = useRef<HTMLElement>(null)
  const { prefersReducedMotion } = useReducedMotion()
  const { canUseAdvancedEffects } = useAdaptiveQuality()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  useEffect(() => {
    if (prefersReducedMotion || !canUseAdvancedEffects || !elementRef.current) return

    const element = elementRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      if (dist < distance) {
        const force = (distance - dist) / distance
        let moveX = deltaX * force * strength
        let moveY = deltaY * force * strength

        switch (attractionType) {
          case 'repel':
            moveX = -moveX
            moveY = -moveY
            break
          case 'orbit':
            const angle = Math.atan2(deltaY, deltaX) + Math.PI / 2
            moveX = Math.cos(angle) * force * strength * 20
            moveY = Math.sin(angle) * force * strength * 20
            break
        }
        
        x.set(moveX)
        y.set(moveY)
        
        // 3D rotation effect
        const rotX = (deltaY / rect.height) * 10 * force
        const rotY = (deltaX / rect.width) * 10 * force
        rotateX.set(-rotX)
        rotateY.set(rotY)
      }
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
      rotateX.set(0)
      rotateY.set(0)
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength, distance, attractionType, prefersReducedMotion, canUseAdvancedEffects, x, y, rotateX, rotateY])

  if (prefersReducedMotion || !canUseAdvancedEffects) {
    return (
      <Component className={`magnetic-element static ${className}`}>
        {children}
      </Component>
    )
  }

  return (
    <motion.div
      ref={elementRef}
      className={`enhanced-magnetic-element ${className}`}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300
      }}
    >
      {children}
    </motion.div>
  )
}

// Cursor interaction zones
export function CursorZone({
  children,
  cursorState,
  className = ''
}: {
  children: React.ReactNode
  cursorState: Partial<CursorState>
  className?: string
}) {
  return (
    <div
      className={`cursor-zone ${className}`}
      data-cursor={JSON.stringify(cursorState)}
    >
      {children}
    </div>
  )
}