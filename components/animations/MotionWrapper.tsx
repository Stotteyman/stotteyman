'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimationErrorBoundary } from './AnimationErrorBoundary'

interface MotionWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  enabledAnimation?: ReactNode
  reducedAnimation?: ReactNode
  staticFallback?: ReactNode
  className?: string
}

export function MotionWrapper({
  children,
  fallback,
  enabledAnimation,
  reducedAnimation,
  staticFallback,
  className = ''
}: MotionWrapperProps) {
  const { prefersReducedMotion } = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={`motion-wrapper loading ${className}`}>
        {staticFallback || children}
      </div>
    )
  }

  const renderContent = () => {
    if (prefersReducedMotion) {
      // Show reduced motion version or static fallback
      return reducedAnimation || staticFallback || children
    }

    // Show full animation version
    return enabledAnimation || children
  }

  return (
    <AnimationErrorBoundary fallback={fallback}>
      <div 
        className={`motion-wrapper ${prefersReducedMotion ? 'reduced-motion' : 'full-motion'} ${className}`}
        data-motion-preference={prefersReducedMotion ? 'reduced' : 'full'}
      >
        {renderContent()}
      </div>
    </AnimationErrorBoundary>
  )
}

interface ConditionalAnimationProps {
  children: ReactNode
  condition?: boolean
  fallback?: ReactNode
  className?: string
}

export function ConditionalAnimation({
  children,
  condition = true,
  fallback,
  className = ''
}: ConditionalAnimationProps) {
  const { prefersReducedMotion } = useReducedMotion()
  
  // Don't animate if motion is reduced or condition is false
  const shouldAnimate = !prefersReducedMotion && condition

  if (!shouldAnimate) {
    return (
      <div className={`conditional-animation static ${className}`}>
        {fallback || children}
      </div>
    )
  }

  return (
    <AnimationErrorBoundary>
      <div className={`conditional-animation animated ${className}`}>
        {children}
      </div>
    </AnimationErrorBoundary>
  )
}

interface MotionToggleProps {
  className?: string
}

export function MotionToggle({ className = '' }: MotionToggleProps) {
  const { 
    prefersReducedMotion, 
    setReducedMotion
  } = useReducedMotion()

  const handleToggle = () => {
    // Toggle reduced motion preference
    setReducedMotion(!prefersReducedMotion)
  }

  return (
    <div className={`motion-toggle ${className}`}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        aria-label={`${prefersReducedMotion ? 'Enable' : 'Disable'} animations`}
      >
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-4 rounded-full transition-colors ${
              prefersReducedMotion ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
          <span className="text-sm text-white">
            Animations {prefersReducedMotion ? 'Off' : 'On'}
          </span>
        </div>
        

      </button>
      

    </div>
  )
}