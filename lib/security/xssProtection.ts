import DOMPurify from 'isomorphic-dompurify'

// XSS Protection Configuration
const XSS_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'width', 'height',
    'class', 'id', 'target', 'rel'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string, options?: {
  allowedTags?: string[]
  allowedAttributes?: string[]
  stripTags?: boolean
}): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  const config = {
    ALLOWED_TAGS: options?.allowedTags || XSS_CONFIG.ALLOWED_TAGS,
    ALLOWED_ATTR: options?.allowedAttributes || XSS_CONFIG.ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: XSS_CONFIG.ALLOWED_URI_REGEXP,
    KEEP_CONTENT: !options?.stripTags,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_DOM: true,
    FORCE_BODY: false,
    WHOLE_DOCUMENT: false
  }

  return DOMPurify.sanitize(dirty, config)
}

/**
 * Sanitize text content by stripping all HTML tags
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}

/**
 * Escape HTML entities in user input
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') {
    return ''
  }

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate and sanitize URL to prevent javascript: and data: URI attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  // Remove any whitespace
  const cleanUrl = url.trim()

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
    'chrome:',
    'chrome-extension:',
    'moz-extension:'
  ]

  const lowerUrl = cleanUrl.toLowerCase()
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return ''
    }
  }

  // Allow relative URLs, http, https, mailto, tel
  if (cleanUrl.startsWith('/') || 
      cleanUrl.startsWith('./') || 
      cleanUrl.startsWith('../') ||
      cleanUrl.startsWith('http://') ||
      cleanUrl.startsWith('https://') ||
      cleanUrl.startsWith('mailto:') ||
      cleanUrl.startsWith('tel:')) {
    return cleanUrl
  }

  // If it doesn't match allowed patterns, return empty
  return ''
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\\d+]/g, '')
  
  // Basic phone validation (7-15 digits, optional + prefix)
  const phoneRegex = /^\\+?[1-9]\\d{6,14}$/
  return phoneRegex.test(cleanPhone)
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = {} as T

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Sanitize string values
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T]
    } else if (Array.isArray(value)) {
      // Sanitize array of strings
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      ) as T[keyof T]
    } else {
      // Keep other types as-is (numbers, booleans, etc.)
      sanitized[key as keyof T] = value
    }
  }

  return sanitized
}

/**
 * Content Security Policy nonce generator
 */
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for environments without crypto
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(identifier)

    if (!attempt || now > attempt.resetTime) {
      // First attempt or window expired
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (attempt.count >= this.maxAttempts) {
      return false
    }

    // Increment attempt count
    attempt.count++
    return true
  }

  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier)
    if (!attempt || Date.now() > attempt.resetTime) {
      return this.maxAttempts
    }
    return Math.max(0, this.maxAttempts - attempt.count)
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, attempt] of this.attempts.entries()) {
      if (now > attempt.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

/**
 * Input validation schemas
 */
export const ValidationSchemas = {
  contactForm: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\-']+$/
    },
    email: {
      required: true,
      maxLength: 254,
      validator: validateEmail
    },
    phone: {
      required: false,
      validator: validatePhone
    },
    company: {
      required: false,
      maxLength: 200,
      pattern: /^[a-zA-Z0-9\s\-&.,()]+$/
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 2000
    }
  }
}

/**
 * Validate input against schema
 */
export function validateInput(
  value: any, 
  schema: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    validator?: (value: any) => boolean
  }
): { isValid: boolean; error?: string } {
  // Check required
  if (schema.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return { isValid: false, error: 'This field is required' }
  }

  // Skip other validations if not required and empty
  if (!schema.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return { isValid: true }
  }

  const stringValue = String(value).trim()

  // Check min length
  if (schema.minLength && stringValue.length < schema.minLength) {
    return { isValid: false, error: `Minimum length is ${schema.minLength} characters` }
  }

  // Check max length
  if (schema.maxLength && stringValue.length > schema.maxLength) {
    return { isValid: false, error: `Maximum length is ${schema.maxLength} characters` }
  }

  // Check pattern
  if (schema.pattern && !schema.pattern.test(stringValue)) {
    return { isValid: false, error: 'Invalid format' }
  }

  // Check custom validator
  if (schema.validator && !schema.validator(value)) {
    return { isValid: false, error: 'Invalid value' }
  }

  return { isValid: true }
}

// Global rate limiter instances
export const contactFormLimiter = new RateLimiter(3, 10 * 60 * 1000) // 3 attempts per 10 minutes
export const generalLimiter = new RateLimiter(10, 60 * 1000) // 10 attempts per minute