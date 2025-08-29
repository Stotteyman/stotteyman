'use client'

import { lazy, ComponentType, LazyExoticComponent } from 'react'

export interface CodeSplittingConfig {
  routeBasedSplitting: boolean
  componentBasedSplitting: boolean
  vendorSplitting: boolean
  dynamicImportThreshold: number // Size in bytes
  preloadCriticalRoutes: string[]
  lazyLoadRoutes: string[]
}

export interface LazyComponentOptions {
  fallback?: ComponentType
  preload?: boolean
  chunkName?: string
  webpackChunkName?: string
}

export class CodeSplittingManager {
  private config: CodeSplittingConfig
  private loadedChunks = new Set<string>()
  private preloadedChunks = new Set<string>()
  private componentCache = new Map<string, LazyExoticComponent<any>>()

  constructor(config: Partial<CodeSplittingConfig> = {}) {
    this.config = {
      routeBasedSplitting: true,
      componentBasedSplitting: true,
      vendorSplitting: true,
      dynamicImportThreshold: 50 * 1024, // 50KB
      preloadCriticalRoutes: ['/'],
      lazyLoadRoutes: ['/about', '/contact', '/blog'],
      ...config
    }
  }

  /**
   * Create a lazy-loaded component with advanced options
   */
  public createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: LazyComponentOptions = {}
  ): LazyExoticComponent<T> {
    const { fallback, preload = false, chunkName, webpackChunkName } = options

    // Create cache key
    const cacheKey = chunkName || importFn.toString()
    
    // Return cached component if exists
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey)!
    }

    // Enhance import function with chunk naming
    const enhancedImportFn = webpackChunkName 
      ? () => import(/* webpackChunkName: "[request]" */ `${webpackChunkName}`)
      : importFn

    // Create lazy component
    const LazyComponent = lazy(enhancedImportFn as any)

    // Preload if requested
    if (preload) {
      this.preloadComponent(enhancedImportFn, cacheKey)
    }

    // Cache the component
    this.componentCache.set(cacheKey, LazyComponent)

    return LazyComponent
  }

  /**
   * Preload a component without rendering it
   */
  public async preloadComponent(
    importFn: () => Promise<any>,
    chunkName?: string
  ): Promise<void> {
    const key = chunkName || importFn.toString()
    
    if (this.preloadedChunks.has(key)) {
      return
    }

    try {
      await importFn()
      this.preloadedChunks.add(key)
    } catch (error) {
      console.warn('Failed to preload component:', error)
    }
  }

  /**
   * Preload critical route components
   */
  public async preloadCriticalRoutes(): Promise<void> {
    const preloadPromises = this.config.preloadCriticalRoutes.map(route => 
      this.preloadRouteComponent(route)
    )

    await Promise.allSettled(preloadPromises)
  }

  /**
   * Preload a specific route component
   */
  public async preloadRouteComponent(route: string): Promise<void> {
    try {
      // This would be customized based on your routing structure
      const componentPath = this.getComponentPathForRoute(route)
      if (componentPath) {
        await import(componentPath)
        this.preloadedChunks.add(route)
      }
    } catch (error) {
      console.warn(`Failed to preload route ${route}:`, error)
    }
  }

  /**
   * Create a route-based lazy component
   */
  public createLazyRoute(
    route: string,
    importFn: () => Promise<any>,
    options: LazyComponentOptions = {}
  ) {
    const shouldLazyLoad = this.config.lazyLoadRoutes.includes(route) ||
                          !this.config.preloadCriticalRoutes.includes(route)

    if (!shouldLazyLoad) {
      // For critical routes, preload immediately
      this.preloadComponent(importFn, route)
    }

    return this.createLazyComponent(importFn, {
      ...options,
      chunkName: route,
      preload: !shouldLazyLoad
    })
  }

  /**
   * Dynamically import a module with size checking
   */
  public async dynamicImport<T = any>(
    importFn: () => Promise<T>,
    options: {
      threshold?: number
      fallback?: () => T
      timeout?: number
    } = {}
  ): Promise<T> {
    const { 
      threshold = this.config.dynamicImportThreshold,
      fallback,
      timeout = 10000 
    } = options

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Import timeout')), timeout)
      })

      // Race between import and timeout
      const result = await Promise.race([importFn(), timeoutPromise])
      
      return result
    } catch (error) {
      console.warn('Dynamic import failed:', error)
      
      if (fallback) {
        return fallback()
      }
      
      throw error
    }
  }

  /**
   * Get webpack chunk loading stats
   */
  public getChunkStats(): {
    loadedChunks: number
    preloadedChunks: number
    totalChunks: number
    loadingErrors: string[]
  } {
    // Access webpack chunk loading stats if available
    const webpackStats = (window as any).__webpack_require__?.cache || {}
    const totalChunks = Object.keys(webpackStats).length

    return {
      loadedChunks: this.loadedChunks.size,
      preloadedChunks: this.preloadedChunks.size,
      totalChunks,
      loadingErrors: [] // Would be populated from actual webpack errors
    }
  }

  /**
   * Optimize chunk loading based on user behavior
   */
  public optimizeChunkLoading(): void {
    // Preload chunks based on user interaction patterns
    this.setupIntersectionObserver()
    this.setupHoverPreloading()
    this.setupIdlePreloading()
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            const preloadRoute = element.dataset.preloadRoute
            
            if (preloadRoute && !this.preloadedChunks.has(preloadRoute)) {
              this.preloadRouteComponent(preloadRoute)
            }
          }
        })
      },
      { rootMargin: '50px' }
    )

    // Observe elements with data-preload-route attribute
    document.querySelectorAll('[data-preload-route]').forEach(el => {
      observer.observe(el)
    })
  }

  private setupHoverPreloading(): void {
    if (typeof window === 'undefined') return

    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href) {
        const route = new URL(link.href).pathname
        if (this.config.lazyLoadRoutes.includes(route)) {
          this.preloadRouteComponent(route)
        }
      }
    })
  }

  private setupIdlePreloading(): void {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) {
      return
    }

    const preloadIdleChunks = () => {
      const unloadedRoutes = this.config.lazyLoadRoutes.filter(
        route => !this.preloadedChunks.has(route)
      )

      if (unloadedRoutes.length > 0) {
        const route = unloadedRoutes[0]
        this.preloadRouteComponent(route).then(() => {
          // Schedule next preload
          if (unloadedRoutes.length > 1) {
            requestIdleCallback(preloadIdleChunks)
          }
        })
      }
    }

    requestIdleCallback(preloadIdleChunks)
  }

  private getComponentPathForRoute(route: string): string | null {
    // Map routes to component paths
    const routeMap: Record<string, string> = {
      '/': './app/page',
      '/about': './app/about/page',
      '/contact': './app/contact/page',
      '/ventures': './app/ventures/page',
      '/blog': './app/blog/page',
      '/livestream': './app/livestream/page'
    }

    return routeMap[route] || null
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<CodeSplittingConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Get current configuration
   */
  public getConfig(): CodeSplittingConfig {
    return { ...this.config }
  }

  /**
   * Clear caches
   */
  public clearCaches(): void {
    this.loadedChunks.clear()
    this.preloadedChunks.clear()
    this.componentCache.clear()
  }

  /**
   * Get performance insights
   */
  public getPerformanceInsights(): {
    cacheHitRate: number
    averageLoadTime: number
    failedImports: number
    recommendations: string[]
  } {
    const stats = this.getChunkStats()
    const cacheHitRate = stats.totalChunks > 0 
      ? (stats.preloadedChunks / stats.totalChunks) * 100 
      : 0

    const recommendations: string[] = []

    if (cacheHitRate < 50) {
      recommendations.push('Consider preloading more critical components')
    }

    if (stats.loadingErrors.length > 0) {
      recommendations.push('Investigate and fix chunk loading errors')
    }

    if (this.config.lazyLoadRoutes.length < 3) {
      recommendations.push('Consider lazy loading more non-critical routes')
    }

    return {
      cacheHitRate,
      averageLoadTime: 0, // Would be calculated from actual metrics
      failedImports: stats.loadingErrors.length,
      recommendations
    }
  }
}

// Global instance
let globalCodeSplittingManager: CodeSplittingManager | null = null

export function getCodeSplittingManager(config?: Partial<CodeSplittingConfig>): CodeSplittingManager {
  if (!globalCodeSplittingManager) {
    globalCodeSplittingManager = new CodeSplittingManager(config)
  }
  return globalCodeSplittingManager
}

// Utility functions for common patterns
export function createLazyPage(importFn: () => Promise<any>, chunkName?: string) {
  const manager = getCodeSplittingManager()
  return manager.createLazyComponent(importFn, { chunkName })
}

export function preloadRoute(route: string) {
  const manager = getCodeSplittingManager()
  return manager.preloadRouteComponent(route)
}

export function optimizeChunkLoading() {
  const manager = getCodeSplittingManager()
  manager.optimizeChunkLoading()
}