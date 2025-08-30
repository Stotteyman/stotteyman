'use client'

export interface AnimationMetrics {
  frameRate: number
  droppedFrames: number
  totalFrames: number
  averageFrameTime: number
  longestFrame: number
  jankScore: number
  timestamp: Date
}

export interface AnimationPerformanceConfig {
  targetFPS: number
  jankThreshold: number // ms
  monitoringInterval: number // ms
  maxHistorySize: number
}

export class AnimationPerformanceMonitor {
  private config: AnimationPerformanceConfig
  private isMonitoring = false
  private frameHistory: number[] = []
  private metricsHistory: AnimationMetrics[] = []
  private callbacks: Array<(metrics: AnimationMetrics) => void> = []
  private animationFrame: number | null = null
  private lastFrameTime = 0
  private frameCount = 0
  private droppedFrameCount = 0

  constructor(config: Partial<AnimationPerformanceConfig> = {}) {
    this.config = {
      targetFPS: 60,
      jankThreshold: 16.67, // 60fps = 16.67ms per frame
      monitoringInterval: 1000, // 1 second
      maxHistorySize: 100,
      ...config
    }
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastFrameTime = performance.now()
    this.frameCount = 0
    this.droppedFrameCount = 0
    this.frameHistory = []

    this.scheduleFrame()
    this.scheduleMetricsCollection()
  }

  public stopMonitoring(): void {
    this.isMonitoring = false
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  private scheduleFrame(): void {
    if (!this.isMonitoring) return

    this.animationFrame = requestAnimationFrame((currentTime) => {
      this.measureFrame(currentTime)
      this.scheduleFrame()
    })
  }

  private measureFrame(currentTime: number): void {
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime
      return
    }

    const frameTime = currentTime - this.lastFrameTime
    this.frameHistory.push(frameTime)
    this.frameCount++

    // Check for dropped frames
    if (frameTime > this.config.jankThreshold * 2) {
      this.droppedFrameCount++
    }

    // Keep frame history manageable
    if (this.frameHistory.length > this.config.targetFPS * 2) {
      this.frameHistory = this.frameHistory.slice(-this.config.targetFPS)
    }

    this.lastFrameTime = currentTime
  }

  private scheduleMetricsCollection(): void {
    if (!this.isMonitoring) return

    setTimeout(() => {
      this.collectMetrics()
      this.scheduleMetricsCollection()
    }, this.config.monitoringInterval)
  }

  private collectMetrics(): void {
    if (this.frameHistory.length === 0) return

    const totalFrameTime = this.frameHistory.reduce((sum, time) => sum + time, 0)
    const averageFrameTime = totalFrameTime / this.frameHistory.length
    const frameRate = 1000 / averageFrameTime
    const longestFrame = Math.max(...this.frameHistory)
    
    // Calculate jank score (percentage of frames that exceeded threshold)
    const jankFrames = this.frameHistory.filter(time => time > this.config.jankThreshold).length
    const jankScore = (jankFrames / this.frameHistory.length) * 100

    const metrics: AnimationMetrics = {
      frameRate: Math.round(frameRate * 100) / 100,
      droppedFrames: this.droppedFrameCount,
      totalFrames: this.frameCount,
      averageFrameTime: Math.round(averageFrameTime * 100) / 100,
      longestFrame: Math.round(longestFrame * 100) / 100,
      jankScore: Math.round(jankScore * 100) / 100,
      timestamp: new Date()
    }

    this.metricsHistory.push(metrics)

    // Keep history manageable
    if (this.metricsHistory.length > this.config.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.config.maxHistorySize)
    }

    // Notify callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(metrics)
      } catch (error) {
        console.error('Error in animation metrics callback:', error)
      }
    })

    // Reset counters for next interval
    this.frameCount = 0
    this.droppedFrameCount = 0
    this.frameHistory = []
  }

  public onMetricsUpdate(callback: (metrics: AnimationMetrics) => void): () => void {
    this.callbacks.push(callback)
    
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  public getCurrentMetrics(): AnimationMetrics | null {
    if (this.metricsHistory.length === 0) {
      return null
    }
    const lastIndex = this.metricsHistory.length - 1
    const lastMetrics = this.metricsHistory[lastIndex]
    return lastMetrics || null
  }

  public getMetricsHistory(): AnimationMetrics[] {
    return [...this.metricsHistory]
  }

  public getPerformanceScore(): number {
    const current = this.getCurrentMetrics()
    if (!current) return 100

    let score = 100

    // Deduct points for low frame rate
    const frameRateRatio = current.frameRate / this.config.targetFPS
    if (frameRateRatio < 1) {
      score -= (1 - frameRateRatio) * 50
    }

    // Deduct points for jank
    score -= current.jankScore

    // Deduct points for dropped frames
    if (current.totalFrames > 0) {
      const droppedRatio = current.droppedFrames / current.totalFrames
      score -= droppedRatio * 30
    }

    return Math.max(0, Math.round(score))
  }

  public getRecommendations(): string[] {
    const current = this.getCurrentMetrics()
    const recommendations: string[] = []

    if (!current) {
      return ['Start monitoring to get recommendations']
    }

    if (current.frameRate < this.config.targetFPS * 0.9) {
      recommendations.push('Frame rate is below target. Consider optimizing animations or reducing complexity.')
    }

    if (current.jankScore > 10) {
      recommendations.push('High jank detected. Review animation implementations for performance issues.')
    }

    if (current.longestFrame > this.config.jankThreshold * 3) {
      recommendations.push('Very long frames detected. Check for blocking operations during animations.')
    }

    if (current.droppedFrames > current.totalFrames * 0.05) {
      recommendations.push('High number of dropped frames. Consider reducing animation complexity.')
    }

    if (recommendations.length === 0) {
      recommendations.push('Animation performance is good!')
    }

    return recommendations
  }

  public updateConfig(updates: Partial<AnimationPerformanceConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  public getConfig(): AnimationPerformanceConfig {
    return { ...this.config }
  }

  public clearHistory(): void {
    this.metricsHistory = []
  }

  public exportMetrics(): string {
    return JSON.stringify({
      config: this.config,
      metrics: this.metricsHistory
    }, null, 2)
  }
}

// Adaptive quality manager for animations
export class AdaptiveAnimationQuality {
  private monitor: AnimationPerformanceMonitor
  private qualityLevel: 'high' | 'medium' | 'low' = 'high'
  private callbacks: Array<(quality: string) => void> = []

  constructor(monitor: AnimationPerformanceMonitor) {
    this.monitor = monitor
    this.setupMonitoring()
  }

  private setupMonitoring(): void {
    this.monitor.onMetricsUpdate((metrics) => {
      const newQuality = this.determineQuality(metrics)
      if (newQuality !== this.qualityLevel) {
        this.qualityLevel = newQuality
        this.notifyQualityChange()
      }
    })
  }

  private determineQuality(metrics: AnimationMetrics): 'high' | 'medium' | 'low' {
    const score = this.monitor.getPerformanceScore()

    if (score >= 80 && metrics.frameRate >= 55) {
      return 'high'
    } else if (score >= 60 && metrics.frameRate >= 45) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  private notifyQualityChange(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.qualityLevel)
      } catch (error) {
        console.error('Error in quality change callback:', error)
      }
    })
  }

  public onQualityChange(callback: (quality: string) => void): () => void {
    this.callbacks.push(callback)
    
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  public getCurrentQuality(): 'high' | 'medium' | 'low' {
    return this.qualityLevel
  }

  public getQualitySettings(): {
    particleCount: number
    animationComplexity: 'high' | 'medium' | 'low'
    enableBlur: boolean
    enableShadows: boolean
    enableTransforms: boolean
  } {
    switch (this.qualityLevel) {
      case 'high':
        return {
          particleCount: 100,
          animationComplexity: 'high',
          enableBlur: true,
          enableShadows: true,
          enableTransforms: true
        }
      case 'medium':
        return {
          particleCount: 50,
          animationComplexity: 'medium',
          enableBlur: true,
          enableShadows: false,
          enableTransforms: true
        }
      case 'low':
        return {
          particleCount: 20,
          animationComplexity: 'low',
          enableBlur: false,
          enableShadows: false,
          enableTransforms: false
        }
    }
  }
}

// Global instances
let globalAnimationMonitor: AnimationPerformanceMonitor | null = null
let globalAdaptiveQuality: AdaptiveAnimationQuality | null = null

export function getAnimationMonitor(config?: Partial<AnimationPerformanceConfig>): AnimationPerformanceMonitor {
  if (!globalAnimationMonitor) {
    globalAnimationMonitor = new AnimationPerformanceMonitor(config)
  }
  return globalAnimationMonitor
}

export function getAdaptiveQuality(): AdaptiveAnimationQuality {
  const monitor = getAnimationMonitor()
  if (!globalAdaptiveQuality) {
    globalAdaptiveQuality = new AdaptiveAnimationQuality(monitor)
  }
  return globalAdaptiveQuality
}