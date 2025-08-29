import { AnimationConfig, PerformanceMetrics } from '@/types/animations'
import { PerformanceMonitor } from './PerformanceMonitor'
import { AnimationRegistry } from './AnimationRegistry'
import { AnimationQueue } from './AnimationQueue'

export class AnimationManager {
  private static instance: AnimationManager
  private performanceMonitor: PerformanceMonitor
  private animationRegistry: AnimationRegistry
  private animationQueue: AnimationQueue
  private activeAnimations: Map<string, any> = new Map()
  private isProcessing = false
  private reducedMotion = false
  private qualityLevel: 'low' | 'medium' | 'high' = 'medium'

  private constructor() {
    this.performanceMonitor = new PerformanceMonitor()
    this.animationRegistry = AnimationRegistry.getInstance()
    this.animationQueue = AnimationQueue.getInstance()
    this.checkReducedMotion()
    this.setupEventListeners()
    this.setupQualityListeners()
  }

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager()
    }
    return AnimationManager.instance
  }

  private checkReducedMotion(): void {
    if (typeof window !== 'undefined') {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      
      // Listen for changes
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        this.reducedMotion = e.matches
        if (this.reducedMotion) {
          this.pauseAllAnimations()
        }
      })
    }
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      // Pause animations when tab is not visible
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAllAnimations()
        } else {
          this.resumeAllAnimations()
        }
      })

      // Handle low battery
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          const handleBatteryChange = () => {
            if (battery.level < 0.2 && !battery.charging) {
              this.enablePowerSaveMode()
            } else {
              this.disablePowerSaveMode()
            }
          }
          
          battery.addEventListener('levelchange', handleBatteryChange)
          battery.addEventListener('chargingchange', handleBatteryChange)
          handleBatteryChange()
        })
      }
    }
  }

  async createAnimation(config: AnimationConfig): Promise<string> {
    if (this.reducedMotion) {
      return this.createFallbackAnimation(config)
    }

    const animationId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      let animation: any

      switch (config.type) {
        case 'entrance':
          animation = await this.createEntranceAnimation(config)
          break
        case 'exit':
          animation = await this.createExitAnimation(config)
          break
        case 'hover':
          animation = await this.createHoverAnimation(config)
          break
        case 'scroll':
          animation = await this.createScrollAnimation(config)
          break
        default:
          throw new Error(`Unknown animation type: ${config.type}`)
      }

      this.activeAnimations.set(animationId, animation)
      this.performanceMonitor.trackAnimation(animationId, config)

      return animationId
    } catch (error) {
      console.error('Failed to create animation:', error)
      return this.createFallbackAnimation(config)
    }
  }

  private async createEntranceAnimation(config: AnimationConfig): Promise<any> {
    const { default: gsap } = await import('gsap')
    
    const timeline = gsap.timeline({
      delay: config.delay,
      onComplete: () => this.onAnimationComplete(config.id)
    })

    config.properties.forEach((prop, index) => {
      timeline.fromTo(
        `.${config.id}`,
        { [prop.property]: prop.from },
        { 
          [prop.property]: prop.to,
          duration: config.duration,
          ease: config.easing,
          stagger: config.stagger
        },
        index === 0 ? 0 : '-=0.1'
      )
    })

    return timeline
  }

  private async createExitAnimation(config: AnimationConfig): Promise<any> {
    const { default: gsap } = await import('gsap')
    
    return gsap.to(`.${config.id}`, {
      ...config.properties.reduce((acc, prop) => ({
        ...acc,
        [prop.property]: prop.to
      }), {}),
      duration: config.duration,
      ease: config.easing,
      stagger: config.stagger,
      onComplete: () => this.onAnimationComplete(config.id)
    })
  }

  private async createHoverAnimation(config: AnimationConfig): Promise<any> {
    const { default: gsap } = await import('gsap')
    
    const element = document.querySelector(`.${config.id}`)
    if (!element) return null

    const hoverIn = gsap.to(element, {
      ...config.properties.reduce((acc, prop) => ({
        ...acc,
        [prop.property]: prop.to
      }), {}),
      duration: config.duration * 0.3,
      ease: config.easing,
      paused: true
    })

    const hoverOut = gsap.to(element, {
      ...config.properties.reduce((acc, prop) => ({
        ...acc,
        [prop.property]: prop.from
      }), {}),
      duration: config.duration * 0.2,
      ease: config.easing,
      paused: true
    })

    element.addEventListener('mouseenter', () => hoverIn.play())
    element.addEventListener('mouseleave', () => hoverOut.play())

    return { hoverIn, hoverOut }
  }

  private async createScrollAnimation(config: AnimationConfig): Promise<any> {
    const { default: gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    
    gsap.registerPlugin(ScrollTrigger)

    return gsap.fromTo(`.${config.id}`, 
      config.properties.reduce((acc, prop) => ({
        ...acc,
        [prop.property]: prop.from
      }), {}),
      {
        ...config.properties.reduce((acc, prop) => ({
          ...acc,
          [prop.property]: prop.to
        }), {}),
        duration: config.duration,
        ease: config.easing,
        stagger: config.stagger,
        scrollTrigger: {
          trigger: `.${config.id}`,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  }

  private createFallbackAnimation(config: AnimationConfig): string {
    const animationId = `fallback_${Date.now()}`
    
    // Apply CSS-only animation
    const elements = document.querySelectorAll(`.${config.id}`)
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.transition = `all ${config.duration}s ${config.easing}`
        element.style.opacity = '1'
        element.style.transform = 'translateY(0)'
      }
    })

    return animationId
  }

  pauseAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId)
    if (animation && animation.pause) {
      animation.pause()
    }
  }

  resumeAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId)
    if (animation && animation.resume) {
      animation.resume()
    }
  }

  killAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId)
    if (animation) {
      if (animation.kill) {
        animation.kill()
      } else if (animation.hoverIn && animation.hoverOut) {
        animation.hoverIn.kill()
        animation.hoverOut.kill()
      }
      this.activeAnimations.delete(animationId)
    }
  }

  private pauseAllAnimations(): void {
    this.activeAnimations.forEach((animation, id) => {
      this.pauseAnimation(id)
    })
  }

  private resumeAllAnimations(): void {
    this.activeAnimations.forEach((animation, id) => {
      this.resumeAnimation(id)
    })
  }

  private enablePowerSaveMode(): void {
    console.log('Enabling power save mode - reducing animations')
    // Reduce animation complexity
    this.activeAnimations.forEach((animation, id) => {
      if (animation.timeScale) {
        animation.timeScale(0.5) // Slow down animations
      }
    })
  }

  private disablePowerSaveMode(): void {
    console.log('Disabling power save mode - restoring animations')
    this.activeAnimations.forEach((animation, id) => {
      if (animation.timeScale) {
        animation.timeScale(1) // Restore normal speed
      }
    })
  }

  private onAnimationComplete(animationId: string): void {
    this.performanceMonitor.onAnimationComplete(animationId)
  }

  private setupQualityListeners(): void {
    if (typeof window !== 'undefined') {
      // Listen for quality changes
      window.addEventListener('quality-change', ((event: CustomEvent) => {
        const { quality } = event.detail
        this.setQualityLevel(quality)
      }) as EventListener)

      // Listen for performance degradation
      window.addEventListener('performance-degradation', ((event: CustomEvent) => {
        const { issues } = event.detail
        this.handlePerformanceDegradation(issues)
      }) as EventListener)
    }
  }

  setQualityLevel(quality: 'low' | 'medium' | 'high'): void {
    this.qualityLevel = quality
    
    // Adjust animation queue concurrency based on quality
    switch (quality) {
      case 'low':
        this.animationQueue.setMaxConcurrent(2)
        break
      case 'medium':
        this.animationQueue.setMaxConcurrent(5)
        break
      case 'high':
        this.animationQueue.setMaxConcurrent(10)
        break
    }
  }

  private handlePerformanceDegradation(issues: string[]): void {
    if (issues.includes('low-fps') || issues.includes('slow-render')) {
      // Reduce quality automatically
      if (this.qualityLevel === 'high') {
        this.setQualityLevel('medium')
      } else if (this.qualityLevel === 'medium') {
        this.setQualityLevel('low')
      }
    }

    if (issues.includes('high-memory')) {
      // Clear completed animations more aggressively
      this.cleanup()
    }
  }

  /**
   * Create animation using preset
   */
  async createAnimationFromPreset(
    presetId: string, 
    targetSelector: string,
    overrides?: Partial<AnimationConfig>
  ): Promise<string> {
    const config = this.animationRegistry.createAnimationConfig(presetId, {
      id: targetSelector.replace(/[^a-zA-Z0-9]/g, '_'),
      ...overrides
    })

    if (!config) {
      throw new Error(`Animation preset '${presetId}' not found`)
    }

    return this.createAnimation(config)
  }

  /**
   * Queue animation for later execution
   */
  queueAnimation(
    config: AnimationConfig,
    options?: {
      priority?: number
      dependencies?: string[]
      callback?: (animationId: string) => void
      onError?: (error: Error) => void
    }
  ): string {
    return this.animationQueue.enqueue(config, options)
  }

  /**
   * Queue multiple animations as a batch
   */
  queueAnimationBatch(
    animations: Array<{
      config: AnimationConfig
      priority?: number
      dependencies?: string[]
    }>,
    options?: {
      parallel?: boolean
      onComplete?: () => void
      onError?: (error: Error) => void
    }
  ): string {
    return this.animationQueue.enqueueBatch(animations, options)
  }

  /**
   * Get available animation presets for current quality level
   */
  getAvailablePresets(): Array<{
    id: string
    name: string
    description: string
    category: string
    complexity: string
  }> {
    return this.animationRegistry.getOptimizedPresets(this.qualityLevel).map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      category: preset.category,
      complexity: preset.complexity
    }))
  }

  /**
   * Register custom animation preset
   */
  registerCustomPreset(preset: {
    id: string
    name: string
    description: string
    config: Omit<AnimationConfig, 'id'>
    category: 'entrance' | 'exit' | 'hover' | 'scroll' | 'loading' | 'transition'
    complexity: 'low' | 'medium' | 'high'
  }): void {
    this.animationRegistry.registerPreset({
      ...preset,
      performance: {
        cpuIntensive: preset.complexity === 'high',
        memoryUsage: preset.complexity,
        gpuAccelerated: true
      }
    })
  }

  /**
   * Get animation queue status
   */
  getQueueStatus(): {
    queued: number
    running: number
    completed: number
    failed: number
  } {
    return this.animationQueue.getStatus()
  }

  /**
   * Pause all animations and queue processing
   */
  pauseAll(): void {
    this.pauseAllAnimations()
    this.animationQueue.pause()
  }

  /**
   * Resume all animations and queue processing
   */
  resumeAll(): void {
    this.resumeAllAnimations()
    this.animationQueue.resume()
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics()
  }

  cleanup(): void {
    this.activeAnimations.forEach((animation, id) => {
      this.killAnimation(id)
    })
    this.activeAnimations.clear()
  }

  /**
   * Get comprehensive manager statistics
   */
  getStatistics(): {
    activeAnimations: number
    qualityLevel: string
    reducedMotion: boolean
    performance: PerformanceMetrics
    queue: ReturnType<AnimationQueue['getStatus']>
    presets: number
  } {
    return {
      activeAnimations: this.activeAnimations.size,
      qualityLevel: this.qualityLevel,
      reducedMotion: this.reducedMotion,
      performance: this.getPerformanceMetrics(),
      queue: this.getQueueStatus(),
      presets: this.animationRegistry.getAllPresets().length
    }
  }
}