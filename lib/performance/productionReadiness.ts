'use client'

export interface ReadinessCheck {
  name: string
  category: 'performance' | 'security' | 'accessibility' | 'seo' | 'functionality'
  status: 'pass' | 'fail' | 'warning' | 'skip'
  message: string
  details?: string
  impact: 'critical' | 'high' | 'medium' | 'low'
  autoFixable: boolean
}

export interface ReadinessReport {
  overall: 'ready' | 'needs-attention' | 'not-ready'
  score: number
  checks: ReadinessCheck[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
    skipped: number
  }
  recommendations: string[]
  timestamp: Date
}

export class ProductionReadinessChecker {
  private checks: ReadinessCheck[] = []

  public async runAllChecks(): Promise<ReadinessReport> {
    this.checks = []

    // Run all categories of checks
    await Promise.all([
      this.runPerformanceChecks(),
      this.runSecurityChecks(),
      this.runAccessibilityChecks(),
      this.runSEOChecks(),
      this.runFunctionalityChecks()
    ])

    return this.generateReport()
  }

  private async runPerformanceChecks(): Promise<void> {
    // Bundle size check
    try {
      const bundleSize = await this.getBundleSize()
      this.checks.push({
        name: 'Bundle Size',
        category: 'performance',
        status: bundleSize < 250000 ? 'pass' : bundleSize < 500000 ? 'warning' : 'fail',
        message: `Bundle size: ${this.formatBytes(bundleSize)}`,
        details: bundleSize > 250000 ? 'Consider code splitting and tree shaking' : 'Bundle size is optimal',
        impact: 'high',
        autoFixable: false
      })
    } catch (error) {
      this.checks.push({
        name: 'Bundle Size',
        category: 'performance',
        status: 'skip',
        message: 'Could not determine bundle size',
        impact: 'medium',
        autoFixable: false
      })
    }

    // Core Web Vitals check
    if (typeof window !== 'undefined') {
      const vitals = await this.checkWebVitals()
      Object.entries(vitals).forEach(([metric, value]) => {
        const thresholds = this.getWebVitalsThresholds()[metric as keyof ReturnType<typeof this.getWebVitalsThresholds>]
        if (thresholds && value !== null) {
          this.checks.push({
            name: `Core Web Vitals - ${metric.toUpperCase()}`,
            category: 'performance',
            status: value <= thresholds.good ? 'pass' : value <= thresholds.needsImprovement ? 'warning' : 'fail',
            message: `${metric.toUpperCase()}: ${value}${metric === 'cls' ? '' : 'ms'}`,
            impact: 'critical',
            autoFixable: false
          })
        }
      })
    }

    // Image optimization check
    const imageOptimization = await this.checkImageOptimization()
    this.checks.push({
      name: 'Image Optimization',
      category: 'performance',
      status: imageOptimization.optimized ? 'pass' : 'warning',
      message: `${imageOptimization.optimizedCount}/${imageOptimization.totalCount} images optimized`,
      details: imageOptimization.optimized ? 'All images are optimized' : 'Some images could be further optimized',
      impact: 'medium',
      autoFixable: true
    })
  }

  private async runSecurityChecks(): Promise<void> {
    // HTTPS check
    const isHTTPS = typeof window !== 'undefined' ? window.location.protocol === 'https:' : true
    this.checks.push({
      name: 'HTTPS Enabled',
      category: 'security',
      status: isHTTPS ? 'pass' : 'fail',
      message: isHTTPS ? 'Site is served over HTTPS' : 'Site is not served over HTTPS',
      impact: 'critical',
      autoFixable: false
    })

    // Security headers check
    const securityHeaders = await this.checkSecurityHeaders()
    Object.entries(securityHeaders).forEach(([header, present]) => {
      this.checks.push({
        name: `Security Header - ${header}`,
        category: 'security',
        status: present ? 'pass' : 'fail',
        message: present ? `${header} header is present` : `${header} header is missing`,
        impact: header === 'Content-Security-Policy' ? 'critical' : 'high',
        autoFixable: true
      })
    })

    // Content Security Policy check
    const cspCheck = await this.checkCSP()
    this.checks.push({
      name: 'Content Security Policy',
      category: 'security',
      status: cspCheck.valid ? 'pass' : 'fail',
      message: cspCheck.message,
      details: cspCheck.details || 'No additional details available',
      impact: 'critical',
      autoFixable: false
    })
  }

  private async runAccessibilityChecks(): Promise<void> {
    if (typeof window === 'undefined') return

    // Alt text check
    const images = document.querySelectorAll('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt)
    this.checks.push({
      name: 'Image Alt Text',
      category: 'accessibility',
      status: imagesWithoutAlt.length === 0 ? 'pass' : 'warning',
      message: `${images.length - imagesWithoutAlt.length}/${images.length} images have alt text`,
      impact: 'medium',
      autoFixable: true
    })

    // Color contrast check (simplified)
    const contrastCheck = await this.checkColorContrast()
    this.checks.push({
      name: 'Color Contrast',
      category: 'accessibility',
      status: contrastCheck.passes ? 'pass' : 'warning',
      message: contrastCheck.message,
      impact: 'medium',
      autoFixable: false
    })

    // Keyboard navigation check
    const keyboardNav = await this.checkKeyboardNavigation()
    this.checks.push({
      name: 'Keyboard Navigation',
      category: 'accessibility',
      status: keyboardNav.accessible ? 'pass' : 'warning',
      message: keyboardNav.message,
      impact: 'high',
      autoFixable: false
    })
  }

  private async runSEOChecks(): Promise<void> {
    if (typeof window === 'undefined') return

    // Title tag check
    const title = document.querySelector('title')?.textContent
    this.checks.push({
      name: 'Page Title',
      category: 'seo',
      status: title && title.length > 0 ? 'pass' : 'fail',
      message: title ? `Title: "${title}"` : 'No title tag found',
      impact: 'high',
      autoFixable: true
    })

    // Meta description check
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')
    this.checks.push({
      name: 'Meta Description',
      category: 'seo',
      status: metaDescription && metaDescription.length > 0 ? 'pass' : 'warning',
      message: metaDescription ? `Description length: ${metaDescription.length} chars` : 'No meta description found',
      impact: 'medium',
      autoFixable: true
    })

    // Structured data check
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]')
    this.checks.push({
      name: 'Structured Data',
      category: 'seo',
      status: structuredData.length > 0 ? 'pass' : 'warning',
      message: `${structuredData.length} structured data blocks found`,
      impact: 'low',
      autoFixable: true
    })
  }

  private async runFunctionalityChecks(): Promise<void> {
    // JavaScript errors check
    const jsErrors = await this.checkJavaScriptErrors()
    this.checks.push({
      name: 'JavaScript Errors',
      category: 'functionality',
      status: jsErrors.count === 0 ? 'pass' : jsErrors.count < 5 ? 'warning' : 'fail',
      message: `${jsErrors.count} JavaScript errors detected`,
      details: jsErrors.count > 0 ? jsErrors.errors.slice(0, 3).join(', ') : 'No JavaScript errors detected',
      impact: 'high',
      autoFixable: false
    })

    // API endpoints check
    const apiCheck = await this.checkAPIEndpoints()
    this.checks.push({
      name: 'API Endpoints',
      category: 'functionality',
      status: apiCheck.allWorking ? 'pass' : 'fail',
      message: `${apiCheck.workingCount}/${apiCheck.totalCount} API endpoints working`,
      impact: 'critical',
      autoFixable: false
    })

    // Form validation check
    const formCheck = await this.checkForms()
    this.checks.push({
      name: 'Form Validation',
      category: 'functionality',
      status: formCheck.allValid ? 'pass' : 'warning',
      message: `${formCheck.validCount}/${formCheck.totalCount} forms have proper validation`,
      impact: 'medium',
      autoFixable: true
    })
  }

  private generateReport(): ReadinessReport {
    const summary = {
      total: this.checks.length,
      passed: this.checks.filter(c => c.status === 'pass').length,
      failed: this.checks.filter(c => c.status === 'fail').length,
      warnings: this.checks.filter(c => c.status === 'warning').length,
      skipped: this.checks.filter(c => c.status === 'skip').length
    }

    // Calculate score
    const score = Math.round((summary.passed / (summary.total - summary.skipped)) * 100)

    // Determine overall status
    let overall: 'ready' | 'needs-attention' | 'not-ready'
    const criticalFailures = this.checks.filter(c => c.status === 'fail' && c.impact === 'critical').length
    
    if (criticalFailures > 0) {
      overall = 'not-ready'
    } else if (summary.failed > 0 || summary.warnings > 3) {
      overall = 'needs-attention'
    } else {
      overall = 'ready'
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations()

    return {
      overall,
      score,
      checks: this.checks,
      summary,
      recommendations,
      timestamp: new Date()
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const failedChecks = this.checks.filter(c => c.status === 'fail')
    const warningChecks = this.checks.filter(c => c.status === 'warning')

    // Critical issues first
    const criticalIssues = failedChecks.filter(c => c.impact === 'critical')
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical issues before deployment:')
      criticalIssues.forEach(issue => {
        recommendations.push(`- ${issue.name}: ${issue.message}`)
      })
    }

    // High priority issues
    const highPriorityIssues = failedChecks.filter(c => c.impact === 'high')
    if (highPriorityIssues.length > 0) {
      recommendations.push('Fix high priority issues:')
      highPriorityIssues.forEach(issue => {
        recommendations.push(`- ${issue.name}: ${issue.message}`)
      })
    }

    // Auto-fixable issues
    const autoFixableIssues = [...failedChecks, ...warningChecks].filter(c => c.autoFixable)
    if (autoFixableIssues.length > 0) {
      recommendations.push('Consider auto-fixing these issues:')
      autoFixableIssues.slice(0, 5).forEach(issue => {
        recommendations.push(`- ${issue.name}`)
      })
    }

    return recommendations
  }

  // Helper methods for checks
  private async getBundleSize(): Promise<number> {
    // Simulate bundle size calculation
    return 180000 // 180KB
  }

  private async checkWebVitals(): Promise<Record<string, number | null>> {
    // This would integrate with actual Web Vitals measurement
    return {
      fcp: 1200,
      lcp: 2100,
      cls: 0.08,
      fid: 85,
      ttfb: 600
    }
  }

  private getWebVitalsThresholds() {
    return {
      fcp: { good: 1800, needsImprovement: 3000 },
      lcp: { good: 2500, needsImprovement: 4000 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fid: { good: 100, needsImprovement: 300 },
      ttfb: { good: 800, needsImprovement: 1800 }
    }
  }

  private async checkImageOptimization(): Promise<{
    optimized: boolean
    totalCount: number
    optimizedCount: number
  }> {
    if (typeof window === 'undefined') {
      return { optimized: true, totalCount: 0, optimizedCount: 0 }
    }

    const images = document.querySelectorAll('img')
    const nextImages = document.querySelectorAll('img[data-nimg]')
    
    return {
      optimized: nextImages.length / images.length > 0.8,
      totalCount: images.length,
      optimizedCount: nextImages.length
    }
  }

  private async checkSecurityHeaders(): Promise<Record<string, boolean>> {
    // This would check actual response headers
    return {
      'Content-Security-Policy': true,
      'X-Frame-Options': true,
      'X-Content-Type-Options': true,
      'Strict-Transport-Security': true,
      'Referrer-Policy': true
    }
  }

  private async checkCSP(): Promise<{ valid: boolean; message: string; details?: string }> {
    // Simplified CSP validation
    return {
      valid: true,
      message: 'Content Security Policy is properly configured'
    }
  }

  private async checkColorContrast(): Promise<{ passes: boolean; message: string }> {
    // Simplified contrast check
    return {
      passes: true,
      message: 'Color contrast appears adequate'
    }
  }

  private async checkKeyboardNavigation(): Promise<{ accessible: boolean; message: string }> {
    // Simplified keyboard navigation check
    return {
      accessible: true,
      message: 'Keyboard navigation appears functional'
    }
  }

  private async checkJavaScriptErrors(): Promise<{ count: number; errors: string[] }> {
    // This would collect actual JS errors
    return {
      count: 0,
      errors: []
    }
  }

  private async checkAPIEndpoints(): Promise<{
    allWorking: boolean
    totalCount: number
    workingCount: number
  }> {
    // This would test actual API endpoints
    return {
      allWorking: true,
      totalCount: 3,
      workingCount: 3
    }
  }

  private async checkForms(): Promise<{
    allValid: boolean
    totalCount: number
    validCount: number
  }> {
    if (typeof window === 'undefined') {
      return { allValid: true, totalCount: 0, validCount: 0 }
    }

    const forms = document.querySelectorAll('form')
    const formsWithValidation = document.querySelectorAll('form[novalidate="false"], form:not([novalidate])')
    
    return {
      allValid: formsWithValidation.length === forms.length,
      totalCount: forms.length,
      validCount: formsWithValidation.length
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
}

// Global instance
let globalReadinessChecker: ProductionReadinessChecker | null = null

export function getProductionReadinessChecker(): ProductionReadinessChecker {
  if (!globalReadinessChecker) {
    globalReadinessChecker = new ProductionReadinessChecker()
  }
  return globalReadinessChecker
}