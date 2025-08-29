/**
 * Comprehensive Scroll Animation System Hook
 * Integrates ScrollTriggerManager, presets, and performance optimization
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { ScrollTriggerManager } from '@/lib/animations/ScrollTriggerManager'
import { ScrollAnimationPresets, ScrollPreset } from '@/lib/animations/ScrollAnimationPresets'
import { useAdaptiveQuality } from './useAdaptiveQuality'
import { ScrollAnimationConfig } from '@/types/animations'

export interface UseScrollAnimationSystemOptions {
  enablePresets?: boolean
  enableBatching?: boolean
  enablePerformanceMonitoring?: boolean
  defaultQuality?: 'low' | 'medium' | 'high'
}

export interface ScrollAnimationSystemReturn {
  // Core functionality
  createAnimation: (element: Element, config: ScrollAnimationConfig) => Promise<string>
  createFromPreset: (element: Element, presetId: string, overrides?: Partial<ScrollAnimationConfig>) => Promise<string>
  removeAnimation: (animationId: string) => boolean
  
  // Batch operations
  createBatch: (elements: Array<{ element: Element; config: ScrollAnimationConfig }>) => Promise<string[]>
  createBatchFromPreset: (elements: Element[], presetId: string) => Promise<string[]>
  
  // Preset management
  getAvailablePresets: () => ScrollPreset[]
  searchPresets: (query: string) => ScrollPreset[]
  createCustomPreset: (id: string, name: string, config: ScrollAnimationConfig) => void
  
  // Control
  pauseAll: () => void
  resumeAll: () => void
  refresh: (animationId?: string) => void
  
  // State
  isInitialized: boolean
  statistics: any
  quality: 'low' | 'medium' | 'high'
  
  // Utilities
  registerElement: (element: Element, presetId?: string) => Promise<string>
  unregisterElement: (element: Element) => void
  observeElement: (element: Element, callback: (isVisible: boolean) => void) => () => void
}

export function useScrollAnimationSystem(
  options: UseScrollAnimationSystemOptions = {}
): ScrollAnimationSystemReturn {
  const {
    enablePresets = true,
    enableBatching = true,
    enablePerformanceMonitoring = true,
    defaultQuality = 'medium'
  } = options

  const [isInitialized, setIsInitialized] = useState(false)
  const [statistics, setStatistics] = useState<any>({})
  const scrollManagerRef = useRef<ScrollTriggerManager | null>(null)
  const observersRef = useRef<Map<Element, IntersectionObserver>>(new Map())
  const { quality, shouldReduceMotion } = useAdaptiveQuality()

  // Initialize the scroll animation system
  useEffect(() => {
    const initialize = async () => {
      try {
        scrollManagerRef.current = ScrollTriggerManager.getInstance()
        setIsInitialized(true)
        
        if (enablePerformanceMonitoring) {
          // Set up periodic statistics updates
          const interval = setInterval(() => {
            if (scrollManagerRef.current) {
              setStatistics(scrollManagerRef.current.getStatistics())
            }
          }, 1000)

          return () => clearInterval(interval)
        }
      } catch (error) {
        console.error('Failed to initialize scroll animation system:', error)
      }
    }

    initialize()
  }, [enablePerformanceMonitoring])

  // Create animation from configuration
  const createAnimation = useCallback(async (
    element: Element,
    config: ScrollAnimationConfig
  ): Promise<string> => {
    if (!scrollManagerRef.current || !isInitialized) {
      throw new Error('Scroll animation system not initialized')
    }

    // Skip animations if reduced motion is preferred
    if (shouldReduceMotion) {
      // Apply final state immediately
      if (config.properties) {
        config.properties.forEach(prop => {
          if (element instanceof HTMLElement) {
            (element.style as any)[prop.property] = prop.to
          }
        })
      }
      return 'reduced-motion-skip'
    }

    return scrollManagerRef.current.createTrigger(element, config)
  }, [isInitialized, shouldReduceMotion])

  // Create animation from preset
  const createFromPreset = useCallback(async (
    element: Element,
    presetId: string,
    overrides?: Partial<ScrollAnimationConfig>
  ): Promise<string> => {
    if (!enablePresets) {
      throw new Error('Presets are disabled')
    }

    const adjustedConfig = ScrollAnimationPresets.getQualityAdjustedConfig(presetId, quality)
    if (!adjustedConfig) {
      throw new Error(`Preset '${presetId}' not found`)
    }

    const finalConfig = { ...adjustedConfig, ...overrides }
    return createAnimation(element, finalConfig)
  }, [enablePresets, quality, createAnimation])

  // Remove animation
  const removeAnimation = useCallback((animationId: string): boolean => {
    if (!scrollManagerRef.current) return false
    return scrollManagerRef.current.removeTrigger(animationId)
  }, [])

  // Create batch of animations
  const createBatch = useCallback(async (
    elements: Array<{ element: Element; config: ScrollAnimationConfig }>
  ): Promise<string[]> => {
    if (!enableBatching || !scrollManagerRef.current) {
      // Fallback to individual creation
      const promises = elements.map(({ element, config }) => createAnimation(element, config))
      return Promise.all(promises)
    }

    const batchId = `batch_${Date.now()}`
    return scrollManagerRef.current.createBatch(batchId, elements)
  }, [enableBatching, createAnimation])

  // Create batch from preset
  const createBatchFromPreset = useCallback(async (
    elements: Element[],
    presetId: string
  ): Promise<string[]> => {
    const adjustedConfig = ScrollAnimationPresets.getQualityAdjustedConfig(presetId, quality)
    if (!adjustedConfig) {
      throw new Error(`Preset '${presetId}' not found`)
    }

    const batchElements = elements.map(element => ({
      element,
      config: adjustedConfig
    }))

    return createBatch(batchElements)
  }, [quality, createBatch])

  // Get available presets based on current quality
  const getAvailablePresets = useCallback((): ScrollPreset[] => {
    if (!enablePresets) return []
    return ScrollAnimationPresets.getOptimizedPresets(quality)
  }, [enablePresets, quality])

  // Search presets
  const searchPresets = useCallback((query: string): ScrollPreset[] => {
    if (!enablePresets) return []
    const allPresets = ScrollAnimationPresets.searchPresets(query)
    return allPresets.filter(preset => {
      // Filter by quality
      switch (quality) {
        case 'low':
          return preset.complexity === 'low' && !preset.performance.cpuIntensive
        case 'medium':
          return preset.complexity !== 'high'
        case 'high':
          return true
        default:
          return preset.complexity === 'low'
      }
    })
  }, [enablePresets, quality])

  // Create custom preset
  const createCustomPreset = useCallback((
    id: string,
    name: string,
    config: ScrollAnimationConfig
  ): void => {
    if (!enablePresets) return
    
    ScrollAnimationPresets.createCustomPreset(id, name, `Custom: ${name}`, config, {
      category: 'entrance',
      complexity: 'medium',
      performance: {
        cpuIntensive: false,
        memoryUsage: 'medium',
        recommendedQuality: 'medium'
      }
    })
  }, [enablePresets])

  // Control functions
  const pauseAll = useCallback((): void => {
    if (scrollManagerRef.current) {
      scrollManagerRef.current.pauseAll()
    }
  }, [])

  const resumeAll = useCallback((): void => {
    if (scrollManagerRef.current) {
      scrollManagerRef.current.resumeAll()
    }
  }, [])

  const refresh = useCallback((animationId?: string): void => {
    if (scrollManagerRef.current) {
      scrollManagerRef.current.refresh(animationId)
    }
  }, [])

  // Register element with automatic preset selection
  const registerElement = useCallback(async (
    element: Element,
    presetId?: string
  ): Promise<string> => {
    // Auto-select preset based on element type and class
    let selectedPresetId = presetId
    
    if (!selectedPresetId && enablePresets) {
      // Auto-detect based on element characteristics
      if (element.classList.contains('text-reveal')) {
        selectedPresetId = 'text-reveal-mask'
      } else if (element.classList.contains('parallax')) {
        selectedPresetId = 'parallax-slow'
      } else if (element.classList.contains('stagger')) {
        selectedPresetId = 'stagger-fade-up'
      } else {
        selectedPresetId = 'fade-in-up' // Default
      }
    }

    if (selectedPresetId) {
      return createFromPreset(element, selectedPresetId)
    } else {
      // Create basic fade-in animation
      const basicConfig: ScrollAnimationConfig = {
        trigger: '',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: false,
        pin: false,
        animation: {
          from: { opacity: 0, y: 30 },
          to: { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        }
      }
      return createAnimation(element, basicConfig)
    }
  }, [enablePresets, createFromPreset, createAnimation])

  // Unregister element
  const unregisterElement = useCallback((element: Element): void => {
    // Find and remove animation by element
    // This would require tracking element-to-animation mapping
    // For now, we'll implement a basic cleanup
    const observer = observersRef.current.get(element)
    if (observer) {
      observer.disconnect()
      observersRef.current.delete(element)
    }
  }, [])

  // Observe element visibility
  const observeElement = useCallback((
    element: Element,
    callback: (isVisible: boolean) => void
  ): (() => void) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting)
      },
      {
        threshold: [0, 0.1, 0.5, 0.9, 1],
        rootMargin: '10px'
      }
    )

    observer.observe(element)
    observersRef.current.set(element, observer)

    // Return cleanup function
    return () => {
      observer.disconnect()
      observersRef.current.delete(element)
    }
  }, [])

  // Listen for quality changes
  useEffect(() => {
    const handleQualityChange = (event: CustomEvent) => {
      const { quality: newQuality } = event.detail
      
      if (newQuality === 'paused') {
        pauseAll()
      } else {
        resumeAll()
        refresh() // Refresh all animations with new quality
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('quality-change', handleQualityChange as EventListener)
      return () => {
        window.removeEventListener('quality-change', handleQualityChange as EventListener)
      }
    }
  }, [pauseAll, resumeAll, refresh])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all observers
      observersRef.current.forEach(observer => observer.disconnect())
      observersRef.current.clear()
    }
  }, [])

  return {
    // Core functionality
    createAnimation,
    createFromPreset,
    removeAnimation,
    
    // Batch operations
    createBatch,
    createBatchFromPreset,
    
    // Preset management
    getAvailablePresets,
    searchPresets,
    createCustomPreset,
    
    // Control
    pauseAll,
    resumeAll,
    refresh,
    
    // State
    isInitialized,
    statistics,
    quality,
    
    // Utilities
    registerElement,
    unregisterElement,
    observeElement
  }
}