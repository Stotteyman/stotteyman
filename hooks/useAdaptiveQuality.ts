import { useState, useEffect } from 'react'
import { DeviceCapabilities } from '@/types/animations'
import { AdaptiveQuality, QualitySettings } from '@/lib/animations/AdaptiveQuality'

export function useAdaptiveQuality() {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)
  const [qualitySettings, setQualitySettings] = useState<QualitySettings | null>(null)
  const [adaptiveQuality] = useState(() => AdaptiveQuality.getInstance())

  useEffect(() => {
    // Initialize from AdaptiveQuality instance
    setQuality(adaptiveQuality.getCurrentQuality())
    setCapabilities(adaptiveQuality.getDeviceCapabilities())
    setQualitySettings(adaptiveQuality.getCurrentSettings())
    
    checkReducedMotion()
    setupQualityListeners()
  }, [adaptiveQuality])

  const setupQualityListeners = (): void => {
    if (typeof window === 'undefined') return

    // Listen for quality changes from AdaptiveQuality
    const handleQualityChange = ((event: CustomEvent) => {
      const { quality: newQuality, settings } = event.detail
      setQuality(newQuality)
      setQualitySettings(settings)
    }) as EventListener

    window.addEventListener('quality-change', handleQualityChange)

    return () => {
      window.removeEventListener('quality-change', handleQualityChange)
    }
  }

  const checkReducedMotion = (): void => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduceMotion(mediaQuery.matches)

    mediaQuery.addEventListener('change', (e) => {
      setShouldReduceMotion(e.matches)
      if (e.matches) {
        adaptiveQuality.setQuality('low', 'Reduced motion preference')
      }
    })
  }

  const forceQuality = (newQuality: 'low' | 'medium' | 'high'): void => {
    adaptiveQuality.setQuality(newQuality, 'Manual override')
  }

  const enableAutoAdjust = (enabled: boolean): void => {
    adaptiveQuality.setAutoAdjust(enabled)
  }

  const getRecommendedQuality = (): 'low' | 'medium' | 'high' => {
    return adaptiveQuality.getRecommendedQuality()
  }

  return {
    quality,
    capabilities,
    shouldReduceMotion,
    qualitySettings: qualitySettings || adaptiveQuality.getCurrentSettings(),
    forceQuality,
    enableAutoAdjust,
    getRecommendedQuality,
    canUseWebGL: capabilities?.supportsWebGL && quality !== 'low',
    canUseAdvancedEffects: quality !== 'low' && !shouldReduceMotion,
    targetFrameRate: qualitySettings?.frameRateTarget || 60,
    isAutoAdjustEnabled: adaptiveQuality.isAutoAdjustEnabled(),
    adjustmentHistory: adaptiveQuality.getAdjustmentHistory(),
    statistics: adaptiveQuality.getStatistics()
  }
}