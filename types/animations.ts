/**
 * Animation type definitions for Next.js 15.5.0 upgrade
 * Enhanced with strict typing for performance and accessibility
 */

// Core animation types
export type AnimationType = 'entrance' | 'exit' | 'hover' | 'scroll' | 'transition'
export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier'
export type AnimationQuality = 'low' | 'medium' | 'high' | 'auto'

// Animation configuration interfaces
export interface AnimationConfig {
  id: string
  name: string
  type: AnimationType
  duration: number
  easing: EasingFunction | string
  delay?: number
  stagger?: number
  properties: AnimationProperty[]
  quality?: AnimationQuality
  respectsReducedMotion?: boolean
}

export interface AnimationProperty {
  property: string
  from: string | number
  to: string | number
  unit?: string
}

// Performance monitoring interfaces
export interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  renderTime: number
  animationCount: number
  timestamp: number
  quality: AnimationQuality
}

export interface PerformanceThresholds {
  minFPS: number
  maxMemoryUsage: number
  maxRenderTime: number
  degradationThreshold: number
}

// Device capabilities interface
export interface DeviceCapabilities {
  supportsWebGL: boolean
  supportsIntersectionObserver: boolean
  supportsResizeObserver: boolean
  devicePixelRatio: number
  maxTextureSize: number
  preferredFrameRate: number
  hardwareConcurrency: number
  memoryGB?: number
  connectionType?: string
}

// Particle system interfaces
export interface ParticleSystemProps {
  count: number
  speed: number
  size: { min: number; max: number }
  colors: string[]
  interactive: boolean
  density: 'low' | 'medium' | 'high'
  quality?: AnimationQuality
  respectsReducedMotion?: boolean
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

// Morphing background interfaces
export interface MorphingBackgroundProps {
  shapes: ShapeConfig[]
  colors: ColorPalette
  animationSpeed: number
  blendMode: BlendMode
  quality?: AnimationQuality
}

export interface ShapeConfig {
  type: 'blob' | 'geometric' | 'organic'
  size: number
  position: { x: number; y: number }
  morphSpeed: number
  complexity: number
}

export interface ColorPalette {
  primary: string[]
  secondary: string[]
  accent: string[]
  gradients: GradientConfig[]
}

export interface GradientConfig {
  id: string
  colors: string[]
  direction: number
  type: 'linear' | 'radial' | 'conic'
}

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light'

// Scroll animation interfaces
export interface ScrollAnimationConfig {
  trigger: string
  start: string
  end: string
  scrub: boolean | number
  pin: boolean
  animation: GSAPTimeline
  markers?: boolean
  refreshPriority?: number
}

export interface ScrollAnimationHookReturn {
  isLoaded: boolean
  progress: number
  direction: 'up' | 'down'
  isInView: boolean
  velocity: number
}

// Reduced motion interfaces
export interface ReducedMotionConfig {
  respectSystemPreference: boolean
  fallbackAnimations: FallbackAnimationConfig[]
  staticAlternatives: StaticAlternativeConfig[]
}

export interface FallbackAnimationConfig {
  originalAnimation: string
  fallbackType: 'css' | 'static' | 'simplified'
  fallbackConfig: Record<string, any>
}

export interface StaticAlternativeConfig {
  component: string
  staticVersion: React.ComponentType
  description: string
}

// Animation error handling
export interface AnimationError {
  id: string
  type: 'performance' | 'compatibility' | 'resource' | 'timeout'
  message: string
  component?: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

export interface AnimationFallback {
  type: 'css' | 'static' | 'simplified'
  config: FallbackConfig
  reason: string
}

export interface FallbackConfig {
  duration?: number
  easing?: string
  properties?: Record<string, string>
  className?: string
}

// Lazy animation loading
export interface LazyAnimationWrapperProps {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
  quality?: AnimationQuality
}

// Adaptive quality system
export interface AdaptiveQualityHookReturn {
  quality: AnimationQuality
  capabilities: DeviceCapabilities
  shouldReduceMotion: boolean
  canUseWebGL: boolean
  recommendedFPS: number
}

// Animation manager interfaces
export interface AnimationManager {
  register(config: AnimationConfig): void
  unregister(id: string): void
  play(id: string, target?: HTMLElement): Promise<void>
  pause(id: string): void
  stop(id: string): void
  setQuality(quality: AnimationQuality): void
  getMetrics(): PerformanceMetrics
  cleanup(): void
}

// GSAP specific types
export interface GSAPTimeline {
  to(target: any, vars: any): GSAPTimeline
  from(target: any, vars: any): GSAPTimeline
  fromTo(target: any, fromVars: any, toVars: any): GSAPTimeline
  set(target: any, vars: any): GSAPTimeline
  play(): GSAPTimeline
  pause(): GSAPTimeline
  reverse(): GSAPTimeline
  restart(): GSAPTimeline
  kill(): void
  progress(): number
  progress(value: number): GSAPTimeline
  duration(): number
  duration(value: number): GSAPTimeline
}

// Framer Motion specific types
export interface FramerMotionVariants {
  initial?: Record<string, any>
  animate?: Record<string, any>
  exit?: Record<string, any>
  hover?: Record<string, any>
  tap?: Record<string, any>
  focus?: Record<string, any>
}

export interface FramerMotionTransition {
  duration?: number
  delay?: number
  ease?: string | number[]
  type?: 'spring' | 'tween' | 'keyframes' | 'inertia'
  stiffness?: number
  damping?: number
  mass?: number
  velocity?: number
  restDelta?: number
  restSpeed?: number
}

// Three.js specific types for WebGL animations
export interface ThreeJSScene {
  scene: any
  camera: any
  renderer: any
  controls?: any
  objects: any[]
  lights: any[]
  materials: any[]
  geometries: any[]
}

export interface WebGLCapabilities {
  maxTextureSize: number
  maxVertexTextures: number
  maxFragmentTextures: number
  maxVaryingVectors: number
  maxVertexAttribs: number
  maxVertexUniformVectors: number
  maxFragmentUniformVectors: number
  floatTextures: boolean
  anisotropyExt: boolean
  shaderTextureLOD: boolean
}