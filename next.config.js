/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next.js 15.5.0 optimizations
    optimizeCss: true,
    optimizeServerReact: true,
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-icons',
      'gsap',
      'lottie-react',
      'react-intersection-observer',
      'use-gesture',
      'three',
      'dompurify'
    ],
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000, // 128KB
    // Memory optimization
    memoryBasedWorkersCount: true,
    // Enhanced caching
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    // Next.js 15.5.0 specific features
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Enhanced bundling
    bundlePagesRouterDependencies: true,
    // Improved static generation
    staticWorkerRequestDeduping: true,
    // Enhanced middleware
    middlewareSourceMaps: process.env.NODE_ENV === 'development',
    // Performance improvements
    serverMinification: true,
    serverSourceMaps: process.env.NODE_ENV === 'development',
    // Enhanced image optimization
    nextScriptWorkers: true,
    // Next.js 15.5.0 enhanced features
    turbotrace: {
      logLevel: 'error',
      logDetail: true,
      showAll: false,
      contextDirectory: process.cwd(),
    },
    // Enhanced React optimizations
    reactCompiler: process.env.NODE_ENV === 'production',
    // Improved build performance
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    // Enhanced static optimization
    gzipSize: true,
    // Advanced caching strategies
    incrementalCacheHandlerPath: process.env.NODE_ENV === 'production' ? require.resolve('./lib/cache-handler.js') : undefined,
    // Improved tree shaking
    esmExternals: 'loose',
    // Enhanced font optimization
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
    ],
    // Next.js 15.5.0 new features
    ppr: process.env.NODE_ENV === 'production', // Partial Prerendering
    dynamicIO: true, // Dynamic IO for better streaming
    reactOwnerStack: process.env.NODE_ENV === 'development', // Better error traces
    serverActions: {
      allowedOrigins: ['localhost:3000', process.env.VERCEL_URL],
      bodySizeLimit: '2mb',
    },
    // Enhanced build performance
    useWasmBinary: true, // Use WebAssembly for faster builds
    forceSwcTransforms: true, // Force SWC for all transforms
    // Improved hydration
    clientRouterFilter: true,
    clientRouterFilterRedirects: true,
    // Enhanced streaming
    appDocumentPreloading: true,
    optimisticClientCache: true,
    // Better error handling
    strictNextHead: true,
    // Enhanced security
    serverComponentsExternalPackages: ['canvas', 'sharp', 'sqlite3'],
  },
  serverExternalPackages: ['canvas', 'sharp'],
  transpilePackages: ['three', 'gsap'],
  typedRoutes: true,
  // Enhanced logging for development
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? {
      properties: ['^data-testid', '^data-cy']
    } : false,
    // Enhanced SWC optimizations
    styledComponents: false,
    emotion: false,
  },
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}.js',
      skipDefaultConversion: true,
    },
    'framer-motion': {
      transform: 'framer-motion/dist/es/{{member}}',
      skipDefaultConversion: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.calendly.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Next.js 15.5.0 enhanced image features
    loader: 'default',
    loaderFile: '',
    domains: [],
    path: '/_next/image',
    // Enhanced quality and performance
    quality: 85,
    priority: false,
    loading: 'lazy',
    // Advanced optimization
    unoptimized: false,
    // Enhanced AVIF support with better compression
    experimentalLayout: 'responsive',
    // Improved caching with stale-while-revalidate
    cacheTTL: 31536000, // 1 year
    // Enhanced responsive images
    breakpoints: [640, 768, 1024, 1280, 1536],
    // Advanced image processing with Next.js 15.5.0
    sharp: {
      quality: 85,
      progressive: true,
      optimizeScans: true,
      mozjpeg: true,
      // Enhanced AVIF encoding
      avif: {
        quality: 80,
        speed: 4,
        chromaSubsampling: '4:2:0',
      },
      // Enhanced WebP encoding
      webp: {
        quality: 85,
        effort: 4,
        lossless: false,
      },
      // Enhanced JPEG encoding
      jpeg: {
        quality: 85,
        progressive: true,
        mozjpeg: true,
        trellisQuantisation: true,
        overshootDeringing: true,
        optimizeScans: true,
      },
      // Enhanced PNG encoding
      png: {
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: true,
      },
    },
    // Enhanced loading strategies
    placeholder: 'blur',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    // Next.js 15.5.0 new image features
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Enhanced responsive loading
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    // Improved performance monitoring
    onLoad: process.env.NODE_ENV === 'development' ? (result) => {
      console.log('Image loaded:', result.naturalWidth, 'x', result.naturalHeight)
    } : undefined,
    onError: process.env.NODE_ENV === 'development' ? (error) => {
      console.error('Image error:', error)
    } : undefined,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://calendly.com https://assets.calendly.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://assets.calendly.com",
              "connect-src 'self' https://vitals.vercel-insights.com https://api.calendly.com",
              "frame-src https://calendly.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      // Performance headers for static assets
      {
        source: '/(_next/static|favicon.ico|robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  webpack: (config, context) => {
    // Use enhanced webpack configuration
    const { enhanceWebpackConfig } = require('./lib/config/webpack.config.js')
    return enhanceWebpackConfig(config, context)
  },
  // Enhanced performance settings
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  // Performance and caching optimizations
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Enable static optimization
  staticPageGenerationTimeout: 60,
  // Next.js 15.5.0 specific optimizations
  swcMinify: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  // Enhanced output configuration
  output: 'standalone',
  // Improved build performance
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enhanced caching
  cacheHandler: process.env.NODE_ENV === 'production' ? require.resolve('./lib/cache-handler.js') : undefined,
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50MB
}

// Add bundle analyzer support
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)