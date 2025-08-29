/**
 * Performance type definitions for animation system
 */

export interface DeviceCapabilities {
  supportsWebGL: boolean
  supportsWebGL2?: boolean
  supportsIntersectionObserver: boolean
  supportsResizeObserver?: boolean
  supportsWebP?: boolean
  supportsAVIF?: boolean
  devicePixelRatio: number
  maxTextureSize: number
  preferredFrameRate: number
  memoryLimit: number
  cpuCores: number
  connectionType?: 'fast' | 'slow' | 'offline'
  gpu?: 'high' | 'medium' | 'low' | 'none'
}

export interface QualitySettings {
  particleCount: number
  animationComplexity: 'low' | 'medium' | 'high'
  enableWebGL: boolean
  enableAdvancedEffects: boolean
  frameRateTarget: number
  enableParallax?: boolean
  enableBlur?: boolean
  enableShadows?: boolean
  textureQuality?: 'low' | 'medium' | 'high'
  antiAliasing?: boolean
}

export interface PerformanceThresholds {
  minFPS: number
  maxMemoryUsage: number
  maxRenderTime: number
  maxAnimationCount: number
  maxParticleCount?: number
  maxTextureSize?: number
}

export interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  renderTime: number
  animationCount: number
  timestamp: number
  particleCount?: number
  textureMemory?: number
  drawCalls?: number
}

export interface PerformanceConfig {
  enableMonitoring: boolean
  sampleRate: number
  reportingInterval: number
  thresholds: PerformanceThresholds
  adaptiveQuality: boolean
  reportingEndpoint?: string
}

export interface BatteryStatus {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}

export interface NetworkInformation {
  downlink?: number
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  rtt?: number
  saveData?: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
}

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra' | 'paused'

export interface AdaptiveQualityOptions {
  initialQuality?: QualityLevel
  autoAdjust?: boolean
  thresholds?: Partial<PerformanceThresholds>
  enableBatteryOptimization?: boolean
  enableNetworkOptimization?: boolean
}

export interface PerformanceReport {
  timestamp: number
  sessionId: string
  userAgent: string
  deviceCapabilities: DeviceCapabilities
  qualityLevel: QualityLevel
  metrics: PerformanceMetrics[]
  issues: string[]
  recommendations: string[]
}