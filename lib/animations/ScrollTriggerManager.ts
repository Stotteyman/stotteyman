/**
 * ScrollTrigger Manager - Advanced scroll animation management with performance optimization
 */

import { ScrollAnimationConfig } from '@/types/animations'
import { PerformanceMonitor } from './PerformanceMonitor'
import { AdaptiveQuality } from './AdaptiveQuality'

export interface ScrollTriggerInstance {
  id: string
  element: Element
  config: ScrollAnimationConfig
  animation: any
  isActive: boolean
  performance: {
    createdAt: number
    lastTriggered: number
    triggerCount: number
  }
}

export interface ScrollBatch {
  id: string
  triggers: ScrollTriggerInstance[]
  priority: number
  onComplete?: () => void
}

export class ScrollTriggerManager {
  private static instance: ScrollTriggerManager
  private triggers: Map<string, ScrollTriggerInstance> = new Map()
  private batches: Map<string, ScrollBatch> = new Map()
  private performanceMonitor: PerformanceMonitor
  private adaptiveQuality: AdaptiveQuality
  private gsap: any = null
  private ScrollTrigger: any = null
  private isInitialized = false
  private refreshQueue: Set<string> = new Set()
  private refreshTimeout: NodeJS.Timeout | null = null

  private constructor() {
    this.performanceMonitor = new PerformanceMonitor()
    this.adaptiveQuality = AdaptiveQuality.getInstance()
    this.initialize()
  }

  static getInstance(): ScrollTriggerManager {
    if (!ScrollTriggerManager.instance) {
      ScrollTriggerManager.instance = new ScrollTriggerManager()
    }
    return ScrollTriggerManager.instance
  }

  private async initialize(): Promise<void> {
    try {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger')
      ])

      this.gsap = gsap
      this.ScrollTrigger = ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      // Configure ScrollTrigger for performance
      ScrollTrigger.config({
        limitCallbacks: true,
        syncInterval: 16, // 60fps
        autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
      })

      // Set up performance monitoring
      this.setupPerformanceMonitoring()
      this.setupQualityListeners()

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize ScrollTriggerManager:', error)
    }
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return

    // Monitor scroll performance
    let scrollCount = 0
    let lastScrollTime = 0

    const handleScroll = () => {
      const now = performance.now()
      scrollCount++

      // Check scroll frequency
      if (now - lastScrollTime > 1000) {
        const scrollsPerSecond = scrollCount
        scrollCount = 0
        lastScrollTime = now

        // If scrolling too frequently, reduce animation complexity
        if (scrollsPerSecond > 60) {
          this.optimizeForHighFrequencyScrolling()
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  private setupQualityListeners(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('quality-change', ((event: CustomEvent) => {
      const { quality } = event.detail
      this.adjustTriggersForQuality(quality)
    }) as EventListener)

    window.addEventListener('performance-degradation', ((event: CustomEvent) => {
      const { issues } = event.detail
      if (issues.includes('low-fps') || issues.includes('slow-render')) {
        this.reduceAnimationComplexity()
      }
    }) as EventListener)
  }

  private optimizeForHighFrequencyScrolling(): void {
    // Temporarily disable scrub animations
    this.triggers.forEach((trigger) => {
      if (trigger.config.scrub && trigger.animation) {
        trigger.animation.scrollTrigger.disable()
        setTimeout(() => {
          trigger.animation.scrollTrigger.enable()
        }, 1000)
      }
    })
  }

  private adjustTriggersForQuality(quality: 'low' | 'medium' | 'high'): void {
    const settings = this.adaptiveQuality.getCurrentSettings()

    this.triggers.forEach((trigger) => {
      if (!trigger.animation) return

      // Adjust animation properties based on quality
      switch (quality) {
        case 'low':
          trigger.animation.duration(Math.min(trigger.animation.duration(), 0.3))
          if (trigger.animation.scrollTrigger) {
            trigger.animation.scrollTrigger.refresh()
          }
          break

        case 'medium':
          trigger.animation.duration(Math.min(trigger.animation.duration(), 0.6))
          break

        case 'high':
          // No restrictions for high quality
          break
      }
    })

    // Batch refresh for performance
    this.batchRefresh()
  }

  private reduceAnimationComplexity(): void {
    this.triggers.forEach((trigger) => {
      if (trigger.animation && trigger.config.type === 'scroll') {
        // Simplify easing
        trigger.animation.ease('power1.out')
        
        // Reduce stagger
        if (trigger.animation.stagger) {
          trigger.animation.stagger(Math.min(trigger.animation.stagger(), 0.05))
        }
      }
    })
  }

  /**
   * Create a scroll trigger with advanced configuration
   */
  async createTrigger(
    element: Element,
    config: ScrollAnimationConfig,
    options: {
      id?: string
      priority?: number
      batch?: string
      onProgress?: (progress: number) => void
      onToggle?: (isActive: boolean) => void
    } = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const triggerId = options.id || `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const quality = this.adaptiveQuality.getCurrentQuality()
    const settings = this.adaptiveQuality.getCurrentSettings()

    try {
      // Adjust config based on quality
      const adjustedConfig = this.adjustConfigForQuality(config, quality, settings)

      // Create GSAP animation
      const animation = this.createAnimation(element, adjustedConfig)

      // Create trigger instance
      const trigger: ScrollTriggerInstance = {
        id: triggerId,
        element,
        config: adjustedConfig,
        animation,
        isActive: false,
        performance: {
          createdAt: Date.now(),
          lastTriggered: 0,
          triggerCount: 0
        }
      }

      this.triggers.set(triggerId, trigger)

      // Add to batch if specified
      if (options.batch) {
        this.addToBatch(options.batch, trigger, options.priority || 0)
      }

      return triggerId
    } catch (error) {
      console.error('Failed to create scroll trigger:', error)
      throw error
    }
  }

  private adjustConfigForQuality(
    config: ScrollAnimationConfig,
    quality: 'low' | 'medium' | 'high',
    settings: any
  ): ScrollAnimationConfig {
    const adjusted = { ...config }

    // Adjust based on quality settings
    if (quality === 'low') {
      adjusted.scrub = false // Disable scrub for better performance
      if (typeof adjusted.start === 'string' && adjusted.start.includes('%')) {
        adjusted.start = 'top 90%' // Less aggressive triggering
      }
    }

    return adjusted
  }

  private createAnimation(element: Element, config: ScrollAnimationConfig): any {
    if (!this.gsap || !this.ScrollTrigger) {
      throw new Error('GSAP not initialized')
    }

    const fromProps: any = {}
    const toProps: any = {}

    // Build animation properties from config
    config.properties?.forEach((prop) => {
      fromProps[prop.property] = prop.from
      toProps[prop.property] = prop.to
    })

    // Create the animation
    const animation = this.gsap.fromTo(element, fromProps, {
      ...toProps,
      duration: config.duration || 1,
      ease: config.easing || 'power2.out',
      delay: config.delay || 0,
      stagger: config.stagger || 0,
      scrollTrigger: {
        trigger: element,
        start: config.start || 'top 80%',
        end: config.end || 'bottom 20%',
        scrub: config.scrub || false,
        pin: config.pin || false,
        anticipatePin: 1,
        refreshPriority: 0,
        onEnter: () => this.onTriggerEnter(element),
        onLeave: () => this.onTriggerLeave(element),
        onEnterBack: () => this.onTriggerEnterBack(element),
        onLeaveBack: () => this.onTriggerLeaveBack(element),
        onUpdate: (self: any) => this.onTriggerUpdate(element, self),
        onRefresh: () => this.onTriggerRefresh(element)
      }
    })

    return animation
  }

  private onTriggerEnter(element: Element): void {
    const trigger = this.findTriggerByElement(element)
    if (trigger) {
      trigger.isActive = true
      trigger.performance.lastTriggered = Date.now()
      trigger.performance.triggerCount++
    }
  }

  private onTriggerLeave(element: Element): void {
    const trigger = this.findTriggerByElement(element)
    if (trigger) {
      trigger.isActive = false
    }
  }

  private onTriggerEnterBack(element: Element): void {
    const trigger = this.findTriggerByElement(element)
    if (trigger) {
      trigger.isActive = true
      trigger.performance.triggerCount++
    }
  }

  private onTriggerLeaveBack(element: Element): void {
    const trigger = this.findTriggerByElement(element)
    if (trigger) {
      trigger.isActive = false
    }
  }

  private onTriggerUpdate(element: Element, self: any): void {
    // Track performance metrics
    const trigger = this.findTriggerByElement(element)
    if (trigger) {
      trigger.performance.lastTriggered = Date.now()
    }
  }

  private onTriggerRefresh(element: Element): void {
    // Handle refresh events
  }

  private findTriggerByElement(element: Element): ScrollTriggerInstance | undefined {
    for (const trigger of this.triggers.values()) {
      if (trigger.element === element) {
        return trigger
      }
    }
    return undefined
  }

  /**
   * Create a batch of scroll triggers
   */
  createBatch(
    batchId: string,
    elements: Array<{
      element: Element
      config: ScrollAnimationConfig
      priority?: number
    }>,
    options: {
      onComplete?: () => void
      sequential?: boolean
      staggerDelay?: number
    } = {}
  ): Promise<string[]> {
    const triggerIds: string[] = []
    const batch: ScrollBatch = {
      id: batchId,
      triggers: [],
      priority: 0,
      onComplete: options.onComplete
    }

    const promises = elements.map(async ({ element, config, priority = 0 }, index) => {
      const delay = options.sequential ? (options.staggerDelay || 0.1) * index : config.delay || 0
      const adjustedConfig = { ...config, delay }

      const triggerId = await this.createTrigger(element, adjustedConfig, {
        batch: batchId,
        priority
      })

      triggerIds.push(triggerId)
      return triggerId
    })

    this.batches.set(batchId, batch)

    return Promise.all(promises)
  }

  private addToBatch(batchId: string, trigger: ScrollTriggerInstance, priority: number): void {
    let batch = this.batches.get(batchId)
    if (!batch) {
      batch = {
        id: batchId,
        triggers: [],
        priority,
        onComplete: undefined
      }
      this.batches.set(batchId, batch)
    }

    batch.triggers.push(trigger)
    batch.priority = Math.max(batch.priority, priority)
  }

  /**
   * Remove a scroll trigger
   */
  removeTrigger(triggerId: string): boolean {
    const trigger = this.triggers.get(triggerId)
    if (!trigger) return false

    // Kill the animation
    if (trigger.animation) {
      trigger.animation.kill()
    }

    // Remove from triggers
    this.triggers.delete(triggerId)

    // Remove from batches
    for (const batch of this.batches.values()) {
      const index = batch.triggers.findIndex(t => t.id === triggerId)
      if (index !== -1) {
        batch.triggers.splice(index, 1)
        if (batch.triggers.length === 0) {
          this.batches.delete(batch.id)
        }
      }
    }

    return true
  }

  /**
   * Pause all scroll triggers
   */
  pauseAll(): void {
    this.triggers.forEach((trigger) => {
      if (trigger.animation && trigger.animation.scrollTrigger) {
        trigger.animation.scrollTrigger.disable()
      }
    })
  }

  /**
   * Resume all scroll triggers
   */
  resumeAll(): void {
    this.triggers.forEach((trigger) => {
      if (trigger.animation && trigger.animation.scrollTrigger) {
        trigger.animation.scrollTrigger.enable()
      }
    })
  }

  /**
   * Refresh all scroll triggers (batched for performance)
   */
  refresh(triggerId?: string): void {
    if (triggerId) {
      this.refreshQueue.add(triggerId)
    } else {
      this.triggers.forEach((_, id) => this.refreshQueue.add(id))
    }

    this.batchRefresh()
  }

  private batchRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
    }

    this.refreshTimeout = setTimeout(() => {
      if (this.ScrollTrigger) {
        this.ScrollTrigger.batch(Array.from(this.refreshQueue), {
          onEnter: () => {},
          onLeave: () => {},
          onEnterBack: () => {},
          onLeaveBack: () => {}
        })
        this.ScrollTrigger.refresh()
      }
      this.refreshQueue.clear()
    }, 100) // Batch refreshes over 100ms
  }

  /**
   * Get performance statistics
   */
  getStatistics(): {
    totalTriggers: number
    activeTriggers: number
    batches: number
    averagePerformance: {
      triggerCount: number
      lastTriggered: number
    }
  } {
    const activeTriggers = Array.from(this.triggers.values()).filter(t => t.isActive).length
    const totalTriggerCount = Array.from(this.triggers.values())
      .reduce((sum, t) => sum + t.performance.triggerCount, 0)
    const avgTriggerCount = this.triggers.size > 0 ? totalTriggerCount / this.triggers.size : 0

    const lastTriggered = Math.max(
      ...Array.from(this.triggers.values()).map(t => t.performance.lastTriggered)
    )

    return {
      totalTriggers: this.triggers.size,
      activeTriggers,
      batches: this.batches.size,
      averagePerformance: {
        triggerCount: avgTriggerCount,
        lastTriggered
      }
    }
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    // Kill all animations
    this.triggers.forEach((trigger) => {
      if (trigger.animation) {
        trigger.animation.kill()
      }
    })

    // Clear all data
    this.triggers.clear()
    this.batches.clear()
    this.refreshQueue.clear()

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
    }

    // Kill all ScrollTriggers
    if (this.ScrollTrigger) {
      this.ScrollTrigger.killAll()
    }

    ScrollTriggerManager.instance = null as any
  }
}