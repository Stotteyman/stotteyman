/**
 * Component for allowing users to toggle animation preferences
 */

'use client'

import { useState } from 'react'
import { useReducedMotionContext } from '@/lib/animations/ReducedMotionProvider'

interface AnimationToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'switch' | 'button' | 'checkbox'
}

export function AnimationToggle({
  className = '',
  showLabel = true,
  size = 'md',
  variant = 'switch'
}: AnimationToggleProps) {
  const { prefersReducedMotion, setReducedMotion, isSupported } = useReducedMotionContext()
  const [isToggling, setIsToggling] = useState(false)

  if (!isSupported) {
    return null
  }

  const handleToggle = async () => {
    setIsToggling(true)
    
    // Add a small delay to show the toggle state
    await new Promise(resolve => setTimeout(resolve, 100))
    
    setReducedMotion(!prefersReducedMotion)
    setIsToggling(false)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'lg':
        return 'text-lg'
      default:
        return 'text-base'
    }
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-3 ${getSizeClasses()} ${className}`}>
        {showLabel && (
          <label 
            htmlFor="animation-toggle"
            className="font-medium text-gray-700 dark:text-gray-300"
          >
            Reduce animations
          </label>
        )}
        <button
          id="animation-toggle"
          role="switch"
          aria-checked={prefersReducedMotion}
          aria-label={prefersReducedMotion ? 'Enable animations' : 'Reduce animations'}
          onClick={handleToggle}
          disabled={isToggling}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
            ${prefersReducedMotion 
              ? 'bg-blue-600' 
              : 'bg-gray-200 dark:bg-gray-700'
            }
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
              ${prefersReducedMotion ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
          ${prefersReducedMotion
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
          }
          ${getSizeClasses()} ${className}
        `}
        aria-pressed={prefersReducedMotion}
      >
        <span className="text-lg" role="img" aria-hidden="true">
          {prefersReducedMotion ? '🐌' : '⚡'}
        </span>
        {showLabel && (
          <span>
            {prefersReducedMotion ? 'Reduced motion' : 'Full animations'}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'checkbox') {
    return (
      <label className={`flex items-center gap-3 cursor-pointer ${getSizeClasses()} ${className}`}>
        <input
          type="checkbox"
          checked={prefersReducedMotion}
          onChange={handleToggle}
          disabled={isToggling}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
        />
        {showLabel && (
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Reduce animations for accessibility
          </span>
        )}
      </label>
    )
  }

  return null
}

// Preset configurations for common use cases
export function AccessibilityAnimationToggle() {
  return (
    <AnimationToggle
      variant="checkbox"
      showLabel={true}
      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    />
  )
}

export function HeaderAnimationToggle() {
  return (
    <AnimationToggle
      variant="switch"
      showLabel={false}
      size="sm"
      className="ml-auto"
    />
  )
}

export function SettingsAnimationToggle() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Animation Preferences
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Control how animations behave throughout the site. Reducing animations can help with motion sensitivity and improve performance.
      </p>
      <AnimationToggle
        variant="button"
        showLabel={true}
        className="mt-3"
      />
    </div>
  )
}