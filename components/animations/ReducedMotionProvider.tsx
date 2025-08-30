/**
 * Reduced Motion Provider and Support System
 * Comprehensive accessibility support for motion-sensitive users
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ReducedMotionConfig, FallbackAnimationConfig, StaticAlternativeConfig } from '@/types/animations'

interface ReducedMotionContextType {
  reducedMotion: boolean
  setReducedMotion: (enabled: boolean) => void
  registerFallback: (config: FallbackAnimationConfig) => void
  registerStaticAlternative: (config: StaticAlternativeConfig) => void
  getFallback: (animationId: string) => FallbackAnimationConfig | null
  getStaticAlternative: (componentName: string) => React.ComponentType | null
  toggleAnimations: () => void
  animationsEnabled: boolean
}

const ReducedMotionContext = createContext<ReducedMotionContextType | null>(null)

interface ReducedMotionProviderProps {
  children: ReactNode
  config?: Partial<ReducedMotionConfig>
}

export function ReducedMotionProvider({ 
  children, 
  config = {} 
}: ReducedMotionProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [fallbacks, setFallbacks] = useState<Map<string, FallbackAnimationConfig>>(new Map())
  const [staticAlternatives, setStaticAlternatives] = useState<Map<string, React.ComponentType>>(new Map())

  const defaultConfig: ReducedMotionConfig = {
    respectSystemPreference: true,
    fallbackAnimations: [],
    staticAlternatives: [],
    ...config
  }

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const updateReducedMotion = (matches: boolean) => {
      if (defaultConfig.respectSystemPreference) {
        setReducedMotion(matches)
        setAnimationsEnabled(!matches)
      }
    }

    // Set initial state
    updateReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      updateReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    // Check for user preference in localStorage
    const userPreference = localStorage.getItem('animations-enabled')
    if (userPreference !== null) {
      const enabled = userPreference === 'true'
      setAnimationsEnabled(enabled)
      setReducedMotion(!enabled)
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [defaultConfig.respectSystemPreference])

  useEffect(() => {
    // Register default fallbacks
    defaultConfig.fallbackAnimations.forEach(registerFallback)
    
    // Register default static alternatives
    defaultConfig.staticAlternatives.forEach(registerStaticAlternative)
  }, [defaultConfig])

  useEffect(() => {
    // Apply global CSS class for reduced motion
    document.documentElement.classList.toggle('reduce-motion', reducedMotion)
    document.documentElement.classList.toggle('animations-disabled', !animationsEnabled)
    
    // Set CSS custom property
    document.documentElement.style.setProperty(
      '--animation-duration-multiplier', 
      reducedMotion ? '0' : '1'
    )
  }, [reducedMotion, animationsEnabled])

  const registerFallback = (config: FallbackAnimationConfig) => {
    setFallbacks(prev => new Map(prev.set(config.originalAnimation, config)))
  }

  const registerStaticAlternative = (config: StaticAlternativeConfig) => {
    setStaticAlternatives(prev => new Map(prev.set(config.component, config.staticVersion)))
  }

  const getFallback = (animationId: string): FallbackAnimationConfig | null => {
    return fallbacks.get(animationId) || null
  }

  const getStaticAlternative = (componentName: string): React.ComponentType | null => {
    return staticAlternatives.get(componentName) || null
  }

  const toggleAnimations = () => {
    const newState = !animationsEnabled
    setAnimationsEnabled(newState)
    setReducedMotion(!newState)
    
    // Save user preference
    localStorage.setItem('animations-enabled', newState.toString())
  }

  const contextValue: ReducedMotionContextType = {
    reducedMotion,
    setReducedMotion,
    registerFallback,
    registerStaticAlternative,
    getFallback,
    getStaticAlternative,
    toggleAnimations,
    animationsEnabled
  }

  return (
    <ReducedMotionContext.Provider value={contextValue}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

export function useReducedMotionContext() {
  const context = useContext(ReducedMotionContext)
  if (!context) {
    throw new Error('useReducedMotionContext must be used within a ReducedMotionProvider')
  }
  return context
}

/**
 * Component for toggling animation preferences
 */
interface AnimationToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AnimationToggle({ 
  className = '', 
  showLabel = true,
  size = 'md' 
}: AnimationToggleProps) {
  const { animationsEnabled, toggleAnimations, reducedMotion } = useReducedMotionContext()

  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5',
    lg: 'w-12 h-6'
  }

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <label htmlFor="animation-toggle" className="text-sm font-medium">
          Enable Animations
        </label>
      )}
      <button
        id="animation-toggle"
        type="button"
        role="switch"
        aria-checked={animationsEnabled}
        aria-label={animationsEnabled ? 'Disable animations' : 'Enable animations'}
        onClick={toggleAnimations}
        className={`
          relative inline-flex ${sizeClasses[size]} rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${animationsEnabled ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            ${thumbSizeClasses[size]} inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
            ${animationsEnabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {reducedMotion && (
        <span className="text-xs text-gray-500">
          (System preference: Reduce motion)
        </span>
      )}
    </div>
  )
}

/**
 * Higher-order component for conditional animation rendering
 */
export function withReducedMotion<P extends object>(
  AnimatedComponent: React.ComponentType<P>,
  StaticComponent?: React.ComponentType<P>
) {
  return function ReducedMotionWrapper(props: P) {
    const { reducedMotion, getStaticAlternative } = useReducedMotionContext()
    
    if (reducedMotion) {
      const StaticAlternative = StaticComponent || getStaticAlternative(AnimatedComponent.name)
      if (StaticAlternative) {
        return <StaticAlternative {...props} />
      }
      // Fallback to animated component with reduced motion class
      return (
        <div className="reduce-motion">
          <AnimatedComponent {...props} />
        </div>
      )
    }
    
    return <AnimatedComponent {...props} />
  }
}

/**
 * Hook for conditional animation values
 */
export function useAnimationValue<T>(animatedValue: T, staticValue: T): T {
  const { reducedMotion } = useReducedMotionContext()
  return reducedMotion ? staticValue : animatedValue
}

/**
 * Component for displaying animation status
 */
export function AnimationStatus({ className = '' }: { className?: string }) {
  const { reducedMotion, animationsEnabled } = useReducedMotionContext()

  if (!reducedMotion && animationsEnabled) return null

  return (
    <div className={`fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-md text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>
          {reducedMotion 
            ? 'Animations reduced for accessibility' 
            : 'Animations disabled by user preference'
          }
        </span>
      </div>
    </div>
  )
}

/**
 * Accessibility announcement component for screen readers
 */
export function MotionAnnouncement() {
  const { reducedMotion, animationsEnabled } = useReducedMotionContext()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (reducedMotion) {
      setAnnouncement('Animations have been reduced for accessibility')
    } else if (!animationsEnabled) {
      setAnnouncement('Animations have been disabled')
    } else {
      setAnnouncement('Animations are enabled')
    }
  }, [reducedMotion, animationsEnabled])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}