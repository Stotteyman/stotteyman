/**
 * Adaptive Quality System - Dynamically adjusts animation quality based on device capabilities and performance
 */

import { DeviceCapabilities, PerformanceMetrics } from '@/types/animations'
import { PerformanceMonitor } from './PerformanceMonitor'

export interface QualitySettings {
  particleCount: number
  animationComplexity: 'low' | 'medium' | 'high'
  enableWebGL: boolean
  enableAdvancedEffects: boolean
  frameRateTarget: number
  enableBlur: boolean
  enableShadows: boolean
  enableGradients: boolean
  maxConcurrentAnimations: number
  staggerDelay: number
  easingComplexity: 'simple' | 'complex'
}

export interface QualityProfile {
  name: string
  settings: QualitySettings
  thresholds: {
    minFPS: number
    maxMemoryUsage: number
    maxCPUUsage: number
  }
}

export class AdaptiveQuality {
  private static instance: AdaptiveQuality
  private currentQuality: 'low' | 'medium' | 'high' = 'medium'
  private deviceCapabilities: DeviceCapabilities | null = null
  private performanceMonitor: PerformanceMonitor
  private qualityProfiles: Map<string, QualityProfile> = new Map()
  private autoAdjustEnabled = true
  private adjustmentHistory: Array<{ quality: string; timestamp: number; reason: string }> = []
  private lastAdjustment = 0
  private adjustmentCooldown = 5000 // 5 seconds

  private constructor() {
    this.performanceMonitor = new PerformanceMonitor()
    this.initializeQualityProfiles()
    this.detectDeviceCapabilities()
    this.setupPerformanceListeners()
  }

  static getInstance(): AdaptiveQuality {
    if (!AdaptiveQuality.instance) {
      AdaptiveQuality.instance = new AdaptiveQuality()
    }
    return AdaptiveQuality.instance
  }

  private initializeQualityProfiles(): void {
    // Low Quality Profile
    this.qualityProfiles.set('low', {
      name: 'Low Quality',
      settings: {
        particleCount: 20,
        animationComplexity: 'low',
        enableWebGL: false,
        enableAdvancedEffects: false,
        frameRateTarget: 30,
        enableBlur: false,
        enableShadows: false,
        enableGradients: false,
        maxConcurrentAnimations: 2,
        staggerDelay: 0.2,
        easingComplexity: 'simple'
      },
      thresholds: {
        minFPS: 20,
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        maxCPUUsage: 90
      }
    })

    // Medium Quality Profile
    this.qualityProfiles.set('medium', {
      name: 'Medium Quality',
      settings: {
        particleCount: 50,
        animationComplexity: 'medium',
        enableWebGL: true,
        enableAdvancedEffects: true,
        frameRateTarget: 60,
        enableBlur: true,
        enableShadows: true,
        enableGradients: true,
        maxConcurrentAnimations: 5,
        staggerDelay: 0.1,
        easingComplexity: 'complex'
      },
      thresholds: {
        minFPS: 45,
        maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        maxCPUUsage: 70
      }
    })

    // High Quality Profile
    this.qualityProfiles.set('high', {
      name: 'High Quality',
      settings: {
        particleCount: 100,
        animationComplexity: 'high',
        enableWebGL: true,
        enableAdvancedEffects: true,
        frameRateTarget: 120,
        enableBlur: true,
        enableShadows: true,
        enableGradients: true,
        maxConcurrentAnimations: 10,
        staggerDelay: 0.05,
        easingComplexity: 'complex'
      },
      thresholds: {
        minFPS: 55,
        maxMemoryUsage: 200 * 1024 * 1024, // 200MB
        maxCPUUsage: 60
      }
    })

    // Ultra Quality Profile (for high-end devices)
    this.qualityProfiles.set('ultra', {
      name: 'Ultra Quality',
      settings: {
        particleCount: 200,
        animationComplexity: 'high',
        enableWebGL: true,
        enableAdvancedEffects: true,
        frameRateTarget: 144,
        enableBlur: true,
        enableShadows: true,
        enableGradients: true,
        maxConcurrentAnimations: 15,
        staggerDelay: 0.02,
        easingComplexity: 'complex'
      },
      thresholds: {
        minFPS: 60,
        maxMemoryUsage: 500 * 1024 * 1024, // 500MB
        maxCPUUsage: 50
      }
    })
  }

  private async detectDeviceCapabilities(): Promise<void> {
    if (typeof window === 'undefined') return

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') as WebGLRenderingContext | null
    
    // Detect GPU tier
    let gpuTier: 'low' | 'medium' | 'high' = 'medium'
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase()
        if (renderer.includes('intel') || renderer.includes('integrated')) {
          gpuTier = 'low'
        } else if (renderer.includes('nvidia') || renderer.includes('amd') || renderer.includes('radeon')) {
          gpuTier = 'high'
        }
      }
    }

    // Detect memory
    let memoryGB = 4 // Default assumption
    if ('deviceMemory' in navigator) {
      memoryGB = (navigator as any).deviceMemory
    }

    // Detect connection speed
    let connectionSpeed: 'slow' | 'fast' = 'fast'
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        connectionSpeed = 'slow'
      }
    }

    this.deviceCapabilities = {
      supportsWebGL: !!gl,
      supportsWebGL2: !!(canvas.getContext('webgl2')),
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsResizeObserver: 'ResizeObserver' in window,
      supportsWebP: await this.checkWebPSupport(),
      supportsAVIF: await this.checkAVIFSupport(),
      devicePixelRatio: window.devicePixelRatio || 1,
      maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
      preferredFrameRate: this.getPreferredFrameRate(),
      connectionType: connectionSpeed,
      cores: navigator.hardwareConcurrency || 4,
      memory: memoryGB,
      gpu: gpuTier
    }

    // Set initial quality based on capabilities
    this.determineInitialQuality()
  }

  private async checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => resolve(webP.height === 2)
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  private async checkAVIFSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const avif = new Image()
      avif.onload = avif.onerror = () => resolve(avif.height === 2)
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    })
  }

  private getPreferredFrameRate(): number {
    if (typeof window !== 'undefined' && 'screen' in window) {
      // @ts-ignore - experimental API
      const refreshRate = (window.screen as any).refreshRate
      if (refreshRate && refreshRate > 60) {
        return Math.min(refreshRate, 144) // Cap at 144fps
      }
    }
    return 60
  }

  private determineInitialQuality(): void {
    if (!this.deviceCapabilities) return

    let score = 0

    // GPU capabilities
    if (this.deviceCapabilities.gpu === 'high') score += 3
    else if (this.deviceCapabilities.gpu === 'medium') score += 2
    else score += 1

    // Memory
    if (this.deviceCapabilities.memory >= 8) score += 3
    else if (this.deviceCapabilities.memory >= 4) score += 2
    else score += 1

    // CPU cores
    if (this.deviceCapabilities.cores >= 8) score += 2
    else if (this.deviceCapabilities.cores >= 4) score += 1

    // WebGL support
    if (this.deviceCapabilities.supportsWebGL2) score += 2
    else if (this.deviceCapabilities.supportsWebGL) score += 1

    // High DPI
    if (this.deviceCapabilities.devicePixelRatio >= 2) score += 1

    // Connection speed
    if (this.deviceCapabilities.connectionType === 'slow') score -= 2

    // Determine quality
    if (score >= 10) {
      this.setQuality('ultra' as any)
    } else if (score >= 7) {
      this.setQuality('high')
    } else if (score >= 4) {
      this.setQuality('medium')
    } else {
      this.setQuality('low')
    }
  }

  private setupPerformanceListeners(): void {
    if (typeof window === 'undefined') return

    // Listen for performance degradation
    window.addEventListener('performance-degradation', ((event: CustomEvent) => {
      if (this.autoAdjustEnabled) {
        this.handlePerformanceDegradation(event.detail)
      }
    }) as EventListener)

    // Listen for battery changes
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const handleBatteryChange = () => {
          if (battery.level < 0.2 && !battery.charging) {
            this.setQuality('low', 'Low battery detected')
          }
        }
        
        battery.addEventListener('levelchange', handleBatteryChange)
        battery.addEventListener('chargingchange', handleBatteryChange)
      })
    }

    // Listen for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.setQuality('low', 'Reduced motion preference')
      }
    })

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden - reduce quality
        this.temporaryQualityReduction('Page hidden')
      } else {
        // Page visible - restore quality
        this.restoreQuality('Page visible')
      }
    })
  }

  private handlePerformanceDegradation(detail: { metrics: PerformanceMetrics; issues: string[] }): void {
    const now = Date.now()
    if (now - this.lastAdjustment < this.adjustmentCooldown) {
      return // Too soon to adjust again
    }

    const { issues } = detail
    let shouldDowngrade = false
    let reason = ''

    if (issues.includes('low-fps')) {
      shouldDowngrade = true
      reason = 'Low FPS detected'
    } else if (issues.includes('high-memory')) {
      shouldDowngrade = true
      reason = 'High memory usage detected'
    } else if (issues.includes('slow-render')) {
      shouldDowngrade = true
      reason = 'Slow render times detected'
    }

    if (shouldDowngrade) {
      this.downgradeQuality(reason)
    }
  }

  private downgradeQuality(reason: string): void {
    const currentLevel = this.currentQuality
    let newLevel: 'low' | 'medium' | 'high'

    if (currentLevel === 'high') {
      newLevel = 'medium'
    } else if (currentLevel === 'medium') {
      newLevel = 'low'
    } else {
      return // Already at lowest quality
    }

    this.setQuality(newLevel, reason)
  }

  private temporaryQualityReduction(reason: string): void {
    // Store current quality for restoration
    const currentQuality = this.currentQuality
    this.setQuality('low', reason)
    
    // Store for restoration
    setTimeout(() => {
      this.setQuality(currentQuality, 'Restoring previous quality')
    }, 1000)
  }

  private restoreQuality(reason: string): void {
    // Attempt to restore to a higher quality if performance allows
    if (this.currentQuality === 'low') {
      const metrics = this.performanceMonitor.getAverageMetrics(5)
      if (metrics.fps > 50 && metrics.memoryUsage < 100 * 1024 * 1024) {
        this.setQuality('medium', reason)
      }
    }
  }

  setQuality(quality: 'low' | 'medium' | 'high', reason = 'Manual adjustment'): void {
    if (this.currentQuality === quality) return

    this.currentQuality = quality
    this.lastAdjustment = Date.now()

    // Record adjustment
    this.adjustmentHistory.push({
      quality,
      timestamp: Date.now(),
      reason
    })

    // Keep only last 20 adjustments
    if (this.adjustmentHistory.length > 20) {
      this.adjustmentHistory.shift()
    }

    // Emit quality change event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('quality-change', {
        detail: { 
          quality, 
          reason,
          settings: this.getCurrentSettings()
        }
      }))
    }
  }

  getCurrentQuality(): 'low' | 'medium' | 'high' {
    return this.currentQuality
  }

  getCurrentSettings(): QualitySettings {
    const profile = this.qualityProfiles.get(this.currentQuality)
    return profile ? profile.settings : this.qualityProfiles.get('medium')!.settings
  }

  getDeviceCapabilities(): DeviceCapabilities | null {
    return this.deviceCapabilities
  }

  setAutoAdjust(enabled: boolean): void {
    this.autoAdjustEnabled = enabled
  }

  isAutoAdjustEnabled(): boolean {
    return this.autoAdjustEnabled
  }

  getAdjustmentHistory(): Array<{ quality: string; timestamp: number; reason: string }> {
    return [...this.adjustmentHistory]
  }

  getQualityProfiles(): Array<{ name: string; key: string; settings: QualitySettings }> {
    return Array.from(this.qualityProfiles.entries()).map(([key, profile]) => ({
      name: profile.name,
      key,
      settings: profile.settings
    }))
  }

  createCustomProfile(key: string, profile: QualityProfile): void {
    this.qualityProfiles.set(key, profile)
  }

  getRecommendedQuality(): 'low' | 'medium' | 'high' {
    if (!this.deviceCapabilities) return 'medium'

    const metrics = this.performanceMonitor.getAverageMetrics(10)
    
    // Check if current performance is good
    if (metrics.fps > 55 && metrics.memoryUsage < 100 * 1024 * 1024) {
      return 'high'
    } else if (metrics.fps > 40 && metrics.memoryUsage < 150 * 1024 * 1024) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  getStatistics(): {
    currentQuality: string
    deviceCapabilities: DeviceCapabilities | null
    autoAdjustEnabled: boolean
    adjustmentCount: number
    lastAdjustment: number
    recommendedQuality: string
  } {
    return {
      currentQuality: this.currentQuality,
      deviceCapabilities: this.deviceCapabilities,
      autoAdjustEnabled: this.autoAdjustEnabled,
      adjustmentCount: this.adjustmentHistory.length,
      lastAdjustment: this.lastAdjustment,
      recommendedQuality: this.getRecommendedQuality()
    }
  }
}