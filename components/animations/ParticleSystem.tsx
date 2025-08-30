/**
 * React Particle System Component
 * WebGL-accelerated particle system with Canvas fallback
 */

'use client'

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { ParticleSystem as ParticleSystemCore } from '@/lib/particles/ParticleSystem'
import { ParticleSystemProps } from '@/types/animations'
import { useReducedMotion } from '@/hooks/useAdaptiveQuality'
import { AnimationErrorBoundary } from './AnimationErrorBoundary'

interface ParticleSystemComponentProps extends ParticleSystemProps {
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  autoStart?: boolean
  onError?: (error: Error) => void
  fallbackComponent?: React.ComponentType
}

export interface ParticleSystemRef {
  start: () => void
  stop: () => void
  updateConfig: (config: Partial<ParticleSystemProps>) => void
  getMetrics: () => any
  destroy: () => void
}

const ParticleSystemComponent = forwardRef<ParticleSystemRef, ParticleSystemComponentProps>(
  ({
    className = '',
    style = {},
    width,
    height,
    autoStart = true,
    onError,
    fallbackComponent: FallbackComponent,
    ...particleConfig
  }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particleSystemRef = useRef<ParticleSystemCore | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const reducedMotion = useReducedMotion()

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      start: () => particleSystemRef.current?.start(),
      stop: () => particleSystemRef.current?.stop(),
      updateConfig: (config: Partial<ParticleSystemProps>) => {
        particleSystemRef.current?.updateConfig(config)
      },
      getMetrics: () => particleSystemRef.current?.getPerformanceMetrics(),
      destroy: () => particleSystemRef.current?.destroy()
    }))

    useEffect(() => {
      if (!canvasRef.current || reducedMotion) return

      const initializeParticleSystem = async () => {
        try {
          const canvas = canvasRef.current!
          const particleSystem = new ParticleSystemCore(canvas, {
            respectsReducedMotion: true,
            ...particleConfig
          })

          particleSystemRef.current = particleSystem

          if (autoStart) {
            particleSystem.start()
          }

          setIsInitialized(true)
          setError(null)
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to initialize particle system')
          setError(error)
          if (onError) {
            onError(error)
          }
        }
      }

      initializeParticleSystem()

      return () => {
        if (particleSystemRef.current) {
          particleSystemRef.current.destroy()
          particleSystemRef.current = null
        }
      }
    }, [reducedMotion, autoStart, onError])

    // Update config when props change
    useEffect(() => {
      if (particleSystemRef.current && isInitialized) {
        particleSystemRef.current.updateConfig(particleConfig)
      }
    }, [particleConfig, isInitialized])

    // Handle reduced motion
    if (reducedMotion) {
      if (FallbackComponent) {
        return <FallbackComponent />
      }
      return (
        <div 
          className={`particle-system-static ${className}`}
          style={{
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
            ...style,
            width: width || '100%',
            height: height || '200px'
          }}
        />
      )
    }

    // Handle errors
    if (error) {
      if (FallbackComponent) {
        return <FallbackComponent />
      }
      return (
        <div 
          className={`particle-system-error ${className}`}
          style={{
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '0.875rem',
            ...style,
            width: width || '100%',
            height: height || '200px'
          }}
        >
          Particle system unavailable
        </div>
      )
    }

    return (
      <canvas
        ref={canvasRef}
        className={`particle-system ${className}`}
        style={{
          display: 'block',
          ...style,
          width: width || '100%',
          height: height || '200px'
        }}
        width={width}
        height={height}
      />
    )
  }
)

ParticleSystemComponent.displayName = 'ParticleSystem'

// Wrapped with error boundary
export const ParticleSystem = React.forwardRef<ParticleSystemRef, ParticleSystemComponentProps>(
  (props, ref) => (
    <AnimationErrorBoundary
      componentName="ParticleSystem"
      animationId="particle-system"
      fallbackStrategy="static"
    >
      <ParticleSystemComponent {...props} ref={ref} />
    </AnimationErrorBoundary>
  )
)

ParticleSystem.displayName = 'ParticleSystem'

/**
 * Preset particle system configurations
 */
export const ParticlePresets = {
  stars: {
    count: 100,
    speed: 0.5,
    size: { min: 1, max: 3 },
    colors: ['#ffffff', '#f0f9ff', '#dbeafe'],
    interactive: false,
    density: 'high' as const
  },
  
  fireflies: {
    count: 30,
    speed: 0.3,
    size: { min: 3, max: 6 },
    colors: ['#fbbf24', '#f59e0b', '#d97706'],
    interactive: true,
    density: 'medium' as const
  },
  
  bubbles: {
    count: 20,
    speed: 0.8,
    size: { min: 5, max: 15 },
    colors: ['#3b82f6', '#1d4ed8', '#1e40af'],
    interactive: true,
    density: 'low' as const
  },
  
  snow: {
    count: 80,
    speed: 1.2,
    size: { min: 2, max: 5 },
    colors: ['#ffffff', '#f8fafc', '#e2e8f0'],
    interactive: false,
    density: 'high' as const
  },
  
  cosmic: {
    count: 60,
    speed: 0.4,
    size: { min: 2, max: 8 },
    colors: ['#8b5cf6', '#a855f7', '#9333ea', '#7c3aed'],
    interactive: true,
    density: 'medium' as const
  },
  
  matrix: {
    count: 150,
    speed: 2,
    size: { min: 1, max: 2 },
    colors: ['#10b981', '#059669', '#047857'],
    interactive: false,
    density: 'high' as const
  }
}

/**
 * Hook for using particle system
 */
export function useParticleSystem(config: ParticleSystemProps) {
  const particleRef = useRef<ParticleSystemRef>(null)
  const [metrics, setMetrics] = useState(null)

  const start = () => particleRef.current?.start()
  const stop = () => particleRef.current?.stop()
  const updateConfig = (newConfig: Partial<ParticleSystemProps>) => {
    particleRef.current?.updateConfig(newConfig)
  }

  const getMetrics = () => {
    const currentMetrics = particleRef.current?.getMetrics()
    setMetrics(currentMetrics)
    return currentMetrics
  }

  return {
    particleRef,
    start,
    stop,
    updateConfig,
    getMetrics,
    metrics
  }
}