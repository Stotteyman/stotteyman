/**
 * Component type definitions for Next.js 15.5.0 upgrade
 */

import React from 'react'

// Form Field Types
export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'select'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string | undefined
  success?: boolean | undefined
  helperText?: string | undefined
  className?: string
  autoComplete?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  options?: Array<{ value: string; label: string }>
  rows?: number
  showPasswordToggle?: boolean
  icon?: React.ReactNode
  prefix?: string
  suffix?: string
  loading?: boolean
}

// Button Types
export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  animation?: 'ripple' | 'magnetic' | 'glow' | 'none'
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  download?: boolean | string
}

// Interactive Button Types
export interface InteractiveButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  loadingState?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  animation?: 'ripple' | 'magnetic' | 'glow' | 'morph' | 'none'
  hapticFeedback?: boolean
  magneticStrength?: number
  glowIntensity?: number
  rippleColor?: string
  morphDuration?: number
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  download?: boolean | string
}

// Card Types
export interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'premium' | 'glassmorphic' | 'minimal'
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  borderGradient?: string[]
  blur?: number
  opacity?: number
  hoverEffect?: 'none' | 'lift' | 'glow' | 'magnetic' | 'tilt'
  clickable?: boolean
  onClick?: () => void
}

// Glassmorphic Card Types
export interface GlassmorphicCardProps {
  children: React.ReactNode
  variant?: 'premium' | 'standard' | 'minimal'
  blur?: number
  opacity?: number
  borderGradient?: string[]
  hoverEffect?: 'lift' | 'glow' | 'magnetic' | 'tilt'
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: boolean
  border?: boolean
  clickable?: boolean
  onClick?: () => void
  glowIntensity?: number
  tiltIntensity?: number
  magneticStrength?: number
}

// Modal Types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
  overlayClassName?: string
  animation?: 'fade' | 'slide' | 'scale' | 'none'
  position?: 'center' | 'top' | 'bottom'
}

// Navigation Types
export interface NavigationProps {
  className?: string
  hideOnScroll?: boolean
  adaptiveBackground?: boolean
  magneticEffect?: boolean
  breadcrumbs?: boolean
  variant?: 'default' | 'minimal' | 'premium'
}

export interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
  disabled?: boolean
  children?: NavigationItem[]
}

// Image Types
export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  className?: string
  sizes?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  lazy?: boolean
  webpSrc?: string
  avifSrc?: string
  animation?: 'fade' | 'slide' | 'zoom' | 'blur' | 'none'
  duration?: number
  delay?: number
}

// Loading Types
export interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
  text?: string
  fullScreen?: boolean
}

// Toast Types
export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
}

// Tooltip Types
export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
  delay?: number
  className?: string
  arrow?: boolean
  disabled?: boolean
}

// Dropdown Types
export interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  className?: string
  disabled?: boolean
  closeOnClick?: boolean
  offset?: number
}

// Tabs Types
export interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

// Accordion Types
export interface AccordionProps {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  className?: string
  collapsible?: boolean
}

export interface AccordionItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

// Progress Types
export interface ProgressProps {
  value: number
  max?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
  animated?: boolean
}

// Badge Types
export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  dot?: boolean
}

// Avatar Types
export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onClick?: () => void
  status?: 'online' | 'offline' | 'away' | 'busy'
}

// Separator Types
export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
  decorative?: boolean
}

// Switch Types
export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  description?: string
}

// Checkbox Types
export interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  label?: string
  description?: string
  indeterminate?: boolean
}

// Radio Types
export interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export interface RadioProps {
  value: string
  disabled?: boolean
  className?: string
  label?: string
  description?: string
}

// Slider Types
export interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  orientation?: 'horizontal' | 'vertical'
  showValue?: boolean
}