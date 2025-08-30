/**
 * Component type definitions for Next.js 15.5.0 upgrade
 * Enhanced UI components with animation and accessibility support
 */

import { ReactNode, ComponentType, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, FormHTMLAttributes } from 'react'
import { AnimationConfig, AnimationQuality, FramerMotionVariants, FramerMotionTransition } from './animations'

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  'data-testid'?: string
  'aria-label'?: string
  'aria-describedby'?: string
  id?: string
}

// Animation-enhanced component props
export interface AnimatedComponentProps extends BaseComponentProps {
  animation?: AnimationConfig
  variants?: FramerMotionVariants
  transition?: FramerMotionTransition
  quality?: AnimationQuality
  respectsReducedMotion?: boolean
  fallbackComponent?: ComponentType
}

// Button component interfaces
export interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, AnimatedComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  animation?: 'ripple' | 'magnetic' | 'morph' | 'pulse' | 'none'
  hapticFeedback?: boolean
  loadingState?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onClick?: () => void | Promise<void>
}

// Card component interfaces
export interface GlassmorphicCardProps extends HTMLAttributes<HTMLDivElement>, AnimatedComponentProps {
  variant?: 'premium' | 'standard' | 'minimal' | 'elevated'
  blur?: number
  opacity?: number
  borderGradient?: string[]
  hoverEffect?: 'lift' | 'glow' | 'magnetic' | 'tilt' | 'none'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  interactive?: boolean
}

export interface VentureCardProps extends GlassmorphicCardProps {
  title: string
  description: string
  image?: string
  tags?: string[]
  status?: 'active' | 'completed' | 'upcoming' | 'paused'
  progress?: number
  href?: string
  onCardClick?: () => void
  showPreview?: boolean
  previewContent?: ReactNode
}

// Navigation component interfaces
export interface SmartNavigationProps extends HTMLAttributes<HTMLElement>, AnimatedComponentProps {
  hideOnScroll?: boolean
  adaptiveBackground?: boolean
  magneticEffect?: boolean
  breadcrumbs?: boolean
  sticky?: boolean
  transparent?: boolean
  blur?: boolean
  logo?: ReactNode
  items?: NavigationItem[]
  mobileBreakpoint?: number
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: ReactNode
  badge?: string | number
  active?: boolean
  disabled?: boolean
  children?: NavigationItem[]
}

export interface NavigationState {
  isVisible: boolean
  isScrolled: boolean
  currentSection: string
  scrollDirection: 'up' | 'down'
  isMobileMenuOpen: boolean
  activeItem?: string
}

// Form component interfaces
export interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement>, AnimatedComponentProps {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  floating?: boolean
  variant?: 'default' | 'filled' | 'outlined' | 'underlined'
  validation?: ValidationRule[]
  realTimeValidation?: boolean
}

export interface ContactFormProps extends FormHTMLAttributes<HTMLFormElement>, AnimatedComponentProps {
  onFormSubmit?: (data: ContactFormData) => Promise<void>
  loading?: boolean
  success?: boolean
  error?: string
  fields?: FormField[]
  submitButtonText?: string
  successMessage?: string
  resetOnSuccess?: boolean
}

export interface ContactFormData {
  name: string
  email: string
  company?: string
  message: string
  subject?: string
  phone?: string
  preferredContact?: 'email' | 'phone'
}

export interface FormField {
  name: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required?: boolean
  validation?: ValidationRule[]
  options?: SelectOption[]
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean
}

// Modal and overlay interfaces
export interface ModalProps extends AnimatedComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  preventScroll?: boolean
  focusTrap?: boolean
  returnFocus?: boolean
  overlay?: boolean
  overlayBlur?: boolean
}

// Loading and skeleton interfaces
export interface LoadingSpinnerProps extends AnimatedComponentProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  thickness?: number
  speed?: number
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
}

export interface SkeletonProps extends AnimatedComponentProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular'
  skeletonAnimation?: 'pulse' | 'wave' | 'none'
  lines?: number
  spacing?: number
}

// Hero section interfaces
export interface HeroSectionProps extends AnimatedComponentProps {
  title: string
  subtitle?: string
  description?: string
  primaryCTA?: CTAConfig
  secondaryCTA?: CTAConfig
  backgroundType?: 'particles' | 'morphing' | 'gradient' | 'image' | 'video'
  backgroundConfig?: BackgroundConfig
  textAlignment?: 'left' | 'center' | 'right'
  overlay?: boolean
  overlayOpacity?: number
}

export interface CTAConfig {
  text: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  external?: boolean
}

export interface BackgroundConfig {
  particles?: {
    count: number
    colors: string[]
    speed: number
    interactive: boolean
  }
  morphing?: {
    shapes: number
    colors: string[]
    speed: number
  }
  gradient?: {
    colors: string[]
    direction: number
    animated: boolean
  }
  image?: {
    src: string
    alt: string
    parallax: boolean
  }
  video?: {
    src: string
    poster?: string
    autoplay: boolean
    loop: boolean
    muted: boolean
  }
}

// Accessibility interfaces
export interface AccessibilityProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-busy'?: boolean
  'aria-controls'?: string
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  'aria-disabled'?: boolean
  'aria-invalid'?: boolean | 'grammar' | 'spelling'
  'aria-pressed'?: boolean
  'aria-selected'?: boolean
  role?: string
  tabIndex?: number
}

// Focus management interfaces
export interface FocusManagerProps {
  autoFocus?: boolean
  restoreFocus?: boolean
  trapFocus?: boolean
  initialFocus?: string | HTMLElement
  finalFocus?: string | HTMLElement
  children: ReactNode
}

// Responsive interfaces
export interface ResponsiveProps {
  xs?: any
  sm?: any
  md?: any
  lg?: any
  xl?: any
  '2xl'?: any
}

// Theme and styling interfaces
export interface ThemeConfig {
  colors: ColorScheme
  typography: TypographyConfig
  spacing: SpacingConfig
  breakpoints: BreakpointConfig
  animations: AnimationThemeConfig
  shadows: ShadowConfig
  borders: BorderConfig
}

export interface ColorScheme {
  primary: ColorScale
  secondary: ColorScale
  accent: ColorScale
  neutral: ColorScale
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  info: ColorScale
}

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface TypographyConfig {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
  }
  fontSize: Record<string, [string, { lineHeight: string; letterSpacing?: string }]>
  fontWeight: Record<string, string>
}

export interface SpacingConfig {
  [key: string]: string
}

export interface BreakpointConfig {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface AnimationThemeConfig {
  duration: Record<string, string>
  easing: Record<string, string>
  keyframes: Record<string, Record<string, any>>
}

export interface ShadowConfig {
  [key: string]: string
}

export interface BorderConfig {
  radius: Record<string, string>
  width: Record<string, string>
}

// Performance optimization interfaces
export interface LazyComponentProps extends BaseComponentProps {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  placeholder?: ReactNode
  fallback?: ReactNode
  onLoad?: () => void
  onError?: (error: Error) => void
}

// Error boundary interfaces
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: any) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

export interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  componentStack?: string
}

// SEO and metadata interfaces
export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  openGraph?: OpenGraphConfig
  twitter?: TwitterConfig
  jsonLd?: Record<string, any>
  noindex?: boolean
  nofollow?: boolean
}

export interface OpenGraphConfig {
  title?: string
  description?: string
  type?: string
  url?: string
  image?: string
  siteName?: string
  locale?: string
}

export interface TwitterConfig {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  site?: string
  creator?: string
  title?: string
  description?: string
  image?: string
}