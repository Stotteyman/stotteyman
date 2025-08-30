/**
 * Hook type definitions for Next.js 15.5.0 upgrade
 */

import type { RefObject } from 'react'

// Performance hooks
export interface UsePerformanceMonitorOptions {
  enabled?: boolean
  sampleRate?: number
  reportingInterval?: number
  thresholds?: {
    fps?: number
    memory?: number
    renderTime?: number
  }
}

export interface UsePerformanceMonitorReturn {
  metrics: {
    fps: number
    memory: number
    renderTime: number
    timestamp: number
  }
  isSupported: boolean
  startMonitoring: () => void
  stopMonitoring: () => void
  resetMetrics: () => void
}

// Adaptive quality hooks
export interface UseAdaptiveQualityOptions {
  initialQuality?: 'low' | 'medium' | 'high'
  autoAdjust?: boolean
  thresholds?: {
    fps?: number
    memory?: number
  }
}

export interface UseAdaptiveQualityReturn {
  quality: 'low' | 'medium' | 'high'
  setQuality: (quality: 'low' | 'medium' | 'high') => void
  deviceCapabilities: {
    webgl: boolean
    webgl2: boolean
    cores: number
    memory: number
    gpu: 'high' | 'medium' | 'low' | 'none'
  }
  isSupported: boolean
}

// Reduced motion hooks
export interface UseReducedMotionReturn {
  prefersReducedMotion: boolean
  isSupported: boolean
}

// Intersection observer hooks
export interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  triggerOnce?: boolean
  skip?: boolean
}

export interface UseIntersectionObserverReturn {
  ref: RefObject<Element>
  inView: boolean
  entry?: IntersectionObserverEntry
}

// Resize observer hooks
export interface UseResizeObserverOptions {
  box?: 'border-box' | 'content-box' | 'device-pixel-content-box'
}

export interface UseResizeObserverReturn {
  ref: RefObject<Element>
  width: number
  height: number
  entry?: ResizeObserverEntry
}

// Mouse position hooks
export interface UseMousePositionOptions {
  includeTouch?: boolean
  throttle?: number
}

export interface UseMousePositionReturn {
  x: number
  y: number
  isMoving: boolean
}

// Scroll hooks
export interface UseScrollOptions {
  throttle?: number
  element?: RefObject<Element>
}

export interface UseScrollReturn {
  scrollX: number
  scrollY: number
  scrollDirection: 'up' | 'down' | 'left' | 'right' | null
  isScrolling: boolean
}

// Local storage hooks
export interface UseLocalStorageOptions<T> {
  defaultValue?: T
  serializer?: {
    read: (value: string) => T
    write: (value: T) => string
  }
}

export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  removeValue: () => void
}

// Media query hooks
export interface UseMediaQueryReturn {
  matches: boolean
  isSupported: boolean
}

// Debounce hooks
export interface UseDebounceOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

export interface UseDebounceReturn<T extends (...args: any[]) => any> {
  debouncedCallback: T
  cancel: () => void
  flush: () => void
  isPending: () => boolean
}

// Throttle hooks
export interface UseThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

export interface UseThrottleReturn<T extends (...args: any[]) => any> {
  throttledCallback: T
  cancel: () => void
  flush: () => void
}

// Animation hooks
export interface UseAnimationOptions {
  duration?: number
  easing?: string
  delay?: number
  iterations?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  playState?: 'running' | 'paused'
}

export interface UseAnimationReturn {
  ref: RefObject<Element>
  play: () => void
  pause: () => void
  stop: () => void
  restart: () => void
  isPlaying: boolean
  progress: number
}

// Gesture hooks
export interface UseGestureOptions {
  drag?: boolean
  pinch?: boolean
  scroll?: boolean
  wheel?: boolean
  hover?: boolean
}

export interface UseGestureReturn {
  ref: RefObject<Element>
  isDragging: boolean
  isPinching: boolean
  isScrolling: boolean
  isHovering: boolean
  gestureState: {
    offset: [number, number]
    velocity: [number, number]
    direction: [number, number]
    distance: number
    angle: number
  }
}

// Web vitals hooks
export interface UseWebVitalsOptions {
  reportWebVitals?: (metric: any) => void
  enabledMetrics?: ('CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB')[]
}

export interface UseWebVitalsReturn {
  metrics: Record<string, number>
  isSupported: boolean
}

// Error boundary hooks
export interface UseErrorBoundaryReturn {
  resetErrorBoundary: () => void
  showBoundary: (error: Error) => void
}

// Focus trap hooks
export interface UseFocusTrapOptions {
  active?: boolean
  paused?: boolean
  allowOutsideClick?: boolean
  clickOutsideDeactivates?: boolean
  returnFocusOnDeactivate?: boolean
  setReturnFocus?: Element | false
  escapeDeactivates?: boolean
  preventScroll?: boolean
}

export interface UseFocusTrapReturn {
  ref: RefObject<Element>
  activate: () => void
  deactivate: () => void
  pause: () => void
  unpause: () => void
}

// Clipboard hooks
export interface UseClipboardOptions {
  timeout?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface UseClipboardReturn {
  copy: (text: string) => Promise<void>
  copied: boolean
  isSupported: boolean
}

// Network status hooks
export interface UseNetworkStatusReturn {
  online: boolean
  downlink?: number
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  rtt?: number
  saveData?: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
}

// Battery hooks
export interface UseBatteryReturn {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  isSupported: boolean
}

// Geolocation hooks
export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

export interface UseGeolocationReturn {
  position: {
    latitude: number
    longitude: number
    accuracy: number
    altitude?: number
    altitudeAccuracy?: number
    heading?: number
    speed?: number
  } | null
  error: GeolocationPositionError | null
  loading: boolean
  isSupported: boolean
}

// Idle hooks
export interface UseIdleOptions {
  timeout?: number
  events?: string[]
  initialState?: boolean
}

export interface UseIdleReturn {
  idle: boolean
  lastActive: number
}

// Page visibility hooks
export interface UsePageVisibilityReturn {
  isVisible: boolean
  visibilityState: 'visible' | 'hidden' | 'prerender'
}

// Preferred color scheme hooks
export interface UsePreferredColorSchemeReturn {
  colorScheme: 'light' | 'dark' | null
  isSupported: boolean
}

// Window size hooks
export interface UseWindowSizeReturn {
  width: number
  height: number
  isSupported: boolean
}

// Document title hooks
export interface UseDocumentTitleOptions {
  restoreOnUnmount?: boolean
}

export interface UseDocumentTitleReturn {
  title: string
  setTitle: (title: string) => void
}

// Favicon hooks
export interface UseFaviconReturn {
  favicon: string
  setFavicon: (href: string) => void
}