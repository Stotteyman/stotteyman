'use client'

import { WebVitalsMetrics } from './webVitals'

export interface StoredMetrics extends WebVitalsMetrics {
  id: string
  userAgent?: string
  viewport?: {
    width: number
    height: number
  }
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
}

export interface MetricsQuery {
  startDate?: Date
  endDate?: Date
  sessionId?: string
  url?: string
  limit?: number
}

export class MetricsStorage {
  private readonly storageKey = 'webvitals_metrics'
  private readonly maxStorageSize = 1000 // Maximum number of metrics to store locally

  public async storeMetrics(metrics: WebVitalsMetrics): Promise<void> {
    try {
      const connectionInfo = this.getConnectionInfo()
      const storedMetrics: StoredMetrics = {
        ...metrics,
        id: this.generateId(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        ...(connectionInfo && { connection: connectionInfo })
      }

      // Store locally
      await this.storeLocally(storedMetrics)

      // Send to analytics endpoint if available
      await this.sendToAnalytics(storedMetrics)
    } catch (error) {
      console.error('Error storing metrics:', error)
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getConnectionInfo(): StoredMetrics['connection'] {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return {
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt
      }
    }
    return undefined
  }

  private async storeLocally(metrics: StoredMetrics): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const existing = this.getLocalMetrics()
      const updated = [...existing, metrics]

      // Keep only the most recent metrics
      if (updated.length > this.maxStorageSize) {
        updated.splice(0, updated.length - this.maxStorageSize)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to store metrics locally:', error)
    }
  }

  private getLocalMetrics(): StoredMetrics[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to retrieve local metrics:', error)
      return []
    }
  }

  private async sendToAnalytics(metrics: StoredMetrics): Promise<void> {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'web_vitals',
          data: metrics
        })
      })

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`)
      }
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics submission failed:', error)
    }
  }

  public queryMetrics(query: MetricsQuery = {}): StoredMetrics[] {
    const allMetrics = this.getLocalMetrics()
    
    return allMetrics.filter(metrics => {
      // Filter by date range
      if (query.startDate && new Date(metrics.timestamp) < query.startDate) {
        return false
      }
      if (query.endDate && new Date(metrics.timestamp) > query.endDate) {
        return false
      }

      // Filter by session ID
      if (query.sessionId && metrics.sessionId !== query.sessionId) {
        return false
      }

      // Filter by URL
      if (query.url && !metrics.url.includes(query.url)) {
        return false
      }

      return true
    }).slice(0, query.limit || 100)
  }

  public getMetricsSummary(query: MetricsQuery = {}): {
    count: number
    averages: {
      fcp: number | null
      lcp: number | null
      cls: number | null
      fid: number | null
      ttfb: number | null
    }
    medians: {
      fcp: number | null
      lcp: number | null
      cls: number | null
      fid: number | null
      ttfb: number | null
    }
  } {
    const metrics = this.queryMetrics(query)
    
    if (metrics.length === 0) {
      return {
        count: 0,
        averages: { fcp: null, lcp: null, cls: null, fid: null, ttfb: null },
        medians: { fcp: null, lcp: null, cls: null, fid: null, ttfb: null }
      }
    }

    const calculateAverage = (values: (number | null)[]): number | null => {
      const validValues = values.filter(v => v !== null) as number[]
      return validValues.length > 0 ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length : null
    }

    const calculateMedian = (values: (number | null)[]): number | null => {
      const validValues = values.filter(v => v !== null) as number[]
      if (validValues.length === 0) return null
      
      validValues.sort((a, b) => a - b)
      const mid = Math.floor(validValues.length / 2)
      return validValues.length % 2 === 0 
        ? ((validValues[mid - 1] || 0) + (validValues[mid] || 0)) / 2 
        : validValues[mid] || 0
    }

    return {
      count: metrics.length,
      averages: {
        fcp: calculateAverage(metrics.map(m => m.fcp)),
        lcp: calculateAverage(metrics.map(m => m.lcp)),
        cls: calculateAverage(metrics.map(m => m.cls)),
        fid: calculateAverage(metrics.map(m => m.fid)),
        ttfb: calculateAverage(metrics.map(m => m.ttfb))
      },
      medians: {
        fcp: calculateMedian(metrics.map(m => m.fcp)),
        lcp: calculateMedian(metrics.map(m => m.lcp)),
        cls: calculateMedian(metrics.map(m => m.cls)),
        fid: calculateMedian(metrics.map(m => m.fid)),
        ttfb: calculateMedian(metrics.map(m => m.ttfb))
      }
    }
  }

  public clearMetrics(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }

  public exportMetrics(): StoredMetrics[] {
    return this.getLocalMetrics()
  }

  public importMetrics(metrics: StoredMetrics[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(metrics))
    }
  }
}

// Global instance
let globalStorage: MetricsStorage | null = null

export function getMetricsStorage(): MetricsStorage {
  if (!globalStorage) {
    globalStorage = new MetricsStorage()
  }
  return globalStorage
}