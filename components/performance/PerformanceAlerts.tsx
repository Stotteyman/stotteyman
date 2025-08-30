'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  X, 
  Check, 
  Clock, 
  TrendingUp,
  Activity,
  Eye,
  Zap,
  Bell,
  BellOff
} from 'lucide-react'
import { getPerformanceAlerting } from '@/lib/performance/alerting'
import type { PerformanceAlert } from '@/lib/performance/alerting'
import { usePerformance } from './PerformanceProvider'

interface PerformanceAlertsProps {
  maxVisible?: number
  autoHide?: boolean
  hideDelay?: number
  className?: string
}

export function PerformanceAlerts({ 
  maxVisible = 5, 
  autoHide = true,
  hideDelay = 10000,
  className = '' 
}: PerformanceAlertsProps) {
  const { thresholds, metrics } = usePerformance()
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isEnabled, setIsEnabled] = useState(true)
  const [alerting, setAlerting] = useState<ReturnType<typeof getPerformanceAlerting> | null>(null)

  // Initialize alerting system
  useEffect(() => {
    if (thresholds) {
      const alertingInstance = getPerformanceAlerting(thresholds)
      setAlerting(alertingInstance)

      // Subscribe to new alerts
      const unsubscribe = alertingInstance.onAlert((alert) => {
        if (isEnabled) {
          setAlerts(prev => {
            const updated = [alert, ...prev].slice(0, maxVisible)
            return updated
          })

          // Auto-hide if enabled
          if (autoHide) {
            setTimeout(() => {
              setAlerts(prev => prev.filter(a => a.id !== alert.id))
            }, hideDelay)
          }
        }
      })

      return unsubscribe
    }
    return undefined
  }, [thresholds, isEnabled, maxVisible, autoHide, hideDelay])

  // Check metrics for alerts
  useEffect(() => {
    if (alerting && metrics && isEnabled) {
      alerting.checkMetrics(metrics)
    }
  }, [alerting, metrics, isEnabled])

  const acknowledgeAlert = (alertId: string) => {
    if (alerting) {
      alerting.acknowledgeAlert(alertId)
    }
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const clearAllAlerts = () => {
    setAlerts([])
    if (alerting) {
      alerting.clearAlerts()
    }
  }

  const toggleAlerts = () => {
    setIsEnabled(!isEnabled)
    if (!isEnabled) {
      setAlerts([])
    }
  }

  const getAlertIcon = (metric: string) => {
    switch (metric) {
      case 'fcp': return <Eye size={16} />
      case 'lcp': return <Activity size={16} />
      case 'cls': return <TrendingUp size={16} />
      case 'fid': return <Zap size={16} />
      case 'ttfb': return <Clock size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
      case 'error': return 'border-orange-500/50 bg-orange-500/10 text-orange-400'
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-400'
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-400'
    }
  }

  const getMetricName = (metric: string) => {
    const names = {
      fcp: 'First Contentful Paint',
      lcp: 'Largest Contentful Paint',
      cls: 'Cumulative Layout Shift',
      fid: 'First Input Delay',
      ttfb: 'Time to First Byte'
    }
    return names[metric as keyof typeof names] || metric.toUpperCase()
  }

  if (!isEnabled) {
    return (
      <div className={`performance-alerts-disabled ${className}`}>
        <button
          onClick={toggleAlerts}
          className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-400 transition-colors"
          title="Enable performance alerts"
        >
          <BellOff size={16} />
          <span className="text-sm">Alerts disabled</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`performance-alerts ${className}`}>
      {/* Alert Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-white">Performance Alerts</span>
          {alerts.length > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={toggleAlerts}
            className="text-gray-400 hover:text-white transition-colors"
            title="Disable alerts"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`alert-item border rounded-lg p-4 mb-3 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getAlertIcon(alert.metric)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {getMetricName(alert.metric)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">
                    {alert.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Value: {Math.round(alert.value)}{alert.metric === 'cls' ? '' : 'ms'}</span>
                    <span>Threshold: {Math.round(alert.threshold)}{alert.metric === 'cls' ? '' : 'ms'}</span>
                    <span>{alert.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                  title="Acknowledge alert"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Dismiss alert"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Bell size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No performance alerts</p>
          <p className="text-xs">System is performing well</p>
        </div>
      )}
    </div>
  )
}

// Floating alert notifications
export function FloatingPerformanceAlerts() {
  const { thresholds, metrics } = usePerformance()
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])

  useEffect(() => {
    if (!thresholds) return

    const alerting = getPerformanceAlerting(thresholds)
    
    const unsubscribe = alerting.onAlert((alert) => {
      // Only show critical alerts as floating notifications
      if (alert.severity === 'critical') {
        setAlerts(prev => [alert, ...prev.slice(0, 2)]) // Max 3 floating alerts
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== alert.id))
        }, 8000)
      }
    })

    return unsubscribe
  }, [thresholds])

  useEffect(() => {
    if (metrics && thresholds) {
      const alerting = getPerformanceAlerting(thresholds)
      alerting.checkMetrics(metrics)
    }
  }, [metrics, thresholds])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="bg-red-500/90 backdrop-blur-sm border border-red-500/50 rounded-lg p-4 max-w-sm shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-white mt-1" />
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Critical Performance Issue
                  </h4>
                  <p className="text-sm text-red-100 mb-2">
                    {getMetricName(alert.metric)}: {Math.round(alert.value)}{alert.metric === 'cls' ? '' : 'ms'}
                  </p>
                  <p className="text-xs text-red-200">
                    Exceeds critical threshold by {Math.round(((alert.value - alert.threshold) / alert.threshold) * 100)}%
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                className="text-red-200 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  function getMetricName(metric: string) {
    const names = {
      fcp: 'First Contentful Paint',
      lcp: 'Largest Contentful Paint',
      cls: 'Cumulative Layout Shift',
      fid: 'First Input Delay',
      ttfb: 'Time to First Byte'
    }
    return names[metric as keyof typeof names] || metric.toUpperCase()
  }
}