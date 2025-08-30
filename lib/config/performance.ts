/**
 * Performance Configuration for Next.js 15.5.0
 * Enhanced monitoring and optimization settings
 */

export interface PerformanceConfig {
  monitoring: {
    enabled: boolean
    sampleRate: number
    reportingEndpoint?: string
  }
  thresholds: {
    fcp: number // First Contentful Paint
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
    ttfb: number // Time to First Byte
    inp: number // Interaction to Next Paint
  }
  optimization: {
    enableImageOptimization: boolean
    enableFontOptimization: boolean
    enableBundleAnalysis: boolean
    enableTreeShaking: boolean
    enableCodeSplitting: boolean
  }
  caching: {
    staticAssetsTTL: number
    apiResponsesTTL: number
    imageCacheTTL: number
  }
  animations: {
    maxConcurrentAnimations: number
    performanceMode: 'high' | 'balanced' | 'battery-saver'
    adaptiveQuality: boolean
  }
}

export const defaultPerformanceConfig: PerformanceConfig = {
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    sampleRate: 0.1, // 10% sampling rate
    ...(process.env['PERFORMANCE_ENDPOINT'] && { reportingEndpoint: process.env['PERFORMANCE_ENDPOINT'] }),
  },
  thresholds: {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    ttfb: 800, // 800ms
    inp: 200,  // 200ms
  },
  optimization: {
    enableImageOptimization: true,
    enableFontOptimization: true,
    enableBundleAnalysis: process.env.NODE_ENV === 'development',
    enableTreeShaking: true,
    enableCodeSplitting: true,
  },
  caching: {
    staticAssetsTTL: 31536000, // 1 year
    apiResponsesTTL: 300,      // 5 minutes
    imageCacheTTL: 2592000,    // 30 days
  },
  animations: {
    maxConcurrentAnimations: 5,
    performanceMode: 'balanced',
    adaptiveQuality: true,
  },
}

/**
 * Get performance configuration based on environment
 */
export function getPerformanceConfig(): PerformanceConfig {
  const config = { ...defaultPerformanceConfig }

  // Adjust for development environment
  if (process.env.NODE_ENV === 'development') {
    config.monitoring.enabled = false
    config.thresholds.fcp = 3000
    config.thresholds.lcp = 4000
    config.animations.performanceMode = 'high'
  }

  // Adjust for production environment
  if (process.env.NODE_ENV === 'production') {
    config.optimization.enableBundleAnalysis = false
    config.animations.performanceMode = 'balanced'
  }

  return config
}

/**
 * Performance budget configuration for Next.js 15.5.0
 */
export const performanceBudget = {
  // Bundle size limits
  maxBundleSize: 250 * 1024, // 250KB
  maxChunkSize: 100 * 1024,  // 100KB
  maxAssetSize: 500 * 1024,  // 500KB

  // Runtime performance limits
  maxRenderTime: 16,  // 16ms (60fps)
  maxMemoryUsage: 50, // 50MB
  maxCPUUsage: 80,    // 80%

  // Network performance limits
  maxRequestCount: 50,
  maxTransferSize: 1024 * 1024, // 1MB
  maxResourceSize: 500 * 1024,  // 500KB
}

/**
 * Feature flags for performance optimizations
 */
export const performanceFeatures = {
  // Next.js 15.5.0 specific features
  enableTurbopack: process.env.NODE_ENV === 'development',
  enableReactCompiler: process.env.NODE_ENV === 'production',
  enableStaticOptimization: true,
  enableIncrementalStaticRegeneration: true,

  // Animation optimizations
  enableWebGLAcceleration: true,
  enableGPUAcceleration: true,
  enableAnimationBatching: true,
  enableIntersectionObserver: true,

  // Caching optimizations
  enableServiceWorker: false, // Disabled for now
  enableMemoryCache: true,
  enableDiskCache: true,
  enableCDNCache: true,

  // Image optimizations
  enableAVIFSupport: true,
  enableWebPSupport: true,
  enableResponsiveImages: true,
  enableImagePreloading: true,
}