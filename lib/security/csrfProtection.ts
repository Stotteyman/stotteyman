import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// CSRF Configuration
const CSRF_CONFIG = {
  tokenName: '__csrf_token',
  cookieName: '__csrf_cookie',
  headerName: 'x-csrf-token',
  tokenLength: 32,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  }
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex')
}

/**
 * Create CSRF token pair (token + secret)
 */
export function createCSRFTokenPair(): { token: string; secret: string } {
  const secret = generateCSRFToken()
  const token = generateCSRFToken()
  
  // Create HMAC of token with secret
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(token)
  const signature = hmac.digest('hex')
  
  return {
    token: `${token}.${signature}`,
    secret
  }
}

/**
 * Verify CSRF token against secret
 */
export function verifyCSRFToken(token: string, secret: string): boolean {
  if (!token || !secret) {
    return false
  }

  try {
    const [tokenPart, signature] = token.split('.')
    if (!tokenPart || !signature) {
      return false
    }

    // Recreate HMAC with secret
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(tokenPart)
    const expectedSignature = hmac.digest('hex')

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    return false
  }
}

/**
 * Set CSRF token in cookies (server-side)
 */
export function setCSRFCookie(response: NextResponse): string {
  const { token, secret } = createCSRFTokenPair()
  
  // Set the secret in an HTTP-only cookie
  response.cookies.set(CSRF_CONFIG.cookieName, secret, CSRF_CONFIG.cookieOptions)
  
  // Return the token to be included in forms
  return token
}

/**
 * Get CSRF token from cookies (server-side)
 */
export async function getCSRFSecret(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(CSRF_CONFIG.cookieName)?.value || null
  } catch (error) {
    return null
  }
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: NextRequest): boolean {
  try {
    // Get token from header or body
    const tokenFromHeader = request.headers.get(CSRF_CONFIG.headerName)
    const tokenFromBody = request.nextUrl.searchParams.get(CSRF_CONFIG.tokenName)
    const token = tokenFromHeader || tokenFromBody

    if (!token) {
      return false
    }

    // Get secret from cookie
    const secret = request.cookies.get(CSRF_CONFIG.cookieName)?.value
    if (!secret) {
      return false
    }

    return verifyCSRFToken(token, secret)
  } catch (error) {
    return false
  }
}

/**
 * CSRF middleware for API routes
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request)
    }

    // Validate CSRF token for state-changing requests
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    return handler(request)
  }
}

// getCSRFToken function moved to hooks/useCSRFToken.ts

// React hook moved to separate client-side file

/**
 * Enhanced fetch with CSRF protection
 */
export async function csrfFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCSRFSecret()
  
  const headers = new Headers(options.headers)
  if (token) {
    headers.set(CSRF_CONFIG.headerName, token)
  }
  headers.set('Content-Type', 'application/json')

  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin'
  })
}

/**
 * Form submission with CSRF protection
 */
export async function submitFormWithCSRF(
  formData: FormData | Record<string, any>,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCSRFSecret()
  
  let body: string | FormData
  const headers = new Headers(options.headers)

  if (formData instanceof FormData) {
    if (token) {
      formData.append(CSRF_CONFIG.tokenName, token)
    }
    body = formData
  } else {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify({
      ...formData,
      ...(token ? { [CSRF_CONFIG.tokenName]: token } : {})
    })
  }

  return fetch(url, {
    method: 'POST',
    ...options,
    headers,
    body,
    credentials: 'same-origin'
  })
}

/**
 * Session management utilities
 */
export class SessionManager {
  private static readonly SESSION_COOKIE = '__session_id'
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static setSession(response: NextResponse, _sessionData: any): void {
    const sessionId = this.generateSessionId()
    const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT)
    
    // In a real app, store session data in Redis/database
    // For now, we'll use a simple in-memory store (not production-ready)
    
    response.cookies.set(this.SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/'
    })
  }

  static getSession(request: NextRequest): string | null {
    return request.cookies.get(this.SESSION_COOKIE)?.value || null
  }

  static clearSession(response: NextResponse): void {
    response.cookies.delete(this.SESSION_COOKIE)
  }

  static isSessionValid(sessionId: string): boolean {
    // In a real app, check against Redis/database
    // This is a placeholder implementation
    return Boolean(sessionId && typeof sessionId === 'string' && sessionId.length === 64)
  }
}

/**
 * Double Submit Cookie pattern for additional CSRF protection
 */
export class DoubleSubmitCookie {
  private static readonly COOKIE_NAME = '__csrf_double_submit'

  static generate(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static setCookie(response: NextResponse): string {
    const value = this.generate()
    
    response.cookies.set(this.COOKIE_NAME, value, {
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })

    return value
  }

  static validate(request: NextRequest, submittedValue: string): boolean {
    const cookieValue = request.cookies.get(this.COOKIE_NAME)?.value
    
    if (!cookieValue || !submittedValue) {
      return false
    }

    return crypto.timingSafeEqual(
      Buffer.from(cookieValue),
      Buffer.from(submittedValue)
    )
  }
}

// React hooks moved to separate client-side file