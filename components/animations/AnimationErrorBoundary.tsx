/**
 * Animation Error Boundary Component
 * Graceful fallbacks for animation failures with comprehensive error handling
 */

'use client'

import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import type { AnimationError, AnimationFallback, FallbackConfig } from '@/types/animations'

interface AnimationErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  fallbackType: 'css' | 'static' | 'simplified' | null
  retryCount: number
}

interface AnimationErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AnimationError) => void
  maxRetries?: number
  enableRetry?: boolean
  fallbackStrategy?: 'css' | 'static' | 'simplified' | 'auto'
  componentName?: string
  animationId?: string
}

export class AnimationErrorBoundary extends Component<
  AnimationErrorBoundaryProps,
  AnimationErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: AnimationErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fallbackType: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AnimationErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    })

    const animationError: AnimationError = {
      id: this.props.animationId || `error-${Date.now()}`,
      type: this.categorizeError(error),
      message: error.message,
      component: this.props.componentName || 'Unknown',
      timestamp: new Date(),
      severity: this.determineSeverity(error),
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'AnimationErrorBoundary',
        retryCount: this.state.retryCount,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      }
    }

    // Report error to monitoring service
    this.reportError(animationError)

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(animationError)
    }

    // Determine fallback strategy
    const fallbackType = this.determineFallbackStrategy(error)
    this.setState({ fallbackType })

    // Auto-retry if enabled and within limits
    if (this.props.enableRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRetry()
    }
  }

  override componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private categorizeError(error: Error): AnimationError['type'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('webgl') || message.includes('canvas')) {
      return 'compatibility'
    }
    if (message.includes('memory') || message.includes('heap')) {
      return 'resource'
    }
    if (message.includes('timeout') || message.includes('slow')) {
      return 'timeout'
    }
    if (message.includes('fps') || message.includes('frame')) {
      return 'performance'
    }
    
    return 'compatibility'
  }

  private determineSeverity(error: Error): AnimationError['severity'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical'
    }
    if (message.includes('memory') || message.includes('crash')) {
      return 'high'
    }
    if (message.includes('performance') || message.includes('slow')) {
      return 'medium'
    }
    
    return 'low'
  }

  private determineFallbackStrategy(error: Error): 'css' | 'static' | 'simplified' {
    if (this.props.fallbackStrategy && this.props.fallbackStrategy !== 'auto') {
      return this.props.fallbackStrategy
    }

    const message = error.message.toLowerCase()
    
    // WebGL or complex animation errors -> static fallback
    if (message.includes('webgl') || message.includes('three') || message.includes('canvas')) {
      return 'static'
    }
    
    // Performance issues -> simplified animations
    if (message.includes('performance') || message.includes('fps') || message.includes('slow')) {
      return 'simplified'
    }
    
    // Default to CSS fallback
    return 'css'
  }

  private reportError(error: AnimationError) {
    // Report to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🎭 Animation Error Boundary')
      console.error('Animation Error:', error)
      console.error('Original Error:', this.state.error)
      console.error('Error Info:', this.state.errorInfo)
      console.groupEnd()
    }

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // This would integrate with your error reporting service (Sentry, etc.)
      try {
            if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
            description: error.message,
            fatal: error.severity === 'critical',
            custom_map: {
              animation_id: error.id,
              component: error.component,
              error_type: error.type
            }
          })
        }
      } catch (reportingError) {
        console.warn('Failed to report animation error:', reportingError)
      }
    }
  }

  private scheduleRetry() {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000) // Exponential backoff
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        fallbackType: null,
        retryCount: prevState.retryCount + 1
      }))
    }, delay)
  }

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      fallbackType: null,
      retryCount: 0
    })
  }

  private renderFallback(): ReactNode {
    const { fallback } = this.props
    const { fallbackType } = this.state

    // Custom fallback provided
    if (fallback) {
      return fallback
    }

    // Default fallbacks based on strategy
    switch (fallbackType) {
      case 'static':
        return <StaticFallback onRetry={this.handleManualRetry} />
      case 'simplified':
        return <SimplifiedFallback onRetry={this.handleManualRetry} />
      case 'css':
      default:
        return <CSSFallback onRetry={this.handleManualRetry} />
    }
  }

  override render() {
    if (this.state.hasError) {
      return this.renderFallback()
    }

    return this.props.children
  }
}

/**
 * CSS-only fallback component
 */
interface FallbackProps {
  error: Error | null
  onRetry: () => void
}

function CSSFallback({ onRetry }: Omit<FallbackProps, 'error'>) {
  return (
    <div className="animation-fallback css-fallback">
      <div className="fallback-content">
        <div className="fallback-animation">
          {/* Simple CSS animation as fallback */}
          <div className="css-pulse"></div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="fallback-debug">
            <p className="text-sm text-gray-600">Animation Error (CSS Fallback)</p>
            <button 
              onClick={onRetry}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Retry Animation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Static fallback component
 */
function StaticFallback({ onRetry }: Omit<FallbackProps, 'error'>) {
  return (
    <div className="animation-fallback static-fallback">
      <div className="fallback-content">
        <div className="static-placeholder">
          {/* Static visual representation */}
          <div className="static-gradient"></div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="fallback-debug">
            <p className="text-sm text-gray-600">Animation Error (Static Fallback)</p>
            <button 
              onClick={onRetry}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Retry Animation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Simplified animation fallback component
 */
function SimplifiedFallback({ onRetry }: Omit<FallbackProps, 'error'>) {
  return (
    <div className="animation-fallback simplified-fallback">
      <div className="fallback-content">
        <div className="simplified-animation">
          {/* Simplified animation with reduced complexity */}
          <div className="simple-fade-in"></div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="fallback-debug">
            <p className="text-sm text-gray-600">Animation Error (Simplified Fallback)</p>
            <button 
              onClick={onRetry}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Retry Animation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Hook for using animation error boundary context
 */
export function useAnimationErrorHandler() {
  const reportError = (error: AnimationError) => {
    // This would integrate with your global error handling system
    console.error('Animation Error:', error)
  }

  const createFallback = (config: FallbackConfig): AnimationFallback => {
    return {
      type: 'css',
      config,
      reason: 'Error boundary triggered'
    }
  }

  return {
    reportError,
    createFallback
  }
}

/**
 * Higher-order component for wrapping components with animation error boundary
 */
export function withAnimationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<AnimationErrorBoundaryProps>
) {
  return function WrappedComponent(props: P) {
    return (
      <AnimationErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </AnimationErrorBoundary>
    )
  }
}

/**
 * Animation error reporter utility
 */
export class AnimationErrorReporter {
  private static instance: AnimationErrorReporter
  private errors: AnimationError[] = []
  private maxErrors = 100

  static getInstance(): AnimationErrorReporter {
    if (!AnimationErrorReporter.instance) {
      AnimationErrorReporter.instance = new AnimationErrorReporter()
    }
    return AnimationErrorReporter.instance
  }

  report(error: AnimationError) {
    this.errors.push(error)
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Send to monitoring service
    this.sendToMonitoring(error)
  }

  getErrors(): AnimationError[] {
    return [...this.errors]
  }

  getErrorsByType(type: AnimationError['type']): AnimationError[] {
    return this.errors.filter(error => error.type === type)
  }

  getErrorsByComponent(component: string): AnimationError[] {
    return this.errors.filter(error => error.component === component)
  }

  clearErrors() {
    this.errors = []
  }

  private sendToMonitoring(error: AnimationError) {
    // Implementation would depend on your monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, DataDog, etc.
      try {
        fetch('/api/errors/animation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(error)
        }).catch(err => {
          console.warn('Failed to send error to monitoring service:', err)
        })
      } catch (err) {
        console.warn('Error reporting failed:', err)
      }
    }
  }
}

// Global error reporter instance
export const animationErrorReporter = AnimationErrorReporter.getInstance()