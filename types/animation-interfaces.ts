/**
 * Comprehensive Animation Interface Definitions for Next.js 15.5.0
 * Detailed type definitions for all animation components and systems
 */

import type { RefObject, CSSProperties } from 'react'
import type { Transition } from 'framer-motion'

// Base Animation Interfaces
export interface BaseAnimationProps {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
  disabled?: boolean
  reducedMotion?: boolean
}

// Animation Manager Interface
export interface AnimationManagerConfig {
  maxConcurrentAnimations: number
  performanceMode: 'high' | 'balanced' | 'battery-saver'
  adaptiveQuality: boolean
  globalEasing: string
  globalDuration: number
  debugMode: boolean
}

export interface AnimationManagerInterface {
  config: AnimationManagerConfig
  activeAnimations: Map<string, Animation>
  register(id: string, animation: Animation): void
  unregister(id: string): void
  pauseAll(): void
  resumeAll(): void
  stopAll(): void
  getPerformanceMetrics(): AnimationPerformanceMetrics
  setQuality(quality: 'low' | 'medium' | 'high'): void
}

// Performance Monitor Interface
export interface AnimationPerformanceMetrics {
  fps: number
  frameDrops: number
  memoryUsage: number
  cpuUsage: number
  activeAnimationCount: number
  averageFrameTime: number
  worstFrameTime: number
  timestamp: number
}

export interface PerformanceMonitorInterface {
  isMonitoring: boolean
  metrics: AnimationPerformanceMetrics
  thresholds: PerformanceThresholds
  startMonitoring(): void
  stopMonitoring(): void
  getMetrics(): AnimationPerformanceMetrics
  checkThresholds(): boolean
  onPerformanceDrop?: (metrics: AnimationPerformanceMetrics) => void
}

export interface PerformanceThresholds {
  minFPS: number
  maxMemoryUsage: number
  maxCPUUsage: number
  maxFrameTime: number
}

// Particle System Interfaces
export interface ParticleSystemInterface extends BaseAnimationProps {
  count: number
  speed: number
  size: { min: number; max: number }
  colors: string[]
  interactive: boolean
  density: 'low' | 'medium' | 'high'
  physics: ParticlePhysicsConfig
  emitter: ParticleEmitterConfig
  renderer: ParticleRendererConfig
}

export interface ParticlePhysicsConfig {
  gravity: { x: number; y: number }
  friction: number
  bounce: number
  wind: { x: number; y: number }
  turbulence: number
  collision: boolean
  boundaries: 'bounce' | 'wrap' | 'destroy'
}

export interface ParticleEmitterConfig {
  rate: number
  burst: number
  lifetime: { min: number; max: number }
  position: { x: number; y: number; radius: number }
  velocity: { min: number; max: number; angle: number; spread: number }
  acceleration: { x: number; y: number }
}

export interface ParticleRendererConfig {
  type: 'circle' | 'square' | 'triangle' | 'image' | 'custom'
  blendMode: GlobalCompositeOperation
  opacity: { min: number; max: number }
  scale: { min: number; max: number }
  rotation: { min: number; max: number; speed: number }
  trail: boolean
  trailLength: number
}

export interface ParticleInterface {
  id: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  acceleration: { x: number; y: number }
  size: number
  color: string
  opacity: number
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
  mass: number
  update(deltaTime: number): void
  render(context: CanvasRenderingContext2D | WebGLRenderingContext): void
  isDead(): boolean
}

// Morphing Background Interfaces
export interface MorphingBackgroundInterface extends BaseAnimationProps {
  shapes: MorphingShapeConfig[]
  colors: ColorPaletteConfig
  animationSpeed: number
  blendMode: GlobalCompositeOperation
  morphingAlgorithm: 'bezier' | 'spline' | 'noise' | 'physics'
  complexity: 'low' | 'medium' | 'high'
  responsive: boolean
}

export interface MorphingShapeConfig {
  id: string
  type: 'blob' | 'geometric' | 'organic' | 'custom'
  size: { min: number; max: number }
  position: { x: number; y: number; randomness: number }
  morphSpeed: number
  morphIntensity: number
  color: string | string[]
  opacity: { min: number; max: number }
  rotation: { speed: number; direction: 'clockwise' | 'counterclockwise' | 'random' }
  path?: string // SVG path for custom shapes
  vertices?: number // For geometric shapes
}

export interface ColorPaletteConfig {
  primary: string | string[]
  secondary: string | string[]
  accent: string | string[]
  background: string | string[]
  gradients: GradientConfig[]
  animateColors: boolean
  colorTransitionSpeed: number
}

export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic'
  colors: string[]
  stops?: number[]
  angle?: number
  position?: { x: number; y: number }
  animate: boolean
  animationSpeed: number
}

// Scroll Animation Interfaces
export interface ScrollAnimationInterface extends BaseAnimationProps {
  trigger: string | RefObject<Element>
  start: string | number
  end: string | number
  scrub: boolean | number
  pin: boolean
  pinSpacing: boolean
  snap: boolean | number | number[]
  anticipatePin: number
  refreshPriority: number
  onUpdate?: (progress: number) => void
  onToggle?: (isActive: boolean) => void
  onRefresh?: () => void
}

export interface ScrollTriggerConfig {
  trigger: Element | string
  start: string | number | (() => number)
  end: string | number | (() => number)
  scrub: boolean | number
  pin: boolean | Element | string
  pinSpacing: boolean
  snap: boolean | number | number[] | { snapTo: number | number[] | 'labels'; duration: number; delay: number }
  anticipatePin: number
  fastScrollEnd: boolean | number
  preventOverlaps: boolean | string
  refreshPriority: number
  markers: boolean | { startColor: string; endColor: string; fontSize: string; fontWeight: string; indent: number }
  id: string
  horizontal: boolean
  containerAnimation: any
  once: boolean
  toggleActions: string
  toggleClass: string | { targets: string | Element | Element[]; className: string }
  onUpdate: (self: any) => void
  onToggle: (self: any) => void
  onRefresh: (self: any) => void
  onScrubComplete: (self: any) => void
}

// Magnetic Effect Interfaces
export interface MagneticEffectInterface extends BaseAnimationProps {
  strength: number
  distance: number
  duration: number
  easing: string
  returnDuration: number
  returnEasing: string
  threshold: number
  axis: 'both' | 'x' | 'y'
  invert: boolean
  scale: boolean
  scaleIntensity: number
}

export interface MagneticCursorInterface extends BaseAnimationProps {
  variant: 'default' | 'hover' | 'click' | 'text' | 'custom'
  size: number
  magneticStrength: number
  magneticDistance: number
  followSpeed: number
  hideNativeCursor: boolean
  blendMode: GlobalCompositeOperation
  trail: boolean
  trailLength: number
  customRenderer?: (context: CanvasRenderingContext2D, position: { x: number; y: number }) => void
}

// Text Animation Interfaces
export interface TextRevealInterface extends BaseAnimationProps {
  text: string
  animationType: 'fade' | 'slide' | 'scale' | 'typewriter' | 'wave' | 'glitch' | 'morphing'
  direction: 'up' | 'down' | 'left' | 'right'
  delay: number
  duration: number
  stagger: number
  easing: string
  splitBy: 'character' | 'word' | 'line'
  preserveWhitespace: boolean
  onComplete?: () => void
}

export interface TypewriterInterface extends BaseAnimationProps {
  text: string | string[]
  speed: number
  deleteSpeed: number
  delayBetweenTexts: number
  loop: boolean
  cursor: boolean
  cursorChar: string
  cursorBlinkSpeed: number
  onComplete?: () => void
  onTextChange?: (text: string, index: number) => void
}

// Glassmorphism Interfaces
export interface GlassmorphismInterface extends BaseAnimationProps {
  blur: number
  opacity: number
  borderRadius: number
  borderWidth: number
  borderOpacity: number
  borderGradient: string[]
  background: string | string[]
  backdropFilter: string
  boxShadow: string
  hoverEffect: 'none' | 'lift' | 'glow' | 'magnetic' | 'tilt' | 'scale'
  hoverIntensity: number
}

export interface GlassmorphicCardInterface extends GlassmorphismInterface {
  variant: 'premium' | 'standard' | 'minimal' | 'custom'
  padding: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border: boolean
  clickable: boolean
  onClick?: () => void
  glowColor: string
  glowIntensity: number
  tiltIntensity: number
  magneticStrength: number
}

// Button Animation Interfaces
export interface AnimatedButtonInterface extends BaseAnimationProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  animation: 'ripple' | 'magnetic' | 'glow' | 'morph' | 'pulse' | 'bounce' | 'shake'
  hapticFeedback: boolean
  loadingState: boolean
  loadingAnimation: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  rippleColor: string
  rippleDuration: number
  magneticStrength: number
  glowColor: string
  glowIntensity: number
  morphDuration: number
  morphEasing: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
}

// Image Animation Interfaces
export interface AnimatedImageInterface extends BaseAnimationProps {
  src: string
  alt: string
  width?: number
  height?: number
  animationType: 'fade' | 'slide' | 'zoom' | 'blur' | 'reveal' | 'parallax'
  direction: 'up' | 'down' | 'left' | 'right' | 'center'
  duration: number
  delay: number
  easing: string
  hoverEffect: 'none' | 'zoom' | 'tilt' | 'glow' | 'blur' | 'grayscale'
  hoverIntensity: number
  parallaxSpeed: number
  onLoad?: () => void
  onError?: () => void
}

// Loading Animation Interfaces
export interface LoadingAnimationInterface extends BaseAnimationProps {
  variant: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave' | 'bars' | 'custom'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color: string
  speed: number
  text?: string
  textPosition: 'top' | 'bottom' | 'left' | 'right'
  fullScreen: boolean
  overlay: boolean
  overlayColor: string
  overlayOpacity: number
  customRenderer?: (props: { size: number; color: string; speed: number }) => React.ReactNode
}

// Transition Interfaces
export interface PageTransitionInterface {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'flip' | 'custom'
  direction: 'up' | 'down' | 'left' | 'right'
  duration: number
  easing: string
  overlay: boolean
  overlayColor: string
  customTransition?: Transition
  onStart?: () => void
  onComplete?: () => void
}

export interface RouteTransitionInterface extends PageTransitionInterface {
  routes: Record<string, PageTransitionInterface>
  defaultTransition: PageTransitionInterface
  preserveScroll: boolean
  skipInitialTransition: boolean
}

// Error Boundary Interfaces
export interface AnimationErrorBoundaryInterface {
  fallback: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  isolate?: boolean
}

// Adaptive Quality Interfaces
export interface AdaptiveQualityInterface {
  initialQuality: 'low' | 'medium' | 'high' | 'auto'
  autoAdjust: boolean
  thresholds: {
    fps: { low: number; medium: number; high: number }
    memory: { low: number; medium: number; high: number }
    cpu: { low: number; medium: number; high: number }
  }
  adjustmentInterval: number
  degradationSteps: QualityDegradationStep[]
  onQualityChange?: (quality: 'low' | 'medium' | 'high') => void
}

export interface QualityDegradationStep {
  condition: (metrics: AnimationPerformanceMetrics) => boolean
  action: 'reduce-particles' | 'disable-blur' | 'reduce-fps' | 'disable-shadows' | 'simplify-shapes'
  value: number
}

// Reduced Motion Interfaces
export interface ReducedMotionInterface {
  respectSystemPreference: boolean
  fallbackAnimations: Record<string, 'none' | 'fade' | 'simple'>
  customFallbacks: Record<string, React.ComponentType>
  showToggle: boolean
  togglePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  onPreferenceChange?: (prefersReducedMotion: boolean) => void
}

// WebGL Interfaces
export interface WebGLAnimationInterface extends BaseAnimationProps {
  canvas: RefObject<HTMLCanvasElement>
  context: WebGLRenderingContext | WebGL2RenderingContext
  shaders: {
    vertex: string
    fragment: string
  }
  uniforms: Record<string, any>
  attributes: Record<string, any>
  textures: WebGLTexture[]
  framebuffers: WebGLFramebuffer[]
  onRender?: (context: WebGLRenderingContext | WebGL2RenderingContext) => void
  onResize?: (width: number, height: number) => void
}

// Animation Composition Interfaces
export interface AnimationSequenceInterface {
  animations: Array<{
    component: React.ComponentType<any>
    props: any
    delay: number
    duration: number
  }>
  loop: boolean
  autoStart: boolean
  onComplete?: () => void
  onSequenceStart?: () => void
  onAnimationStart?: (index: number) => void
  onAnimationComplete?: (index: number) => void
}

export interface AnimationGroupInterface extends BaseAnimationProps {
  animations: React.ReactNode[]
  stagger: number
  direction: 'normal' | 'reverse' | 'alternate'
  sync: boolean
  onGroupStart?: () => void
  onGroupComplete?: () => void
}