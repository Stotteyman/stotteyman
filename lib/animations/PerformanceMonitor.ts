import { PerformanceMetrics, PerformanceThresholds, AnimationConfig } from '@/types/animations'

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private thresholds: PerformanceThresholds = {
    minFPS: 30,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxRenderTime: 16.67, // 60fps = 16.67ms per frame
    maxAnimationCount: 50 // Maximum concurrent animations
  }
  private animationTracking: Map<string, { startTime: number; config: AnimationConfig }> = new Map()
  private frameCount = 0
  private lastFrameTime = 0
  private fpsHistory: number[] = []
  private isMonitoring = false

  constructor() {
    this.startMonitoring()
  }

  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return
    
    this.isMonitoring = true
    this.lastFrameTime = performance.now()
    this.measureFrame()
  }

  private measureFrame(): void {
    if (!this.isMonitoring) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastFrameTime
    
    if (deltaTime > 0) {
      const fps = 1000 / deltaTime
      this.fpsHistory.push(fps)
      
      // Keep only last 60 frames for rolling average
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift()
      }
    }

    this.frameCount++
    this.lastFrameTime = currentTime

    // Collect metrics every 60 frames (roughly 1 second at 60fps)
    if (this.frameCount % 60 === 0) {
      this.collectMetrics()
    }

    requestAnimationFrame(() => this.measureFrame())
  }

  private collectMetrics(): void {
    const currentTime = performance.now()
    const averageFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length
    
    let memoryUsage = 0
    if (window.performance && (window.performance as any).memory) {
      memoryUsage = (window.performance as any).memory.usedJSHeapSize
    }

    const metrics: PerformanceMetrics = {
      fps: Math.round(averageFPS * 100) / 100,
      memoryUsage,
      renderTime: 1000 / averageFPS, // ms per frame
      animationCount: this.animationTracking.size,
      timestamp: currentTime
    }

    this.metrics.push(metrics)
    
    // Keep only last 100 metric samples
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }

    // Check thresholds and take action if needed
    this.checkThresholds(metrics)

    // Report to analytics if configured
    this.reportMetrics(metrics)
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    const issues: string[] = []

    if (metrics.fps < this.thresholds.minFPS) {
      issues.push(`Low FPS: ${metrics.fps}`)
    }

    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      issues.push(`High memory usage: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`)
    }

    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      issues.push(`Slow render time: ${metrics.renderTime.toFixed(2)}ms`)
    }

    if (issues.length > 0) {
      console.warn('Performance issues detected:', issues)
      this.triggerPerformanceDegradation(metrics)
    }
  }

  private triggerPerformanceDegradation(metrics: PerformanceMetrics): void {
    // Emit custom event for performance degradation
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performance-degradation', {
        detail: { metrics, issues: this.getPerformanceIssues(metrics) }
      }))
    }
  }

  private getPerformanceIssues(metrics: PerformanceMetrics): string[] {
    const issues: string[] = []
    
    if (metrics.fps < this.thresholds.minFPS) {
      issues.push('low-fps')
    }
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      issues.push('high-memory')
    }
    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      issues.push('slow-render')
    }
    
    return issues
  }

  private async reportMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Only report in production and occasionally to avoid spam
      if (process.env.NODE_ENV === 'production' && Math.random() < 0.1) {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'performance_metric',
            data: metrics
          })
        })
      }
    } catch (error) {
      // Silently fail - don't let analytics break the app
    }
  }

  trackAnimation(animationId: string, config: AnimationConfig): void {
    this.animationTracking.set(animationId, {
      startTime: performance.now(),
      config
    })
  }

  onAnimationComplete(animationId: string): void {
    const tracking = this.animationTracking.get(animationId)
    if (tracking) {
      const duration = performance.now() - tracking.startTime
      console.log(`Animation ${animationId} completed in ${duration.toFixed(2)}ms`)
      this.animationTracking.delete(animationId)
    }
  }

  getMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        fps: 60,
        memoryUsage: 0,
        renderTime: 16.67,
        animationCount: 0,
        timestamp: performance.now()
      }
    }
    
    const lastMetric = this.metrics[this.metrics.length - 1]
    return lastMetric!
  }

  getAverageMetrics(sampleCount = 10): PerformanceMetrics {
    const recentMetrics = this.metrics.slice(-sampleCount)
    
    if (recentMetrics.length === 0) {
      return this.getMetrics()
    }

    const averages = recentMetrics.reduce(
      (acc, metric) => ({
        fps: acc.fps + metric.fps,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        renderTime: acc.renderTime + metric.renderTime,
        animationCount: acc.animationCount + metric.animationCount,
        timestamp: Math.max(acc.timestamp, metric.timestamp)
      }),
      { fps: 0, memoryUsage: 0, renderTime: 0, animationCount: 0, timestamp: 0 }
    )

    const count = recentMetrics.length
    return {
      fps: Math.round((averages.fps / count) * 100) / 100,
      memoryUsage: Math.round(averages.memoryUsage / count),
      renderTime: Math.round((averages.renderTime / count) * 100) / 100,
      animationCount: Math.round(averages.animationCount / count),
      timestamp: averages.timestamp
    }
  }

  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  stopMonitoring(): void {
    this.isMonitoring = false
  }

  reset(): void {
    this.metrics = []
    this.fpsHistory = []
    this.frameCount = 0
    this.animationTracking.clear()
  }
}