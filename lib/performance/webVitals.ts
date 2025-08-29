'use client'

import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals'

export interface WebVitalsMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  cls: number | null // Cumulative Layout Shift
  fid: number | null // First Input Delay
  ttfb: number | null // Time to First Byte
  timestamp: Date
  sessionId: string
  url: string
}

export interface PerformanceThresholds {
  fcp: number // Good: < 1800ms
  lcp: number // Good: < 2500ms
  cls: number // Good: < 0.1
  fid: number // Good: < 100ms
  ttfb: number // Good: < 800ms
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: 1800,
  lcp: 2500,
  cls: 0.1,
  fid: 100,
  ttfb: 800
}

export class WebVitalsCollector {
  private metrics: Partial<WebVitalsMetrics> = {}
  private sessionId: string
  private callbacks: Array<(metrics: WebVitalsMetrics) => void> = []
  private thresholds: PerformanceThresholds
  
  constructor(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS) {
    this.sessionId = this.generateSessionId()
    this.thresholds = thresholds
    this.initializeCollection()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeCollection(): void {
    // Collect metrics as they become available
    onFCP((metric) => {
      this.metrics.fcp = metric.value
      this.checkAndNotify()
    })

    onLCP((metric) => {
      this.metrics.lcp = metric.value
      this.checkAndNotify()
    })

    onCLS((metric) => {
      this.metrics.cls = metric.value
      this.checkAndNotify()
    })

    onFID((metric) => {
      this.metrics.fid = metric.value
      this.checkAndNotify()
    })

    onTTFB((metric) => {
      this.metrics.ttfb = metric.value
      this.checkAndNotify()
    })
  }

  private checkAndNotify(): void {
    // Create complete metrics object
    const completeMetrics: WebVitalsMetrics = {
      fcp: this.metrics.fcp || null,
      lcp: this.metrics.lcp || null,
      cls: this.metrics.cls || null,
      fid: this.metrics.fid || null,
      ttfb: this.metrics.ttfb || null,
      timestamp: new Date(),
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : ''
    }

    // Notify all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(completeMetrics)
      } catch (error) {
        console.error('Error in web vitals callback:', error)
      }
    })
  }

  public onMetricsUpdate(callback: (metrics: WebVitalsMetrics) => void): () => void {
    this.callbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  public async getCurrentMetrics(): Promise<WebVitalsMetrics> {
    // Return current collected metrics
    return {
      fcp: this.metrics.fcp || null,
      lcp: this.metrics.lcp || null,
      cls: this.metrics.cls || null,
      fid: this.metrics.fid || null,
      ttfb: this.metrics.ttfb || null,
      timestamp: new Date(),
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : ''
    }
  }

  public getPerformanceScore(): {
    overall: number
    scores: Record<keyof Omit<WebVitalsMetrics, 'timestamp' | 'sessionId' | 'url'>, number | null>
  } {
    const scores = {
      fcp: this.calculateScore(this.metrics.fcp || null, this.thresholds.fcp, 'lower'),
      lcp: this.calculateScore(this.metrics.lcp || null, this.thresholds.lcp, 'lower'),
      cls: this.calculateScore(this.metrics.cls || null, this.thresholds.cls, 'lower'),
      fid: this.calculateScore(this.metrics.fid || null, this.thresholds.fid, 'lower'),
      ttfb: this.calculateScore(this.metrics.ttfb || null, this.thresholds.ttfb, 'lower')
    }

    const validScores = Object.values(scores).filter(score => score !== null) as number[]
    const overall = validScores.length > 0 
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
      : 0

    return { overall, scores }
  }

  private calculateScore(value: number | null, threshold: number, direction: 'lower' | 'higher'): number | null {
    if (value === null) return null
    
    if (direction === 'lower') {
      // Lower values are better (FCP, LCP, FID, TTFB, CLS)
      if (value <= threshold) return 100
      if (value <= threshold * 1.5) return 75
      if (value <= threshold * 2) return 50
      if (value <= threshold * 3) return 25
      return 0
    } else {
      // Higher values are better
      if (value >= threshold) return 100
      if (value >= threshold * 0.75) return 75
      if (value >= threshold * 0.5) return 50
      if (value >= threshold * 0.25) return 25
      return 0
    }
  }

  public isMetricGood(metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'sessionId' | 'url'>, value: number | null): boolean {
    if (value === null) return false
    
    switch (metric) {
      case 'fcp':
        return value <= this.thresholds.fcp
      case 'lcp':
        return value <= this.thresholds.lcp
      case 'cls':
        return value <= this.thresholds.cls
      case 'fid':
        return value <= this.thresholds.fid
      case 'ttfb':
        return value <= this.thresholds.ttfb
      default:
        return false
    }
  }

  public destroy(): void {
    this.callbacks = []
    this.metrics = {}
  }
}

// Global instance
let globalCollector: WebVitalsCollector | null = null

export function getWebVitalsCollector(thresholds?: PerformanceThresholds): WebVitalsCollector {
  if (!globalCollector) {
    globalCollector = new WebVitalsCollector(thresholds)
  }
  return globalCollector
}

export function resetWebVitalsCollector(): void {
  if (globalCollector) {
    globalCollector.destroy()
    globalCollector = null
  }
}