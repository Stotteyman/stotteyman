/**
 * SVG-based morphing background with path morphing capabilities
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { MorphingBackgroundProps } from '@/types/animations'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimationErrorBoundary } from './AnimationErrorBoundary'

interface SVGMorphingBackgroundProps extends Partial<MorphingBackgroundProps> {
  className?: string
  style?: React.CSSProperties
  pathMorphing?: boolean
  gradientAnimation?: boolean
}

export function SVGMorphingBackground({
  shapes = [
    { type: 'blob', size: 300, position: { x: 20, y: 20 }, morphSpeed: 1, complexity: 0.7 },
    { type: 'blob', size: 400, position: { x: 80, y: 60 }, morphSpeed: 0.8, complexity: 0.8 }
  ],
  colors = {
    primary: ['#3b82f6', '#1d4ed8'],
    secondary: ['#8b5cf6', '#7c3aed'],
    accent: ['#ec4899', '#db2777'],
    gradients: []
  },
  animationSpeed = 1,
  blendMode = 'multiply',
  className = '',
  style = {},
  pathMorphing = true,
  gradientAnimation = true
}: SVGMorphingBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  const { quality, canUseWebGL } = useAdaptiveQuality()
  const { prefersReducedMotion } = useReducedMotion()

  // Generate organic blob paths
  const generateBlobPath = useCallback((size: number, complexity: number = 8): string => {
    const points: { x: number; y: number }[] = []
    const center = size / 2
    const angleStep = (Math.PI * 2) / complexity
    
    for (let i = 0; i < complexity; i++) {
      const angle = i * angleStep
      const radius = center * (0.7 + Math.random() * 0.3) // Vary radius for organic shape
      const x = center + Math.cos(angle) * radius
      const y = center + Math.sin(angle) * radius
      points.push({ x, y })
    }
    
    // Create smooth curve using quadratic bezier curves
    let path = `M ${points[0]?.x} ${points[0]?.y}`
    
    for (let i = 0; i < points.length; i++) {
      const current = points[i]
      const next = points[(i + 1) % points.length]
      
      if (!current || !next) continue
      
      // Control point for smooth curve
      const controlX = current.x + (next.x - current.x) * 0.5 + (Math.random() - 0.5) * 20
      const controlY = current.y + (next.y - current.y) * 0.5 + (Math.random() - 0.5) * 20
      
      path += ` Q ${controlX} ${controlY} ${next.x} ${next.y}`
    }
    
    path += ' Z'
    return path
  }, [])

  // Generate multiple path variations for morphing
  const generateMorphPaths = useCallback((size: number, count: number = 3): string[] => {
    const paths: string[] = []
    const complexity = quality === 'low' ? 6 : 
                      quality === 'high' ? 12 : 8
    
    for (let i = 0; i < count; i++) {
      paths.push(generateBlobPath(size, complexity))
    }
    
    return paths
  }, [generateBlobPath, quality])

  useEffect(() => {
    if (!svgRef.current || prefersReducedMotion) return

    const initializeSVGMorphing = async () => {
      try {
        const { default: gsap } = await import('gsap')
        
        const svg = svgRef.current
        if (!svg) return

        // Clear existing content
        svg.innerHTML = ''

        // Create defs for gradients and filters
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        svg.appendChild(defs)

        // Create shapes
        shapes.forEach((shape, index) => {
          createSVGShape(svg, defs, shape, colors, index, gsap)
        })

      } catch (error) {
        console.error('Failed to initialize SVG morphing background:', error)
        createStaticSVGFallback()
      }
    }

    initializeSVGMorphing()
  }, [shapes, colors, animationSpeed, canUseWebGL, prefersReducedMotion])

  const createSVGShape = useCallback((
    svg: SVGSVGElement,
    defs: SVGDefsElement,
    shape: any,
    colors: any,
    index: number,
    gsap: any
  ) => {
    const colorSet = index % 3 === 0 ? colors.primary : index % 3 === 1 ? colors.secondary : colors.accent
    
    // Create gradient
    const gradientId = `gradient-${index}`
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
    gradient.setAttribute('id', gradientId)
    gradient.setAttribute('cx', '50%')
    gradient.setAttribute('cy', '50%')
    gradient.setAttribute('r', '50%')
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', colorSet[0])
    stop1.setAttribute('stop-opacity', '0.8')
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop2.setAttribute('offset', '100%')
    stop2.setAttribute('stop-color', colorSet[1] || colorSet[0])
    stop2.setAttribute('stop-opacity', '0.2')
    
    gradient.appendChild(stop1)
    gradient.appendChild(stop2)
    defs.appendChild(gradient)

    // Create filter for blur effect
    const filterId = `blur-${index}`
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', filterId)
    filter.setAttribute('x', '-50%')
    filter.setAttribute('y', '-50%')
    filter.setAttribute('width', '200%')
    filter.setAttribute('height', '200%')
    
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
    blur.setAttribute('in', 'SourceGraphic')
    blur.setAttribute('stdDeviation', '20')
    
    filter.appendChild(blur)
    defs.appendChild(filter)

    // Create path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const initialPath = generateBlobPath(shape.size)
    
    path.setAttribute('d', initialPath)
    path.setAttribute('fill', `url(#${gradientId})`)
    path.setAttribute('filter', `url(#${filterId})`)
    path.setAttribute('opacity', '0.6')
    path.style.mixBlendMode = blendMode
    path.style.transform = `translate(${shape.position.x}%, ${shape.position.y}%)`
    path.style.transformOrigin = 'center'
    
    svg.appendChild(path)

    // Animate the shape if advanced effects are enabled
    if (canUseWebGL && pathMorphing) {
      animateSVGShape(gsap, path, shape, index)
    }

    // Animate gradient if enabled
    if (gradientAnimation && quality !== 'low') {
      animateGradient(gsap, gradient, shape.morphSpeed)
    }
  }, [generateBlobPath, blendMode, canUseWebGL, pathMorphing, gradientAnimation, quality])

  const animateSVGShape = useCallback((gsap: any, path: SVGPathElement, shape: any, index: number) => {
    const morphPaths = generateMorphPaths(shape.size, 4)
    const duration = 4 / shape.morphSpeed / animationSpeed
    
    // Path morphing animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    
    morphPaths.forEach((morphPath) => {
      tl.to(path, {
        attr: { d: morphPath },
        duration: duration,
        ease: 'sine.inOut'
      })
    })

    // Transform animations
    gsap.to(path, {
      rotation: 360,
      duration: (15 + index * 3) / animationSpeed,
      repeat: -1,
      ease: 'none',
      transformOrigin: 'center'
    })

    gsap.to(path, {
      scale: 1.1 + Math.random() * 0.2,
      duration: (6 + Math.random() * 4) / shape.morphSpeed / animationSpeed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      transformOrigin: 'center'
    })

    // Floating movement
    gsap.to(path, {
      x: `+=${30 + Math.random() * 40}`,
      y: `+=${20 + Math.random() * 30}`,
      duration: (8 + Math.random() * 4) / shape.morphSpeed / animationSpeed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }, [generateMorphPaths, animationSpeed])

  const animateGradient = useCallback((gsap: any, gradient: SVGRadialGradientElement, morphSpeed: number) => {
    // Animate gradient center
    gsap.to(gradient, {
      attr: {
        cx: '30%',
        cy: '70%'
      },
      duration: 8 / morphSpeed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    // Animate gradient radius
    gsap.to(gradient, {
      attr: {
        r: '70%'
      },
      duration: 6 / morphSpeed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }, [])

  const createStaticSVGFallback = useCallback(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    svg.innerHTML = ''

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.appendChild(defs)

    shapes.forEach((shape, index) => {
      const colorSet = index % 3 === 0 ? colors.primary : index % 3 === 1 ? colors.secondary : colors.accent
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', `${shape.position.x}%`)
      circle.setAttribute('cy', `${shape.position.y}%`)
      circle.setAttribute('r', `${shape.size / 2}`)
      circle.setAttribute('fill', colorSet[0] || '#3b82f6')
      circle.setAttribute('opacity', '0.4')
      circle.setAttribute('filter', 'blur(20px)')
      circle.style.mixBlendMode = blendMode
      
      svg.appendChild(circle)
    })
  }, [shapes, colors, blendMode])

  if (prefersReducedMotion) {
    return (
      <div className={`svg-morphing-background static ${className}`} style={style}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0 }}
        >
          {shapes.map((shape, index) => {
            const colorSet = index % 3 === 0 ? colors.primary : index % 3 === 1 ? colors.secondary : colors.accent
            return (
              <circle
                key={index}
                cx={`${shape.position.x}%`}
                cy={`${shape.position.y}%`}
                r={shape.size / 10} // Scale for viewBox
                fill={colorSet[0]}
                opacity="0.4"
                filter="blur(2px)"
                style={{ mixBlendMode: blendMode }}
              />
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <AnimationErrorBoundary
      fallback={
        <div className={`svg-morphing-background-fallback ${className}`} style={style}>
          <div className="gradient-fallback" />
        </div>
      }
    >
      <div 
        className={`svg-morphing-background ${className}`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          ...style
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0 }}
          aria-hidden="true"
        />
      </div>
    </AnimationErrorBoundary>
  )
}

// Preset configurations for SVG morphing
export const SVGMorphingPresets = {
  organic: {
    shapes: [
      { type: 'blob' as const, size: 25, position: { x: 20, y: 30 }, morphSpeed: 1 },
      { type: 'blob' as const, size: 35, position: { x: 70, y: 20 }, morphSpeed: 0.8 },
      { type: 'blob' as const, size: 30, position: { x: 50, y: 70 }, morphSpeed: 1.2 }
    ],
    colors: {
      primary: ['#667eea', '#764ba2'],
      secondary: ['#f093fb', '#f5576c'],
      accent: ['#4facfe', '#00f2fe']
    },
    pathMorphing: true,
    gradientAnimation: true,
    blendMode: 'multiply' as const
  },

  ethereal: {
    shapes: [
      { type: 'blob' as const, size: 40, position: { x: 15, y: 15 }, morphSpeed: 0.6 },
      { type: 'blob' as const, size: 45, position: { x: 85, y: 25 }, morphSpeed: 0.8 },
      { type: 'blob' as const, size: 35, position: { x: 60, y: 80 }, morphSpeed: 0.7 }
    ],
    colors: {
      primary: ['#a8edea', '#fed6e3'],
      secondary: ['#d299c2', '#fef9d7'],
      accent: ['#89f7fe', '#66a6ff']
    },
    pathMorphing: true,
    gradientAnimation: true,
    blendMode: 'soft-light' as const
  },

  cosmic: {
    shapes: [
      { type: 'blob' as const, size: 50, position: { x: 10, y: 20 }, morphSpeed: 1.2 },
      { type: 'blob' as const, size: 60, position: { x: 80, y: 10 }, morphSpeed: 1.0 },
      { type: 'blob' as const, size: 40, position: { x: 30, y: 80 }, morphSpeed: 1.5 },
      { type: 'blob' as const, size: 45, position: { x: 90, y: 70 }, morphSpeed: 0.9 }
    ],
    colors: {
      primary: ['#1a1a2e', '#16213e'],
      secondary: ['#0f3460', '#533483'],
      accent: ['#e94560', '#f5af19']
    },
    pathMorphing: true,
    gradientAnimation: true,
    blendMode: 'screen' as const
  }
}