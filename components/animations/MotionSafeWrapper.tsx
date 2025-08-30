/**
 * Motion Safe Wrapper - Provides safe animation fallbacks and accessibility compliance
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useReducedMotionContext } from '@/lib/animations/ReducedMotionProvider'

export interface MotionSafeWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  animationType?: 'decorative' | 'essential' | 'informational'
  fallbackAnimation?: 'fade' | 'slide' | 'scale' | 'none'
  className?: string
  enableFallback?: boolean
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
  onFallbackUsed?: () => void
}

export function MotionSafeWrapper({
  children,
  fallback,
  animationType = 'decorative',
  fallbackAnimation = 'fade',
  className = '',
  enableFallback = true,
  onAnimationStart,
  onAnimationComplete,
  onFallbackUsed
}: MotionSafeWrapperProps) {
  const { prefersReducedMotion, shouldAnimate, getAnimationDuration } = useReducedMotionContext()
  const [isVisible, setIsVisible] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Determine if we should use animations
  const canAnimate = shouldAnimate(animationType)
  const shouldUseFallback = prefersReducedMotion && !canAnimate && enableFallback

  useEffect(() => {
    if (shouldUseFallback) {
      setUseFallback(true)
      onFallbackUsed?.()
    } else {
      setUseFallback(false)
    }
  }, [shouldUseFallback, onFallbackUsed])

  // Set up intersection observer for viewport-based animations
  useEffect(() => {
    if (!elementRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsVisible(true)
          onAnimationStart?.()
          
          // Simulate animation completion for fallbacks
          if (useFallback) {
            const duration = getAnimationDuration(300) // 300ms default
            setTimeout(() => {
              onAnimationComplete?.()
            }, duration)
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '10px'
      }
    )

    observerRef.current.observe(elementRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [useFallback, getAnimationDuration, onAnimationStart, onAnimationComplete])

  const getFallbackClasses = () => {
    if (!useFallback || !isVisible) return ''

    const baseClasses = 'motion-safe-fallback'
    
    switch (fallbackAnimation) {
      case 'fade':
        return `${baseClasses} fallback-fade-in`
      case 'slide':
        return `${baseClasses} fallback-slide-up`
      case 'scale':
        return `${baseClasses} fallback-scale-in`
      case 'none':
        return `${baseClasses} fallback-instant`
      default:
        return baseClasses
    }
  }

  const getInitialStyles = () => {
    if (!useFallback) return {}

    if (!isVisible) {
      switch (fallbackAnimation) {
        case 'fade':
          return { opacity: 0 }
        case 'slide':
          return { opacity: 0, transform: 'translateY(10px)' }
        case 'scale':
          return { opacity: 0, transform: 'scale(0.98)' }
        default:
          return {}
      }
    }

    return {}
  }

  // If we should use fallback and have a custom fallback component
  if (useFallback && fallback) {
    return (
      <div
        ref={elementRef}
        className={`motion-safe-wrapper ${className}`}
        style={getInitialStyles()}
      >
        {fallback}
      </div>
    )
  }

  // Regular wrapper with potential fallback styling
  return (
    <div
      ref={elementRef}
      className={`motion-safe-wrapper ${getFallbackClasses()} ${className}`}
      style={getInitialStyles()}
      data-animation-type={animationType}
      data-reduced-motion={prefersReducedMotion}
      data-use-fallback={useFallback}
    >
      {children}
    </div>
  )
}

/**
 * Higher-order component for motion-safe animations
 */
export function withMotionSafe<P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<MotionSafeWrapperProps> = {}
) {
  return function MotionSafeComponent(props: P) {
    return (
      <MotionSafeWrapper {...options}>
        <Component {...props} />
      </MotionSafeWrapper>
    )
  }
}

/**
 * Conditional animation component - only renders children if animations are enabled
 */
export function AnimationConditional({
  children,
  fallback,
  animationType = 'decorative'
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  animationType?: 'decorative' | 'essential' | 'informational'
}) {
  const { shouldAnimate } = useReducedMotionContext()

  if (shouldAnimate(animationType)) {
    return <>{children}</>
  }

  return <>{fallback || null}</>
}

/**
 * Safe animation trigger - provides callbacks for animation states
 */
export function useMotionSafeAnimation(
  animationType: 'decorative' | 'essential' | 'informational' = 'decorative'
) {
  const { prefersReducedMotion, shouldAnimate, getAnimationDuration, getAnimationEasing } = useReducedMotionContext()
  const [isAnimating, setIsAnimating] = useState(false)

  const canAnimate = shouldAnimate(animationType)

  const startAnimation = (callback?: () => void) => {
    if (!canAnimate) {
      callback?.()
      return
    }

    setIsAnimating(true)
    callback?.()
  }

  const endAnimation = (callback?: () => void) => {
    setIsAnimating(false)
    callback?.()
  }

  const getAnimationProps = (defaultDuration: number, defaultEasing: string) => {
    return {
      duration: getAnimationDuration(defaultDuration),
      easing: getAnimationEasing(defaultEasing),
      shouldAnimate: canAnimate,
      isReducedMotion: prefersReducedMotion
    }
  }

  return {
    canAnimate,
    isAnimating,
    prefersReducedMotion,
    startAnimation,
    endAnimation,
    getAnimationProps
  }
}

/**
 * Preset motion-safe components for common use cases
 */

// Safe fade-in component
export function SafeFadeIn({
  children,
  className = '',
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <MotionSafeWrapper
      animationType="decorative"
      fallbackAnimation="fade"
      className={className}
      onAnimationStart={() => {
        if (delay > 0) {
          setTimeout(() => {
            // Animation logic here
          }, delay)
        }
      }}
    >
      {children}
    </MotionSafeWrapper>
  )
}

// Safe slide-up component
export function SafeSlideUp({
  children,
  className = '',
  essential = false
}: {
  children: React.ReactNode
  className?: string
  essential?: boolean
}) {
  return (
    <MotionSafeWrapper
      animationType={essential ? 'essential' : 'decorative'}
      fallbackAnimation="slide"
      className={className}
    >
      {children}
    </MotionSafeWrapper>
  )
}

// Safe scale component
export function SafeScale({
  children,
  className = '',
  fallback
}: {
  children: React.ReactNode
  className?: string
  fallback?: React.ReactNode
}) {
  return (
    <MotionSafeWrapper
      animationType="decorative"
      fallbackAnimation="scale"
      className={className}
      fallback={fallback}
    >
      {children}
    </MotionSafeWrapper>
  )
}

// Essential animation wrapper (always shows some form of animation)
export function EssentialAnimation({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <MotionSafeWrapper
      animationType="essential"
      fallbackAnimation="fade"
      className={className}
      enableFallback={true}
    >
      {children}
    </MotionSafeWrapper>
  )
}

// Informational animation wrapper (for UI feedback)
export function InformationalAnimation({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <MotionSafeWrapper
      animationType="informational"
      fallbackAnimation="fade"
      className={className}
      enableFallback={true}
    >
      {children}
    </MotionSafeWrapper>
  )
}