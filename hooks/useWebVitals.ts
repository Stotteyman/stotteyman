'use client'

import { useEffect, useState, useCallback } from 'react'
import { WebVitalsMetrics, WebVitalsCollector, getWebVitalsCollector, PerformanceThresholds } from '@/lib/performance/webVitals'
import { getMetricsStorage } from '@/lib/performance/metricsStorage'

export interface UseWebVitalsOptions {
  thresholds?: PerformanceThresholds
  autoStore?: boolean
  onMetricsUpdate?: (metrics: WebVitalsMetrics) => void
}

export interface WebVitalsHookReturn {
  metrics: WebVitalsMetrics | null
  isLoading: boolean
  performanceScore: {
    overall: number
    scores: Record<string, number | null>
  }
  collector: WebVitalsCollector | null
  refreshMetrics: () => Promise<void>
}

export function useWebVitals(options: UseWebVitalsOptions = {}): WebVitalsHookReturn {
  const {
    thresholds,
    autoStore = true,
    onMetricsUpdate
  } = options

  const [metrics, setMetrics] = useState<WebVitalsMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [collector, setCollector] = useState<WebVitalsCollector | null>(null)
  const [performanceScore, setPerformanceScore] = useState({
    overall: 0,
    scores: {}
  })

  const storage = getMetricsStorage()

  const updateMetrics = useCallback((newMetrics: WebVitalsMetrics) => {
    setMetrics(newMetrics)
    setIsLoading(false)

    // Auto-store metrics if enabled
    if (autoStore) {
      storage.storeMetrics(newMetrics).catch(console.error)
    }

    // Call custom callback
    onMetricsUpdate?.(newMetrics)
  }, [autoStore, storage, onMetricsUpdate])

  const refreshMetrics = useCallback(async () => {
    if (!collector) return

    setIsLoading(true)
    try {
      const currentMetrics = await collector.getCurrentMetrics()
      updateMetrics(currentMetrics)
    } catch (error) {
      console.error('Error refreshing metrics:', error)
      setIsLoading(false)
    }
  }, [collector, updateMetrics])

  useEffect(() => {
    // Initialize collector
    const webVitalsCollector = getWebVitalsCollector(thresholds)
    setCollector(webVitalsCollector)

    // Subscribe to metrics updates
    const unsubscribe = webVitalsCollector.onMetricsUpdate(updateMetrics)

    // Get initial metrics
    webVitalsCollector.getCurrentMetrics()
      .then(updateMetrics)
      .catch((error) => {
        console.error('Error getting initial metrics:', error)
        setIsLoading(false)
      })

    return () => {
      unsubscribe()
    }
  }, [thresholds, updateMetrics])

  // Update performance score when metrics change
  useEffect(() => {
    if (collector && metrics) {
      const score = collector.getPerformanceScore()
      setPerformanceScore(score)
    }
  }, [collector, metrics])

  return {
    metrics,
    isLoading,
    performanceScore,
    collector,
    refreshMetrics
  }
}

// Hook for getting historical metrics
export function useMetricsHistory(days: number = 7) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const storage = getMetricsStorage()

  useEffect(() => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const metrics = storage.queryMetrics({
      startDate,
      limit: 1000
    })

    setHistory(metrics)
    setIsLoading(false)
  }, [days, storage])

  return { history, isLoading }
}

// Hook for performance alerts
export function usePerformanceAlerts(thresholds?: PerformanceThresholds) {
  const [alerts, setAlerts] = useState<Array<{
    metric: string
    value: number
    threshold: number
    severity: 'warning' | 'error'
    timestamp: Date
  }>>([])

  const { metrics, collector } = useWebVitals(thresholds ? { thresholds } : {})

  useEffect(() => {
    if (!metrics || !collector) return

    const newAlerts: typeof alerts = []

    // Check each metric against thresholds
    Object.entries(metrics).forEach(([key, value]) => {
      if (key === 'timestamp' || key === 'sessionId' || key === 'url' || value === null) return

      const metricKey = key as keyof Omit<WebVitalsMetrics, 'timestamp' | 'sessionId' | 'url'>
      const isGood = collector.isMetricGood(metricKey, value)

      if (!isGood) {
        const threshold = thresholds?.[metricKey] || 0
        const severity = value > threshold * 2 ? 'error' : 'warning'

        newAlerts.push({
          metric: key,
          value,
          threshold,
          severity,
          timestamp: new Date()
        })
      }
    })

    setAlerts(newAlerts)
  }, [metrics, collector, thresholds])

  return alerts
}