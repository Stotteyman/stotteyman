/**
 * Advanced scroll animations hook with Intersection Observer and GSAP ScrollTrigger
 * Optimized for performance with Next.js 15.5.0
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { ScrollAnimationConfig, ScrollAnimationHookReturn } from '@/types/animations'

export function useAdvancedScrollAnimations(
  configs: ScrollAnimationConfig[]
): ScrollAnimationHookReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('down')
  const [isInView, setIsInView] = useState(false)
  const [velocity, setVelocity] = useState(0)
  
  const scrollTriggerRefs = useRef<any[]>([])
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const rafId = useRef<number>()

  useEffect(() => {
    let gsap: any
    let ScrollTrigger: any

    const initializeGSAP = async () => {
      try {
        // Dynamic import for better code splitting
        const gsapModule = await import('gsap')
        const scrollTriggerModule = await import('gsap/ScrollTrigger')
        
        gsap = gsapModule.gsap
        ScrollTrigger = scrollTriggerModule.ScrollTrigger
        
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger)
        
        // Initialize scroll triggers
        initializeScrollTriggers(gsap, ScrollTrigger)
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load GSAP:', error)
        // Fallback to Intersection Observer
        initializeFallbackScrollAnimations()
        setIsLoaded(true)
      }
    }

    initializeGSAP()

    return () => {
      // Cleanup scroll triggers
      scrollTriggerRefs.current.forEach(trigger => {
        if (trigger && trigger.kill) {
          trigger.kill()
        }
      })
      scrollTriggerRefs.current = []
      
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [configs])

  const initializeScrollTriggers = useCallback((gsap: any, ScrollTrigger: any) => {
    configs.forEach((config, index) => {
      try {
        const trigger = ScrollTrigger.create({
          trigger: config.trigger,
          start: config.start,
          end: config.end,
          scrub: config.scrub,
          pin: config.pin,
          markers: config.markers || false,
          refreshPriority: config.refreshPriority || 0,
          onUpdate: (self: any) => {
            setProgress(self.progress)
            setDirection(self.direction > 0 ? 'down' : 'up')
            
            // Calculate velocity
            const currentTime = Date.now()
            const currentScrollY = window.scrollY
            const timeDelta = currentTime - lastScrollTime.current
            const scrollDelta = currentScrollY - lastScrollY.current
            
            if (timeDelta > 0) {
              setVelocity(Math.abs(scrollDelta / timeDelta))
            }
            
            lastScrollY.current = currentScrollY
            lastScrollTime.current = currentTime
          },
          onEnter: () => setIsInView(true),
          onLeave: () => setIsInView(false),
          onEnterBack: () => setIsInView(true),
          onLeaveBack: () => setIsInView(false),
          animation: config.animation
        })

        scrollTriggerRefs.current[index] = trigger
      } catch (error) {
        console.error(`Error creating scroll trigger for config ${index}:`, error)
      }
    })
  }, [configs])

  const initializeFallbackScrollAnimations = useCallback(() => {
    // Fallback using Intersection Observer for basic scroll animations
    const observers: IntersectionObserver[] = []

    configs.forEach((config) => {
      const element = document.querySelector(config.trigger)
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsInView(entry.isIntersecting)
            setProgress(entry.intersectionRatio)
          })
        },
        {
          threshold: [0, 0.25, 0.5, 0.75, 1],
          rootMargin: '0px'
        }
      )

      observer.observe(element)
      observers.push(observer)
    })

    // Track scroll direction and velocity
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const currentTime = Date.now()
      
      setDirection(currentScrollY > lastScrollY.current ? 'down' : 'up')
      
      const timeDelta = currentTime - lastScrollTime.current
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current)
      
      if (timeDelta > 0) {
        setVelocity(scrollDelta / timeDelta)
      }
      
      lastScrollY.current = currentScrollY
      lastScrollTime.current = currentTime
    }

    const throttledScroll = throttle(handleScroll, 16) // ~60fps
    window.addEventListener('scroll', throttledScroll, { passive: true })

    // Cleanup function for fallback
    return () => {
      observers.forEach(observer => observer.disconnect())
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [configs])

  return {
    isLoaded,
    progress,
    direction,
    isInView,
    velocity
  }
}

/**
 * Hook for staggered scroll animations
 */
export function useStaggeredScrollAnimation(
  selector: string,
  animationConfig: {
    duration?: number
    delay?: number
    stagger?: number
    ease?: string
    from?: Record<string, any>
    to?: Record<string, any>
  } = {}
) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const initializeStaggeredAnimation = async () => {
      try {
        const gsap = (await import('gsap')).gsap
        const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger
        
        gsap.registerPlugin(ScrollTrigger)

        if (!containerRef.current) return

        const elements = containerRef.current.querySelectorAll(selector)
        if (elements.length === 0) return

        // Set initial state
        gsap.set(elements, animationConfig.from || { opacity: 0, y: 50 })

        // Create scroll trigger for staggered animation
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top 80%',
          onEnter: () => {
            if (!hasAnimated) {
              setIsVisible(true)
              setHasAnimated(true)
              
              gsap.to(elements, {
                ...animationConfig.to || { opacity: 1, y: 0 },
                duration: animationConfig.duration || 0.6,
                delay: animationConfig.delay || 0,
                stagger: animationConfig.stagger || 0.1,
                ease: animationConfig.ease || 'power2.out'
              })
            }
          }
        })
      } catch (error) {
        console.error('Failed to initialize staggered animation:', error)
        // Fallback to simple visibility toggle
        initializeFallbackStaggered()
      }
    }

    const initializeFallbackStaggered = () => {
      if (!containerRef.current) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated) {
              setIsVisible(true)
              setHasAnimated(true)
              
              // Simple CSS-based staggered animation
              const elements = entry.target.querySelectorAll(selector)
              elements.forEach((element, index) => {
                setTimeout(() => {
                  element.classList.add('animate-in')
                }, index * (animationConfig.stagger || 100))
              })
            }
          })
        },
        { threshold: 0.1 }
      )

      observer.observe(containerRef.current)

      return () => observer.disconnect()
    }

    initializeStaggeredAnimation()
  }, [selector, animationConfig, hasAnimated])

  return {
    containerRef,
    isVisible,
    hasAnimated
  }
}

/**
 * Hook for parallax scroll effects
 */
export function useParallaxScroll(
  speed: number = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
) {
  const elementRef = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return

      const scrolled = window.pageYOffset
      const rate = scrolled * -speed

      if (direction === 'vertical') {
        setOffset(rate)
        elementRef.current.style.transform = `translateY(${rate}px)`
      } else {
        setOffset(rate)
        elementRef.current.style.transform = `translateX(${rate}px)`
      }
    }

    const throttledScroll = throttle(handleScroll, 16)
    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [speed, direction])

  return {
    elementRef,
    offset
  }
}

/**
 * Hook for scroll-triggered text reveal animations
 */
export function useTextRevealAnimation(
  animationType: 'typewriter' | 'fade-up' | 'split-chars' | 'split-words' = 'fade-up'
) {
  const textRef = useRef<HTMLElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const initializeTextReveal = async () => {
      try {
        const gsap = (await import('gsap')).gsap
        const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger
        const SplitText = (await import('gsap/SplitText')).SplitText
        
        gsap.registerPlugin(ScrollTrigger, SplitText)

        if (!textRef.current) return

        let animation: any

        switch (animationType) {
          case 'typewriter':
            animation = createTypewriterAnimation(gsap, ScrollTrigger, textRef.current)
            break
          case 'split-chars':
            animation = createSplitCharsAnimation(gsap, ScrollTrigger, SplitText, textRef.current)
            break
          case 'split-words':
            animation = createSplitWordsAnimation(gsap, ScrollTrigger, SplitText, textRef.current)
            break
          default:
            animation = createFadeUpAnimation(gsap, ScrollTrigger, textRef.current)
        }

        return () => {
          if (animation && animation.kill) {
            animation.kill()
          }
        }
      } catch (error) {
        console.error('Failed to initialize text reveal:', error)
        // Fallback to simple fade-in
        initializeFallbackTextReveal()
      }
    }

    const initializeFallbackTextReveal = () => {
      if (!textRef.current) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsRevealed(true)
              entry.target.classList.add('text-revealed')
            }
          })
        },
        { threshold: 0.1 }
      )

      observer.observe(textRef.current)

      return () => observer.disconnect()
    }

    initializeTextReveal()
  }, [animationType])

  return {
    textRef,
    isRevealed
  }
}

// Helper functions for text animations
function createTypewriterAnimation(gsap: any, ScrollTrigger: any, element: HTMLElement) {
  const text = element.textContent || ''
  element.textContent = ''

  return ScrollTrigger.create({
    trigger: element,
    start: 'top 80%',
    onEnter: () => {
      let i = 0
      const timer = setInterval(() => {
        element.textContent = text.slice(0, i + 1)
        i++
        if (i >= text.length) {
          clearInterval(timer)
        }
      }, 50)
    }
  })
}

function createSplitCharsAnimation(gsap: any, ScrollTrigger: any, SplitText: any, element: HTMLElement) {
  const split = new SplitText(element, { type: 'chars' })
  gsap.set(split.chars, { opacity: 0, y: 50 })

  return ScrollTrigger.create({
    trigger: element,
    start: 'top 80%',
    onEnter: () => {
      gsap.to(split.chars, {
        opacity: 1,
        y: 0,
        duration: 0.05,
        stagger: 0.02,
        ease: 'power2.out'
      })
    }
  })
}

function createSplitWordsAnimation(gsap: any, ScrollTrigger: any, SplitText: any, element: HTMLElement) {
  const split = new SplitText(element, { type: 'words' })
  gsap.set(split.words, { opacity: 0, y: 30 })

  return ScrollTrigger.create({
    trigger: element,
    start: 'top 80%',
    onEnter: () => {
      gsap.to(split.words, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      })
    }
  })
}

function createFadeUpAnimation(gsap: any, ScrollTrigger: any, element: HTMLElement) {
  gsap.set(element, { opacity: 0, y: 50 })

  return ScrollTrigger.create({
    trigger: element,
    start: 'top 80%',
    onEnter: () => {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      })
    }
  })
}

// Utility function for throttling
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