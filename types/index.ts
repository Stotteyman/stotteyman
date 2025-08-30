/**
 * Main type definitions export for Next.js 15.5.0 upgrade
 * Centralized exports for all type definitions
 */

// Animation types
export * from './animations'

// Component types
export * from './components'

// Performance types
export * from './performance'

// Security types
export * from './security'

// Global type augmentations for Next.js 15.5.0
declare global {
  interface Window {
    // Animation system
    __ANIMATION_MANAGER__?: {
      animations: Map<string, import('./animations').AnimationConfig>
      quality: import('./animations').AnimationQuality
      reducedMotion: boolean
    }
    
    // Security monitoring
    __SECURITY_MONITOR__?: {
      events: import('./security').SecurityEvent[]
      violations: number
      blocked: number
    }
    
    // Web Vitals
    webVitals?: {
      getCLS: (onReport: (metric: any) => void) => void
      getFCP: (onReport: (metric: any) => void) => void
      getFID: (onReport: (metric: any) => void) => void
      getLCP: (onReport: (metric: any) => void) => void
      getTTFB: (onReport: (metric: any) => void) => void
      getINP: (onReport: (metric: any) => void) => void
    }
    
    // Device capabilities
    DeviceMotionEvent?: {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    
    DeviceOrientationEvent?: {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
  }
  
  // Next.js specific augmentations
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PERFORMANCE_MONITORING?: string
      NEXT_PUBLIC_ANIMATION_QUALITY?: 'low' | 'medium' | 'high' | 'auto'
      NEXT_PUBLIC_SECURITY_MONITORING?: string
      NEXT_PUBLIC_CSP_REPORT_URI?: string
      NEXT_PUBLIC_SENTRY_DSN?: string
      NEXT_PUBLIC_ANALYTICS_ID?: string
      BUILD_TIME?: string
      BUILD_ID?: string
      NEXT_RUNTIME?: 'nodejs' | 'edge'
    }
  }
  
  // CSS custom properties for theming
  interface CSSStyleDeclaration {
    '--animation-duration'?: string
    '--animation-easing'?: string
    '--animation-delay'?: string
    '--particle-count'?: string
    '--particle-speed'?: string
    '--blur-strength'?: string
    '--glass-opacity'?: string
    '--gradient-angle'?: string
    '--scroll-progress'?: string
    '--mouse-x'?: string
    '--mouse-y'?: string
  }
}

// Utility types for Next.js 15.5.0
export type NextPageProps<T = {}> = {
  params: T
  searchParams: { [key: string]: string | string[] | undefined }
}

export type NextLayoutProps<T = {}> = {
  children: React.ReactNode
  params: T
}

export type NextErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export type NextNotFoundProps = {}

export type NextLoadingProps = {}

// API route types
export type NextApiRequest = {
  query: { [key: string]: string | string[] }
  cookies: { [key: string]: string }
  body: any
  method?: string
  headers: { [key: string]: string | string[] | undefined }
}

export type NextApiResponse<T = any> = {
  status: (statusCode: number) => NextApiResponse<T>
  json: (body: T) => void
  send: (body: T) => void
  redirect: (url: string) => void
  setHeader: (name: string, value: string | string[]) => void
  end: () => void
}

// Middleware types
export type NextMiddleware = (
  request: NextRequest,
  event: NextFetchEvent
) => NextResponse | Response | null | undefined | Promise<NextResponse | Response | null | undefined>

export type NextRequest = Request & {
  nextUrl: {
    pathname: string
    search: string
    searchParams: URLSearchParams
    href: string
    origin: string
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
  ua?: {
    browser: { name?: string; version?: string }
    device: { model?: string; type?: string; vendor?: string }
    engine: { name?: string; version?: string }
    os: { name?: string; version?: string }
    cpu: { architecture?: string }
  }
}

export type NextFetchEvent = {
  waitUntil: (promise: Promise<any>) => void
}

export type NextResponse = Response & {
  cookies: {
    get: (name: string) => { name: string; value: string } | undefined
    getAll: () => { name: string; value: string }[]
    set: (name: string, value: string, options?: any) => void
    delete: (name: string) => void
  }
  nextUrl?: URL
}

// Server component types
export type ServerComponentProps<T = {}> = {
  params: T
  searchParams: { [key: string]: string | string[] | undefined }
}

// Client component types
export type ClientComponentProps<T = {}> = T & {
  children?: React.ReactNode
}

// Hook return types
export type UseClientSideReturn<T> = {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export type UseServerActionReturn<T, P = any> = {
  execute: (params: P) => Promise<T>
  loading: boolean
  error: Error | null
  data: T | null
}

// Form action types
export type FormAction<T = any> = (
  prevState: T,
  formData: FormData
) => Promise<T>

export type ServerAction<T = any, P = any> = (
  params: P
) => Promise<T>

// Streaming types
export type StreamingResponse<T> = {
  stream: ReadableStream<T>
  controller: ReadableStreamDefaultController<T>
}

// Edge runtime types
export type EdgeRuntimeConfig = {
  runtime: 'edge'
  regions?: string[]
  unstable_allowDynamic?: string[]
}

// Experimental features
export type ExperimentalConfig = {
  ppr?: boolean
  dynamicIO?: boolean
  reactCompiler?: boolean
  turbo?: {
    rules?: Record<string, any>
  }
  serverActions?: {
    allowedOrigins?: string[]
    bodySizeLimit?: string
  }
}