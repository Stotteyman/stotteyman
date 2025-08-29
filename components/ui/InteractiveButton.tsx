'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { InteractiveButtonProps } from '@/types/components'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MagneticElement } from '../animations/MagneticCursor'

export function InteractiveButton({
  variant = 'primary',
  size = 'md',
  animation = 'ripple',
  hapticFeedback = false,
  loadingState = false,
  onClick,
  children,
  disabled = false,
  className = ''
}: InteractiveButtonProps) {
  const [isClicked, setIsClicked] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = useReducedMotion()
  let rippleId = 0

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loadingState) return

    // Haptic feedback for supported devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }

    // Ripple effect
    if (animation === 'ripple' && !prefersReducedMotion) {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        setRipples(prev => [...prev, { x, y, id: rippleId++ }])
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.slice(1))
        }, 600)
      }
    }

    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 150)

    try {
      if (onClick) {
        await onClick(e)
      }
    } catch (error) {
      console.error('Button click error:', error)
    }
  }

  const getVariantStyles = () => {
    const baseStyles = 'font-semibold rounded-full transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus:ring-blue-500 neon-glow`
      case 'secondary':
        return `${baseStyles} glass border border-white/20 text-white hover:border-blue-500/50 focus:ring-blue-500`
      case 'ghost':
        return `${baseStyles} text-gray-300 hover:text-white hover:bg-white/10 focus:ring-gray-500`
      default:
        return baseStyles
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'lg':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-6 py-3 text-base'
    }
  }

  const getAnimationProps = () => {
    if (prefersReducedMotion) return {}

    switch (animation) {
      case 'magnetic':
        return {}
      case 'morph':
        return {
          whileHover: { 
            scale: 1.05,
            borderRadius: '20px'
          },
          whileTap: { scale: 0.95 }
        }
      default:
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 }
        }
    }
  }

  const ButtonComponent = animation === 'magnetic' ? MagneticElement : motion.button

  const buttonProps = animation === 'magnetic' 
    ? { strength: 0.2, as: 'button' as const }
    : getAnimationProps()

  return (
    <ButtonComponent
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loadingState}
      className={`${getVariantStyles()} ${getSizeStyles()} ${className} ${
        disabled || loadingState ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${isClicked ? 'animate-pulse' : ''}`}
      {...buttonProps}
    >
      {/* Ripple effects */}
      {animation === 'ripple' && ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ 
            width: 300, 
            height: 300, 
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Loading spinner */}
      {loadingState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
        </motion.div>
      )}

      {/* Button content */}
      <span className={`relative z-10 flex items-center justify-center gap-2 ${
        loadingState ? 'opacity-0' : 'opacity-100'
      } transition-opacity duration-200`}>
        {children}
      </span>

      {/* Shine effect for primary variant */}
      {variant === 'primary' && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          whileHover={{ translateX: '200%' }}
          transition={{ duration: 0.6 }}
        />
      )}
    </ButtonComponent>
  )
}