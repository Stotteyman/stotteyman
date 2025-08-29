'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MorphingBackgroundProps, ShapeConfig, ColorPalette } from '@/types/animations'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimationErrorBoundary } from './AnimationErrorBoundary'

interface MorphingBackgroundComponentProps extends Partial<MorphingBackgroundProps> {
  className?: string
  style?: React.CSSProperties
}

export function MorphingBackground({
  shapes = [
    { type: 'blob', size: 300, position: { x: 20, y: 20 }, morphSpeed: 1 },
    { type: 'blob', size: 400, position: { x: 80, y: 60 }, morphSpeed: 0.8 },
    { type: 'blob', size: 250, position: { x: 60, y: 80 }, morphSpeed: 1.2 }
  ],
  colors = {
    primary: ['#3b82f6', '#1d4ed8'],
    secondary: ['#8b5cf6', '#7c3aed'],
    accent: ['#ec4899', '#db2777']
  },
  animationSpeed = 1,
  blendMode = 'multiply',
  className = '',
  style = {}
}: MorphingBackgroundComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const { qualitySettings, canUseAdvancedEffects } = useAdaptiveQuality()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return

    const initializeMorphing = async () => {
      try {
        const { default: gsap } = await import('gsap')
        
        const container = containerRef.current
        if (!container) return

        // Create morphing shapes
        shapes.forEach((shape, index) => {
          const shapeElement = createShapeElement(shape, colors, index)
          container.appendChild(shapeElement)
          
          if (canUseAdvancedEffects) {
            animateShape(gsap, shapeElement, shape, animationSpeed)
          }
        })

        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize morphing background:', error)
        createStaticFallback()
      }
    }

    initializeMorphing()

    return () => {
      const currentAnimation = animationRef.current
      if (currentAnimation) {
        cancelAnimationFrame(currentAnimation)
      }
    }
  }, [shapes, colors, animationSpeed, canUseAdvancedEffects, prefersReducedMotion])

  const createShapeElement = useCallback((shape: ShapeConfig, colors: ColorPalette, index: number): HTMLElement => {
    const element = document.createElement('div')
    element.className = `morphing-shape morphing-shape-${index}`
    
    const colorSet = index % 3 === 0 ? colors.primary : index % 3 === 1 ? colors.secondary : colors.accent
    const gradient = `radial-gradient(circle, ${colorSet[0]}, ${colorSet[1] || colorSet[0]})`
    
    element.style.cssText = `
      position: absolute;
      width: ${shape.size}px;
      height: ${shape.size}px;
      left: ${shape.position.x}%;
      top: ${shape.position.y}%;
      background: ${gradient};
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.6;
      mix-blend-mode: ${blendMode};
      transform: translate(-50%, -50%);
      will-change: transform, border-radius;
    `

    return element
  }, [])

  const animateShape = (gsap: any, element: HTMLElement, shape: ShapeConfig, speed: number) => {
    // Adjust animation complexity based on quality
    const complexity = qualitySettings.animationComplexity
    const duration = complexity === 'low' ? 8 : complexity === 'high' ? 3 : 5
    
    // Create morphing animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    
    // Enhanced morphing border-radius for blob effect
    const morphSteps = complexity === 'low' ? 2 : complexity === 'high' ? 5 : 3
    
    for (let i = 0; i < morphSteps; i++) {
      const randomRadius = () => Math.random() * 40 + 30 // 30-70%
      tl.to(element, {
        borderRadius: `${randomRadius()}% ${randomRadius()}% ${randomRadius()}% ${randomRadius()}% / ${randomRadius()}% ${randomRadius()}% ${randomRadius()}% ${randomRadius()}%`,
        duration: duration / shape.morphSpeed / speed,
        ease: 'sine.inOut'
      })
    }

    // Floating movement with more organic paths
    if (complexity !== 'low') {
      const motionPath = {
        path: `M0,0 Q${Math.random() * 100 - 50},${Math.random() * 60 - 30} ${Math.random() * 100 - 50},${Math.random() * 60 - 30}`,
        autoRotate: false
      }
      
      gsap.to(element, {
        motionPath,
        duration: (8 + Math.random() * 4) / shape.morphSpeed / speed,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    } else {
      // Simple movement for low quality
      gsap.to(element, {
        x: '+=30',
        y: '+=20',
        duration: 6 / shape.morphSpeed / speed,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    }

    // Scale pulsing with variation
    gsap.to(element, {
      scale: 1.1 + Math.random() * 0.3,
      duration: (5 + Math.random() * 3) / shape.morphSpeed / speed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    // Rotation for more dynamic effect
    if (complexity === 'high') {
      gsap.to(element, {
        rotation: 360,
        duration: (12 + Math.random() * 8) / shape.morphSpeed / speed,
        repeat: -1,
        ease: 'none'
      })
    }

    // Opacity variation for breathing effect
    gsap.to(element, {
      opacity: 0.3 + Math.random() * 0.4,
      duration: (3 + Math.random() * 2) / shape.morphSpeed / speed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }

  const createStaticFallback = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    
    shapes.forEach((shape, index) => {
      const element = createShapeElement(shape, colors, index)
      element.style.animation = 'none'
      element.style.transform = 'translate(-50%, -50%) scale(1)'
      container.appendChild(element)
    })
  }, [shapes, colors, createShapeElement])

  if (prefersReducedMotion) {
    return (
      <div 
        ref={containerRef}
        className={`morphing-background static ${className}`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          ...style
        }}
      >
        {shapes.map((shape, index) => {
          const colorSet = index % 3 === 0 ? colors.primary : index % 3 === 1 ? colors.secondary : colors.accent
          return (
            <div
              key={index}
              className="static-shape"
              style={{
                position: 'absolute',
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                left: `${shape.position.x}%`,
                top: `${shape.position.y}%`,
                background: `radial-gradient(circle, ${colorSet[0]}, ${colorSet[1] || colorSet[0]})`,
                borderRadius: '50%',
                filter: 'blur(40px)',
                opacity: 0.4,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <AnimationErrorBoundary
      fallback={
        <div className={`morphing-background-fallback ${className}`} style={style}>
          <div className="gradient-fallback" />
        </div>
      }
    >
      <div 
        ref={containerRef}
        className={`morphing-background ${className}`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          ...style
        }}
        aria-hidden="true"
      />
    </AnimationErrorBoundary>
  )
}

// Scroll-responsive morphing background
export function ScrollMorphingBackground(props: MorphingBackgroundComponentProps) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Modify colors based on scroll progress
  const dynamicColors = {
    primary: props.colors?.primary || ['#3b82f6', '#1d4ed8'],
    secondary: props.colors?.secondary || ['#8b5cf6', '#7c3aed'],
    accent: props.colors?.accent || ['#ec4899', '#db2777']
  }

  // Shift hue based on scroll
  const hueShift = scrollProgress * 60 // 0-60 degree shift

  return (
    <MorphingBackground
      {...props}
      colors={dynamicColors}
      style={{
        filter: `hue-rotate(${hueShift}deg)`,
        ...props.style
      }}
    />
  )
}

// Preset configurations
export const MorphingPresets = {
  subtle: {
    shapes: [
      { type: 'blob' as const, size: 200, position: { x: 10, y: 10 }, morphSpeed: 0.5 },
      { type: 'blob' as const, size: 150, position: { x: 90, y: 80 }, morphSpeed: 0.7 }
    ],
    colors: {
      primary: ['#3b82f6', '#1d4ed8'],
      secondary: ['#8b5cf6', '#7c3aed'],
      accent: ['#ec4899', '#db2777']
    },
    animationSpeed: 0.5,
    blendMode: 'soft-light' as const
  },

  dynamic: {
    shapes: [
      { type: 'blob' as const, size: 300, position: { x: 20, y: 20 }, morphSpeed: 1 },
      { type: 'blob' as const, size: 400, position: { x: 80, y: 60 }, morphSpeed: 0.8 },
      { type: 'blob' as const, size: 250, position: { x: 60, y: 80 }, morphSpeed: 1.2 }
    ],
    colors: {
      primary: ['#3b82f6', '#1d4ed8'],
      secondary: ['#8b5cf6', '#7c3aed'],
      accent: ['#ec4899', '#db2777']
    },
    animationSpeed: 1,
    blendMode: 'multiply' as const
  },

  intense: {
    shapes: [
      { type: 'blob' as const, size: 400, position: { x: 15, y: 15 }, morphSpeed: 1.5 },
      { type: 'blob' as const, size: 500, position: { x: 85, y: 25 }, morphSpeed: 1.2 },
      { type: 'blob' as const, size: 350, position: { x: 50, y: 75 }, morphSpeed: 1.8 },
      { type: 'blob' as const, size: 300, position: { x: 25, y: 85 }, morphSpeed: 1.0 }
    ],
    colors: {
      primary: ['#ff6b6b', '#ee5a24'],
      secondary: ['#a55eea', '#8b5cf6'],
      accent: ['#26de81', '#20bf6b']
    },
    animationSpeed: 1.5,
    blendMode: 'screen' as const
  }
}