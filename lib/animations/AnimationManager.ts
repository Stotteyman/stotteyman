/**
 * Animation Manager for coordinating different animation layers
 * Supports CSS, Framer Motion, GSAP, and WebGL animations
 */

import { AnimationConfig, AnimationQuality, PerformanceMetrics, DeviceCapabilities } from '@/types/animations'

export class AnimationManager {
  private animations = new Map<string, AnimationConfig>()
  private activeAnimations = new Set<string>()
  private quality: AnimationQuality = 'auto'
  private performanceMonitor: PerformanceMonitor
  private adaptiveQuality: AdaptiveQuality
  private reducedMotion = false
  private initialized = false

  constructor() {
    this.performanceMonitor = new PerformanceMonitor()
    this.adaptiveQuality = new AdaptiveQuality()
    this.init()
  }

  private async init(): Promise<void> {
    if (this.initialized) return

    // Check for reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Listen for reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches
      this.handleReducedMotionChange()
    })

    // Initialize performance monitoring
    await this.performanceMonitor.init()
    
    // Initialize adaptive quality system
    await this.adaptiveQuality.init()
    
    // Set initial quality based on device capabilities
    this.quality = this.adaptiveQuality.getRecommendedQuality()

    // Start performance monitoring
    this.performanceMonitor.startMonitoring((metrics) => {
      this.handlePerformanceUpdate(metrics)
    })

    this.initialized = true
  }

  /**
   * Register an animation configuration
   */
  register(config: AnimationConfig): void {
    if (!this.initialized) {
      console.warn('AnimationManager not initialized. Call init() first.')
      return
    }

    // Apply quality settings to animation config
    const optimizedConfig = this.optimizeConfigForQuality(config)
    this.animations.set(config.id, optimizedConfig)
  }

  /**
   * Unregister an animation
   */
  unregister(id: string): void {
    this.animations.delete(id)
    this.activeAnimations.delete(id)
  }

  /**
   * Play an animation
   */
  async play(id: string, target?: HTMLElement): Promise<void> {
    const config = this.animations.get(id)
    if (!config) {
      console.warn(`Animation with id "${id}" not found`)
      return
    }

    // Check if reduced motion is enabled and animation respects it
    if (this.reducedMotion && config.respectsReducedMotion) {
      await this.playReducedMotionFallback(config, target)
      return
    }

    try {
      this.activeAnimations.add(id)
      await this.executeAnimation(config, target)
    } catch (error) {
      console.error(`Error playing animation "${id}":`, error)
      await this.playFallbackAnimation(config, target)
    } finally {
      this.activeAnimations.delete(id)
    }
  }

  /**
   * Pause an animation
   */
  pause(id: string): void {
    // Implementation depends on animation library
    // This would interface with GSAP, Framer Motion, etc.
    console.log(`Pausing animation: ${id}`)
  }

  /**
   * Stop an animation
   */
  stop(id: string): void {
    this.activeAnimations.delete(id)
    // Implementation depends on animation library
    console.log(`Stopping animation: ${id}`)
  }

  /**
   * Set animation quality
   */
  setQuality(quality: AnimationQuality): void {
    this.quality = quality
    this.updateAllAnimationsForQuality()
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics()
  }

  /**
   * Cleanup all animations and resources
   */
  cleanup(): void {
    this.animations.clear()
    this.activeAnimations.clear()
    this.performanceMonitor.cleanup()
    this.adaptiveQuality.cleanup()
  }

  /**
   * Get current animation quality
   */
  getQuality(): AnimationQuality {
    return this.quality
  }

  /**
   * Check if reduced motion is enabled
   */
  isReducedMotion(): boolean {
    return this.reducedMotion
  }

  /**
   * Get active animation count
   */
  getActiveAnimationCount(): number {
    return this.activeAnimations.size
  }

  private optimizeConfigForQuality(config: AnimationConfig): AnimationConfig {
    const optimized = { ...config }

    switch (this.quality) {
      case 'low':
        optimized.duration = Math.min(config.duration, 300)
        optimized.easing = 'ease'
        break
      case 'medium':
        optimized.duration = Math.min(config.duration, 600)
        break
      case 'high':
        // Use original config
        break
      case 'auto':
        // Let adaptive quality system decide
        optimized.quality = this.adaptiveQuality.getRecommendedQuality()
        break
    }

    return optimized
  }

  private async executeAnimation(config: AnimationConfig, target?: HTMLElement): Promise<void> {
    // This would interface with the actual animation libraries
    // For now, we'll simulate the animation execution
    return new Promise((resolve) => {
      setTimeout(resolve, config.duration)
    })
  }

  private async playReducedMotionFallback(config: AnimationConfig, target?: HTMLElement): Promise<void> {
    // Play a simplified version or static alternative
    if (target) {
      target.style.transition = 'none'
      // Apply final state immediately
      config.properties.forEach(prop => {
        if (target.style.hasOwnProperty(prop.property)) {
          (target.style as any)[prop.property] = prop.to + (prop.unit || '')
        }
      })
    }
  }

  private async playFallbackAnimation(config: AnimationConfig, target?: HTMLElement): Promise<void> {
    // Play a CSS-only fallback animation
    if (target) {
      target.style.transition = `all ${config.duration}ms ${config.easing}`
      config.properties.forEach(prop => {
        if (target.style.hasOwnProperty(prop.property)) {
          (target.style as any)[prop.property] = prop.to + (prop.unit || '')
        }
      })
    }
  }

  private handlePerformanceUpdate(metrics: PerformanceMetrics): void {
    // Adjust quality based on performance
    if (metrics.fps < 30 && this.quality === 'high') {
      this.setQuality('medium')
    } else if (metrics.fps < 20 && this.quality === 'medium') {
      this.setQuality('low')
    } else if (metrics.fps > 55 && this.quality === 'low') {
      this.setQuality('medium')
    } else if (metrics.fps > 58 && this.quality === 'medium') {
      this.setQuality('high')
    }
  }

  private handleReducedMotionChange(): void {
    // Pause or modify all active animations
    this.activeAnimations.forEach(id => {
      if (this.reducedMotion) {
        this.pause(id)
      }
    })
  }

  private updateAllAnimationsForQuality(): void {
    // Re-optimize all registered animations for new quality setting
    this.animations.forEach((config, id) => {
      const optimized = this.optimizeConfigForQuality(config)
      this.animations.set(id, optimized)
    })
  }
}

/**
 * Performance Monitor for tracking FPS and memory usage
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    animationCount: 0,
    timestamp: Date.now(),
    quality: 'high'
  }
  private isMonitoring = false
  private frameCount = 0
  private lastTime = 0
  private rafId: number | null = null
  private observers: ((metrics: PerformanceMetrics) => void)[] = []

  async init(): Promise<void> {
    // Initialize performance observers if available
    if ('PerformanceObserver' in window) {
      this.initPerformanceObservers()
    }
  }

  startMonitoring(callback?: (metrics: PerformanceMetrics) => void): void {
    if (callback) {
      this.observers.push(callback)
    }

    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastTime = performance.now()
    this.measurePerformance()
  }

  stopMonitoring(): void {
    this.isMonitoring = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  cleanup(): void {
    this.stopMonitoring()
    this.observers = []
  }

  private measurePerformance = (): void => {
    if (!this.isMonitoring) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime

    this.frameCount++

    // Calculate FPS every second
    if (deltaTime >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime)
      this.frameCount = 0
      this.lastTime = currentTime

      // Update memory usage if available
      if ('memory' in performance) {
        this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize
      }

      this.metrics.timestamp = Date.now()

      // Notify observers
      this.observers.forEach(callback => callback(this.metrics))
    }

    this.rafId = requestAnimationFrame(this.measurePerformance)
  }

  private initPerformanceObservers(): void {
    try {
      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.renderTime = entry.startTime
          }
        })
      })
      paintObserver.observe({ entryTypes: ['paint'] })

      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.duration > 50) {
            // Long task detected, might affect animation performance
            this.metrics.renderTime = Math.max(this.metrics.renderTime, entry.duration)
          }
        })
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Performance observers not fully supported:', error)
    }
  }
}

/**
 * Adaptive Quality system for dynamic animation quality adjustment
 */
export class AdaptiveQuality {
  private capabilities: DeviceCapabilities = {
    supportsWebGL: false,
    supportsIntersectionObserver: false,
    supportsResizeObserver: false,
    devicePixelRatio: 1,
    maxTextureSize: 0,
    preferredFrameRate: 60,
    hardwareConcurrency: 1
  }
  private recommendedQuality: AnimationQuality = 'medium'

  async init(): Promise<void> {
    await this.detectCapabilities()
    this.recommendedQuality = this.calculateRecommendedQuality()
  }

  getRecommendedQuality(): AnimationQuality {
    return this.recommendedQuality
  }

  getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities }
  }

  cleanup(): void {
    // Cleanup any resources
  }

  private async detectCapabilities(): Promise<void> {
    // Detect WebGL support
    this.capabilities.supportsWebGL = this.detectWebGL()
    
    // Detect Intersection Observer support
    this.capabilities.supportsIntersectionObserver = 'IntersectionObserver' in window
    
    // Detect Resize Observer support
    this.capabilities.supportsResizeObserver = 'ResizeObserver' in window
    
    // Get device pixel ratio
    this.capabilities.devicePixelRatio = window.devicePixelRatio || 1
    
    // Get hardware concurrency
    this.capabilities.hardwareConcurrency = navigator.hardwareConcurrency || 1
    
    // Detect device memory if available
    if ('deviceMemory' in navigator) {
      this.capabilities.memoryGB = (navigator as any).deviceMemory
    }
    
    // Detect connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.capabilities.connectionType = connection.effectiveType
    }
  }

  private detectWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (gl) {
        this.capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  private calculateRecommendedQuality(): AnimationQuality {
    let score = 0

    // WebGL support adds significant capability
    if (this.capabilities.supportsWebGL) score += 3

    // High DPI displays can handle more complex animations
    if (this.capabilities.devicePixelRatio >= 2) score += 2

    // More CPU cores help with animation processing
    if (this.capabilities.hardwareConcurrency >= 4) score += 2
    else if (this.capabilities.hardwareConcurrency >= 2) score += 1

    // Device memory affects what we can do
    if (this.capabilities.memoryGB && this.capabilities.memoryGB >= 4) score += 2
    else if (this.capabilities.memoryGB && this.capabilities.memoryGB >= 2) score += 1

    // Connection speed affects loading of animation assets
    if (this.capabilities.connectionType === '4g') score += 1

    // Modern API support
    if (this.capabilities.supportsIntersectionObserver) score += 1
    if (this.capabilities.supportsResizeObserver) score += 1

    // Determine quality based on score
    if (score >= 8) return 'high'
    if (score >= 5) return 'medium'
    return 'low'
  }
}

// Singleton instance
export const animationManager = new AnimationManager()