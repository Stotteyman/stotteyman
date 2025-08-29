'use client'

import { useEffect, useRef, ReactNode, useState } from 'react'
import { useAdvancedScrollAnimations } from '@/hooks/useAdvancedScrollAnimations'
import { ScrollAnimationConfig } from '@/types/animations'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'

interface ScrollAnimationsProps {
  children: ReactNode
  config?: Partial<ScrollAnimationConfig>
  className?: string
  trigger?: 'viewport' | 'scroll' | 'hover'
  stagger?: number
  delay?: number
}

export function ScrollAnimations({
  children,
  config,
  className = '',
  trigger = 'viewport',
  stagger = 0,
  delay = 0
}: ScrollAnimationsProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { registerElement, unregisterElement, isLoaded } = useAdvancedScrollAnimations()
  const { shouldReduceMotion, quality } = useAdaptiveQuality()

  useEffect(() => {
    const element = elementRef.current
    if (!element || !isLoaded) return

    // Skip animations if reduced motion is preferred
    if (shouldReduceMotion) {
      setIsVisible(true)
      element.style.opacity = '1'
      element.style.transform = 'none'
      return
    }

    // Add delay if specified
    const timeoutId = setTimeout(() => {
      registerElement(element, config)
      
      // Set up intersection observer for visibility
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting)
        },
        { threshold: 0.1 }
      )
      
      observer.observe(element)
      
      return () => {
        observer.disconnect()
      }
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (element) {
        unregisterElement(element)
      }
    }
  }, [isLoaded, registerElement, unregisterElement, config, delay, shouldReduceMotion])

  const getInitialStyles = () => {
    if (shouldReduceMotion) {
      return { opacity: 1, transform: 'none' }
    }
    
    const intensity = quality === 'low' ? 0.5 : quality === 'high' ? 1.5 : 1
    return {
      opacity: 0,
      transform: `translateY(${30 * intensity}px) scale(${0.95 + (0.05 * (1 - intensity))})`
    }
  }

  return (
    <div
      ref={elementRef}
      className={`scroll-animation-wrapper ${className} ${isVisible ? 'in-view' : ''}`}
      style={getInitialStyles()}
      aria-hidden={!isVisible}
    >
      {children}
    </div>
  )
}

interface StaggeredAnimationsProps {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function StaggeredAnimations({
  children,
  staggerDelay = 0.1,
  className = '',
  direction = 'up'
}: StaggeredAnimationsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const { isLoaded } = useAdvancedScrollAnimations()
  const { shouldReduceMotion, quality } = useAdaptiveQuality()

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return

    const initializeStaggered = async () => {
      try {
        const container = containerRef.current
        if (!container) return

        // Skip animations if reduced motion is preferred
        if (shouldReduceMotion) {
          const elements = container.children
          Array.from(elements).forEach((element) => {
            if (element instanceof HTMLElement) {
              element.style.opacity = '1'
              element.style.transform = 'none'
            }
          })
          setIsInView(true)
          return
        }

        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        
        gsap.registerPlugin(ScrollTrigger)

        const elements = container.children
        if (!elements) return

        // Adjust animation based on quality
        const qualityMultiplier = quality === 'low' ? 0.5 : quality === 'high' ? 1.5 : 1
        const adjustedStagger = staggerDelay * (quality === 'low' ? 0.5 : 1)
        
        // Set initial state
        gsap.set(elements, {
          opacity: 0,
          y: direction === 'up' ? 50 * qualityMultiplier : direction === 'down' ? -50 * qualityMultiplier : 0,
          x: direction === 'left' ? 50 * qualityMultiplier : direction === 'right' ? -50 * qualityMultiplier : 0,
          scale: 0.9 + (0.1 * (1 - qualityMultiplier))
        })

        // Create staggered animation
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.8 * qualityMultiplier,
          stagger: adjustedStagger,
          ease: quality === 'low' ? 'power1.out' : 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            onEnter: () => setIsInView(true),
            onLeave: () => setIsInView(false),
            onEnterBack: () => setIsInView(true),
            onLeaveBack: () => setIsInView(false)
          }
        })
      } catch (error) {
        console.error('Failed to initialize staggered animations:', error)
        
        // Fallback CSS animation
        const elements = containerRef.current?.children
        if (elements) {
          Array.from(elements).forEach((element, index) => {
            if (element instanceof HTMLElement) {
              setTimeout(() => {
                element.style.transition = 'all 0.6s ease-out'
                element.style.opacity = '1'
                element.style.transform = 'translateY(0) scale(1)'
              }, index * staggerDelay * 1000)
            }
          })
          setIsInView(true)
        }
      }
    }

    initializeStaggered()
  }, [isLoaded, staggerDelay, direction, shouldReduceMotion, quality])

  return (
    <div 
      ref={containerRef} 
      className={`staggered-animations ${className} ${isInView ? 'in-view' : ''}`}
      role="group"
      aria-label="Animated content group"
    >
      {children.map((child, index) => (
        <div 
          key={index} 
          className="stagger-item"
          style={{ 
            opacity: shouldReduceMotion ? 1 : 0,
            transform: shouldReduceMotion ? 'none' : undefined
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

interface ParallaxScrollProps {
  children: ReactNode
  speed?: number
  direction?: 'vertical' | 'horizontal'
  className?: string
}

export function ParallaxScroll({
  children,
  speed = 0.5,
  direction = 'vertical',
  className = ''
}: ParallaxScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const { isLoaded } = useAdvancedScrollAnimations()

  useEffect(() => {
    if (!isLoaded || !elementRef.current) return

    const initializeParallax = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        
        gsap.registerPlugin(ScrollTrigger)

        const element = elementRef.current
        if (!element) return

        gsap.to(element, {
          [direction === 'vertical' ? 'yPercent' : 'xPercent']: -100 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        })
      } catch (error) {
        console.error('Failed to initialize parallax:', error)
      }
    }

    initializeParallax()
  }, [isLoaded, speed, direction])

  return (
    <div
      ref={elementRef}
      className={`parallax-scroll ${className}`}
      style={{
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  )
}

interface RevealTextProps {
  text: string
  className?: string
  animationType?: 'fade' | 'slide' | 'typewriter'
  delay?: number
}

export function RevealText({
  text,
  className = '',
  animationType = 'slide',
  delay = 0
}: RevealTextProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const { isLoaded } = useAdvancedScrollAnimations()

  useEffect(() => {
    if (!isLoaded || !textRef.current) return

    const initializeTextReveal = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        
        gsap.registerPlugin(ScrollTrigger)

        const element = textRef.current
        if (!element) return

        // Split text into characters or words
        const words = text.split(' ')
        element.innerHTML = words
          .map(word => `<span class="word">${word}</span>`)
          .join(' ')

        const wordElements = element.querySelectorAll('.word')

        // Set initial state based on animation type
        switch (animationType) {
          case 'fade':
            gsap.set(wordElements, { opacity: 0 })
            break
          case 'slide':
            gsap.set(wordElements, { opacity: 0, y: 30 })
            break
          case 'typewriter':
            gsap.set(wordElements, { opacity: 0 })
            break
        }

        // Create reveal animation
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        })

        const animationProps: any = {
          opacity: 1,
          duration: animationType === 'typewriter' ? 0.05 : 0.6,
          stagger: animationType === 'typewriter' ? 0.05 : 0.1,
          ease: 'power2.out',
          delay
        }
        
        if (animationType === 'slide') {
          animationProps.y = 0
        }
        
        timeline.to(wordElements, animationProps)
      } catch (error) {
        console.error('Failed to initialize text reveal:', error)
        
        // Fallback: just show the text
        if (textRef.current) {
          textRef.current.textContent = text
          textRef.current.style.opacity = '1'
        }
      }
    }

    initializeTextReveal()
  }, [isLoaded, text, animationType, delay])

  return (
    <div
      ref={textRef}
      className={`reveal-text ${className}`}
      style={{ opacity: 0 }}
    />
  )
}