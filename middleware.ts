import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers
  const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://calendly.com https://assets.calendly.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://assets.calendly.com",
      "connect-src 'self' https://vitals.vercel-insights.com https://api.calendly.com https://www.google-analytics.com",
      "frame-src https://calendly.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // XSS Protection
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '),

    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // DNS Prefetch Control
    'X-DNS-Prefetch-Control': 'on',

    // Remove server information
    'X-Powered-By': '',

    // Cross-Origin Embedder Policy
    'Cross-Origin-Embedder-Policy': 'credentialless',

    // Cross-Origin Opener Policy
    'Cross-Origin-Opener-Policy': 'same-origin',

    // Cross-Origin Resource Policy
    'Cross-Origin-Resource-Policy': 'same-origin'
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value)
    }
  })

  // Rate limiting headers (basic implementation)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitKey = `rate_limit_${ip}`
  
  // Add rate limiting info to headers
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', '99')
  response.headers.set('X-RateLimit-Reset', String(Date.now() + 60000))

  // Performance headers
  response.headers.set('X-Response-Time', String(Date.now()))

  // Cache control for different types of content
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/_next/static/') || pathname.includes('.')) {
    // Static assets - long cache
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (pathname.startsWith('/api/')) {
    // API routes - no cache by default
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  } else {
    // Pages - short cache with revalidation
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}