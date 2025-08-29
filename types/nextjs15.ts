/**
 * Next.js 15.5.0 Enhanced Type Definitions
 * Comprehensive types for all Next.js 15.5.0 features and optimizations
 */

import type { NextConfig } from 'next'
import type { ImageProps } from 'next/image'
import type { Metadata } from 'next'

// Next.js 15.5.0 Configuration Types
export interface EnhancedNextConfig {
  experimental?: {
    optimizeCss?: boolean
    optimizeServerReact?: boolean
    optimizePackageImports?: string[]
    webVitalsAttribution?: string[]
    scrollRestoration?: boolean
    largePageDataBytes?: number
    memoryBasedWorkersCount?: boolean
    staleTimes?: {
      dynamic?: number
      static?: number
    }
    turbo?: {
      rules?: Record<string, any>
    }
    bundlePagesRouterDependencies?: boolean
    staticWorkerRequestDeduping?: boolean
    middlewareSourceMaps?: boolean
    serverMinification?: boolean
    serverSourceMaps?: boolean
    nextScriptWorkers?: boolean
    turbotrace?: {
      logLevel?: 'error' | 'warn' | 'info' | 'debug'
      logDetail?: boolean
      showAll?: boolean
      contextDirectory?: string
    }
    reactCompiler?: boolean
    parallelServerBuildTraces?: boolean
    parallelServerCompiles?: boolean
    gzipSize?: boolean
    incrementalCacheHandlerPath?: string
    esmExternals?: 'loose' | boolean
    fontLoaders?: Array<{
      loader: string
      options: Record<string, any>
    }>
  }
  serverExternalPackages?: string[]
  transpilePackages?: string[]
  typedRoutes?: boolean
  logging?: {
    fetches?: {
      fullUrl?: boolean
    }
  }
  compiler?: {
    removeConsole?: boolean | {
      exclude?: string[]
    }
    reactRemoveProperties?: boolean | {
      properties?: string[]
    }
    styledComponents?: boolean
    emotion?: boolean
  }
  modularizeImports?: Record<string, {
    transform: string
    skipDefaultConversion?: boolean
  }>
  images?: EnhancedImageConfig
  cacheHandler?: string
  cacheMaxMemorySize?: number
}

// Enhanced Image Configuration for Next.js 15.5.0
export interface EnhancedImageConfig {
  remotePatterns?: Array<{
    protocol?: 'http' | 'https'
    hostname: string
    port?: string
    pathname?: string
  }>
  formats?: ('image/avif' | 'image/webp')[]
  deviceSizes?: number[]
  imageSizes?: number[]
  minimumCacheTTL?: number
  dangerouslyAllowSVG?: boolean
  contentDispositionType?: 'attachment' | 'inline'
  contentSecurityPolicy?: string
  loader?: 'default' | 'imgix' | 'cloudinary' | 'akamai' | 'custom'
  loaderFile?: string
  domains?: string[]
  path?: string
  quality?: number
  priority?: boolean
  loading?: 'lazy' | 'eager'
  unoptimized?: boolean
  experimentalLayout?: 'responsive' | 'fill' | 'fixed' | 'intrinsic'
  cacheTTL?: number
  breakpoints?: number[]
  sharp?: {
    quality?: number
    progressive?: boolean
    optimizeScans?: boolean
    mozjpeg?: boolean
  }
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

// Enhanced Image Component Props for Next.js 15.5.0
export interface EnhancedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  unoptimized?: boolean
  className?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void
  // Enhanced Next.js 15.5.0 features
  webpSrc?: string
  avifSrc?: string
  fallbackSrc?: string
  animation?: 'fade' | 'slide' | 'zoom' | 'blur' | 'none'
  duration?: number
  delay?: number
  responsive?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
}

// App Router Types for Next.js 15.5.0
export interface PageProps<T = Record<string, string | string[]>> {
  params: T
  searchParams: Record<string, string | string[] | undefined>
}

export interface LayoutProps<T = Record<string, string | string[]>> {
  children: React.ReactNode
  params: T
}

export interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export interface NotFoundProps {}

export interface LoadingProps {}

// Enhanced Metadata Types for Next.js 15.5.0
export interface EnhancedMetadata extends Metadata {
  // Enhanced SEO properties
  canonical?: string
  robots?: {
    index?: boolean
    follow?: boolean
    noarchive?: boolean
    nosnippet?: boolean
    noimageindex?: boolean
    nocache?: boolean
    notranslate?: boolean
    indexifembedded?: boolean
    nositelinkssearchbox?: boolean
    unavailable_after?: string
    'max-video-preview'?: number | 'none'
    'max-image-preview'?: 'none' | 'standard' | 'large'
    'max-snippet'?: number | 'none'
  }
  // Enhanced Open Graph
  openGraph?: {
    title?: string
    description?: string
    url?: string
    siteName?: string
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
      type?: string
      secureUrl?: string
    }>
    locale?: string
    type?: 'website' | 'article' | 'book' | 'profile' | 'music' | 'video'
    publishedTime?: string
    modifiedTime?: string
    expirationTime?: string
    authors?: string[]
    section?: string
    tags?: string[]
  }
  // Enhanced Twitter Card
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player'
    site?: string
    siteId?: string
    creator?: string
    creatorId?: string
    title?: string
    description?: string
    images?: string | Array<{
      url: string
      alt?: string
      width?: number
      height?: number
    }>
    app?: {
      name: string
      id: {
        iphone?: string
        ipad?: string
        googleplay?: string
      }
      url?: {
        iphone?: string
        ipad?: string
        googleplay?: string
      }
    }
  }
  // Performance hints
  preload?: Array<{
    href: string
    as: 'script' | 'style' | 'image' | 'font' | 'fetch'
    type?: string
    crossOrigin?: 'anonymous' | 'use-credentials'
  }>
  prefetch?: Array<{
    href: string
    as?: 'document' | 'image' | 'script' | 'style'
  }>
  // Security
  contentSecurityPolicy?: string
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
}

// Route Handler Types for Next.js 15.5.0
export interface RouteContext {
  params: Record<string, string | string[]>
}

export interface NextRequest extends Request {
  nextUrl: {
    pathname: string
    search: string
    searchParams: URLSearchParams
    href: string
    origin: string
    protocol: string
    host: string
    hostname: string
    port: string
    hash: string
    basePath: string
    buildId?: string
    defaultLocale?: string
    domainLocale?: {
      defaultLocale: string
      domain: string
      http?: boolean
      locales?: string[]
    }
    locale?: string
    trailingSlash?: boolean
  }
  geo?: {
    city?: string
    country?: string
    region?: string
    latitude?: string
    longitude?: string
  }
  ip?: string
  cookies: {
    get(name: string): { name: string; value: string } | undefined
    getAll(): Array<{ name: string; value: string }>
    has(name: string): boolean
    set(name: string, value: string, options?: any): void
    delete(name: string): void
  }
  headers: Headers
}

export interface NextResponse extends Response {
  cookies: {
    get(name: string): { name: string; value: string } | undefined
    getAll(): Array<{ name: string; value: string }>
    has(name: string): boolean
    set(name: string, value: string, options?: any): NextResponse
    delete(name: string): NextResponse
  }
  headers: Headers
}

// Middleware Types for Next.js 15.5.0
export interface MiddlewareConfig {
  matcher?: string | string[]
  unstable_allowDynamic?: string[]
}

export type MiddlewareFunction = (
  request: NextRequest,
  event: {
    waitUntil: (promise: Promise<any>) => void
  }
) => NextResponse | Response | Promise<NextResponse | Response> | void | Promise<void>

// Server Actions Types for Next.js 15.5.0
export type ServerAction<T = any, R = any> = (formData: FormData) => Promise<R>

export interface ServerActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

// Streaming Types for Next.js 15.5.0
export interface StreamingProps {
  fallback?: React.ReactNode
  loading?: React.ReactNode
  error?: React.ReactNode
}

// Performance Types for Next.js 15.5.0
export interface WebVitalsMetric {
  id: string
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache'
}

export interface NextWebVitalsMetric extends WebVitalsMetric {
  label: 'web-vital' | 'custom'
}

// Cache Types for Next.js 15.5.0
export interface CacheHandler {
  get(key: string): Promise<any>
  set(key: string, data: any, ctx: {
    kind?: string
    revalidate?: number
    tags?: string[]
  }): Promise<void>
  revalidateTag(tag: string): Promise<void>
  revalidatePath?(path: string): Promise<void>
}

export interface IncrementalCacheValue {
  kind: 'PAGE' | 'ROUTE' | 'IMAGE' | 'FETCH' | 'REDIRECT'
  html?: string
  pageData?: any
  headers?: Record<string, string>
  status?: number
  body?: Buffer
  revalidate?: number | false
  tags?: string[]
}

// Font Types for Next.js 15.5.0
export interface FontConfig {
  src: string | Array<{
    path: string
    weight?: string
    style?: string
  }>
  weight?: string | string[]
  style?: string | string[]
  subsets?: string[]
  axes?: string[]
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  preload?: boolean
  fallback?: string[]
  adjustFontFallback?: boolean
  variable?: string
  declarations?: Array<{
    prop: string
    value: string
  }>
}

// Bundle Analysis Types
export interface BundleAnalysis {
  assets: Array<{
    name: string
    size: number
    chunks: string[]
    chunkNames: string[]
    emitted: boolean
  }>
  chunks: Array<{
    id: string | number
    names: string[]
    size: number
    modules: Array<{
      name: string
      size: number
      reasons: Array<{
        moduleName: string
        type: string
      }>
    }>
  }>
  entrypoints: Record<string, {
    chunks: (string | number)[]
    assets: string[]
    size: number
  }>
  namedChunkGroups: Record<string, {
    chunks: (string | number)[]
    assets: string[]
    size: number
  }>
}

// Turbopack Types for Next.js 15.5.0
export interface TurbopackConfig {
  rules?: Record<string, {
    loaders: string[]
    as?: string
  }>
  resolveAlias?: Record<string, string | string[]>
  resolveExtensions?: string[]
  memoryLimit?: number
}

// React Compiler Types for Next.js 15.5.0
export interface ReactCompilerConfig {
  compilationMode?: 'annotation' | 'infer'
  panicThreshold?: 'none' | 'critical_errors' | 'all_errors'
  sources?: (filename: string) => boolean
  runtimeModule?: string
}