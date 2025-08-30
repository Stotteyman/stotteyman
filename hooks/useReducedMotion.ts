/**
 * Hook for detecting and respecting user's reduced motion preferences
 */

import { useState, useEffect } from 'react'

export interface UseReducedMotionReturn {
  prefersReducedMotion: boolean
  isSupported: boolean
  setReducedMotion: (enabled: boolean) => void
  getAnimationDuration: (defaultDuration: number) => number
  getAnimationEasing: (defaultEasing: string) => string
  shouldAnimate: (animationType?: 'essential' | 'decorative' | 'informational') => boolean
}

export function useReducedMotion(): UseReducedMotionReturn {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [userOverride, setUserOverride] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if the browser supports prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsSupported(true)
    
    // Set initial state
    const initialState = userOverride !== null ? userOverride : mediaQuery.matches
    setPrefersReducedMotion(initialState)
    
    // Update CSS custom property for global access
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--prefers-reduced-motion', 
        initialState ? '1' : '0'
      )
    }

    // Listen for changes in system preference
    const handleChange = (e: MediaQueryListEvent) => {
      if (userOverride === null) {
        setPrefersReducedMotion(e.matches)
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty(
            '--prefers-reduced-motion', 
            e.matches ? '1' : '0'
          )
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    // Check for saved user preference
    if (typeof localStorage !== 'undefined') {
      const savedPreference = localStorage.getItem('reduced-motion-preference')
      if (savedPreference !== null) {
        const preference = savedPreference === 'true'
        setUserOverride(preference)
        setPrefersReducedMotion(preference)
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty(
            '--prefers-reduced-motion', 
            preference ? '1' : '0'
          )
        }
      }
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [userOverride])

  const setReducedMotion = (enabled: boolean) => {
    setUserOverride(enabled)
    setPrefersReducedMotion(enabled)
    
    // Save preference to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('reduced-motion-preference', enabled.toString())
    }
    
    // Update CSS custom property
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--prefers-reduced-motion', 
        enabled ? '1' : '0'
      )
    }
    
    // Dispatch custom event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('reduced-motion-change', {
        detail: { prefersReducedMotion: enabled }
      }))
    }
  }

  const getAnimationDuration = (defaultDuration: number): number => {
    if (prefersReducedMotion) {
      // Reduce duration significantly or make instant
      return Math.min(defaultDuration * 0.1, 0.2)
    }
    return defaultDuration
  }

  const getAnimationEasing = (defaultEasing: string): string => {
    if (prefersReducedMotion) {
      // Use linear easing for reduced motion
      return 'linear'
    }
    return defaultEasing
  }

  const shouldAnimate = (animationType: 'essential' | 'decorative' | 'informational' = 'decorative'): boolean => {
    if (!prefersReducedMotion) {
      return true
    }
    
    // Allow essential and informational animations even with reduced motion
    // Essential animations are those that convey important information
    // Informational animations provide UI feedback
    return animationType === 'essential' || animationType === 'informational'
  }

  return {
    prefersReducedMotion,
    isSupported,
    setReducedMotion,
    getAnimationDuration,
    getAnimationEasing,
    shouldAnimate
  }
}