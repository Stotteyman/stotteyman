/**
 * Fallback Animation System - Provides CSS-only animations when JS animations are disabled
 */

export interface FallbackAnimationConfig {
  name: string
  keyframes: string
  duration: number
  easing: string
  fillMode: 'none' | 'forwards' | 'backwards' | 'both'
  iterationCount: number | 'infinite'
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  delay: number
}

export class FallbackAnimationSystem {
  private static instance: FallbackAnimationSystem
  private styleSheet: CSSStyleSheet | null = null
  private animations: Map<string, FallbackAnimationConfig> = new Map()
  private isInitialized = false

  private constructor() {
    this.initialize()
  }

  static getInstance(): FallbackAnimationSystem {
    if (!FallbackAnimationSystem.instance) {
      FallbackAnimationSystem.instance = new FallbackAnimationSystem()
    }
    return FallbackAnimationSystem.instance
  }

  private initialize(): void {
    if (typeof document === 'undefined') return

    // Create a dedicated stylesheet for fallback animations
    const style = document.createElement('style')
    style.id = 'fallback-animations'
    document.head.appendChild(style)
    this.styleSheet = style.sheet

    // Register default fallback animations
    this.registerDefaultAnimations()
    this.isInitialized = true
  }

  private registerDefaultAnimations(): void {
    // Fade animations
    this.registerAnimation({
      name: 'fallback-fade-in',
      keyframes: `
        from { opacity: 0; }
        to { opacity: 1; }
      `,
      duration: 0.3,
      easing: 'ease-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    this.registerAnimation({
      name: 'fallback-fade-out',
      keyframes: `
        from { opacity: 1; }
        to { opacity: 0; }
      `,
      duration: 0.2,
      easing: 'ease-in',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    // Slide animations
    this.registerAnimation({
      name: 'fallback-slide-up',
      keyframes: `
        from { 
          opacity: 0; 
          transform: translateY(10px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      `,
      duration: 0.4,
      easing: 'ease-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    this.registerAnimation({
      name: 'fallback-slide-down',
      keyframes: `
        from { 
          opacity: 0; 
          transform: translateY(-10px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      `,
      duration: 0.4,
      easing: 'ease-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    this.registerAnimation({
      name: 'fallback-slide-left',
      keyframes: `
        from { 
          opacity: 0; 
          transform: translateX(10px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      `,
      duration: 0.4,
      easing: 'ease-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    this.registerAnimation({
      name: 'fallback-slide-right',
      keyframes: `
        from { 
          opacity: 0; 
          transform: translateX(-10px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      `,
      duration: 0.4,
      easing: 'ease-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    // Scale animations
    this.registerAnimation({
      name: 'fallback-scale-in',
      keyframes: `
        from { 
          opacity: 0; 
          transform: scale(0.95); 
        }
        to { 
          opacity: 1; 
          transform: scale(1); 
        }
      `,
      duration: 0.3,
      easing: 'ease-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    this.registerAnimation({
      name: 'fallback-scale-out',
      keyframes: `
        from { 
          opacity: 1; 
          transform: scale(1); 
        }
        to { 
          opacity: 0; 
          transform: scale(0.95); 
        }
      `,
      duration: 0.2,
      easing: 'ease-in',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    // Rotation animations
    this.registerAnimation({
      name: 'fallback-rotate-in',
      keyframes: `
        from { 
          opacity: 0; 
          transform: rotate(-5deg) scale(0.95); 
        }
        to { 
          opacity: 1; 
          transform: rotate(0deg) scale(1); 
        }
      `,
      duration: 0.5,
      easing: 'ease-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    // Loading animations
    this.registerAnimation({
      name: 'fallback-pulse',
      keyframes: `
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      `,
      duration: 1.5,
      easing: 'ease-in-out',
      fillMode: 'none',
      iterationCount: 'infinite',
      direction: 'normal',
      delay: 0
    })

    this.registerAnimation({
      name: 'fallback-shimmer',
      keyframes: `
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      `,
      duration: 1.3,
      easing: 'linear',
      fillMode: 'none',
      iterationCount: 'infinite',
      direction: 'normal',
      delay: 0
    })

    // Focus animations
    this.registerAnimation({
      name: 'fallback-focus-ring',
      keyframes: `
        from { 
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); 
        }
        to { 
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); 
        }
      `,
      duration: 0.2,
      easing: 'ease-out',
      fillMode: 'forwards',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    // Notification animations
    this.registerAnimation({
      name: 'fallback-toast-in',
      keyframes: `
        from { 
          opacity: 0; 
          transform: translateY(-10px) scale(0.95); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0) scale(1); 
        }
      `,
      duration: 0.3,
      easing: 'ease-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    this.registerAnimation({
      name: 'fallback-shake',
      keyframes: `
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
      `,
      duration: 0.5,
      easing: 'ease-in-out',
      fillMode: 'both',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })

    // Hover effects
    this.registerAnimation({
      name: 'fallback-lift',
      keyframes: `
        from { 
          transform: translateY(0); 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
        }
        to { 
          transform: translateY(-2px); 
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); 
        }
      `,
      duration: 0.2,
      easing: 'ease-out',
      fillMode: 'forwards',
      iterationCount: 1,
      direction: 'normal',
      delay: 0
    })
  }

  registerAnimation(config: FallbackAnimationConfig): void {
    if (!this.styleSheet) return

    // Create keyframes rule
    const keyframesRule = `@keyframes ${config.name} { ${config.keyframes} }`
    
    // Create animation class rule
    const animationRule = `
      .${config.name} {
        animation: ${config.name} ${config.duration}s ${config.easing} ${config.delay}s ${config.iterationCount} ${config.direction} ${config.fillMode};
      }
    `

    try {
      this.styleSheet.insertRule(keyframesRule)
      this.styleSheet.insertRule(animationRule)
      this.animations.set(config.name, config)
    } catch (error) {
      console.warn(`Failed to register fallback animation: ${config.name}`, error)
    }
  }

  applyAnimation(element: Element, animationName: string, options?: {
    duration?: number
    delay?: number
    easing?: string
  }): void {
    if (!this.animations.has(animationName)) {
      console.warn(`Fallback animation not found: ${animationName}`)
      return
    }

    const config = this.animations.get(animationName)!
    
    // Apply animation class
    element.classList.add(animationName)

    // Apply custom options if provided
    if (options && element instanceof HTMLElement) {
      if (options.duration !== undefined) {
        element.style.animationDuration = `${options.duration}s`
      }
      if (options.delay !== undefined) {
        element.style.animationDelay = `${options.delay}s`
      }
      if (options.easing !== undefined) {
        element.style.animationTimingFunction = options.easing
      }
    }

    // Remove animation class after completion
    const duration = (options?.duration || config.duration) * 1000
    const delay = (options?.delay || config.delay) * 1000
    
    setTimeout(() => {
      element.classList.remove(animationName)
      if (element instanceof HTMLElement) {
        element.style.animationDuration = ''
        element.style.animationDelay = ''
        element.style.animationTimingFunction = ''
      }
    }, duration + delay)
  }

  removeAnimation(element: Element, animationName: string): void {
    element.classList.remove(animationName)
    if (element instanceof HTMLElement) {
      element.style.animation = 'none'
    }
  }

  createStaggeredAnimation(
    elements: Element[],
    animationName: string,
    staggerDelay: number = 0.1
  ): void {
    elements.forEach((element, index) => {
      setTimeout(() => {
        this.applyAnimation(element, animationName)
      }, index * staggerDelay * 1000)
    })
  }

  createSequentialAnimation(
    elements: Element[],
    animationNames: string[],
    delay: number = 0.3
  ): void {
    elements.forEach((element, index) => {
      const animationName = animationNames[index % animationNames.length]
      setTimeout(() => {
        this.applyAnimation(element, animationName)
      }, index * delay * 1000)
    })
  }

  getAvailableAnimations(): string[] {
    return Array.from(this.animations.keys())
  }

  getAnimationConfig(name: string): FallbackAnimationConfig | undefined {
    return this.animations.get(name)
  }

  // Utility methods for common animation patterns
  fadeIn(element: Element, duration: number = 0.3): void {
    this.applyAnimation(element, 'fallback-fade-in', { duration })
  }

  fadeOut(element: Element, duration: number = 0.2): void {
    this.applyAnimation(element, 'fallback-fade-out', { duration })
  }

  slideUp(element: Element, duration: number = 0.4): void {
    this.applyAnimation(element, 'fallback-slide-up', { duration })
  }

  scaleIn(element: Element, duration: number = 0.3): void {
    this.applyAnimation(element, 'fallback-scale-in', { duration })
  }

  pulse(element: Element): void {
    this.applyAnimation(element, 'fallback-pulse')
  }

  shake(element: Element): void {
    this.applyAnimation(element, 'fallback-shake')
  }

  // Batch operations
  batchFadeIn(elements: Element[], staggerDelay: number = 0.1): void {
    this.createStaggeredAnimation(elements, 'fallback-fade-in', staggerDelay)
  }

  batchSlideUp(elements: Element[], staggerDelay: number = 0.1): void {
    this.createStaggeredAnimation(elements, 'fallback-slide-up', staggerDelay)
  }

  // Cleanup
  clearAllAnimations(): void {
    document.querySelectorAll('[class*="fallback-"]').forEach(element => {
      Array.from(element.classList).forEach(className => {
        if (className.startsWith('fallback-')) {
          element.classList.remove(className)
        }
      })
      if (element instanceof HTMLElement) {
        element.style.animation = ''
      }
    })
  }

  destroy(): void {
    const styleElement = document.getElementById('fallback-animations')
    if (styleElement) {
      styleElement.remove()
    }
    this.animations.clear()
    this.styleSheet = null
    this.isInitialized = false
    FallbackAnimationSystem.instance = null as any
  }
}