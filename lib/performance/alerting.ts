'use client'

import { WebVitalsMetrics, PerformanceThresholds } from './webVitals'

export interface PerformanceAlert {
  id: string
  metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'sessionId' | 'url'>
  value: number
  threshold: number
  severity: 'warning' | 'error' | 'critical'
  message: string
  timestamp: Date
  url: string
  sessionId: string
  acknowledged: boolean
}

export interface AlertRule {
  metric: keyof Omit<WebVitalsMetrics, 'timestamp' | 'sessionId' | 'url'>
  warningThreshold: number
  errorThreshold: number
  criticalThreshold: number
  enabled: boolean
}

export interface NotificationChannel {
  type: 'console' | 'toast' | 'email' | 'webhook'
  config: Record<string, any>
  enabled: boolean
}

export class PerformanceAlerting {
  private alerts: PerformanceAlert[] = []
  private rules: AlertRule[] = []
  private channels: NotificationChannel[] = []
  private callbacks: Array<(alert: PerformanceAlert) => void> = []

  constructor(thresholds: PerformanceThresholds) {
    this.initializeDefaultRules(thresholds)
    this.initializeDefaultChannels()
  }

  private initializeDefaultRules(thresholds: PerformanceThresholds): void {
    this.rules = [
      {
        metric: 'fcp',
        warningThreshold: thresholds.fcp,
        errorThreshold: thresholds.fcp * 1.5,
        criticalThreshold: thresholds.fcp * 2,
        enabled: true
      },
      {
        metric: 'lcp',
        warningThreshold: thresholds.lcp,
        errorThreshold: thresholds.lcp * 1.5,
        criticalThreshold: thresholds.lcp * 2,
        enabled: true
      },
      {
        metric: 'cls',
        warningThreshold: thresholds.cls,
        errorThreshold: thresholds.cls * 2,
        criticalThreshold: thresholds.cls * 3,
        enabled: true
      },
      {
        metric: 'fid',
        warningThreshold: thresholds.fid,
        errorThreshold: thresholds.fid * 2,
        criticalThreshold: thresholds.fid * 3,
        enabled: true
      },
      {
        metric: 'ttfb',
        warningThreshold: thresholds.ttfb,
        errorThreshold: thresholds.ttfb * 1.5,
        criticalThreshold: thresholds.ttfb * 2,
        enabled: true
      }
    ]
  }

  private initializeDefaultChannels(): void {
    this.channels = [
      {
        type: 'console',
        config: {},
        enabled: true
      },
      {
        type: 'toast',
        config: {
          duration: 5000,
          position: 'top-right'
        },
        enabled: false // Disabled by default to avoid spam
      }
    ]
  }

  public checkMetrics(metrics: WebVitalsMetrics): PerformanceAlert[] {
    const newAlerts: PerformanceAlert[] = []

    this.rules.forEach(rule => {
      if (!rule.enabled) return

      const value = metrics[rule.metric]
      if (value === null || value === undefined) return

      const severity = this.determineSeverity(value, rule)
      if (!severity) return

      const alert: PerformanceAlert = {
        id: this.generateAlertId(),
        metric: rule.metric,
        value,
        threshold: this.getThresholdForSeverity(rule, severity),
        severity,
        message: this.generateAlertMessage(rule.metric, value, severity),
        timestamp: new Date(),
        url: metrics.url,
        sessionId: metrics.sessionId,
        acknowledged: false
      }

      newAlerts.push(alert)
      this.alerts.push(alert)
      this.notifyChannels(alert)
      this.notifyCallbacks(alert)
    })

    // Clean up old alerts (keep only last 100)
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    return newAlerts
  }

  private determineSeverity(value: number, rule: AlertRule): 'warning' | 'error' | 'critical' | null {
    if (value >= rule.criticalThreshold) return 'critical'
    if (value >= rule.errorThreshold) return 'error'
    if (value >= rule.warningThreshold) return 'warning'
    return null
  }

  private getThresholdForSeverity(rule: AlertRule, severity: 'warning' | 'error' | 'critical'): number {
    switch (severity) {
      case 'warning': return rule.warningThreshold
      case 'error': return rule.errorThreshold
      case 'critical': return rule.criticalThreshold
    }
  }

  private generateAlertMessage(metric: string, value: number, severity: string): string {
    const metricNames = {
      fcp: 'First Contentful Paint',
      lcp: 'Largest Contentful Paint',
      cls: 'Cumulative Layout Shift',
      fid: 'First Input Delay',
      ttfb: 'Time to First Byte'
    }

    const metricName = metricNames[metric as keyof typeof metricNames] || metric.toUpperCase()
    const unit = metric === 'cls' ? '' : 'ms'
    
    return `${severity.toUpperCase()}: ${metricName} is ${Math.round(value)}${unit}, which exceeds the ${severity} threshold.`
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private notifyChannels(alert: PerformanceAlert): void {
    this.channels.forEach(channel => {
      if (!channel.enabled) return

      try {
        switch (channel.type) {
          case 'console':
            this.notifyConsole(alert)
            break
          case 'toast':
            this.notifyToast(alert, channel.config)
            break
          case 'webhook':
            this.notifyWebhook(alert, channel.config)
            break
          case 'email':
            this.notifyEmail(alert, channel.config)
            break
        }
      } catch (error) {
        console.error(`Failed to notify via ${channel.type}:`, error)
      }
    })
  }

  private notifyConsole(alert: PerformanceAlert): void {
    const method = alert.severity === 'critical' ? 'error' : alert.severity === 'error' ? 'warn' : 'info'
    console[method](`[Performance Alert] ${alert.message}`, {
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      url: alert.url,
      timestamp: alert.timestamp
    })
  }

  private notifyToast(alert: PerformanceAlert, config: any): void {
    // This would integrate with a toast notification system
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({
        message: alert.message,
        type: alert.severity,
        duration: config.duration || 5000,
        position: config.position || 'top-right'
      })
    }
  }

  private async notifyWebhook(alert: PerformanceAlert, config: any): Promise<void> {
    if (!config.url) return

    await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {})
      },
      body: JSON.stringify({
        alert,
        timestamp: new Date().toISOString(),
        source: 'performance-monitoring'
      })
    })
  }

  private async notifyEmail(alert: PerformanceAlert, config: any): Promise<void> {
    // This would integrate with an email service
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: config.recipients,
        subject: `Performance Alert: ${alert.metric.toUpperCase()}`,
        body: `
          Performance Alert Details:
          
          Metric: ${alert.metric}
          Value: ${alert.value}
          Threshold: ${alert.threshold}
          Severity: ${alert.severity}
          URL: ${alert.url}
          Time: ${alert.timestamp.toISOString()}
          
          Message: ${alert.message}
        `
      })
    })
  }

  private notifyCallbacks(alert: PerformanceAlert): void {
    this.callbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('Error in alert callback:', error)
      }
    })
  }

  public onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.callbacks.push(callback)
    
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  public getAlerts(options: {
    severity?: 'warning' | 'error' | 'critical'
    acknowledged?: boolean
    limit?: number
  } = {}): PerformanceAlert[] {
    let filtered = [...this.alerts]

    if (options.severity) {
      filtered = filtered.filter(alert => alert.severity === options.severity)
    }

    if (options.acknowledged !== undefined) {
      filtered = filtered.filter(alert => alert.acknowledged === options.acknowledged)
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      return true
    }
    return false
  }

  public clearAlerts(): void {
    this.alerts = []
  }

  public addRule(rule: AlertRule): void {
    this.rules.push(rule)
  }

  public updateRule(metric: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.find(r => r.metric === metric)
    if (rule) {
      Object.assign(rule, updates)
      return true
    }
    return false
  }

  public addChannel(channel: NotificationChannel): void {
    this.channels.push(channel)
  }

  public updateChannel(type: string, updates: Partial<NotificationChannel>): boolean {
    const channel = this.channels.find(c => c.type === type)
    if (channel) {
      Object.assign(channel, updates)
      return true
    }
    return false
  }

  public getPerformanceInsights(): {
    totalAlerts: number
    alertsByMetric: Record<string, number>
    alertsBySeverity: Record<string, number>
    mostProblematicPages: Array<{ url: string; alertCount: number }>
  } {
    const alertsByMetric: Record<string, number> = {}
    const alertsBySeverity: Record<string, number> = {}
    const pageAlerts: Record<string, number> = {}

    this.alerts.forEach(alert => {
      // Count by metric
      alertsByMetric[alert.metric] = (alertsByMetric[alert.metric] || 0) + 1
      
      // Count by severity
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1
      
      // Count by page
      pageAlerts[alert.url] = (pageAlerts[alert.url] || 0) + 1
    })

    const mostProblematicPages = Object.entries(pageAlerts)
      .map(([url, count]) => ({ url, alertCount: count }))
      .sort((a, b) => b.alertCount - a.alertCount)
      .slice(0, 10)

    return {
      totalAlerts: this.alerts.length,
      alertsByMetric,
      alertsBySeverity,
      mostProblematicPages
    }
  }
}

// Global instance
let globalAlerting: PerformanceAlerting | null = null

export function getPerformanceAlerting(thresholds?: PerformanceThresholds): PerformanceAlerting {
  if (!globalAlerting && thresholds) {
    globalAlerting = new PerformanceAlerting(thresholds)
  }
  return globalAlerting!
}

export function resetPerformanceAlerting(): void {
  globalAlerting = null
}