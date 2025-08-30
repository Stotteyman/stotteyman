/**
 * Global type definitions for Next.js 15.5.0 upgrade
 */

// Next.js 15.5.0 specific types
declare global {
  interface Window {
    // Google Analytics
    gtag?: (...args: any[]) => void
    
    // Performance monitoring
    __PERFORMANCE_MONITOR__?: {
      fps: number
      memory: number
      renderTime: number
    }
    
    // Animation preferences
    __ANIMATION_PREFERENCES__?: {
      reducedMotion: boolean
      quality: 'low' | 'medium' | 'high'
      particlesEnabled: boolean
    }
    
    // Device capabilities
    __DEVICE_CAPABILITIES__?: {
      webgl: boolean
      webgl2: boolean
      intersectionObserver: boolean
      resizeObserver: boolean
      webp: boolean
      avif: boolean
      devicePixelRatio: number
      cores: number
      memory: number
    }
    
    // Calendly integration
    Calendly?: {
      initPopupWidget: (options: CalendlyOptions) => void
      closePopupWidget: () => void
      initInlineWidget: (options: CalendlyInlineOptions) => void
    }
  }
  
  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SITE_URL: string
      NEXT_PUBLIC_CALENDLY_URL?: string
      NEXT_PUBLIC_ANALYTICS_ID?: string
      NEXT_PUBLIC_PERFORMANCE_MONITORING?: string
      ANALYZE?: string
    }
  }
}

// Calendly types
export interface CalendlyOptions {
  url: string
  parentElement?: HTMLElement
  prefill?: {
    name?: string
    firstName?: string
    lastName?: string
    email?: string
    guests?: string[]
    customAnswers?: Record<string, string>
    date?: Date
  }
  utm?: {
    utmCampaign?: string
    utmSource?: string
    utmMedium?: string
    utmContent?: string
    utmTerm?: string
  }
}

export interface CalendlyInlineOptions extends CalendlyOptions {
  parentElement: HTMLElement
}

// Web Vitals types
export interface WebVitalsMetric {
  id: string
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache'
}

// Performance Observer types
export interface PerformanceObserverInit {
  entryTypes?: string[]
  type?: string
  buffered?: boolean
}

// Intersection Observer types
export interface IntersectionObserverInit {
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
}

// Resize Observer types
export interface ResizeObserverEntry {
  target: Element
  contentRect: DOMRectReadOnly
  borderBoxSize?: ResizeObserverSize[]
  contentBoxSize?: ResizeObserverSize[]
  devicePixelContentBoxSize?: ResizeObserverSize[]
}

export interface ResizeObserverSize {
  inlineSize: number
  blockSize: number
}

// Animation frame types
export interface AnimationFrameCallback {
  (time: DOMHighResTimeStamp): void
}

// CSS Custom Properties
export interface CSSCustomProperties {
  '--primary-color'?: string
  '--secondary-color'?: string
  '--accent-color'?: string
  '--background-color'?: string
  '--text-color'?: string
  '--border-color'?: string
  '--shadow-color'?: string
  '--blur-amount'?: string
  '--animation-duration'?: string
  '--animation-easing'?: string
  '--particle-count'?: string
  '--particle-speed'?: string
  '--magnetic-strength'?: string
  '--glow-intensity'?: string
}

// Theme types
export interface Theme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    border: string
    input: string
    ring: string
    destructive: string
    destructiveForeground: string
    success: string
    successForeground: string
    warning: string
    warningForeground: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      linear: string
      easeIn: string
      easeOut: string
      easeInOut: string
      bounce: string
    }
  }
}

// Utility types
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type NonEmptyArray<T> = [T, ...T[]]

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type ValueOf<T> = T[keyof T]

export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

// React types extensions
export type ComponentWithChildren<P = {}> = React.FC<P & { children: React.ReactNode }>

export type ComponentWithOptionalChildren<P = {}> = React.FC<P & { children?: React.ReactNode }>

export type RefCallback<T> = (instance: T | null) => void

export type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>

// Event handler types
export type MouseEventHandler<T = Element> = React.MouseEventHandler<T>
export type KeyboardEventHandler<T = Element> = React.KeyboardEventHandler<T>
export type FocusEventHandler<T = Element> = React.FocusEventHandler<T>
export type ChangeEventHandler<T = Element> = React.ChangeEventHandler<T>
export type FormEventHandler<T = Element> = React.FormEventHandler<T>

// Animation types
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both'
export type AnimationIterationCount = number | 'infinite'
export type AnimationPlayState = 'running' | 'paused'
export type AnimationTimingFunction = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'step-start'
  | 'step-end'
  | string

// Error boundary types
export interface ErrorInfo {
  componentStack: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

// Performance types
export interface PerformanceConfig {
  enableMonitoring: boolean
  sampleRate: number
  thresholds: {
    fps: number
    memory: number
    renderTime: number
  }
  reportingEndpoint?: string
}

// Security types
export interface CSPDirectives {
  'default-src'?: string[]
  'script-src'?: string[]
  'style-src'?: string[]
  'img-src'?: string[]
  'font-src'?: string[]
  'connect-src'?: string[]
  'frame-src'?: string[]
  'object-src'?: string[]
  'media-src'?: string[]
  'worker-src'?: string[]
  'child-src'?: string[]
  'form-action'?: string[]
  'frame-ancestors'?: string[]
  'base-uri'?: string[]
  'upgrade-insecure-requests'?: boolean
}

export {}