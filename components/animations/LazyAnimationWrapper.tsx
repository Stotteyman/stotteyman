'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'

interface LazyAnimationWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  animationType?: 'fade' | 'slide' | 'scale' | 'none'
  delay?: number
  preload?: boolean
  className?: string
  onVisible?: () => void
  onHidden?: () => void
}

export function LazyAnimationWrapper({
  children,
  fallback = null,
  threshold = 0.1,
  rootMargin = '50px',
  animationType = 'fade',
  delay = 0,
  preload = false,
  className = '',
  onVisible,
  onHidden
}: LazyAnimationWrapperProps) {
  const [isVisible, setIsVisible] = useState(preload)
  const [hasBeenVisible, setHasBeenVisible] = useState(preload)
  const [isLoaded, setIsLoaded] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { canUseWebGL } = useAdaptiveQuality()

  // Intersection Observer for visibility detection
  useEffect(() => {
    const element = elementRef.current
    if (!element || hasBeenVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            setHasBeenVisible(true)
            onVisible?.()
          } else if (hasBeenVisible) {
            setIsVisible(false)
            onHidden?.()
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, hasBeenVisible, onVisible, onHidden])

  // Preload animations when they become visible
  useEffect(() => {
    if (isVisible && !isLoaded && canUseWebGL) {
      // Simulate loading time for heavy animations
      const loadTimer = setTimeout(() => {
        setIsLoaded(true)
      }, 100)

      return () => clearTimeout(loadTimer)
    }
    
    return undefined
  }, [isVisible, isLoaded, canUseWebGL])

  const getAnimationVariants = () => {
    if (prefersReducedMotion || animationType === 'none') {
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
      }
    }

    switch (animationType) {
      case 'slide':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 }
        }
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        }
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
    }
  }

  const animationVariants = getAnimationVariants()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={elementRef} className={className}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={animationVariants}
            transition={{
              duration: 0.6,
              delay,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {isLoaded ? (
              <Suspense fallback={fallback}>
                {children}
              </Suspense>
            ) : (
              fallback
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Animation preloader hook
export function useAnimationPreloader() {
  const [preloadedComponents, setPreloadedComponents] = useState<Set<string>>(new Set())

  const preloadAnimation = async (componentName: string) => {
    if (preloadedComponents.has(componentName)) return

    try {
      switch (componentName) {
        case 'morphing':
          await import('./MorphingBackground')
          break
        case 'magnetic':
          await import('./MagneticCursor')
          break
        default:
          console.warn(`Unknown animation component: ${componentName}`)
          return
      }

      setPreloadedComponents(prev => new Set([...prev, componentName]))
    } catch (error) {
      console.error(`Failed to preload animation component ${componentName}:`, error)
    }
  }

  const preloadCriticalAnimations = async () => {
    const criticalAnimations = ['magnetic']
    await Promise.all(criticalAnimations.map(preloadAnimation))
  }

  const isPreloaded = (componentName: string) => preloadedComponents.has(componentName)

  return {
    preloadAnimation,
    preloadCriticalAnimations,
    isPreloaded,
    preloadedComponents: Array.from(preloadedComponents)
  }
}

// Performance-aware animation loader
export class AnimationLoader {
  private static instance: AnimationLoader
  private loadedModules = new Map<string, any>()
  private loadingPromises = new Map<string, Promise<any>>()

  static getInstance(): AnimationLoader {
    if (!AnimationLoader.instance) {
      AnimationLoader.instance = new AnimationLoader()
    }
    return AnimationLoader.instance
  }

  async loadAnimation(name: string): Promise<any> {
    // Return cached module if already loaded
    if (this.loadedModules.has(name)) {
      return this.loadedModules.get(name)
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)
    }

    // Create new loading promise
    const loadingPromise = this.createLoadingPromise(name)
    this.loadingPromises.set(name, loadingPromise)

    try {
      const loadedModule = await loadingPromise
      this.loadedModules.set(name, loadedModule)
      this.loadingPromises.delete(name)
      return loadedModule
    } catch (error) {
      this.loadingPromises.delete(name)
      throw error
    }
  }

  private async createLoadingPromise(name: string): Promise<any> {
    switch (name) {
      case 'morphing':
        return import('./MorphingBackground')
      case 'magnetic':
        return import('./MagneticCursor')
      case 'scroll':
        return import('./ScrollAnimations')
      default:
        throw new Error(`Unknown animation module: ${name}`)
    }
  }

  preloadCriticalAnimations(): Promise<void[]> {
    const critical = ['magnetic', 'scroll']
    return Promise.all(critical.map(name => this.loadAnimation(name).catch(console.error)))
  }

  getCacheStatus() {
    return {
      loaded: Array.from(this.loadedModules.keys()),
      loading: Array.from(this.loadingPromises.keys()),
      cacheSize: this.loadedModules.size
    }
  }

  clearCache() {
    this.loadedModules.clear()
    this.loadingPromises.clear()
  }
}

// Global animation loader instance
export const animationLoader = AnimationLoader.getInstance()