export interface SecurityConfig {
  csp: {
    directives: Record<string, string[]>
    reportUri?: string
  }
  headers: SecurityHeader[]
  rateLimit: {
    windowMs: number
    max: number
  }
}

export interface SecurityHeader {
  name: string
  value: string
  condition?: string
}

export interface SecurityViolation {
  type: 'csp' | 'xss' | 'csrf' | 'rate_limit'
  severity: 'low' | 'medium' | 'high'
  details: string
  timestamp: Date
  userAgent?: string
  ip?: string
}

export interface CSPReport {
  'csp-report': {
    'document-uri': string
    referrer: string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    disposition: string
    'blocked-uri': string
    'line-number': number
    'column-number': number
    'source-file': string
    'status-code': number
    'script-sample': string
  }
}

export interface RateLimitConfig {
  windowMs: number
  max: number
  message: string
  standardHeaders: boolean
  legacyHeaders: boolean
}