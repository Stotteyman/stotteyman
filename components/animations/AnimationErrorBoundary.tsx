'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  fallbackMode: 'css' | 'static' | 'simplified'
  retryCount: number
  errorId: string
}

export class AnimationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      fallbackMode: 'css',
      retryCount: 0,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Determine fallback mode based on error type
    let fallbackMode: 'css' | 'static' | 'simplified' = 'css'
    
    if (error.message.includes('WebGL') || error.message.includes('canvas')) {
      fallbackMode = 'css'
    } else if (error.message.includes('GSAP') || error.message.includes('framer-motion') || error.message.includes('animation')) {
      fallbackMode = 'simplified'
    } else if (error.message.includes('three') || error.message.includes('particle')) {
      fallbackMode = 'static'
    } else {
      fallbackMode = 'css'
    }

    const errorId = `anim_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      fallbackMode,
      errorId
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Animation error caught by boundary:', error, errorInfo)
    
    // Report error to monitoring service
    this.reportError(error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Apply fallback animations
    this.applyFallback()
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      errorId: this.state.errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      fallbackMode: this.state.fallbackMode,
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      deviceInfo: {
        webGL: !!document.createElement('canvas').getContext('webgl'),
        devicePixelRatio: window.devicePixelRatio,
        screenSize: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Animation Error Boundary')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Error Data:', errorData)
      console.groupEnd()
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'animation_error_boundary',
            data: errorData
          })
        }).catch(() => {
          // Silently fail - don't let error reporting break the app
        })
      } catch {
        // Silently fail
      }
    }

    // Store error in localStorage for debugging
    try {
      const storedErrors = JSON.parse(localStorage.getItem('animation_errors') || '[]')
      storedErrors.push(errorData)
      // Keep only last 10 errors
      if (storedErrors.length > 10) {
        storedErrors.shift()
      }
      localStorage.setItem('animation_errors', JSON.stringify(storedErrors))
    } catch {
      // Silently fail
    }
  }

  private applyFallback() {
    if (typeof window === 'undefined') return

    const { fallbackMode } = this.state

    switch (fallbackMode) {
      case 'css':
        this.applyCSSFallback()
        break
      case 'simplified':
        this.applySimplifiedFallback()
        break
      case 'static':
        this.applyStaticFallback()
        break
    }
  }

  private applyCSSFallback() {
    // Add CSS-only animations as fallback
    const style = document.createElement('style')
    style.textContent = `
      .animation-fallback {
        transition: all 0.3s ease-out !important;
      }
      
      .animation-fallback.fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      
      .animation-fallback.slide-in {
        transform: translateX(0) !important;
      }
      
      .animation-fallback:hover {
        transform: scale(1.05) !important;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .animation-fallback {
          transition: none !important;
          transform: none !important;
        }
      }
    `
    document.head.appendChild(style)

    // Apply fallback classes to animated elements
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="motion"]')
    animatedElements.forEach(element => {
      element.classList.add('animation-fallback', 'fade-in')
    })
  }

  private applySimplifiedFallback() {
    // Use basic CSS transitions instead of complex animations
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="motion"]')
    animatedElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
        element.style.opacity = '1'
        element.style.transform = 'translateY(0) scale(1)'
      }
    })
  }

  private applyStaticFallback() {
    // Remove all animations and show static content
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="motion"]')
    animatedElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.transition = 'none'
        element.style.animation = 'none'
        element.style.opacity = '1'
        element.style.transform = 'none'
      }
    })
  }

  private handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  private handleReportIssue = () => {
    const errorData = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      fallbackMode: this.state.fallbackMode,
      retryCount: this.state.retryCount
    }
    
    // Open issue reporting (could be a modal, external link, etc.)
    console.log('Report issue:', errorData)
    
    // You could integrate with your issue tracking system here
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('report-animation-issue', {
        detail: errorData
      }))
    }
  }

  override render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return (
          <div className="animation-error-wrapper">
            {this.props.fallback}
            {process.env.NODE_ENV === 'development' && (
              <div className="error-debug-info">
                <details>
                  <summary>Animation Error Debug Info</summary>
                  <pre>{JSON.stringify({
                    error: this.state.error?.message,
                    fallbackMode: this.state.fallbackMode,
                    retryCount: this.state.retryCount,
                    errorId: this.state.errorId
                  }, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>
        )
      }

      // Default fallback with retry option
      return (
        <div className="animation-error-fallback">
          {this.state.fallbackMode === 'static' ? (
            <div className="static-content">
              {this.props.children}
            </div>
          ) : (
            <div className={`fallback-${this.state.fallbackMode}`}>
              {this.props.children}
            </div>
          )}
          
          {/* Error recovery UI */}
          {process.env.NODE_ENV === 'development' && (
            <div className="error-recovery-ui" style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: '#ff6b6b',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div>Animation Error ({this.state.fallbackMode} fallback)</div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                {this.state.retryCount < 3 && (
                  <button
                    onClick={this.handleRetry}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Retry ({3 - this.state.retryCount} left)
                  </button>
                )}
                <button
                  onClick={this.handleReportIssue}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Report
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with animation error boundary
export function withAnimationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <AnimationErrorBoundary fallback={fallback}>
        <Component {...props} />
      </AnimationErrorBoundary>
    )
  }
}

// Hook for handling animation errors in functional components
export function useAnimationErrorHandler() {
  const handleError = (error: Error) => {
    console.error('Animation error:', error)
    
    // Emit custom event for global error handling
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('animation-error', {
        detail: { error }
      }))
    }
  }

  const createSafeAnimation = async (animationFn: () => Promise<any>) => {
    try {
      return await animationFn()
    } catch (error) {
      handleError(error as Error)
      return null
    }
  }

  return {
    handleError,
    createSafeAnimation
  }
}