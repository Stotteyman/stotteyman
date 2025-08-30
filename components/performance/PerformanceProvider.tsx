'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_THRESHOLDS } from '@/lib/performance/webVitals'
import type { WebVitalsMetrics, PerformanceThresholds } from '@/lib/performance/webVitals'
import { useWebVitals } from '@/hooks/useWebVitals'

interface PerformanceContextType {
  metrics: WebVitalsMetrics | null
  isLoading: boolean
  performanceScore: {
    overall: number
    scores: Record<string, number | null>
  }
  thresholds: PerformanceThresholds
  refreshMetrics: () => Promise<void>
  isMonitoring: boolean
  startMonitoring: () => void
  stopMonitoring: () => void
}

const PerformanceContext = createContext<PerformanceContextType | null>(null)

interface PerformanceProviderProps {
  children: React.ReactNode
  thresholds?: PerformanceThresholds
  autoStart?: boolean
}

export function PerformanceProvider({ 
  children, 
  thresholds = DEFAULT_THRESHOLDS,
  autoStart = true 
}: PerformanceProviderProps) {
  const [isMonitoring, setIsMonitoring] = useState(autoStart)
  
  const {
    metrics,
    isLoading,
    performanceScore,
    refreshMetrics
  } = useWebVitals({
    thresholds,
    autoStore: isMonitoring,
    onMetricsUpdate: (metrics) => {
      // Log significant performance issues
      if (metrics.lcp && metrics.lcp > thresholds.lcp * 2) {
        console.warn('Poor LCP detected:', metrics.lcp)
      }
      if (metrics.cls && metrics.cls > thresholds.cls * 2) {
        console.warn('Poor CLS detected:', metrics.cls)
      }
      if (metrics.fid && metrics.fid > thresholds.fid * 2) {
        console.warn('Poor FID detected:', metrics.fid)
      }
    }
  })

  const startMonitoring = () => {
    setIsMonitoring(true)
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  // Auto-refresh metrics periodically when monitoring
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      refreshMetrics().catch(console.error)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [isMonitoring, refreshMetrics])

  const contextValue: PerformanceContextType = {
    metrics,
    isLoading,
    performanceScore,
    thresholds,
    refreshMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance(): PerformanceContextType {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// Performance monitoring component that can be dropped anywhere
export function PerformanceMonitor({ 
  showAlerts = true,
  className = '' 
}: { 
  showAlerts?: boolean
  className?: string 
}) {
  const { metrics, performanceScore, isLoading } = usePerformance()

  if (isLoading || !metrics) {
    return null
  }

  const hasIssues = performanceScore.overall < 75

  if (!showAlerts || !hasIssues) {
    return null
  }

  return (
    <div className={`performance-monitor ${className}`}>
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <span className="text-yellow-400 font-medium">Performance Alert</span>
        </div>
        <p className="text-sm text-gray-300">
          Performance score: {Math.round(performanceScore.overall)}/100
        </p>
        <div className="mt-2 text-xs text-gray-400">
          {metrics.lcp && metrics.lcp > 2500 && (
            <div>• LCP: {Math.round(metrics.lcp)}ms (target: &lt;2500ms)</div>
          )}
          {metrics.fcp && metrics.fcp > 1800 && (
            <div>• FCP: {Math.round(metrics.fcp)}ms (target: &lt;1800ms)</div>
          )}
          {metrics.cls && metrics.cls > 0.1 && (
            <div>• CLS: {metrics.cls.toFixed(3)} (target: &lt;0.1)</div>
          )}
          {metrics.fid && metrics.fid > 100 && (
            <div>• FID: {Math.round(metrics.fid)}ms (target: &lt;100ms)</div>
          )}
        </div>
      </div>
    </div>
  )
}