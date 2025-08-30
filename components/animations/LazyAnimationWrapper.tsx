'use client'

import { useState, useEffect, useRef, Suspense, lazy } from 'react'
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

// Lazy loaded animation components
const LazyParticleSystem = lazy(() => import('./ParticleSystem').then(mod => ({ default: mod.ParticleSystem })))
const LazyMorphingBackground = lazy(() => import('./MorphingBackground').then(mod => ({ default: mod.MorphingBackground })))

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
    
    // Return undefined for other code paths
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
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 }
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

  const variants = getAnimationVariants()

  return (
    <div ref={elementRef} className={className}>
      <AnimatePresence mode="wait">
        {hasBeenVisible ? (
          <motion.div
            key="content"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            exit="hidden"
            variants={variants}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              delay: prefersReducedMotion ? 0 : delay,
              ease: "easeOut"
            }}
          >
            <Suspense fallback={fallback}>
              {children}
            </Suspense>
          </motion.div>
        ) : (
          fallback && (
            <motion.div
              key="fallback"
              initial="visible"
              exit="hidden"
              variants={variants}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              {fallback}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}

// Specialized lazy wrappers for heavy animation components
export function LazyParticleWrapper(props: any) {
  return (
    <LazyAnimationWrapper
      animationType="fade"
      threshold={0.2}
      rootMargin="100px"
      fallback={<div className="w-full h-full bg-transparent" />}
    >
      <Suspense fallback={null}>
        <LazyParticleSystem {...props} />
      </Suspense>
    </LazyAnimationWrapper>
  )
}

export function LazyMorphingWrapper(props: any) {
  return (
    <LazyAnimationWrapper
      animationType="scale"
      threshold={0.1}
      rootMargin="150px"
      fallback={<div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />}
    >
      <Suspense fallback={null}>
        <LazyMorphingBackground {...props} />
      </Suspense>
    </LazyAnimationWrapper>
  )
}

// Hook for preloading animations
export function useAnimationPreloader() {
  const [preloadedComponents, setPreloadedComponents] = useState<Set<string>>(new Set())
  const { canUseWebGL } = useAdaptiveQuality()

  const preloadAnimation = async (componentName: string) => {
    if (!canUseWebGL || preloadedComponents.has(componentName)) {
      return
    }

    try {
      switch (componentName) {
        case 'particles':
          await import('./ParticleSystem')
          break
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
    const criticalAnimations = ['magnetic', 'particles']
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
      case 'particles':
        return import('./ParticleSystem')
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