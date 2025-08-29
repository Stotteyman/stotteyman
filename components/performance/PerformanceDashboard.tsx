'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Clock, 
  Zap, 
  Eye, 
  Gauge, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { usePerformance } from './PerformanceProvider'
import { useMetricsHistory } from '@/hooks/useWebVitals'

interface MetricCardProps {
  title: string
  value: number | null
  unit: string
  threshold: number
  icon: React.ReactNode
  description: string
}

function MetricCard({ title, value, unit, threshold, icon, description }: MetricCardProps) {
  const getStatus = () => {
    if (value === null) return 'loading'
    if (value <= threshold) return 'good'
    if (value <= threshold * 1.5) return 'needs-improvement'
    return 'poor'
  }

  const status = getStatus()
  
  const statusColors = {
    loading: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    good: 'text-green-400 bg-green-500/10 border-green-500/20',
    'needs-improvement': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    poor: 'text-red-400 bg-red-500/10 border-red-500/20'
  }

  const statusIcons = {
    loading: <RefreshCw size={16} className="animate-spin" />,
    good: <CheckCircle size={16} />,
    'needs-improvement': <AlertTriangle size={16} />,
    poor: <AlertTriangle size={16} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-6 border ${statusColors[status]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        {statusIcons[status]}
      </div>
      
      <div className="mb-2">
        <span className="text-3xl font-bold text-white">
          {value !== null ? Math.round(value) : '--'}
        </span>
        <span className="text-gray-400 ml-1">{unit}</span>
      </div>
      
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Target: &lt;{threshold}{unit}</span>
        <span className={`capitalize ${statusColors[status].split(' ')[0]}`}>
          {status.replace('-', ' ')}
        </span>
      </div>
    </motion.div>
  )
}

interface PerformanceDashboardProps {
  showHistory?: boolean
  className?: string
}

export function PerformanceDashboard({ 
  showHistory = true, 
  className = '' 
}: PerformanceDashboardProps) {
  const { 
    metrics, 
    isLoading, 
    performanceScore, 
    thresholds, 
    refreshMetrics 
  } = usePerformance()
  
  const { history } = useMetricsHistory(7)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshMetrics()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getOverallStatus = () => {
    if (performanceScore.overall >= 90) return 'excellent'
    if (performanceScore.overall >= 75) return 'good'
    if (performanceScore.overall >= 50) return 'needs-improvement'
    return 'poor'
  }

  const overallStatus = getOverallStatus()
  const statusColors = {
    excellent: 'text-green-400',
    good: 'text-blue-400',
    'needs-improvement': 'text-yellow-400',
    poor: 'text-red-400'
  }

  return (
    <div className={`performance-dashboard ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Performance Dashboard</h2>
          <p className="text-gray-400">Real-time Web Vitals monitoring</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-6 border border-white/10 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Overall Performance Score</h3>
            <div className="flex items-center gap-4">
              <span className={`text-4xl font-bold ${statusColors[overallStatus]}`}>
                {Math.round(performanceScore.overall)}
              </span>
              <div>
                <div className={`text-sm font-medium ${statusColors[overallStatus]} capitalize`}>
                  {overallStatus.replace('-', ' ')}
                </div>
                <div className="text-xs text-gray-400">
                  Based on Core Web Vitals
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Gauge size={48} className={statusColors[overallStatus]} />
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="First Contentful Paint"
          value={metrics?.fcp || null}
          unit="ms"
          threshold={thresholds.fcp}
          icon={<Eye size={20} className="text-blue-400" />}
          description="Time until first content appears"
        />
        
        <MetricCard
          title="Largest Contentful Paint"
          value={metrics?.lcp || null}
          unit="ms"
          threshold={thresholds.lcp}
          icon={<Activity size={20} className="text-green-400" />}
          description="Time until largest content loads"
        />
        
        <MetricCard
          title="Cumulative Layout Shift"
          value={metrics?.cls || null}
          unit=""
          threshold={thresholds.cls}
          icon={<TrendingUp size={20} className="text-purple-400" />}
          description="Visual stability of the page"
        />
        
        <MetricCard
          title="First Input Delay"
          value={metrics?.fid || null}
          unit="ms"
          threshold={thresholds.fid}
          icon={<Zap size={20} className="text-yellow-400" />}
          description="Time to first user interaction"
        />
        
        <MetricCard
          title="Time to First Byte"
          value={metrics?.ttfb || null}
          unit="ms"
          threshold={thresholds.ttfb}
          icon={<Clock size={20} className="text-orange-400" />}
          description="Server response time"
        />
      </div>

      {/* History Section */}
      {showHistory && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Recent History</h3>
          <div className="text-sm text-gray-400">
            {history.length} measurements in the last 7 days
          </div>
          
          {/* Simple history visualization */}
          <div className="mt-4 space-y-2">
            {history.slice(-5).map((metric, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-gray-500">
                  {new Date(metric.timestamp).toLocaleString()}
                </span>
                <div className="flex gap-4 text-xs">
                  <span>FCP: {metric.fcp ? Math.round(metric.fcp) : '--'}ms</span>
                  <span>LCP: {metric.lcp ? Math.round(metric.lcp) : '--'}ms</span>
                  <span>CLS: {metric.cls ? metric.cls.toFixed(3) : '--'}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="glass rounded-xl p-8 border border-white/10">
              <div className="flex items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-blue-400" />
                <span className="text-white">Collecting performance metrics...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}