/**
 * Animation type definitions for Next.js 15.5.0 upgrade
 */

// Morphing Background Types
export interface MorphingBackgroundProps {
  shapes?: ShapeConfig[]
  colors?: ColorPalette
  animationSpeed?: number
  blendMode?: BlendMode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export interface ShapeConfig {
  type: 'blob' | 'geometric' | 'organic'
  size: number
  position: { x: number; y: number }
  morphSpeed: number
  color?: string
  opacity?: number
}

export interface ColorPalette {
  primary: string | string[]
  secondary: string | string[]
  accent: string | string[]
  background?: string | string[]
  gradients?: string[]
}

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'

// Particle System Types
export interface ParticleSystemProps {
  count?: number
  speed?: number
  size?: { min: number; max: number }
  colors?: string[]
  interactive?: boolean
  density?: 'low' | 'medium' | 'high'
  className?: string
}

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

// Animation Configuration Types
export interface AnimationConfig {
  id: string
  name: string
  type: 'entrance' | 'exit' | 'hover' | 'scroll'
  duration: number
  easing: string
  delay: number
  stagger: number
  properties: AnimationProperty[]
}

export interface AnimationProperty {
  property: string
  from: any
  to: any
  unit?: string
}

// Scroll Animation Types
export interface ScrollAnimationConfig {
  trigger: string
  start: string
  end: string
  scrub: boolean | number
  pin: boolean
  animation: any // GSAP Timeline
}

// Magnetic Effect Types
export interface MagneticEffectConfig {
  strength: number
  distance: number
  duration: number
  easing: string
}

// Lazy Animation Types
export interface LazyAnimationConfig {
  threshold: number
  rootMargin: string
  triggerOnce: boolean
  fallback: React.ReactNode
}

// Performance Types
export interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  renderTime: number
  animationCount: number
  timestamp: number
}

export interface PerformanceThresholds {
  minFPS: number
  maxMemoryUsage: number
  maxRenderTime: number
  maxAnimationCount: number
}

export interface DeviceCapabilities {
  supportsWebGL: boolean
  supportsWebGL2: boolean
  supportsIntersectionObserver: boolean
  supportsResizeObserver: boolean
  supportsWebP: boolean
  supportsAVIF: boolean
  devicePixelRatio: number
  maxTextureSize: number
  preferredFrameRate: number
  connectionType: 'fast' | 'slow' | 'offline'
  cores: number
  memory: number
  gpu: 'high' | 'medium' | 'low' | 'none'
}

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra'

// Error Handling Types
export interface AnimationError {
  type: 'load' | 'runtime' | 'performance'
  message: string
  component: string
  timestamp: number
  stack?: string
}

// Cursor Types
export interface CursorState {
  variant: 'default' | 'hover' | 'click' | 'text'
  position: { x: number; y: number }
  isVisible: boolean
}

export interface CursorContextType {
  cursorVariant: 'default' | 'hover' | 'click' | 'text'
  setCursorVariant: (variant: 'default' | 'hover' | 'click' | 'text') => void
  cursorPosition: { x: number; y: number }
  setCursorPosition: (position: { x: number; y: number }) => void
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
}

// Text Animation Types
export interface TextRevealProps {
  text: string
  className?: string
  animationType?: 'fade' | 'slide' | 'scale' | 'typewriter'
  delay?: number
  duration?: number
  stagger?: number
}

// Image Animation Types
export interface ImageAnimationProps {
  src: string
  alt: string
  animationType?: 'fade' | 'slide' | 'zoom' | 'blur'
  duration?: number
  delay?: number
  className?: string
}

// Button Animation Types
export interface ButtonAnimationProps {
  variant: 'primary' | 'secondary' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  animation: 'ripple' | 'magnetic' | 'morph' | 'glow'
  hapticFeedback?: boolean
  loadingState?: boolean
}

// Card Animation Types
export interface CardAnimationProps {
  variant: 'premium' | 'standard' | 'minimal'
  hoverEffect: 'lift' | 'glow' | 'magnetic' | 'tilt'
  blurIntensity?: number
  borderGradient?: string[]
}