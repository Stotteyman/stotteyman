'use client'

import { useEffect, useState, useCallback } from 'react'
import { WebVitalsMetrics } from '@/lib/performance/webVitals'
import { getMetricsStorage } from '@/lib/performance/metricsStorage'

export interface RegressionDetection {
  metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'sessionId' | 'url'>
  currentValue: number
  baselineValue: number
  percentageChange: number
  isRegression: boolean
  severity: 'minor' | 'moderate' | 'severe'
  confidence: number
}

export interface RegressionConfig {
  baselineDays: number
  minSamples: number
  regressionThreshold: number // Percentage increase to consider regression
  severityThresholds: {
    minor: number
    moderate: number
    severe: number
  }
}

const DEFAULT_CONFIG: RegressionConfig = {
  baselineDays: 7,
  minSamples: 10,
  regressionThreshold: 10, // 10% increase
  severityThresholds: {
    minor: 15,   // 15% increase
    moderate: 30, // 30% increase
    severe: 50    // 50% increase
  }
}

export function usePerformanceRegression(
  currentMetrics: WebVitalsMetrics | null,
  config: Partial<RegressionConfig> = {}
) {
  const [regressions, setRegressions] = useState<RegressionDetection[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [baseline, setBaseline] = useState<Record<string, number> | null>(null)

  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  const storage = getMetricsStorage()

  const calculateBaseline = useCallback(async () => {
    setIsAnalyzing(true)
    
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - fullConfig.baselineDays)

      const historicalMetrics = storage.queryMetrics({
        startDate,
        endDate,
        limit: 1000
      })

      if (historicalMetrics.length < fullConfig.minSamples) {
        setBaseline(null)
        return
      }

      // Calculate baseline values (median of historical data)
      const baselineValues: Record<string, number> = {}
      const metrics = ['fcp', 'lcp', 'cls', 'fid', 'ttfb'] as const

      metrics.forEach(metric => {
        const values = historicalMetrics
          .map(m => m[metric])
          .filter(v => v !== null && v !== undefined) as number[]

        if (values.length >= fullConfig.minSamples) {
          values.sort((a, b) => a - b)
          const mid = Math.floor(values.length / 2)
          baselineValues[metric] = values.length % 2 === 0
            ? (values[mid - 1] + values[mid]) / 2
            : values[mid]
        }
      })

      setBaseline(baselineValues)
    } catch (error) {
      console.error('Error calculating baseline:', error)
      setBaseline(null)
    } finally {
      setIsAnalyzing(false)
    }
  }, [fullConfig.baselineDays, fullConfig.minSamples, storage])

  const detectRegressions = useCallback(() => {
    if (!currentMetrics || !baseline) {
      setRegressions([])
      return
    }

    const detectedRegressions: RegressionDetection[] = []
    const metrics = ['fcp', 'lcp', 'cls', 'fid', 'ttfb'] as const

    metrics.forEach(metric => {
      const currentValue = currentMetrics[metric]
      const baselineValue = baseline[metric]

      if (currentValue === null || currentValue === undefined || !baselineValue) {
        return
      }

      const percentageChange = ((currentValue - baselineValue) / baselineValue) * 100
      const isRegression = percentageChange > fullConfig.regressionThreshold

      if (isRegression) {
        let severity: 'minor' | 'moderate' | 'severe' = 'minor'
        if (percentageChange > fullConfig.severityThresholds.severe) {
          severity = 'severe'
        } else if (percentageChange > fullConfig.severityThresholds.moderate) {
          severity = 'moderate'
        }

        // Calculate confidence based on sample size and consistency
        const confidence = Math.min(95, 50 + (percentageChange / 2))

        detectedRegressions.push({
          metric,
          currentValue,
          baselineValue,
          percentageChange,
          isRegression,
          severity,
          confidence
        })
      }
    })

    setRegressions(detectedRegressions)
  }, [currentMetrics, baseline, fullConfig])

  // Calculate baseline on mount and when config changes
  useEffect(() => {
    calculateBaseline()
  }, [calculateBaseline])

  // Detect regressions when metrics or baseline changes
  useEffect(() => {
    detectRegressions()
  }, [detectRegressions])

  const refreshBaseline = useCallback(() => {
    calculateBaseline()
  }, [calculateBaseline])

  const getMetricTrend = useCallback((metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'sessionId' | 'url'>) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - fullConfig.baselineDays)

    const historicalMetrics = storage.queryMetrics({
      startDate,
      endDate,
      limit: 1000
    })

    const values = historicalMetrics
      .map(m => ({ value: m[metric], timestamp: new Date(m.timestamp) }))
      .filter(v => v.value !== null && v.value !== undefined)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    if (values.length < 2) return null

    // Simple linear regression to determine trend
    const n = values.length
    const sumX = values.reduce((sum, _, i) => sum + i, 0)
    const sumY = values.reduce((sum, v) => sum + (v.value as number), 0)
    const sumXY = values.reduce((sum, v, i) => sum + i * (v.value as number), 0)
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return {
      slope,
      intercept,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      values: values.map(v => v.value as number)
    }
  }, [fullConfig.baselineDays, storage])

  const getInsights = useCallback(() => {
    const insights: string[] = []

    if (regressions.length === 0) {
      insights.push('No performance regressions detected')
    } else {
      const severeCount = regressions.filter(r => r.severity === 'severe').length
      const moderateCount = regressions.filter(r => r.severity === 'moderate').length
      const minorCount = regressions.filter(r => r.severity === 'minor').length

      if (severeCount > 0) {
        insights.push(`${severeCount} severe performance regression${severeCount > 1 ? 's' : ''} detected`)
      }
      if (moderateCount > 0) {
        insights.push(`${moderateCount} moderate performance regression${moderateCount > 1 ? 's' : ''} detected`)
      }
      if (minorCount > 0) {
        insights.push(`${minorCount} minor performance regression${minorCount > 1 ? 's' : ''} detected`)
      }

      // Most problematic metric
      const worstRegression = regressions.reduce((worst, current) => 
        current.percentageChange > worst.percentageChange ? current : worst
      )
      
      insights.push(`${worstRegression.metric.toUpperCase()} shows the largest regression (${worstRegression.percentageChange.toFixed(1)}% increase)`)
    }

    return insights
  }, [regressions])

  return {
    regressions,
    baseline,
    isAnalyzing,
    refreshBaseline,
    getMetricTrend,
    getInsights,
    hasRegressions: regressions.length > 0,
    severeRegressions: regressions.filter(r => r.severity === 'severe'),
    moderateRegressions: regressions.filter(r => r.severity === 'moderate'),
    minorRegressions: regressions.filter(r => r.severity === 'minor')
  }
}