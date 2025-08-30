/**
 * Animation Manager for coordinating different animation layers
 * Supports CSS, Framer Motion, GSAP, and WebGL animations
 */

import type { AnimationConfig, AnimationQuality, AnimationPerformanceMetrics } from '@/types/animations'
import { PerformanceMonitor } from './PerformanceMonitor'
import { AdaptiveQuality } from './AdaptiveQuality'

export class AnimationManager {
  private animations = new Map<string, AnimationConfig>()
  private activeAnimations = new Set<string>()
  private quality: AnimationQuality = 'auto'
  private performanceMonitor: PerformanceMonitor | null = null
  private adaptiveQuality: AdaptiveQuality | null = null
  private reducedMotion = false
  private initialized = false
  private static instance: AnimationManager | null = null

  constructor() {
    // Don't initialize anything in constructor to avoid SSR issues
  }

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager()
    }
    return AnimationManager.instance
  }

  private async init(): Promise<void> {
    if (this.initialized) return

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Server-side rendering - set default values
      this.reducedMotion = false
      this.quality = 'medium'
      this.initialized = true
      return
    }

    // Initialize dependencies only when needed
    if (!this.performanceMonitor) {
      this.performanceMonitor = new PerformanceMonitor()
    }
    if (!this.adaptiveQuality) {
      this.adaptiveQuality = AdaptiveQuality.getInstance()
    }

    // Check for reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Listen for reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches
      this.handleReducedMotionChange()
    })

    // Set initial quality based on device capabilities
    this.quality = this.adaptiveQuality.getRecommendedQuality()

    // Start performance monitoring
    this.performanceMonitor.startMonitoring()
    
    // Set up performance monitoring interval
    this.setupPerformanceMonitoring()

    this.initialized = true
  }

  /**
   * Register an animation configuration
   */
  async register(config: AnimationConfig): Promise<void> {
    await this.ensureInitialized()
    
    // Apply quality settings to animation config
    const optimizedConfig = this.optimizeConfigForQuality(config)
    this.animations.set(config.id, optimizedConfig)
  }

  /**
   * Unregister an animation
   */
  async unregister(id: string): Promise<void> {
    await this.ensureInitialized()
    
    this.animations.delete(id)
    this.activeAnimations.delete(id)
  }

  /**
   * Play an animation
   */
  async play(id: string, target?: HTMLElement): Promise<void> {
    await this.ensureInitialized()
    
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
  async pause(id: string): Promise<void> {
    await this.ensureInitialized()
    
    // Implementation depends on animation library
    // This would interface with GSAP, Framer Motion, etc.
    console.log(`Pausing animation: ${id}`)
  }

  /**
   * Stop an animation
   */
  async stop(id: string): Promise<void> {
    await this.ensureInitialized()
    
    this.activeAnimations.delete(id)
    // Implementation depends on animation library
    console.log(`Stopping animation: ${id}`)
  }

  /**
   * Set animation quality
   */
  async setQuality(quality: AnimationQuality): Promise<void> {
    await this.ensureInitialized()
    
    this.quality = quality
    this.updateAllAnimationsForQuality()
  }

  /**
   * Get current performance metrics
   */
  async getMetrics(): Promise<AnimationPerformanceMetrics> {
    await this.ensureInitialized()
    
    return this.performanceMonitor!.getMetrics()
  }

  /**
   * Cleanup all animations and resources
   */
  async cleanup(): Promise<void> {
    await this.ensureInitialized()
    
    this.animations.clear()
    this.activeAnimations.clear()
    if (this.performanceMonitor) {
      this.performanceMonitor.stopMonitoring()
    }
  }

  /**
   * Get current animation quality
   */
  async getQuality(): Promise<AnimationQuality> {
    await this.ensureInitialized()
    
    return this.quality
  }

  /**
   * Check if reduced motion is enabled
   */
  async isReducedMotion(): Promise<boolean> {
    await this.ensureInitialized()
    
    return this.reducedMotion
  }

  /**
   * Get active animation count
   */
  async getActiveAnimationCount(): Promise<number> {
    await this.ensureInitialized()
    
    return this.activeAnimations.size
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init()
    }
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
        if (this.adaptiveQuality) {
          optimized.quality = this.adaptiveQuality.getRecommendedQuality()
        }
        break
    }

    return optimized
  }

  private async executeAnimation(config: AnimationConfig, _target?: HTMLElement): Promise<void> {
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

  private handlePerformanceUpdate(metrics: AnimationPerformanceMetrics): void {
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

  private setupPerformanceMonitoring(): void {
    // Check performance every 2 seconds and adjust quality if needed
    setInterval(() => {
      if (this.initialized && this.performanceMonitor) {
        const metrics = this.performanceMonitor.getMetrics()
        this.handlePerformanceUpdate(metrics)
      }
    }, 2000)
  }
}

// Export the getInstance function instead of a singleton instance
export const getAnimationManager = () => AnimationManager.getInstance()
