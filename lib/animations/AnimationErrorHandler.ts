/**
 * Global animation error handling system
 */

export interface AnimationError {
  id: string
  type: 'load' | 'runtime' | 'performance' | 'webgl' | 'memory'
  message: string
  component: string
  timestamp: number
  stack?: string
  context?: Record<string, any>
}

export class AnimationErrorHandler {
  private static instance: AnimationErrorHandler
  private errors: AnimationError[] = []
  private errorCallbacks: ((error: AnimationError) => void)[] = []
  private maxErrors = 50

  private constructor() {
    this.setupGlobalErrorHandling()
  }

  static getInstance(): AnimationErrorHandler {
    if (!AnimationErrorHandler.instance) {
      AnimationErrorHandler.instance = new AnimationErrorHandler()
    }
    return AnimationErrorHandler.instance
  }

  private setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return

    // Handle unhandled promise rejections from animation libraries
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isAnimationError(event.reason)) {
        const error = this.createAnimationError({
          type: 'runtime',
          message: event.reason.message || 'Unhandled animation promise rejection',
          component: 'unknown',
          stack: event.reason.stack,
          context: { source: 'unhandledrejection' }
        })
        this.handleError(error)
        event.preventDefault() // Prevent console error
      }
    })

    // Handle WebGL context lost errors
    window.addEventListener('webglcontextlost', (event) => {
      const error = this.createAnimationError({
        type: 'webgl',
        message: 'WebGL context lost',
        component: 'webgl',
        context: { event: event.type }
      })
      this.handleError(error)
    })

    // Handle animation-specific custom events
    window.addEventListener('animation-error', ((event: CustomEvent) => {
      const { error, component } = event.detail
      const animError = this.createAnimationError({
        type: 'runtime',
        message: error.message,
        component: component || 'unknown',
        stack: error.stack,
        context: { source: 'custom-event' }
      })
      this.handleError(animError)
    }) as EventListener)

    // Monitor memory usage for animation-related memory leaks
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          const error = this.createAnimationError({
            type: 'memory',
            message: 'High memory usage detected - possible animation memory leak',
            component: 'memory-monitor',
            context: {
              usedHeapSize: memory.usedJSHeapSize,
              heapSizeLimit: memory.jsHeapSizeLimit,
              percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
            }
          })
          this.handleError(error)
        }
      }, 30000) // Check every 30 seconds
    }
  }

  private isAnimationError(error: any): boolean {
    if (!error || typeof error !== 'object') return false
    
    const message = error.message || ''
    const stack = error.stack || ''
    
    const animationKeywords = [
      'gsap', 'framer-motion', 'three', 'webgl', 'canvas',
      'animation', 'transition', 'transform', 'particle',
      'scroll-trigger', 'lottie', 'morphing'
    ]
    
    return animationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || 
      stack.toLowerCase().includes(keyword)
    )
  }

  private createAnimationError(params: Omit<AnimationError, 'id' | 'timestamp'>): AnimationError {
    return {
      id: `anim_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...params
    }
  }

  handleError(error: AnimationError): void {
    // Add to error collection
    this.errors.push(error)
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log error
    console.error(`Animation Error [${error.type}]:`, error.message, error)

    // Notify callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error)
      } catch (callbackError) {
        console.error('Error in animation error callback:', callbackError)
      }
    })

    // Report to analytics
    this.reportError(error)

    // Take recovery action based on error type
    this.attemptRecovery(error)
  }

  private reportError(error: AnimationError): void {
    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'animation_error',
            data: error
          })
        }).catch(() => {
          // Silently fail
        })
      } catch {
        // Silently fail
      }
    }
  }

  private attemptRecovery(error: AnimationError): void {
    switch (error.type) {
      case 'webgl':
        this.recoverFromWebGLError()
        break
      case 'memory':
        this.recoverFromMemoryError()
        break
      case 'performance':
        this.recoverFromPerformanceError()
        break
      case 'load':
        this.recoverFromLoadError()
        break
      default:
        this.recoverFromGenericError()
    }
  }

  private recoverFromWebGLError(): void {
    // Disable WebGL-based animations
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('disable-webgl-animations'))
      
      // Force canvas-based fallbacks
      document.documentElement.classList.add('no-webgl')
    }
  }

  private recoverFromMemoryError(): void {
    // Reduce animation quality
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('quality-change', {
        detail: { quality: 'low', reason: 'memory-pressure' }
      }))
    }
  }

  private recoverFromPerformanceError(): void {
    // Pause non-essential animations
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pause-decorative-animations'))
    }
  }

  private recoverFromLoadError(): void {
    // Enable CSS fallback mode
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('animation-fallback-mode')
    }
  }

  private recoverFromGenericError(): void {
    // Enable reduced motion mode temporarily
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('temporary-reduced-motion', {
        detail: { duration: 10000 } // 10 seconds
      }))
    }
  }

  onError(callback: (error: AnimationError) => void): () => void {
    this.errorCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index > -1) {
        this.errorCallbacks.splice(index, 1)
      }
    }
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

  clearErrors(): void {
    this.errors = []
  }

  getErrorStats(): {
    total: number
    byType: Record<string, number>
    byComponent: Record<string, number>
    recent: number
  } {
    const now = Date.now()
    const recentThreshold = now - (5 * 60 * 1000) // Last 5 minutes
    
    const byType: Record<string, number> = {}
    const byComponent: Record<string, number> = {}
    let recent = 0

    this.errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1
      byComponent[error.component] = (byComponent[error.component] || 0) + 1
      
      if (error.timestamp > recentThreshold) {
        recent++
      }
    })

    return {
      total: this.errors.length,
      byType,
      byComponent,
      recent
    }
  }
}

// Export singleton instance
export const animationErrorHandler = AnimationErrorHandler.getInstance()