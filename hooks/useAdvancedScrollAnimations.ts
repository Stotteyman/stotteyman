import { useEffect, useRef, useState, useCallback } from 'react'
import { ScrollAnimationConfig } from '@/types/animations'
import { useAdaptiveQuality } from './useAdaptiveQuality'

interface ScrollAnimationReturn {
  isLoaded: boolean
  progress: number
  direction: 'up' | 'down'
  isInView: boolean
  velocity: number
  isScrolling: boolean
  registerElement: (element: HTMLElement, config?: Partial<ScrollAnimationConfig>) => void
  unregisterElement: (element: HTMLElement) => void
  pauseAnimations: () => void
  resumeAnimations: () => void
  refreshAnimations: () => void
}

export function useAdvancedScrollAnimations(
  configs: ScrollAnimationConfig[] = []
): ScrollAnimationReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('down')
  const [isInView, setIsInView] = useState(false)
  const [velocity, setVelocity] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  
  const { shouldReduceMotion, canUseAdvancedEffects, quality } = useAdaptiveQuality()
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(0)
  const scrollTimeout = useRef<NodeJS.Timeout>()
  const animationsRef = useRef<Map<HTMLElement, any>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const gsapRef = useRef<any>(null)
  const scrollTriggerRef = useRef<any>(null)
  const isPaused = useRef(false)

  // Initialize GSAP and ScrollTrigger
  useEffect(() => {
    const initializeGSAP = async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger')
        ])
        
        gsap.registerPlugin(ScrollTrigger)
        gsapRef.current = gsap
        scrollTriggerRef.current = ScrollTrigger
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load GSAP:', error)
        // Fallback to CSS animations
        setIsLoaded(true)
      }
    }

    initializeGSAP()
  }, [])

  // Set up intersection observer for viewport detection
  useEffect(() => {
    if (typeof window === 'undefined') return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            triggerEntranceAnimation(entry.target as HTMLElement)
          } else {
            setIsInView(false)
          }
        })
      },
      {
        threshold: [0, 0.1, 0.5, 0.9, 1],
        rootMargin: '-10% 0px -10% 0px'
      }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Set up enhanced scroll tracking with velocity and throttling
  useEffect(() => {
    if (typeof window === 'undefined') return

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentTime = performance.now()
          const currentScrollY = window.scrollY
          const deltaY = currentScrollY - lastScrollY.current
          const deltaTime = currentTime - lastScrollTime.current
          
          // Calculate velocity (pixels per millisecond)
          const currentVelocity = deltaTime > 0 ? Math.abs(deltaY / deltaTime) : 0
          setVelocity(currentVelocity)
          
          // Update direction
          const newDirection = deltaY > 0 ? 'down' : 'up'
          if (newDirection !== direction && Math.abs(deltaY) > 1) {
            setDirection(newDirection)
          }
          
          // Calculate scroll progress
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight
          const currentProgress = maxScroll > 0 ? Math.min(currentScrollY / maxScroll, 1) : 0
          setProgress(currentProgress)
          
          // Update scroll state
          setIsScrolling(true)
          clearTimeout(scrollTimeout.current)
          scrollTimeout.current = setTimeout(() => {
            setIsScrolling(false)
            setVelocity(0)
          }, 150)
          
          lastScrollY.current = currentScrollY
          lastScrollTime.current = currentTime
          ticking = false
        })
        ticking = true
      }
    }

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout.current)
    }
  }, [direction])

  // Initialize configured animations
  useEffect(() => {
    if (!isLoaded || !gsapRef.current || !scrollTriggerRef.current) return

    configs.forEach((config) => {
      createScrollAnimation(config)
    })

    return () => {
      // Cleanup all scroll triggers
      scrollTriggerRef.current?.getAll().forEach((trigger: any) => {
        trigger.kill()
      })
    }
  }, [isLoaded, configs])

  const createScrollAnimation = useCallback((config: ScrollAnimationConfig) => {
    if (!gsapRef.current || !scrollTriggerRef.current || isPaused.current) return

    const elements = document.querySelectorAll(config.trigger)
    
    elements.forEach((element) => {
      // Skip if reduced motion is preferred
      if (shouldReduceMotion) {
        element.classList.add('animate-in')
        return
      }

      // Adjust animation complexity based on quality
      const animationProps = getQualityAdjustedProps()
      
      const animation = gsapRef.current.fromTo(
        element,
        {
          opacity: 0,
          y: animationProps.translateY,
          scale: animationProps.scale,
          rotationX: canUseAdvancedEffects ? animationProps.rotationX : 0
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: animationProps.duration,
          ease: animationProps.easing,
          scrollTrigger: {
            trigger: element,
            start: config.start || 'top 80%',
            end: config.end || 'bottom 20%',
            scrub: config.scrub || false,
            pin: config.pin || false,
            toggleActions: 'play none none reverse',
            refreshPriority: quality === 'high' ? 0 : 1,
            fastScrollEnd: quality === 'low',
            onEnter: () => {
              element.classList.add('animate-in')
            },
            onLeave: () => {
              element.classList.remove('animate-in')
            },
            onEnterBack: () => {
              element.classList.add('animate-in')
            },
            onLeaveBack: () => {
              element.classList.remove('animate-in')
            }
          }
        }
      )

      animationsRef.current.set(element as HTMLElement, animation)
    })
  }, [shouldReduceMotion, canUseAdvancedEffects, quality])

  const getQualityAdjustedProps = useCallback(() => {
    switch (quality) {
      case 'low':
        return {
          translateY: 20,
          scale: 0.98,
          rotationX: 0,
          duration: 0.4,
          easing: 'power1.out'
        }
      case 'medium':
        return {
          translateY: 35,
          scale: 0.95,
          rotationX: 5,
          duration: 0.6,
          easing: 'power2.out'
        }
      case 'high':
        return {
          translateY: 50,
          scale: 0.9,
          rotationX: 10,
          duration: 1,
          easing: 'power3.out'
        }
      default:
        return {
          translateY: 35,
          scale: 0.95,
          rotationX: 5,
          duration: 0.6,
          easing: 'power2.out'
        }
    }
  }, [quality])

  const triggerEntranceAnimation = useCallback((element: HTMLElement) => {
    if (!gsapRef.current) {
      // Fallback CSS animation
      element.style.transition = 'all 0.6s ease-out'
      element.style.opacity = '1'
      element.style.transform = 'translateY(0) scale(1)'
      return
    }

    // Check if element already has animation
    if (animationsRef.current.has(element)) return

    const animation = gsapRef.current.fromTo(
      element,
      {
        opacity: 0,
        y: 30,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out'
      }
    )

    animationsRef.current.set(element, animation)
  }, [])

  const registerElement = useCallback((
    element: HTMLElement, 
    config?: Partial<ScrollAnimationConfig>
  ) => {
    if (!observerRef.current) return

    // Add element to intersection observer
    observerRef.current.observe(element)

    // Create custom animation if config provided
    if (config && gsapRef.current && scrollTriggerRef.current) {
      const fullConfig: ScrollAnimationConfig = {
        trigger: '',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: false,
        pin: false,
        animation: null,
        ...config
      }

      const animation = gsapRef.current.fromTo(
        element,
        {
          opacity: 0,
          y: 50,
          ...config.animation?.from
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          ...config.animation?.to,
          scrollTrigger: {
            trigger: element,
            start: fullConfig.start,
            end: fullConfig.end,
            scrub: fullConfig.scrub,
            pin: fullConfig.pin,
            toggleActions: 'play none none reverse'
          }
        }
      )

      animationsRef.current.set(element, animation)
    }
  }, [])

  const unregisterElement = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element)
    }

    const animation = animationsRef.current.get(element)
    if (animation) {
      animation.kill()
      animationsRef.current.delete(element)
    }
  }, [])

  const pauseAnimations = useCallback(() => {
    isPaused.current = true
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.getAll().forEach((trigger: any) => {
        if (trigger.animation) {
          trigger.animation.pause()
        }
      })
    }
  }, [])

  const resumeAnimations = useCallback(() => {
    isPaused.current = false
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.getAll().forEach((trigger: any) => {
        if (trigger.animation) {
          trigger.animation.resume()
        }
      })
    }
  }, [])

  const refreshAnimations = useCallback(() => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.refresh()
    }
  }, [])

  // Listen for quality changes
  useEffect(() => {
    const handleQualityChange = (event: CustomEvent) => {
      const { quality: newQuality } = event.detail
      if (newQuality === 'paused') {
        pauseAnimations()
      } else {
        resumeAnimations()
        // Refresh animations with new quality settings
        refreshAnimations()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('quality-change', handleQualityChange as EventListener)
      return () => {
        window.removeEventListener('quality-change', handleQualityChange as EventListener)
      }
    }
  }, [pauseAnimations, resumeAnimations, refreshAnimations])

  return {
    isLoaded,
    progress,
    direction,
    isInView,
    velocity,
    isScrolling,
    registerElement,
    unregisterElement,
    pauseAnimations,
    resumeAnimations,
    refreshAnimations
  }
}