/**
 * Animation Recovery System - Intelligent error recovery and fallback management
 */

import { AnimationError } from './AnimationErrorHandler'
import { AnimationErrorReporter, RecoveryAttempt } from './AnimationErrorReporter'
import { FallbackAnimationSystem } from './FallbackAnimationSystem'

export interface RecoveryStrategy {
  name: string
  priority: number
  condition: (error: AnimationError) => boolean
  execute: (error: AnimationError) => Promise<boolean>
  rollback?: () => Promise<void>
  maxAttempts: number
  cooldown: number // milliseconds
}

export interface RecoveryState {
  strategy: string
  attempts: number
  lastAttempt: number
  success: boolean
  active: boolean
}

export class AnimationRecoverySystem {
  private static instance: AnimationRecoverySystem
  private strategies: Map<string, RecoveryStrategy> = new Map()
  private recoveryStates: Map<string, RecoveryState> = new Map()
  private errorReporter: AnimationErrorReporter
  private fallbackSystem: FallbackAnimationSystem
  private isRecovering = false
  private recoveryQueue: AnimationError[] = []

  private constructor() {
    this.errorReporter = AnimationErrorReporter.getInstance()
    this.fallbackSystem = FallbackAnimationSystem.getInstance()
    this.initializeStrategies()
  }

  static getInstance(): AnimationRecoverySystem {
    if (!AnimationRecoverySystem.instance) {
      AnimationRecoverySystem.instance = new AnimationRecoverySystem()
    }
    return AnimationRecoverySystem.instance
  }

  private initializeStrategies(): void {
    // Strategy 1: WebGL Context Recovery
    this.registerStrategy({
      name: 'webgl-recovery',
      priority: 10,
      condition: (error) => error.type === 'webgl',
      execute: async (error) => {
        try {
          // Attempt to restore WebGL context
          const canvas = document.createElement('canvas')
          const gl = canvas.getContext('webgl', { antialias: false })
          
          if (gl) {
            // WebGL is available, switch to canvas fallback temporarily
            document.documentElement.classList.add('webgl-recovery-mode')
            
            // Notify components to reinitialize with canvas
            window.dispatchEvent(new CustomEvent('webgl-recovery', {
              detail: { useCanvas: true }
            }))
            
            return true
          }
          
          return false
        } catch {
          return false
        }
      },
      rollback: async () => {
        document.documentElement.classList.remove('webgl-recovery-mode')
      },
      maxAttempts: 2,
      cooldown: 5000
    })

    // Strategy 2: Memory Pressure Relief
    this.registerStrategy({
      name: 'memory-relief',
      priority: 9,
      condition: (error) => error.type === 'memory',
      execute: async (error) => {
        try {
          // Clear animation caches
          this.clearAnimationCaches()
          
          // Reduce quality
          window.dispatchEvent(new CustomEvent('quality-change', {
            detail: { quality: 'low', reason: 'memory-pressure' }
          }))
          
          // Pause non-essential animations
          this.pauseNonEssentialAnimations()
          
          // Force garbage collection if available
          if ('gc' in window && typeof (window as any).gc === 'function') {
            (window as any).gc()
          }
          
          return true
        } catch {
          return false
        }
      },
      maxAttempts: 1,
      cooldown: 30000
    })

    // Strategy 3: Library Reload
    this.registerStrategy({
      name: 'library-reload',
      priority: 8,
      condition: (error) => error.type === 'load',
      execute: async (error) => {
        try {
          // Attempt to reload failed animation library
          const libraryName = this.extractLibraryName(error.message)
          if (libraryName) {
            await this.reloadAnimationLibrary(libraryName)
            return true
          }
          return false
        } catch {
          return false
        }
      },
      maxAttempts: 3,
      cooldown: 2000
    })

    // Strategy 4: Performance Degradation
    this.registerStrategy({
      name: 'performance-degradation',
      priority: 7,
      condition: (error) => error.type === 'performance',
      execute: async (error) => {
        try {
          // Reduce animation complexity
          document.documentElement.classList.add('performance-degraded')
          
          // Disable heavy animations
          this.disableHeavyAnimations()
          
          // Reduce frame rate target
          window.dispatchEvent(new CustomEvent('reduce-frame-rate', {
            detail: { targetFPS: 30 }
          }))
          
          return true
        } catch {
          return false
        }
      },
      rollback: async () => {
        document.documentElement.classList.remove('performance-degraded')
      },
      maxAttempts: 1,
      cooldown: 10000
    })

    // Strategy 5: CSS Fallback Mode
    this.registerStrategy({
      name: 'css-fallback',
      priority: 6,
      condition: (error) => true, // Universal fallback
      execute: async (error) => {
        try {
          // Enable CSS-only animations
          document.documentElement.classList.add('css-fallback-mode')
          
          // Apply fallback animations to all animated elements
          const animatedElements = document.querySelectorAll('[class*="animate"], [data-animate]')
          animatedElements.forEach(element => {
            this.applyFallbackAnimation(element, error)
          })
          
          return true
        } catch {
          return false
        }
      },
      maxAttempts: 1,
      cooldown: 0
    })

    // Strategy 6: Component Restart
    this.registerStrategy({
      name: 'component-restart',
      priority: 5,
      condition: (error) => error.component !== 'unknown',
      execute: async (error) => {
        try {
          // Attempt to restart the specific component
          window.dispatchEvent(new CustomEvent('restart-animation-component', {
            detail: { component: error.component, errorId: error.id }
          }))
          
          // Wait for component to restart
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          return true
        } catch {
          return false
        }
      },
      maxAttempts: 2,
      cooldown: 3000
    })

    // Strategy 7: Static Mode
    this.registerStrategy({
      name: 'static-mode',
      priority: 1,
      condition: (error) => true, // Last resort
      execute: async (error) => {
        try {
          // Disable all animations
          document.documentElement.classList.add('static-mode')
          
          // Remove all animation classes and styles
          const allElements = document.querySelectorAll('*')
          allElements.forEach(element => {
            if (element instanceof HTMLElement) {
              element.style.animation = 'none'
              element.style.transition = 'none'
              element.style.transform = 'none'
              element.style.opacity = '1'
            }
          })
          
          return true
        } catch {
          return false
        }
      },
      maxAttempts: 1,
      cooldown: 0
    })
  }

  private clearAnimationCaches(): void {
    // Clear various animation-related caches
    if (typeof window !== 'undefined') {
      // Clear GSAP cache if available
      if ((window as any).gsap && (window as any).gsap.killTweensOf) {
        (window as any).gsap.killTweensOf('*')
      }
      
      // Clear Three.js cache if available
      if ((window as any).THREE && (window as any).THREE.Cache) {
        (window as any).THREE.Cache.clear()
      }
      
      // Dispatch cache clear event
      window.dispatchEvent(new CustomEvent('clear-animation-caches'))
    }
  }

  private pauseNonEssentialAnimations(): void {
    const nonEssentialSelectors = [
      '.particle-system',
      '.morphing-background',
      '.decorative-animation',
      '[data-animation-type="decorative"]'
    ]
    
    nonEssentialSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.animationPlayState = 'paused'
          element.classList.add('animation-paused')
        }
      })
    })
  }

  private extractLibraryName(errorMessage: string): string | null {
    const libraryPatterns = [
      /gsap/i,
      /framer-motion/i,
      /three/i,
      /lottie/i,
      /anime/i
    ]
    
    for (const pattern of libraryPatterns) {
      if (pattern.test(errorMessage)) {
        return pattern.source.replace(/[^a-zA-Z]/g, '')
      }
    }
    
    return null
  }

  private async reloadAnimationLibrary(libraryName: string): Promise<void> {
    // This would attempt to reload the specific library
    // Implementation depends on your module loading strategy
    console.log(`Attempting to reload library: ${libraryName}`)
    
    // Dispatch reload event
    window.dispatchEvent(new CustomEvent('reload-animation-library', {
      detail: { library: libraryName }
    }))
  }

  private disableHeavyAnimations(): void {
    const heavyAnimationSelectors = [
      '.particle-system',
      '.webgl-animation',
      '[data-animation-complexity="high"]',
      '.morphing-background'
    ]
    
    heavyAnimationSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        element.classList.add('animation-disabled')
        if (element instanceof HTMLElement) {
          element.style.display = 'none'
        }
      })
    })
  }

  private applyFallbackAnimation(element: Element, error: AnimationError): void {
    // Determine appropriate fallback based on element and error
    const classList = Array.from(element.classList)
    
    if (classList.some(cls => cls.includes('fade'))) {
      this.fallbackSystem.fadeIn(element, 0.3)
    } else if (classList.some(cls => cls.includes('slide'))) {
      this.fallbackSystem.slideUp(element, 0.4)
    } else if (classList.some(cls => cls.includes('scale'))) {
      this.fallbackSystem.scaleIn(element, 0.3)
    } else {
      // Default fallback
      this.fallbackSystem.fadeIn(element, 0.2)
    }
  }

  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.name, strategy)
  }

  async attemptRecovery(error: AnimationError): Promise<boolean> {
    if (this.isRecovering) {
      this.recoveryQueue.push(error)
      return false
    }

    this.isRecovering = true

    try {
      // Get applicable strategies sorted by priority
      const applicableStrategies = Array.from(this.strategies.values())
        .filter(strategy => strategy.condition(error))
        .sort((a, b) => b.priority - a.priority)

      for (const strategy of applicableStrategies) {
        const state = this.getRecoveryState(strategy.name)
        
        // Check if strategy is on cooldown
        if (Date.now() - state.lastAttempt < strategy.cooldown) {
          continue
        }
        
        // Check if max attempts reached
        if (state.attempts >= strategy.maxAttempts) {
          continue
        }

        // Attempt recovery
        const success = await this.executeStrategy(strategy, error)
        
        // Record attempt
        const attempt: RecoveryAttempt = {
          errorId: error.id,
          strategy: strategy.name,
          success,
          timestamp: Date.now(),
          details: { attempts: state.attempts + 1 }
        }
        
        this.errorReporter.recordRecoveryAttempt(attempt)
        
        // Update state
        this.updateRecoveryState(strategy.name, {
          attempts: state.attempts + 1,
          lastAttempt: Date.now(),
          success,
          active: success
        })

        if (success) {
          console.log(`Recovery successful using strategy: ${strategy.name}`)
          return true
        }
      }

      console.warn('All recovery strategies failed for error:', error)
      return false
    } finally {
      this.isRecovering = false
      
      // Process queued errors
      if (this.recoveryQueue.length > 0) {
        const nextError = this.recoveryQueue.shift()!
        setTimeout(() => this.attemptRecovery(nextError), 100)
      }
    }
  }

  private async executeStrategy(strategy: RecoveryStrategy, error: AnimationError): Promise<boolean> {
    try {
      console.log(`Attempting recovery strategy: ${strategy.name}`)
      return await strategy.execute(error)
    } catch (executeError) {
      console.error(`Recovery strategy ${strategy.name} failed:`, executeError)
      return false
    }
  }

  private getRecoveryState(strategyName: string): RecoveryState {
    if (!this.recoveryStates.has(strategyName)) {
      this.recoveryStates.set(strategyName, {
        strategy: strategyName,
        attempts: 0,
        lastAttempt: 0,
        success: false,
        active: false
      })
    }
    return this.recoveryStates.get(strategyName)!
  }

  private updateRecoveryState(strategyName: string, updates: Partial<RecoveryState>): void {
    const state = this.getRecoveryState(strategyName)
    Object.assign(state, updates)
  }

  async rollbackStrategy(strategyName: string): Promise<boolean> {
    const strategy = this.strategies.get(strategyName)
    if (!strategy || !strategy.rollback) {
      return false
    }

    try {
      await strategy.rollback()
      this.updateRecoveryState(strategyName, { active: false })
      return true
    } catch (error) {
      console.error(`Failed to rollback strategy ${strategyName}:`, error)
      return false
    }
  }

  getRecoveryStatistics(): {
    strategies: Array<{
      name: string
      attempts: number
      successes: number
      successRate: number
      active: boolean
    }>
    totalAttempts: number
    totalSuccesses: number
    overallSuccessRate: number
  } {
    const strategies = Array.from(this.recoveryStates.values()).map(state => {
      const successes = state.success ? 1 : 0
      return {
        name: state.strategy,
        attempts: state.attempts,
        successes,
        successRate: state.attempts > 0 ? successes / state.attempts : 0,
        active: state.active
      }
    })

    const totalAttempts = strategies.reduce((sum, s) => sum + s.attempts, 0)
    const totalSuccesses = strategies.reduce((sum, s) => sum + s.successes, 0)

    return {
      strategies,
      totalAttempts,
      totalSuccesses,
      overallSuccessRate: totalAttempts > 0 ? totalSuccesses / totalAttempts : 0
    }
  }

  resetRecoveryStates(): void {
    this.recoveryStates.clear()
  }

  // Health check - verify system is functioning
  async performHealthCheck(): Promise<{
    healthy: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check WebGL availability
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) {
      issues.push('WebGL not available')
      recommendations.push('Use Canvas API fallback for graphics')
    }

    // Check memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
      if (memoryUsage > 0.8) {
        issues.push('High memory usage detected')
        recommendations.push('Clear animation caches and reduce quality')
      }
    }

    // Check for active recovery strategies
    const activeStrategies = Array.from(this.recoveryStates.values())
      .filter(state => state.active)
    
    if (activeStrategies.length > 0) {
      issues.push(`${activeStrategies.length} recovery strategies currently active`)
      recommendations.push('Monitor system stability and consider rollback if issues persist')
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations
    }
  }
}