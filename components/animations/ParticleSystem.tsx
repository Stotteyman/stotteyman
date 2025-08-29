'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { ParticleSystemProps } from '@/types/animations'
import { ParticleSystem as ParticleSystemClass } from '@/lib/particles/ParticleSystem'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimationErrorBoundary } from './AnimationErrorBoundary'

interface ParticleSystemComponentProps extends Partial<ParticleSystemProps> {
  className?: string
  style?: React.CSSProperties
}

export function ParticleSystem({
  count = 50,
  speed = 1,
  size = { min: 1, max: 3 },
  colors = ['#3b82f6', '#8b5cf6', '#ec4899'],
  interactive = true,
  density = 'medium',
  className = '',
  style = {}
}: ParticleSystemComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particleSystemRef = useRef<ParticleSystemClass | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { qualitySettings, canUseAdvancedEffects } = useAdaptiveQuality()
  const prefersReducedMotion = useReducedMotion()

  // Adjust config based on quality settings
  const adjustedConfig: ParticleSystemProps = useMemo(() => ({
    count: prefersReducedMotion ? 0 : Math.floor(count * (qualitySettings.particleCount / 100)),
    speed: prefersReducedMotion ? 0 : speed * 0.5,
    size,
    colors,
    interactive: interactive && canUseAdvancedEffects,
    density: qualitySettings.animationComplexity === 'low' ? 'low' : density
  }), [count, speed, size, colors, interactive, density, prefersReducedMotion, qualitySettings, canUseAdvancedEffects])

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return

    try {
      const particleSystem = new ParticleSystemClass(canvasRef.current, adjustedConfig)
      particleSystemRef.current = particleSystem
      
      particleSystem.start()
      setIsInitialized(true)
      setError(null)

      return () => {
        particleSystem.destroy()
        particleSystemRef.current = null
      }
    } catch (err) {
      console.error('Failed to initialize particle system:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return undefined
    }
  }, [adjustedConfig, prefersReducedMotion, canUseAdvancedEffects])

  // Update config when quality changes
  useEffect(() => {
    if (particleSystemRef.current && isInitialized) {
      particleSystemRef.current.updateConfig(adjustedConfig)
    }
  }, [adjustedConfig, isInitialized])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (particleSystemRef.current) {
        particleSystemRef.current.resize()
      }
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!particleSystemRef.current) return

      if (document.hidden) {
        particleSystemRef.current.stop()
      } else {
        particleSystemRef.current.start()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  if (prefersReducedMotion) {
    return (
      <div 
        className={`particle-system-fallback ${className}`}
        style={style}
      >
        {/* Static decorative elements as fallback */}
        <div className="static-particles">
          {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
            <div
              key={i}
              className="static-particle"
              style={{
                position: 'absolute',
                width: `${size.min + Math.random() * (size.max - size.min)}px`,
                height: `${size.min + Math.random() * (size.max - size.min)}px`,
                backgroundColor: colors[i % colors.length],
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`particle-system-error ${className}`} style={style}>
        <div className="error-message">
          <p>Unable to load particle system</p>
          {process.env.NODE_ENV === 'development' && (
            <small>{error}</small>
          )}
        </div>
      </div>
    )
  }

  return (
    <AnimationErrorBoundary
      fallback={
        <div className={`particle-system-fallback ${className}`} style={style}>
          <div className="fallback-gradient" />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className={`particle-system ${className}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: interactive ? 'auto' : 'none',
          ...style
        }}
        aria-hidden="true"
      />
    </AnimationErrorBoundary>
  )
}

// WebGL-enhanced particle system for high-end devices
export function WebGLParticleSystem(props: ParticleSystemComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particleSystemRef = useRef<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { qualitySettings, canUseWebGL } = useAdaptiveQuality()
  const prefersReducedMotion = useReducedMotion()

  // Fall back to canvas version if WebGL not available
  if (!canUseWebGL) {
    return <ParticleSystem {...props} />
  }

  const adjustedConfig: ParticleSystemProps = useMemo(() => ({
    count: prefersReducedMotion ? 0 : Math.floor((props.count || 50) * (qualitySettings.particleCount / 100)),
    speed: prefersReducedMotion ? 0 : (props.speed || 1) * 0.5,
    size: props.size || { min: 1, max: 3 },
    colors: props.colors || ['#3b82f6', '#8b5cf6', '#ec4899'],
    interactive: (props.interactive !== false) && qualitySettings.enableAdvancedEffects,
    density: qualitySettings.animationComplexity === 'low' ? 'low' : (props.density || 'medium')
  }), [props, prefersReducedMotion, qualitySettings])

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return

    const initWebGLSystem = async () => {
      try {
        const { WebGLParticleSystem } = await import('@/lib/particles/WebGLParticleSystem')
        
        if (!WebGLParticleSystem.isSupported()) {
          throw new Error('WebGL not supported')
        }

        const particleSystem = new WebGLParticleSystem(canvasRef.current!, adjustedConfig)
        particleSystemRef.current = particleSystem
        
        particleSystem.start()
        setIsInitialized(true)
        setError(null)

        return () => {
          particleSystem.destroy()
          particleSystemRef.current = null
        }
      } catch (err) {
        console.error('Failed to initialize WebGL particle system:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        return undefined
      }
    }

    initWebGLSystem()
  }, [adjustedConfig, prefersReducedMotion])

  if (prefersReducedMotion || error) {
    return <ParticleSystem {...props} />
  }

  return (
    <AnimationErrorBoundary
      fallback={<ParticleSystem {...props} />}
    >
      <canvas
        ref={canvasRef}
        className={`webgl-particle-system ${props.className || ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: props.interactive ? 'auto' : 'none',
          ...props.style
        }}
        aria-hidden="true"
      />
    </AnimationErrorBoundary>
  )
}

// Preset configurations
export const ParticlePresets = {
  subtle: {
    count: 20,
    speed: 0.5,
    size: { min: 1, max: 2 },
    colors: ['#3b82f6', '#8b5cf6'],
    density: 'low' as const
  },
  
  standard: {
    count: 50,
    speed: 1,
    size: { min: 1, max: 3 },
    colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
    density: 'medium' as const
  },
  
  intense: {
    count: 100,
    speed: 2,
    size: { min: 2, max: 5 },
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#06d6a0'],
    density: 'high' as const
  },
  
  cosmic: {
    count: 75,
    speed: 0.8,
    size: { min: 1, max: 4 },
    colors: ['#ffffff', '#3b82f6', '#8b5cf6', '#ec4899'],
    density: 'medium' as const
  }
}