/**
 * Scroll Animation Components
 * Reusable components for various scroll-triggered animations
 */

'use client'

import React, { ReactNode, useEffect, useRef } from 'react'
import { useAdvancedScrollAnimations, useStaggeredScrollAnimation, useParallaxScroll, useTextRevealAnimation } from '@/hooks/useAdvancedScrollAnimations'
import { useReducedMotion } from '@/hooks/useAdaptiveQuality'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'rotate'
  duration?: number
  delay?: number
  threshold?: number
  triggerOnce?: boolean
}

export function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up',
  duration = 0.8,
  delay = 0,
  threshold = 0.1,
  triggerOnce = true
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !elementRef.current) return

    const initializeAnimation = async () => {
      try {
        const gsap = (await import('gsap')).gsap
        const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger
        
        gsap.registerPlugin(ScrollTrigger)

        const element = elementRef.current
        if (!element) return

        // Set initial state based on animation type
        const initialState = getInitialState(animation)
        const finalState = getFinalState(animation)

        gsap.set(element, initialState)

        ScrollTrigger.create({
          trigger: element,
          start: `top ${100 - threshold * 100}%`,
          onEnter: () => {
            gsap.to(element, {
              ...finalState,
              duration,
              delay,
              ease: 'power2.out'
            })
          },
          once: triggerOnce
        })
      } catch (error) {
        console.error('Failed to initialize scroll reveal:', error)
        // Fallback to CSS animation
        if (elementRef.current) {
          elementRef.current.classList.add('scroll-reveal-fallback')
        }
      }
    }

    initializeAnimation()
  }, [animation, duration, delay, threshold, triggerOnce, reducedMotion])

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

interface StaggeredRevealProps {
  children: ReactNode
  className?: string
  itemSelector?: string
  stagger?: number
  duration?: number
  animation?: 'fade-up' | 'fade-down' | 'scale' | 'slide-left' | 'slide-right'
}

export function StaggeredReveal({
  children,
  className = '',
  itemSelector = '.stagger-item',
  stagger = 0.1,
  duration = 0.6,
  animation = 'fade-up'
}: StaggeredRevealProps) {
  const { containerRef, isVisible } = useStaggeredScrollAnimation(itemSelector, {
    duration,
    stagger,
    from: getInitialState(animation),
    to: getFinalState(animation)
  })
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={containerRef as any} className={`${className} ${isVisible ? 'staggered-visible' : ''}`}>
      {children}
    </div>
  )
}

interface ParallaxElementProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: 'vertical' | 'horizontal'
  disabled?: boolean
}

export function ParallaxElement({
  children,
  className = '',
  speed = 0.5,
  direction = 'vertical',
  disabled = false
}: ParallaxElementProps) {
  const { elementRef } = useParallaxScroll(speed, direction)
  const reducedMotion = useReducedMotion()

  if (reducedMotion || disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={elementRef as any} className={className}>
      {children}
    </div>
  )
}

interface TextRevealProps {
  children: ReactNode
  className?: string
  animation?: 'typewriter' | 'fade-up' | 'split-chars' | 'split-words'
  as?: keyof JSX.IntrinsicElements
}

export function TextReveal({
  children,
  className = '',
  animation = 'fade-up',
  as: Component = 'div'
}: TextRevealProps) {
  const { textRef, isRevealed } = useTextRevealAnimation(animation)
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <Component className={className}>{children}</Component>
  }

  return (
    <Component 
      ref={textRef as any} 
      className={`${className} ${isRevealed ? 'text-revealed' : ''}`}
    >
      {children}
    </Component>
  )
}

interface ScrollProgressProps {
  className?: string
  height?: string
  backgroundColor?: string
  progressColor?: string
}

export function ScrollProgress({
  className = '',
  height = '4px',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  progressColor = '#3b82f6'
}: ScrollProgressProps) {
  const progressRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const updateProgress = () => {
      if (!progressRef.current) return

      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      progressRef.current.style.width = `${Math.min(scrollPercent, 100)}%`
    }

    const throttledUpdate = throttle(updateProgress, 16)
    window.addEventListener('scroll', throttledUpdate, { passive: true })
    
    // Initial update
    updateProgress()

    return () => {
      window.removeEventListener('scroll', throttledUpdate)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <div 
      className={`fixed top-0 left-0 w-full z-50 ${className}`}
      style={{ height, backgroundColor }}
    >
      <div
        ref={progressRef}
        className="h-full transition-all duration-150 ease-out"
        style={{ backgroundColor: progressColor, width: '0%' }}
      />
    </div>
  )
}

interface InfiniteScrollProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
}

export function InfiniteScroll({
  children,
  className = '',
  speed = 50,
  direction = 'left',
  pauseOnHover = true
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const container = containerRef.current
    const content = container.firstElementChild as HTMLElement
    if (!content) return

    // Clone content for seamless loop
    const clone = content.cloneNode(true) as HTMLElement
    container.appendChild(clone)

    const animationName = `infinite-scroll-${direction}`
    const keyframes = `
      @keyframes ${animationName} {
        0% { transform: translateX(${direction === 'left' ? '0%' : '-100%'}); }
        100% { transform: translateX(${direction === 'left' ? '-100%' : '0%'}); }
      }
    `

    // Add keyframes to document
    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)

    // Apply animation
    content.style.animation = `${animationName} ${speed}s linear infinite`
    clone.style.animation = `${animationName} ${speed}s linear infinite`

    // Pause on hover if enabled
    if (pauseOnHover) {
      const handleMouseEnter = () => {
        content.style.animationPlayState = 'paused'
        clone.style.animationPlayState = 'paused'
      }

      const handleMouseLeave = () => {
        content.style.animationPlayState = 'running'
        clone.style.animationPlayState = 'running'
      }

      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
        document.head.removeChild(style)
      }
    }

    return () => {
      document.head.removeChild(style)
    }
  }, [speed, direction, pauseOnHover, reducedMotion])

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
      style={{ display: 'flex' }}
    >
      <div style={{ display: 'flex', minWidth: '100%' }}>
        {children}
      </div>
    </div>
  )
}

// Helper functions
function getInitialState(animation: string): Record<string, any> {
  switch (animation) {
    case 'fade-up':
      return { opacity: 0, y: 50 }
    case 'fade-down':
      return { opacity: 0, y: -50 }
    case 'fade-left':
      return { opacity: 0, x: 50 }
    case 'fade-right':
      return { opacity: 0, x: -50 }
    case 'scale':
      return { opacity: 0, scale: 0.8 }
    case 'rotate':
      return { opacity: 0, rotation: 10 }
    case 'slide-left':
      return { x: -100 }
    case 'slide-right':
      return { x: 100 }
    default:
      return { opacity: 0, y: 50 }
  }
}

function getFinalState(animation: string): Record<string, any> {
  switch (animation) {
    case 'fade-up':
    case 'fade-down':
      return { opacity: 1, y: 0 }
    case 'fade-left':
    case 'fade-right':
      return { opacity: 1, x: 0 }
    case 'scale':
      return { opacity: 1, scale: 1 }
    case 'rotate':
      return { opacity: 1, rotation: 0 }
    case 'slide-left':
    case 'slide-right':
      return { x: 0 }
    default:
      return { opacity: 1, y: 0 }
  }
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}