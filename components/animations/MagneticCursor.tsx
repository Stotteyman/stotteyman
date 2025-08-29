'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MagneticCursorProps {
  children?: React.ReactNode
  className?: string
  strength?: number
  size?: number
  showTrail?: boolean
  color?: string
  blendMode?: 'difference' | 'multiply' | 'screen' | 'overlay' | 'normal'
  elasticity?: number
}

export function MagneticCursor({
  children,
  className = '',
  strength = 0.3,
  size = 20,
  showTrail = true,
  color = 'white',
  blendMode = 'difference',
  elasticity = 0.2
}: MagneticCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'click'>('default')
  const prefersReducedMotion = useReducedMotion()

  // Mouse position tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Spring configuration for smooth movement
  const springConfig = { damping: 25, stiffness: 700 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  // Trail particles
  const [trailParticles, setTrailParticles] = useState<Array<{ x: number; y: number; id: number }>>([])

  useEffect(() => {
    if (prefersReducedMotion) return

    let particleId = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setIsVisible(true)

      // Add trail particle
      if (showTrail) {
        setTrailParticles(prev => {
          const newParticles = [...prev, { x: e.clientX, y: e.clientY, id: particleId++ }]
          // Keep only last 10 particles
          return newParticles.slice(-10)
        })
      }

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement
      const isInteractive = target.matches('button, a, input, [role="button"], .magnetic-target')
      setIsHovering(isInteractive)
    }

    const handleMouseDown = () => setCursorVariant('click')
    const handleMouseUp = () => setCursorVariant(isHovering ? 'hover' : 'default')
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [mouseX, mouseY, isHovering, showTrail, prefersReducedMotion])

  // Update cursor variant based on hover state
  useEffect(() => {
    setCursorVariant(isHovering ? 'hover' : 'default')
  }, [isHovering])

  // Clean up old trail particles
  useEffect(() => {
    const interval = setInterval(() => {
      setTrailParticles(prev => prev.slice(-5))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (prefersReducedMotion) {
    return null
  }

  const getCursorSize = () => {
    switch (cursorVariant) {
      case 'hover':
        return size * 1.5
      case 'click':
        return size * 0.8
      default:
        return size
    }
  }

  const getCursorOpacity = () => {
    switch (cursorVariant) {
      case 'hover':
        return 0.8
      case 'click':
        return 1
      default:
        return 0.6
    }
  }

  return (
    <>
      {/* Main cursor */}
      <motion.div
        ref={cursorRef}
        className={`magnetic-cursor ${className}`}
        style={{
          position: 'fixed',
          left: cursorX,
          top: cursorY,
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference'
        }}
        animate={{
          scale: isVisible ? 1 : 0,
          opacity: isVisible ? getCursorOpacity() : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="cursor-dot"
          animate={{
            width: getCursorSize(),
            height: getCursorSize()
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            background: 'white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Cursor ring */}
        <motion.div
          className="cursor-ring"
          animate={{
            width: getCursorSize() * 2,
            height: getCursorSize() * 2,
            opacity: cursorVariant === 'hover' ? 0.3 : 0.1
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            border: '1px solid white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </motion.div>

      {/* Trail particles */}
      {showTrail && trailParticles.map((particle, index) => (
        <motion.div
          key={particle.id}
          className="cursor-trail-particle"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 1,
            opacity: 0.6
          }}
          animate={{
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut'
          }}
          style={{
            position: 'fixed',
            width: size * 0.3,
            height: size * 0.3,
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9998,
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'difference'
          }}
        />
      ))}

      {children}
    </>
  )
}

// Hook for magnetic attraction effect
export function useMagneticEffect(strength: number = 0.3) {
  const elementRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion || !elementRef.current) return

    const element = elementRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = Math.max(rect.width, rect.height)
      
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance
        const moveX = deltaX * force * strength
        const moveY = deltaY * force * strength
        
        element.style.transform = `translate(${moveX}px, ${moveY}px)`
      }
    }

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0px, 0px)'
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength, prefersReducedMotion])

  return elementRef
}

// Component wrapper for magnetic effect
interface MagneticElementProps {
  children: React.ReactNode
  strength?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function MagneticElement({
  children,
  strength = 0.3,
  className = '',
  as: Component = 'div'
}: MagneticElementProps) {
  const magneticRef = useMagneticEffect(strength)
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <Component className={`magnetic-element static ${className}`}>
        {children}
      </Component>
    )
  }

  return (
    <Component
      ref={magneticRef}
      className={`magnetic-element magnetic-target ${className}`}
      style={{
        transition: 'transform 0.2s ease-out'
      }}
    >
      {children}
    </Component>
  )
}

// Cursor context for global cursor management
interface CursorContextType {
  setCursorVariant: (variant: 'default' | 'hover' | 'click' | 'text') => void
  setCursorText: (text: string) => void
}

const CursorContext = React.createContext<CursorContextType | null>(null)

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'click' | 'text'>('default')
  const [cursorText, setCursorText] = useState('')

  return (
    <CursorContext.Provider value={{ setCursorVariant, setCursorText }}>
      <MagneticCursor />
      {children}
    </CursorContext.Provider>
  )
}

export function useCursor() {
  const context = React.useContext(CursorContext)
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider')
  }
  return context
}