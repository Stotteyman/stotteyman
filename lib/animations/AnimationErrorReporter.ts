/**
 * Advanced Animation Error Reporting and Recovery System
 */

import { AnimationError } from './AnimationErrorHandler'

export interface ErrorReport {
  id: string
  sessionId: string
  errors: AnimationError[]
  systemInfo: SystemInfo
  performanceMetrics: PerformanceSnapshot
  userActions: UserAction[]
  recoveryAttempts: RecoveryAttempt[]
  timestamp: number
}

export interface SystemInfo {
  userAgent: string
  platform: string
  webGLSupport: boolean
  webGL2Support: boolean
  devicePixelRatio: number
  screenResolution: string
  viewportSize: string
  memoryInfo?: {
    jsHeapSizeLimit: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
  connectionInfo?: {
    effectiveType: string
    downlink: number
    rtt: number
  }
  animationLibraries: string[]
}

export interface PerformanceSnapshot {
  fps: number
  memoryUsage: number
  renderTime: number
  animationCount: number
  cpuUsage?: number
  timestamp: number
}

export interface UserAction {
  type: 'click' | 'scroll' | 'resize' | 'focus' | 'blur' | 'keypress'
  target: string
  timestamp: number
  details?: Record<string, any>
}

export interface RecoveryAttempt {
  errorId: string
  strategy: 'fallback' | 'retry' | 'disable' | 'reduce-quality' | 'restart'
  success: boolean
  timestamp: number
  details?: Record<string, any>
}

export class AnimationErrorReporter {
  private static instance: AnimationErrorReporter
  private sessionId: string
  private userActions: UserAction[] = []
  private recoveryAttempts: RecoveryAttempt[] = []
  private maxUserActions = 50
  private maxRecoveryAttempts = 20

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.setupUserActionTracking()
  }

  static getInstance(): AnimationErrorReporter {
    if (!AnimationErrorReporter.instance) {
      AnimationErrorReporter.instance = new AnimationErrorReporter()
    }
    return AnimationErrorReporter.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupUserActionTracking(): void {
    if (typeof window === 'undefined') return

    // Track user interactions that might be related to animation errors
    const trackAction = (type: UserAction['type'], event: Event) => {
      const target = this.getElementSelector(event.target as Element)
      this.addUserAction({
        type,
        target,
        timestamp: Date.now(),
        details: this.getEventDetails(event)
      })
    }

    // Track clicks
    document.addEventListener('click', (e) => trackAction('click', e), { passive: true })
    
    // Track scrolling
    let scrollTimeout: NodeJS.Timeout
    document.addEventListener('scroll', (e) => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => trackAction('scroll', e), 100)
    }, { passive: true })

    // Track window resize
    let resizeTimeout: NodeJS.Timeout
    window.addEventListener('resize', (e) => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => trackAction('resize', e), 250)
    })

    // Track focus changes
    document.addEventListener('focusin', (e) => trackAction('focus', e), { passive: true })
    document.addEventListener('focusout', (e) => trackAction('blur', e), { passive: true })

    // Track key presses that might affect animations
    document.addEventListener('keydown', (e) => {
      if (['Escape', 'Tab', 'Enter', 'Space'].includes(e.key)) {
        trackAction('keypress', e)
      }
    }, { passive: true })
  }

  private getElementSelector(element: Element | null): string {
    if (!element) return 'unknown'

    // Try to create a meaningful selector
    const tagName = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : ''
    
    return `${tagName}${id}${classes}`.substring(0, 100) // Limit length
  }

  private getEventDetails(event: Event): Record<string, any> {
    const details: Record<string, any> = {}

    if (event instanceof MouseEvent) {
      details.coordinates = { x: event.clientX, y: event.clientY }
      details.button = event.button
    }

    if (event instanceof KeyboardEvent) {
      details.key = event.key
      details.code = event.code
      details.modifiers = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      }
    }

    if (event.type === 'scroll') {
      details.scrollPosition = {
        x: window.scrollX,
        y: window.scrollY
      }
    }

    if (event.type === 'resize') {
      details.windowSize = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }

    return details
  }

  private addUserAction(action: UserAction): void {
    this.userActions.push(action)
    
    // Keep only recent actions
    if (this.userActions.length > this.maxUserActions) {
      this.userActions.shift()
    }
  }

  private collectSystemInfo(): SystemInfo {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    const gl2 = canvas.getContext('webgl2')

    const systemInfo: SystemInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      webGLSupport: !!gl,
      webGL2Support: !!gl2,
      devicePixelRatio: window.devicePixelRatio || 1,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      animationLibraries: this.detectAnimationLibraries()
    }

    // Add memory info if available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      systemInfo.memoryInfo = {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize
      }
    }

    // Add connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      systemInfo.connectionInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      }
    }

    return systemInfo
  }

  private detectAnimationLibraries(): string[] {
    const libraries: string[] = []
    
    // Check for common animation libraries
    if (typeof window !== 'undefined') {
      if ((window as any).gsap) libraries.push('GSAP')
      if ((window as any).THREE) libraries.push('Three.js')
      if (document.querySelector('[data-framer-motion]')) libraries.push('Framer Motion')
      if ((window as any).lottie) libraries.push('Lottie')
      if ((window as any).anime) libraries.push('Anime.js')
    }

    return libraries
  }

  private collectPerformanceSnapshot(): PerformanceSnapshot {
    // This would integrate with your performance monitoring system
    return {
      fps: 60, // Would be actual FPS from performance monitor
      memoryUsage: 0, // Would be actual memory usage
      renderTime: 16.67, // Would be actual render time
      animationCount: 0, // Would be actual animation count
      timestamp: Date.now()
    }
  }

  recordRecoveryAttempt(attempt: RecoveryAttempt): void {
    this.recoveryAttempts.push(attempt)
    
    // Keep only recent attempts
    if (this.recoveryAttempts.length > this.maxRecoveryAttempts) {
      this.recoveryAttempts.shift()
    }
  }

  generateReport(errors: AnimationError[]): ErrorReport {
    return {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      errors,
      systemInfo: this.collectSystemInfo(),
      performanceMetrics: this.collectPerformanceSnapshot(),
      userActions: [...this.userActions],
      recoveryAttempts: [...this.recoveryAttempts],
      timestamp: Date.now()
    }
  }

  async submitReport(report: ErrorReport): Promise<boolean> {
    try {
      // Submit to your error reporting service
      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      })

      return response.ok
    } catch (error) {
      console.error('Failed to submit error report:', error)
      
      // Store locally as fallback
      this.storeReportLocally(report)
      return false
    }
  }

  private storeReportLocally(report: ErrorReport): void {
    try {
      const storedReports = JSON.parse(localStorage.getItem('animation_error_reports') || '[]')
      storedReports.push(report)
      
      // Keep only last 5 reports
      if (storedReports.length > 5) {
        storedReports.shift()
      }
      
      localStorage.setItem('animation_error_reports', JSON.stringify(storedReports))
    } catch (error) {
      console.error('Failed to store error report locally:', error)
    }
  }

  getStoredReports(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('animation_error_reports') || '[]')
    } catch {
      return []
    }
  }

  clearStoredReports(): void {
    try {
      localStorage.removeItem('animation_error_reports')
    } catch {
      // Silently fail
    }
  }

  // Analytics and insights
  analyzeErrorPatterns(reports: ErrorReport[]): {
    commonErrors: Array<{ message: string; count: number }>
    errorTrends: Array<{ date: string; count: number }>
    systemCorrelations: Array<{ factor: string; errorRate: number }>
    recoveryEffectiveness: Array<{ strategy: string; successRate: number }>
  } {
    const commonErrors = new Map<string, number>()
    const errorsByDate = new Map<string, number>()
    const systemFactors = new Map<string, { errors: number; total: number }>()
    const recoveryStats = new Map<string, { attempts: number; successes: number }>()

    reports.forEach(report => {
      // Count common errors
      report.errors.forEach(error => {
        const key = error.message.substring(0, 100) // Truncate for grouping
        commonErrors.set(key, (commonErrors.get(key) || 0) + 1)
      })

      // Group by date
      const date = new Date(report.timestamp).toISOString().split('T')[0]
      errorsByDate.set(date, (errorsByDate.get(date) || 0) + report.errors.length)

      // Analyze system correlations
      const webglKey = report.systemInfo.webGLSupport ? 'webgl-supported' : 'webgl-not-supported'
      if (!systemFactors.has(webglKey)) {
        systemFactors.set(webglKey, { errors: 0, total: 0 })
      }
      const webglStats = systemFactors.get(webglKey)!
      webglStats.errors += report.errors.length
      webglStats.total += 1

      // Analyze recovery effectiveness
      report.recoveryAttempts.forEach(attempt => {
        if (!recoveryStats.has(attempt.strategy)) {
          recoveryStats.set(attempt.strategy, { attempts: 0, successes: 0 })
        }
        const stats = recoveryStats.get(attempt.strategy)!
        stats.attempts += 1
        if (attempt.success) stats.successes += 1
      })
    })

    return {
      commonErrors: Array.from(commonErrors.entries())
        .map(([message, count]) => ({ message, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      
      errorTrends: Array.from(errorsByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      
      systemCorrelations: Array.from(systemFactors.entries())
        .map(([factor, stats]) => ({
          factor,
          errorRate: stats.total > 0 ? stats.errors / stats.total : 0
        }))
        .sort((a, b) => b.errorRate - a.errorRate),
      
      recoveryEffectiveness: Array.from(recoveryStats.entries())
        .map(([strategy, stats]) => ({
          strategy,
          successRate: stats.attempts > 0 ? stats.successes / stats.attempts : 0
        }))
        .sort((a, b) => b.successRate - a.successRate)
    }
  }
}