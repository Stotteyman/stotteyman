'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface OptimizedImageProps {
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
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  className = '',
  sizes,
  style,
  onLoad,
  onError,
  fallbackSrc,
  lazy = true,
  webpSrc,
  avifSrc
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isInView, setIsInView] = useState(!lazy || priority)
  const imgRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, priority, isInView])

  // Format detection and source selection
  useEffect(() => {
    if (!isInView) return

    const selectOptimalSource = async () => {
      // Check for AVIF support
      if (avifSrc && await supportsFormat('avif')) {
        setCurrentSrc(avifSrc)
        return
      }

      // Check for WebP support
      if (webpSrc && await supportsFormat('webp')) {
        setCurrentSrc(webpSrc)
        return
      }

      // Fallback to original source
      setCurrentSrc(src)
    }

    selectOptimalSource()
  }, [isInView, src, webpSrc, avifSrc])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    
    // Try fallback source if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      return
    }
    
    onError?.()
  }

  const generateBlurDataURL = (width: number = 10, height: number = 10) => {
    if (blurDataURL) return blurDataURL
    
    // Generate a simple blur placeholder
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Create a simple gradient blur effect
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
    
    return canvas.toDataURL()
  }

  const imageProps = {
    src: currentSrc,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    quality,
    sizes,
    style,
    ...(fill ? { fill: true } : width && height ? { width, height } : {}),
    ...(placeholder === 'blur' && {
      placeholder: 'blur' as const,
      blurDataURL: generateBlurDataURL(width || 400, height || 300)
    })
  }

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
        aria-label={`Loading ${alt}`}
      />
    )
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={style}>
      <AnimatePresence mode="wait">
        {!isLoaded && !hasError && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
            style={{
              backgroundSize: '200% 100%',
              animation: prefersReducedMotion ? 'none' : 'shimmer 1.5s infinite'
            }}
          />
        )}
        
        {hasError && !fallbackSrc && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-sm">Failed to load image</div>
            </div>
          </motion.div>
        )}
        
        <motion.div
          key="image"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="relative"
        >
          <Image
            {...imageProps}
            alt={alt || ''}
            priority={priority}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Custom styles for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

// Utility function to check format support
async function supportsFormat(format: 'webp' | 'avif'): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }
  
  return new Promise((resolve) => {
    const img = new window.Image()
    
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    
    // Test images for format support
    const testImages = {
      webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    }
    
    img.src = testImages[format]
  })
}

// Asset preloader utility
export class AssetPreloader {
  private static instance: AssetPreloader
  private preloadedAssets = new Set<string>()
  private preloadPromises = new Map<string, Promise<void>>()

  static getInstance(): AssetPreloader {
    if (!AssetPreloader.instance) {
      AssetPreloader.instance = new AssetPreloader()
    }
    return AssetPreloader.instance
  }

  async preloadImage(src: string, priority: 'low' | 'high' = 'low'): Promise<void> {
    if (this.preloadedAssets.has(src)) {
      return Promise.resolve()
    }

    if (this.preloadPromises.has(src)) {
      return this.preloadPromises.get(src)!
    }

    const preloadPromise = new Promise<void>((resolve, reject) => {
      const img = new window.Image()
      
      img.onload = () => {
        this.preloadedAssets.add(src)
        this.preloadPromises.delete(src)
        resolve()
      }
      
      img.onerror = () => {
        this.preloadPromises.delete(src)
        reject(new Error(`Failed to preload image: ${src}`))
      }
      
      // Set loading priority
      if (priority === 'high') {
        img.loading = 'eager'
      }
      
      img.src = src
    })

    this.preloadPromises.set(src, preloadPromise)
    return preloadPromise
  }

  async preloadImages(sources: string[], priority: 'low' | 'high' = 'low'): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src, priority)))
  }

  preloadCriticalImages(sources: string[]): void {
    // Use requestIdleCallback for non-critical preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadImages(sources, 'low').catch(console.error)
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadImages(sources, 'low').catch(console.error)
      }, 100)
    }
  }

  isPreloaded(src: string): boolean {
    return this.preloadedAssets.has(src)
  }

  getPreloadedCount(): number {
    return this.preloadedAssets.size
  }

  clearCache(): void {
    this.preloadedAssets.clear()
    this.preloadPromises.clear()
  }
}

// Global asset preloader instance
export const assetPreloader = AssetPreloader.getInstance()

// Hook for using the asset preloader
export function useAssetPreloader() {
  const [preloadedCount, setPreloadedCount] = useState(0)

  const preloadImage = async (src: string, priority: 'low' | 'high' = 'low') => {
    try {
      await assetPreloader.preloadImage(src, priority)
      setPreloadedCount(assetPreloader.getPreloadedCount())
    } catch (error) {
      console.error('Failed to preload image:', error)
    }
  }

  const preloadImages = async (sources: string[], priority: 'low' | 'high' = 'low') => {
    try {
      await assetPreloader.preloadImages(sources, priority)
      setPreloadedCount(assetPreloader.getPreloadedCount())
    } catch (error) {
      console.error('Failed to preload images:', error)
    }
  }

  const preloadCriticalImages = (sources: string[]) => {
    assetPreloader.preloadCriticalImages(sources)
    // Update count after a delay since this is async
    setTimeout(() => {
      setPreloadedCount(assetPreloader.getPreloadedCount())
    }, 1000)
  }

  return {
    preloadImage,
    preloadImages,
    preloadCriticalImages,
    preloadedCount,
    isPreloaded: assetPreloader.isPreloaded.bind(assetPreloader)
  }
}