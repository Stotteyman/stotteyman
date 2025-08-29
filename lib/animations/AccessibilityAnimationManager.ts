/**
 * Accessibility Animation Manager - Ensures animations are accessible and compliant
 */

import { FallbackAnimationSystem } from './FallbackAnimationSystem'

export interface AccessibilitySettings {
  respectSystemPreferences: boolean
  allowUserOverride: boolean
  enableFallbackAnimations: boolean
  maxAnimationDuration: number
  enableFocusAnimations: boolean
  enableLoadingAnimations: boolean
  enableHoverAnimations: boolean
  enableScrollAnimations: boolean
  vestibularSafeMode: boolean
}

export interface AnimationAccessibilityReport {
  compliant: boolean
  issues: string[]
  recommendations: string[]
  score: number
}

export class AccessibilityAnimationManager {
  private static instance: AccessibilityAnimationManager
  private settings: AccessibilitySettings
  private fallbackSystem: FallbackAnimationSystem
  private observers: Map<string, MutationObserver> = new Map()
  private animationRegistry: Map<string, Element> = new Map()

  private constructor() {
    this.settings = this.getDefaultSettings()
    this.fallbackSystem = FallbackAnimationSystem.getInstance()
    this.initialize()
  }

  static getInstance(): AccessibilityAnimationManager {
    if (!AccessibilityAnimationManager.instance) {
      AccessibilityAnimationManager.instance = new AccessibilityAnimationManager()
    }
    return AccessibilityAnimationManager.instance
  }

  private getDefaultSettings(): AccessibilitySettings {
    return {
      respectSystemPreferences: true,
      allowUserOverride: true,
      enableFallbackAnimations: true,
      maxAnimationDuration: 2000, // 2 seconds max
      enableFocusAnimations: true,
      enableLoadingAnimations: true,
      enableHoverAnimations: true,
      enableScrollAnimations: true,
      vestibularSafeMode: false
    }
  }

  private initialize(): void {
    if (typeof window === 'undefined') return

    // Set up system preference monitoring
    this.setupSystemPreferenceMonitoring()
    
    // Set up accessibility observers
    this.setupAccessibilityObservers()
    
    // Apply initial accessibility rules
    this.applyAccessibilityRules()
    
    // Set up keyboard navigation support
    this.setupKeyboardNavigation()
  }

  private setupSystemPreferenceMonitoring(): void {
    // Monitor prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (this.settings.respectSystemPreferences) {
        this.handleReducedMotionChange(e.matches)
      }
    }
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
    handleReducedMotionChange({ matches: reducedMotionQuery.matches } as MediaQueryListEvent)

    // Monitor prefers-contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    const handleContrastChange = (e: MediaQueryListEvent) => {
      this.handleHighContrastChange(e.matches)
    }
    contrastQuery.addEventListener('change', handleContrastChange)
    handleContrastChange({ matches: contrastQuery.matches } as MediaQueryListEvent)

    // Monitor color scheme preference
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      this.handleColorSchemeChange(e.matches ? 'dark' : 'light')
    }
    colorSchemeQuery.addEventListener('change', handleColorSchemeChange)
    handleColorSchemeChange({ matches: colorSchemeQuery.matches } as MediaQueryListEvent)
  }

  private setupAccessibilityObservers(): void {
    // Observe DOM changes for new animated elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.auditElement(node as Element)
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    this.observers.set('dom-changes', observer)
  }

  private setupKeyboardNavigation(): void {
    // Ensure focus is visible during animations
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
        
        // Remove class after a delay
        setTimeout(() => {
          document.body.classList.remove('keyboard-navigation')
        }, 3000)
      }
    })

    // Handle escape key to stop animations
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.pauseAllAnimations()
      }
    })
  }

  private handleReducedMotionChange(prefersReduced: boolean): void {
    if (prefersReduced) {
      this.enableReducedMotionMode()
    } else {
      this.disableReducedMotionMode()
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('accessibility-motion-change', {
      detail: { prefersReducedMotion: prefersReduced }
    }))
  }

  private handleHighContrastChange(prefersHighContrast: boolean): void {
    if (prefersHighContrast) {
      document.documentElement.classList.add('high-contrast')
      // Enhance focus indicators
      this.enhanceFocusIndicators()
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }

  private handleColorSchemeChange(scheme: 'light' | 'dark'): void {
    // Adjust animation colors for better visibility
    document.documentElement.setAttribute('data-color-scheme', scheme)
  }

  private enableReducedMotionMode(): void {
    document.documentElement.classList.add('accessibility-reduced-motion')
    
    // Apply reduced motion styles
    const style = document.createElement('style')
    style.id = 'accessibility-reduced-motion-styles'
    style.textContent = `
      .accessibility-reduced-motion *,
      .accessibility-reduced-motion *::before,
      .accessibility-reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      .accessibility-reduced-motion .essential-animation {
        animation-duration: 0.2s !important;
        transition-duration: 0.2s !important;
      }
    `
    document.head.appendChild(style)

    // Use fallback animations for essential elements
    if (this.settings.enableFallbackAnimations) {
      this.applyFallbackAnimations()
    }
  }

  private disableReducedMotionMode(): void {
    document.documentElement.classList.remove('accessibility-reduced-motion')
    
    const existingStyle = document.getElementById('accessibility-reduced-motion-styles')
    if (existingStyle) {
      existingStyle.remove()
    }
  }

  private enhanceFocusIndicators(): void {
    const style = document.createElement('style')
    style.id = 'enhanced-focus-indicators'
    style.textContent = `
      .high-contrast *:focus {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 5px rgba(0, 102, 204, 0.3) !important;
      }
      
      .high-contrast button:focus,
      .high-contrast a:focus,
      .high-contrast input:focus,
      .high-contrast textarea:focus,
      .high-contrast select:focus {
        background-color: #ffffcc !important;
        color: #000000 !important;
      }
    `
    document.head.appendChild(style)
  }

  private applyFallbackAnimations(): void {
    // Find all animated elements and apply fallback animations
    const animatedElements = document.querySelectorAll('[class*="animate"], [style*="animation"]')
    
    animatedElements.forEach((element) => {
      this.applyElementFallback(element)
    })
  }

  private applyElementFallback(element: Element): void {
    // Determine appropriate fallback based on element type and current animation
    const classList = Array.from(element.classList)
    
    if (classList.some(cls => cls.includes('fade'))) {
      this.fallbackSystem.fadeIn(element, 0.2)
    } else if (classList.some(cls => cls.includes('slide'))) {
      this.fallbackSystem.slideUp(element, 0.2)
    } else if (classList.some(cls => cls.includes('scale'))) {
      this.fallbackSystem.scaleIn(element, 0.2)
    } else {
      // Default fallback
      this.fallbackSystem.fadeIn(element, 0.1)
    }
  }

  private applyAccessibilityRules(): void {
    // Ensure all animations respect duration limits
    this.enforceAnimationDurationLimits()
    
    // Add ARIA labels for animated content
    this.addAriaLabelsForAnimations()
    
    // Ensure focus is maintained during animations
    this.maintainFocusDuringAnimations()
  }

  private enforceAnimationDurationLimits(): void {
    const style = document.createElement('style')
    style.id = 'animation-duration-limits'
    style.textContent = `
      * {
        animation-duration: min(var(--animation-duration, 1s), ${this.settings.maxAnimationDuration}ms) !important;
        transition-duration: min(var(--transition-duration, 0.3s), ${this.settings.maxAnimationDuration}ms) !important;
      }
    `
    document.head.appendChild(style)
  }

  private addAriaLabelsForAnimations(): void {
    // Add appropriate ARIA labels for animated content
    const animatedElements = document.querySelectorAll('[class*="animate"], [style*="animation"]')
    
    animatedElements.forEach((element) => {
      if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
        element.setAttribute('aria-label', 'Animated content')
      }
      
      // Add live region for important animations
      if (element.classList.contains('essential-animation')) {
        element.setAttribute('aria-live', 'polite')
      }
    })
  }

  private maintainFocusDuringAnimations(): void {
    // Ensure focused elements remain focusable during animations
    document.addEventListener('animationstart', (e) => {
      const target = e.target as Element
      if (target === document.activeElement) {
        target.setAttribute('data-was-focused', 'true')
      }
    })

    document.addEventListener('animationend', (e) => {
      const target = e.target as Element
      if (target.getAttribute('data-was-focused') === 'true') {
        (target as HTMLElement).focus()
        target.removeAttribute('data-was-focused')
      }
    })
  }

  /**
   * Audit an element for accessibility compliance
   */
  auditElement(element: Element): AnimationAccessibilityReport {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check animation duration
    const computedStyle = window.getComputedStyle(element)
    const animationDuration = parseFloat(computedStyle.animationDuration) * 1000
    
    if (animationDuration > this.settings.maxAnimationDuration) {
      issues.push(`Animation duration (${animationDuration}ms) exceeds maximum (${this.settings.maxAnimationDuration}ms)`)
      recommendations.push('Reduce animation duration or provide user control')
      score -= 20
    }

    // Check for ARIA labels
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      if (element.classList.contains('essential-animation')) {
        issues.push('Essential animation missing ARIA label')
        recommendations.push('Add aria-label or aria-labelledby attribute')
        score -= 15
      }
    }

    // Check for focus management
    if (element.matches(':focus-within') && animationDuration > 500) {
      issues.push('Long animation on focused element may disrupt user experience')
      recommendations.push('Ensure focus remains visible and accessible during animation')
      score -= 10
    }

    // Check for vestibular triggers
    if (this.hasVestibularTriggers(element)) {
      issues.push('Animation may trigger vestibular disorders')
      recommendations.push('Provide option to disable motion or use alternative feedback')
      score -= 25
    }

    // Check for reduced motion compliance
    if (!this.hasReducedMotionFallback(element)) {
      issues.push('No reduced motion fallback provided')
      recommendations.push('Implement prefers-reduced-motion media query support')
      score -= 15
    }

    return {
      compliant: issues.length === 0,
      issues,
      recommendations,
      score: Math.max(0, score)
    }
  }

  private hasVestibularTriggers(element: Element): boolean {
    const style = window.getComputedStyle(element)
    const transform = style.transform
    const animation = style.animation

    // Check for rapid rotation or scaling
    if (transform.includes('rotate') || animation.includes('rotate')) {
      return true
    }

    // Check for rapid movement
    if (animation.includes('translate') && parseFloat(style.animationDuration) < 0.3) {
      return true
    }

    return false
  }

  private hasReducedMotionFallback(element: Element): boolean {
    // Check if element has reduced motion styles
    const hasReducedMotionClass = Array.from(element.classList).some(cls => 
      cls.includes('reduced-motion') || cls.includes('fallback')
    )

    // Check for CSS media query support
    const hasMediaQuerySupport = element.matches('@media (prefers-reduced-motion: reduce)')

    return hasReducedMotionClass || hasMediaQuerySupport
  }

  /**
   * Public API methods
   */
  updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.applyAccessibilityRules()
  }

  getSettings(): AccessibilitySettings {
    return { ...this.settings }
  }

  pauseAllAnimations(): void {
    document.querySelectorAll('*').forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.animationPlayState = 'paused'
      }
    })
  }

  resumeAllAnimations(): void {
    document.querySelectorAll('*').forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.animationPlayState = 'running'
      }
    })
  }

  auditPage(): AnimationAccessibilityReport {
    const animatedElements = document.querySelectorAll('[class*="animate"], [style*="animation"]')
    const reports = Array.from(animatedElements).map(element => this.auditElement(element))
    
    const allIssues = reports.flatMap(report => report.issues)
    const allRecommendations = reports.flatMap(report => report.recommendations)
    const averageScore = reports.reduce((sum, report) => sum + report.score, 0) / reports.length

    return {
      compliant: allIssues.length === 0,
      issues: [...new Set(allIssues)], // Remove duplicates
      recommendations: [...new Set(allRecommendations)],
      score: Math.round(averageScore)
    }
  }

  generateAccessibilityReport(): string {
    const report = this.auditPage()
    
    return `
# Animation Accessibility Report

## Overall Score: ${report.score}/100
## Compliance Status: ${report.compliant ? '✅ Compliant' : '❌ Non-compliant'}

### Issues Found (${report.issues.length}):
${report.issues.map(issue => `- ${issue}`).join('\n')}

### Recommendations (${report.recommendations.length}):
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

### Settings:
- Respect System Preferences: ${this.settings.respectSystemPreferences ? '✅' : '❌'}
- Allow User Override: ${this.settings.allowUserOverride ? '✅' : '❌'}
- Enable Fallback Animations: ${this.settings.enableFallbackAnimations ? '✅' : '❌'}
- Max Animation Duration: ${this.settings.maxAnimationDuration}ms
- Vestibular Safe Mode: ${this.settings.vestibularSafeMode ? '✅' : '❌'}
    `.trim()
  }

  destroy(): void {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()

    // Remove added styles
    const stylesToRemove = [
      'accessibility-reduced-motion-styles',
      'enhanced-focus-indicators',
      'animation-duration-limits'
    ]
    
    stylesToRemove.forEach(id => {
      const element = document.getElementById(id)
      if (element) element.remove()
    })

    // Clear registry
    this.animationRegistry.clear()

    AccessibilityAnimationManager.instance = null as any
  }
}