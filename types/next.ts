/**
 * Next.js 15.5.0 specific type definitions
 */

import { NextRequest, NextResponse } from 'next/server'
import type { Metadata, ResolvingMetadata } from 'next'

// App Router types
export interface PageProps<T = {}> {
  params: T
  searchParams: { [key: string]: string | string[] | undefined }
}

export interface LayoutProps<T = {}> {
  children: React.ReactNode
  params: T
}

export interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export interface NotFoundProps {}

export interface LoadingProps {}

// Metadata types
export interface GenerateMetadataProps<T = {}> {
  params: T
  searchParams: { [key: string]: string | string[] | undefined }
}

export type MetadataGenerator<T = {}> = (
  props: GenerateMetadataProps<T>,
  parent: ResolvingMetadata
) => Promise<Metadata> | Metadata

// Static params types
export interface GenerateStaticParamsProps<T = {}> {
  params: Partial<T>
}

export type StaticParamsGenerator<T = {}> = (
  props?: GenerateStaticParamsProps<T>
) => Promise<T[]> | T[]

// Route handlers
export interface RouteContext<T = {}> {
  params: T
}

export type RouteHandler<T = {}> = (
  request: NextRequest,
  context: RouteContext<T>
) => Promise<NextResponse> | NextResponse | Promise<Response> | Response

// Middleware types
export interface MiddlewareConfig {
  matcher?: string | string[]
}

export type MiddlewareFunction = (
  request: NextRequest
) => Promise<NextResponse> | NextResponse | Promise<Response> | Response

// Image types (Next.js 15.5.0 enhanced)
export interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  quality?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  unoptimized?: boolean
  overrideSrc?: string
  onLoadingComplete?: (result: {
    naturalWidth: number
    naturalHeight: number
  }) => void
  onLoad?: React.ReactEventHandler<HTMLImageElement>
  onError?: React.ReactEventHandler<HTMLImageElement>
  loading?: 'eager' | 'lazy'
  style?: React.CSSProperties
  className?: string
  // Next.js 15.5.0 specific
  loader?: 'default' | 'imgix' | 'cloudinary' | 'akamai' | 'custom'
  loaderFile?: string
}

// Font types (Next.js 15.5.0)
export interface FontDescriptor {
  src: string
  weight?: string | number
  style?: string
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

// Script types (Next.js 15.5.0 enhanced)
export interface ScriptProps {
  src?: string
  id?: string
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker'
  onLoad?: () => void
  onReady?: () => void
  onError?: (error: Error) => void
  children?: React.ReactNode
  // Next.js 15.5.0 specific
  worker?: boolean
}

// Link types (Next.js 15.5.0 enhanced)
export interface LinkProps {
  href: string
  as?: string
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
  passHref?: boolean
  prefetch?: boolean
  locale?: string | false
  legacyBehavior?: boolean
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>
  onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  // Next.js 15.5.0 specific
  unstable_observeIntersection?: boolean
}

// Head types
export interface HeadProps {
  children: React.ReactNode
}

// Dynamic import types
export interface DynamicOptions<P = {}> {
  loading?: React.ComponentType<{ error?: Error; isLoading?: boolean; pastDelay?: boolean }>
  loader?: () => Promise<React.ComponentType<P>>
  loadableGenerated?: {
    webpack?: () => number[]
    modules?: string[]
  }
  ssr?: boolean
  suspense?: boolean
}

// Server actions types (Next.js 15.5.0)
export type ServerAction<T = any, R = any> = (data: T) => Promise<R>

export interface FormState<T = any> {
  message?: string
  errors?: Record<string, string[]>
  data?: T
}

export type FormAction<T = any> = (
  prevState: FormState<T>,
  formData: FormData
) => Promise<FormState<T>>

// Streaming types
export interface StreamingProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

// Suspense boundary types
export interface SuspenseBoundaryProps {
  fallback: React.ReactNode
  children: React.ReactNode
}

// Error boundary types
export interface ErrorBoundaryProps {
  fallback: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  children: React.ReactNode
}

// Parallel routes types
export interface ParallelRouteProps {
  children: React.ReactNode
  [key: string]: React.ReactNode
}

// Intercepting routes types
export interface InterceptingRouteProps {
  children: React.ReactNode
  modal?: React.ReactNode
}

// Route groups types
export interface RouteGroupProps {
  children: React.ReactNode
}

// Configuration types
export interface NextConfig {
  experimental?: {
    appDir?: boolean
    serverComponentsExternalPackages?: string[]
    mdxRs?: boolean
    turbo?: {
      rules?: Record<string, any>
      resolveAlias?: Record<string, string>
      resolveExtensions?: string[]
    }
    typedRoutes?: boolean
    instrumentationHook?: boolean
    ppr?: boolean
    reactCompiler?: boolean
    after?: boolean
    dynamicIO?: boolean
    inlineCss?: boolean
    optimizePackageImports?: string[]
    optimizeCss?: boolean
    optimizeServerReact?: boolean
    webVitalsAttribution?: string[]
    scrollRestoration?: boolean
    largePageDataBytes?: number
    memoryBasedWorkersCount?: boolean
    staleTimes?: {
      dynamic?: number
      static?: number
    }
    bundlePagesRouterDependencies?: boolean
    staticWorkerRequestDeduping?: boolean
    middlewareSourceMaps?: boolean
    serverMinification?: boolean
    serverSourceMaps?: boolean
    nextScriptWorkers?: boolean
  }
  images?: {
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
    loading?: 'eager' | 'lazy'
    unoptimized?: boolean
    cacheTTL?: number
  }
  compiler?: {
    removeConsole?: boolean | { exclude?: string[] }
    reactRemoveProperties?: boolean | { properties?: string[] }
    styledComponents?: boolean
    emotion?: boolean
  }
  modularizeImports?: Record<string, {
    transform: string
    skipDefaultConversion?: boolean
  }>
  serverExternalPackages?: string[]
  transpilePackages?: string[]
  typedRoutes?: boolean
  logging?: {
    fetches?: {
      fullUrl?: boolean
    }
  }
  poweredByHeader?: boolean
  compress?: boolean
  generateEtags?: boolean
  httpAgentOptions?: {
    keepAlive?: boolean
  }
  onDemandEntries?: {
    maxInactiveAge?: number
    pagesBufferLength?: number
  }
  staticPageGenerationTimeout?: number
  swcMinify?: boolean
  reactStrictMode?: boolean
  productionBrowserSourceMaps?: boolean
  optimizeFonts?: boolean
  output?: 'standalone' | 'export'
  eslint?: {
    ignoreDuringBuilds?: boolean
  }
  typescript?: {
    ignoreBuildErrors?: boolean
  }
  cacheHandler?: string
  cacheMaxMemorySize?: number
}

// Webpack types
export interface WebpackConfig {
  mode?: 'development' | 'production' | 'none'
  entry?: string | string[] | Record<string, string | string[]>
  output?: {
    path?: string
    filename?: string
    publicPath?: string
    chunkFilename?: string
  }
  module?: {
    rules?: any[]
  }
  plugins?: any[]
  resolve?: {
    alias?: Record<string, string>
    extensions?: string[]
    fallback?: Record<string, string | false>
  }
  optimization?: {
    splitChunks?: any
    minimize?: boolean
    minimizer?: any[]
    usedExports?: boolean
    sideEffects?: boolean
    concatenateModules?: boolean
    providedExports?: boolean
    innerGraph?: boolean
    mangleExports?: boolean
  }
  devtool?: string | false
  target?: string | string[]
  externals?: any
}

// Build types
export interface BuildManifest {
  pages: Record<string, string[]>
  ampDevFiles?: string[]
  polyfillFiles?: string[]
  lowPriorityFiles?: string[]
}

export interface PagesManifest {
  [page: string]: string
}

export interface RoutesManifest {
  version: number
  basePath: string
  redirects: Array<{
    source: string
    destination: string
    permanent: boolean
  }>
  rewrites: Array<{
    source: string
    destination: string
  }>
  headers: Array<{
    source: string
    headers: Array<{
      key: string
      value: string
    }>
  }>
}

// Analytics types
export interface WebVitalsMetric {
  id: string
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache'
}

export type ReportWebVitalsFunction = (metric: WebVitalsMetric) => void