/**
 * Hook for dynamic animation quality adjustment based on device capabilities
 */

import { useState, useEffect } from 'react'
import type { AnimationQuality, DeviceCapabilities, AdaptiveQualityHookReturn } from '@/types/animations'
import { getAnimationManager } from '@/lib/animations/AnimationManager'

export function useAdaptiveQuality(): AdaptiveQualityHookReturn {
  const [quality, setQuality] = useState<AnimationQuality>('medium')
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    supportsWebGL: false,
    supportsIntersectionObserver: false,
    supportsResizeObserver: false,
    devicePixelRatio: 1,
    maxTextureSize: 0,
    preferredFrameRate: 60,
    hardwareConcurrency: 1
  })
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)
  const [canUseWebGL, setCanUseWebGL] = useState(false)
  const [recommendedFPS, setRecommendedFPS] = useState(60)

  useEffect(() => {
    const initializeQualitySystem = async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        return () => {}
      }

      try {
        // Wait for animation manager to initialize
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get initial quality and capabilities
        const animationManager = getAnimationManager()
        const initialQuality = await animationManager.getQuality()
        const deviceCapabilities = detectDeviceCapabilities()
        const reducedMotion = checkReducedMotionPreference()
        
        setQuality(initialQuality)
        setCapabilities(deviceCapabilities)
        setShouldReduceMotion(reducedMotion)
        setCanUseWebGL(deviceCapabilities.supportsWebGL)
        setRecommendedFPS(calculateRecommendedFPS(deviceCapabilities))

        // Listen for reduced motion preference changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handleReducedMotionChange = (e: MediaQueryListEvent) => {
          setShouldReduceMotion(e.matches)
          if (e.matches) {
            setQuality('low')
          }
        }

        mediaQuery.addEventListener('change', handleReducedMotionChange)

        // Listen for visibility changes to optimize performance
        const handleVisibilityChange = async () => {
          if (document.hidden) {
            setQuality('low')
          } else {
            try {
              const animationManager = getAnimationManager()
              const currentQuality = await animationManager.getQuality()
              setQuality(currentQuality)
            } catch (error) {
              console.warn('Failed to get quality from animation manager:', error)
              setQuality('medium')
            }
          }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Listen for battery status changes if available
        if ('getBattery' in navigator) {
          (navigator as any).getBattery().then((battery: any) => {
            const handleBatteryChange = () => {
              if (battery.level < 0.2 || battery.charging === false) {
                setQuality('low')
                setRecommendedFPS(30)
              }
            }

            battery.addEventListener('levelchange', handleBatteryChange)
            battery.addEventListener('chargingchange', handleBatteryChange)
          })
        }

        // Cleanup function
        return () => {
          mediaQuery.removeEventListener('change', handleReducedMotionChange)
          document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
      } catch (error) {
        console.error('Failed to initialize quality system:', error)
        // Set fallback values
        setQuality('medium')
        setCapabilities(detectDeviceCapabilities())
        setShouldReduceMotion(checkReducedMotionPreference())
        setCanUseWebGL(false)
        setRecommendedFPS(30)
        return () => {} // Return empty cleanup function
      }
    }

    initializeQualitySystem()
  }, [])

  return {
    quality,
    capabilities,
    shouldReduceMotion,
    canUseWebGL,
    recommendedFPS
  }
}

function detectDeviceCapabilities(): DeviceCapabilities {
  // Default values for SSR
  const defaultCapabilities: DeviceCapabilities = {
    supportsWebGL: false,
    supportsIntersectionObserver: false,
    supportsResizeObserver: false,
    devicePixelRatio: 1,
    maxTextureSize: 0,
    preferredFrameRate: 60,
    hardwareConcurrency: 1
  }

  // Return defaults if not in browser environment
  if (typeof window === 'undefined') {
    return defaultCapabilities
  }

  const capabilities: DeviceCapabilities = {
    supportsWebGL: detectWebGLSupport(),
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsResizeObserver: 'ResizeObserver' in window,
    devicePixelRatio: window.devicePixelRatio || 1,
    maxTextureSize: 0,
    preferredFrameRate: 60,
    hardwareConcurrency: navigator.hardwareConcurrency || 1
  }

  // Detect WebGL max texture size
  if (capabilities.supportsWebGL) {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (gl && 'getParameter' in gl) {
        capabilities.maxTextureSize = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE)
      }
    } catch (error) {
      console.warn('Error detecting WebGL capabilities:', error)
    }
  }

  // Detect device memory if available
  if ('deviceMemory' in navigator) {
    capabilities.memoryGB = (navigator as any).deviceMemory
  }

  // Detect connection type if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    capabilities.connectionType = connection.effectiveType
  }

  return capabilities
}

function detectWebGLSupport(): boolean {
  // Return false during SSR
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (error) {
    return false
  }
}

function checkReducedMotionPreference(): boolean {
  // Return false during SSR
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function calculateRecommendedFPS(capabilities: DeviceCapabilities): number {
  let fps = 60

  // Reduce FPS for lower-end devices
  if (capabilities.hardwareConcurrency <= 2) {
    fps = 45
  }

  if (capabilities.memoryGB && capabilities.memoryGB < 2) {
    fps = 30
  }

  if (capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g') {
    fps = 30
  }

  // High-end devices can handle higher FPS
  if (capabilities.hardwareConcurrency >= 8 && capabilities.memoryGB && capabilities.memoryGB >= 8) {
    fps = 120
  }

  return fps
}

/**
 * Hook for reduced motion support
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<any>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    const startMonitoring = () => {
      setIsMonitoring(true)
      try {
        // Get metrics from animation manager
        const currentMetrics = getAnimationManager().getMetrics()
        setMetrics(currentMetrics)
      } catch (error) {
        console.warn('Failed to get metrics from animation manager:', error)
        setMetrics(null)
      }
    }

    const stopMonitoring = () => {
      setIsMonitoring(false)
    }

    // Start monitoring when component mounts
    startMonitoring()

    // Update metrics periodically
    const interval = setInterval(() => {
      if (isMonitoring) {
        try {
          const currentMetrics = getAnimationManager().getMetrics()
          setMetrics(currentMetrics)
        } catch (error) {
          console.warn('Failed to get metrics from animation manager:', error)
        }
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      stopMonitoring()
    }
  }, [isMonitoring])

  return {
    metrics,
    isMonitoring,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false)
  }
}