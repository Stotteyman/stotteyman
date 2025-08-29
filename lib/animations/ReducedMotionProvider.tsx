/**
 * Provider for managing reduced motion preferences across the application
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ReducedMotionContextType {
  prefersReducedMotion: boolean
  isSupported: boolean
  setReducedMotion: (enabled: boolean) => void
  getAnimationDuration: (defaultDuration: number) => number
  getAnimationEasing: (defaultEasing: string) => string
  shouldAnimate: (animationType?: 'essential' | 'decorative') => boolean
  animationSettings: {
    enableParticles: boolean
    enableParallax: boolean
    enableMorphing: boolean
    enableComplexAnimations: boolean
    maxAnimationDuration: number
  }
}

const ReducedMotionContext = createContext<ReducedMotionContextType | undefined>(undefined)

interface ReducedMotionProviderProps {
  children: React.ReactNode
}

export function ReducedMotionProvider({ children }: ReducedMotionProviderProps) {
  const reducedMotionHook = useReducedMotion()
  const [animationSettings, setAnimationSettings] = useState({
    enableParticles: true,
    enableParallax: true,
    enableMorphing: true,
    enableComplexAnimations: true,
    maxAnimationDuration: 2
  })

  // Update animation settings based on reduced motion preference
  useEffect(() => {
    if (reducedMotionHook.prefersReducedMotion) {
      setAnimationSettings({
        enableParticles: false,
        enableParallax: false,
        enableMorphing: false,
        enableComplexAnimations: false,
        maxAnimationDuration: 0.2
      })
    } else {
      setAnimationSettings({
        enableParticles: true,
        enableParallax: true,
        enableMorphing: true,
        enableComplexAnimations: true,
        maxAnimationDuration: 2
      })
    }
  }, [reducedMotionHook.prefersReducedMotion])

  // Apply global CSS classes based on preference
  useEffect(() => {
    if (typeof document === 'undefined') return

    const htmlElement = document.documentElement
    
    if (reducedMotionHook.prefersReducedMotion) {
      htmlElement.classList.add('reduce-motion')
      htmlElement.classList.remove('enable-motion')
    } else {
      htmlElement.classList.add('enable-motion')
      htmlElement.classList.remove('reduce-motion')
    }

    // Set CSS custom properties for animation control
    htmlElement.style.setProperty(
      '--animation-duration-multiplier',
      reducedMotionHook.prefersReducedMotion ? '0.1' : '1'
    )
    
    htmlElement.style.setProperty(
      '--animation-enabled',
      reducedMotionHook.prefersReducedMotion ? '0' : '1'
    )

    return () => {
      htmlElement.classList.remove('reduce-motion', 'enable-motion')
    }
  }, [reducedMotionHook.prefersReducedMotion])

  const contextValue: ReducedMotionContextType = {
    ...reducedMotionHook,
    animationSettings
  }

  return (
    <ReducedMotionContext.Provider value={contextValue}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

export function useReducedMotionContext(): ReducedMotionContextType {
  const context = useContext(ReducedMotionContext)
  if (context === undefined) {
    throw new Error('useReducedMotionContext must be used within a ReducedMotionProvider')
  }
  return context
}

// Higher-order component for wrapping components with reduced motion support
export function withReducedMotion<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ReducedMotionWrapper(props: P) {
    const { prefersReducedMotion } = useReducedMotionContext()
    
    return (
      <div className={prefersReducedMotion ? 'reduced-motion' : 'full-motion'}>
        <Component {...props} />
      </div>
    )
  }
}