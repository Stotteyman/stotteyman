'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useMotionPreference } from '@/hooks/useReducedMotion'
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
  const { shouldReduceMotion } = useMotionPreference()
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
    if (shouldReduceMotion) {
      // Show reduced motion version or static fallback
      return reducedAnimation || staticFallback || children
    }

    // Show full animation version
    return enabledAnimation || children
  }

  return (
    <AnimationErrorBoundary fallback={fallback}>
      <div 
        className={`motion-wrapper ${shouldReduceMotion ? 'reduced-motion' : 'full-motion'} ${className}`}
        data-motion-preference={shouldReduceMotion ? 'reduced' : 'full'}
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
  const { shouldReduceMotion } = useMotionPreference()
  
  // Don't animate if motion is reduced or condition is false
  const shouldAnimate = !shouldReduceMotion && condition

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
    shouldReduceMotion, 
    systemPreference, 
    userOverride,
    setMotionPreference,
    clearMotionPreference
  } = useMotionPreference()

  const handleToggle = () => {
    if (userOverride !== null) {
      // Clear user override to use system preference
      clearMotionPreference()
    } else {
      // Set user override opposite to current state
      setMotionPreference(!shouldReduceMotion)
    }
  }

  return (
    <div className={`motion-toggle ${className}`}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        aria-label={`${shouldReduceMotion ? 'Enable' : 'Disable'} animations`}
      >
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-4 rounded-full transition-colors ${
              shouldReduceMotion ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
          <span className="text-sm text-white">
            Animations {shouldReduceMotion ? 'Off' : 'On'}
          </span>
        </div>
        
        {userOverride !== null && (
          <span className="text-xs text-gray-400">
            (Override)
          </span>
        )}
      </button>
      
      <div className="text-xs text-gray-500 mt-1">
        System: {systemPreference ? 'Reduced' : 'Full'} motion
      </div>
    </div>
  )
}