/**
 * Security type definitions for Next.js 15.5.0
 * Enhanced security headers, CSP, and protection mechanisms
 */

// Content Security Policy interfaces
export interface ContentSecurityPolicy {
  directives: CSPDirectives
  reportUri?: string
  reportOnly?: boolean
  nonce?: string
  upgradeInsecureRequests?: boolean
}

export interface CSPDirectives {
  'default-src'?: string[]
  'script-src'?: string[]
  'style-src'?: string[]
  'img-src'?: string[]
  'font-src'?: string[]
  'connect-src'?: string[]
  'media-src'?: string[]
  'object-src'?: string[]
  'child-src'?: string[]
  'frame-src'?: string[]
  'worker-src'?: string[]
  'manifest-src'?: string[]
  'base-uri'?: string[]
  'form-action'?: string[]
  'frame-ancestors'?: string[]
  'plugin-types'?: string[]
  'sandbox'?: string[]
  'upgrade-insecure-requests'?: boolean
  'block-all-mixed-content'?: boolean
  'require-sri-for'?: string[]
  'trusted-types'?: string[]
  'require-trusted-types-for'?: string[]
}

// Security headers configuration
export interface SecurityHeaders {
  contentSecurityPolicy?: ContentSecurityPolicy
  strictTransportSecurity?: HSTSConfig
  xFrameOptions?: XFrameOptionsConfig
  xContentTypeOptions?: boolean
  referrerPolicy?: ReferrerPolicyConfig
  permissionsPolicy?: PermissionsPolicyConfig
  crossOriginEmbedderPolicy?: COEPConfig
  crossOriginOpenerPolicy?: COOPConfig
  crossOriginResourcePolicy?: CORPConfig
  expectCT?: ExpectCTConfig
  xDNSPrefetchControl?: boolean
  xDownloadOptions?: boolean
  xPermittedCrossDomainPolicies?: string
}

export interface HSTSConfig {
  maxAge: number
  includeSubDomains?: boolean
  preload?: boolean
}

export interface XFrameOptionsConfig {
  policy: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
  uri?: string
}

export interface ReferrerPolicyConfig {
  policy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
}

export interface PermissionsPolicyConfig {
  accelerometer?: string[]
  ambientLightSensor?: string[]
  autoplay?: string[]
  battery?: string[]
  camera?: string[]
  crossOriginIsolated?: string[]
  displayCapture?: string[]
  documentDomain?: string[]
  encryptedMedia?: string[]
  executionWhileNotRendered?: string[]
  executionWhileOutOfViewport?: string[]
  fullscreen?: string[]
  geolocation?: string[]
  gyroscope?: string[]
  magnetometer?: string[]
  microphone?: string[]
  midi?: string[]
  navigationOverride?: string[]
  payment?: string[]
  pictureInPicture?: string[]
  publickeyCredentialsGet?: string[]
  screenWakeLock?: string[]
  syncXhr?: string[]
  usb?: string[]
  webShare?: string[]
  xrSpatialTracking?: string[]
}

export interface COEPConfig {
  policy: 'unsafe-none' | 'require-corp' | 'credentialless'
}

export interface COOPConfig {
  policy: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin'
}

export interface CORPConfig {
  policy: 'same-site' | 'same-origin' | 'cross-origin'
}

export interface ExpectCTConfig {
  maxAge: number
  enforce?: boolean
  reportUri?: string
}

// CORS configuration
export interface CORSConfig {
  origin?: string | string[] | boolean | ((origin: string) => boolean)
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  statusCode?: number
  headers?: boolean
  draft_polli_ratelimit_headers?: boolean
  legacyHeaders?: boolean
  standardHeaders?: boolean
  store?: RateLimitStore
  keyGenerator?: (req: any) => string
  handler?: (req: any, res: any, next: any, options: any) => void
  onLimitReached?: (req: any, res: any, options: any) => void
  skipFailedRequests?: boolean
  skipSuccessfulRequests?: boolean
  requestWasSuccessful?: (req: any, res: any) => boolean
  skip?: (req: any, res: any) => boolean
}

export interface RateLimitStore {
  incr(key: string, cb: (err: any, hits: number, resetTime: Date) => void): void
  decrement(key: string): void
  resetKey(key: string): void
  resetAll(): void
}

// Input sanitization and validation
export interface SanitizationConfig {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  allowedSchemes?: string[]
  allowedSchemesByTag?: Record<string, string[]>
  allowedSchemesAppliedToAttributes?: string[]
  allowProtocolRelative?: boolean
  enforceHtmlBoundary?: boolean
  parseStyleAttributes?: boolean
}

export interface ValidationRule {
  field: string
  rules: ValidationRuleConfig[]
  message?: string
}

export interface ValidationRuleConfig {
  type: 'required' | 'email' | 'url' | 'numeric' | 'alpha' | 'alphanumeric' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message?: string
  validator?: (value: any) => boolean | Promise<boolean>
}

// CSRF protection
export interface CSRFConfig {
  secret?: string
  cookie?: CSRFCookieConfig
  sessionKey?: string
  value?: (req: any) => string
  ignoreMethods?: string[]
  skip?: (req: any, res: any) => boolean
}

export interface CSRFCookieConfig {
  key?: string
  path?: string
  maxAge?: number
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none' | boolean
  signed?: boolean
}

// Security monitoring and logging
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  source: string
  target?: string
  details: Record<string, any>
  userAgent?: string
  ip?: string
  userId?: string
  sessionId?: string
  blocked: boolean
  action: SecurityAction
}

export type SecurityEventType = 
  | 'csp_violation'
  | 'xss_attempt'
  | 'csrf_attempt'
  | 'rate_limit_exceeded'
  | 'suspicious_request'
  | 'malformed_input'
  | 'unauthorized_access'
  | 'brute_force_attempt'
  | 'sql_injection_attempt'
  | 'file_upload_violation'
  | 'cors_violation'
  | 'security_header_missing'

export type SecurityAction = 
  | 'blocked'
  | 'logged'
  | 'rate_limited'
  | 'sanitized'
  | 'redirected'
  | 'challenged'
  | 'quarantined'

export interface SecurityAlert {
  id: string
  event: SecurityEvent
  threshold: SecurityThreshold
  count: number
  timeWindow: number
  firstOccurrence: Date
  lastOccurrence: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  notes?: string
}

export interface SecurityThreshold {
  eventType: SecurityEventType
  count: number
  timeWindow: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  action: SecurityAction
  enabled: boolean
}

// Security middleware configuration
export interface SecurityMiddlewareConfig {
  headers: SecurityHeaders
  cors: CORSConfig
  rateLimit: RateLimitConfig
  csrf: CSRFConfig
  sanitization: SanitizationConfig
  validation: ValidationRule[]
  monitoring: SecurityMonitoringConfig
  logging: SecurityLoggingConfig
}

export interface SecurityMonitoringConfig {
  enabled: boolean
  thresholds: SecurityThreshold[]
  alerting: SecurityAlertingConfig
  reporting: SecurityReportingConfig
}

export interface SecurityAlertingConfig {
  enabled: boolean
  channels: SecurityAlertChannel[]
  cooldown: number
  escalation: SecurityEscalationConfig
}

export interface SecurityAlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'console'
  config: Record<string, any>
  enabled: boolean
  severityFilter: ('low' | 'medium' | 'high' | 'critical')[]
}

export interface SecurityEscalationConfig {
  enabled: boolean
  levels: SecurityEscalationLevel[]
}

export interface SecurityEscalationLevel {
  level: number
  threshold: number
  timeWindow: number
  channels: string[]
  action: SecurityAction
}

export interface SecurityReportingConfig {
  enabled: boolean
  endpoint?: string
  apiKey?: string
  batchSize: number
  flushInterval: number
  includeDetails: boolean
  anonymizeIPs: boolean
}

export interface SecurityLoggingConfig {
  enabled: boolean
  level: 'debug' | 'info' | 'warn' | 'error'
  format: 'json' | 'text'
  destination: 'console' | 'file' | 'database' | 'external'
  retention: number
  rotation: SecurityLogRotationConfig
}

export interface SecurityLogRotationConfig {
  enabled: boolean
  maxSize: string
  maxFiles: number
  datePattern: string
  compress: boolean
}

// Secure session management
export interface SessionConfig {
  secret: string
  name?: string
  cookie: SessionCookieConfig
  store?: SessionStore
  genid?: (req: any) => string
  rolling?: boolean
  resave?: boolean
  saveUninitialized?: boolean
  proxy?: boolean
  unset?: 'destroy' | 'keep'
}

export interface SessionCookieConfig {
  path?: string
  httpOnly?: boolean
  secure?: boolean
  maxAge?: number
  domain?: string
  sameSite?: 'strict' | 'lax' | 'none' | boolean
  signed?: boolean
}

export interface SessionStore {
  get(sid: string, callback: (err: any, session?: any) => void): void
  set(sid: string, session: any, callback?: (err?: any) => void): void
  destroy(sid: string, callback?: (err?: any) => void): void
  touch?(sid: string, session: any, callback?: (err?: any) => void): void
  length?(callback: (err: any, length?: number) => void): void
  clear?(callback?: (err?: any) => void): void
  all?(callback: (err: any, obj?: any) => void): void
}

// Encryption and hashing utilities
export interface EncryptionConfig {
  algorithm: string
  key: string
  iv?: string
  encoding?: 'hex' | 'base64' | 'binary'
}

export interface HashingConfig {
  algorithm: 'sha256' | 'sha512' | 'bcrypt' | 'scrypt' | 'argon2'
  saltRounds?: number
  keyLength?: number
  options?: Record<string, any>
}

// API security interfaces
export interface APISecurityConfig {
  authentication: AuthenticationConfig
  authorization: AuthorizationConfig
  rateLimit: RateLimitConfig
  validation: ValidationRule[]
  sanitization: SanitizationConfig
  cors: CORSConfig
  headers: SecurityHeaders
}

export interface AuthenticationConfig {
  type: 'jwt' | 'session' | 'api-key' | 'oauth' | 'basic'
  config: Record<string, any>
  required: boolean
  skipPaths?: string[]
}

export interface AuthorizationConfig {
  type: 'rbac' | 'abac' | 'custom'
  config: Record<string, any>
  required: boolean
  skipPaths?: string[]
}

// Security audit and compliance
export interface SecurityAudit {
  id: string
  timestamp: Date
  type: 'manual' | 'automated' | 'scheduled'
  scope: string[]
  findings: SecurityFinding[]
  score: number
  status: 'passed' | 'failed' | 'warning'
  recommendations: SecurityRecommendation[]
}

export interface SecurityFinding {
  id: string
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  location: string
  evidence: Record<string, any>
  remediation: string
  status: 'open' | 'fixed' | 'accepted' | 'false-positive'
}

export interface SecurityRecommendation {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  implementation: string[]
  impact: string
  effort: 'low' | 'medium' | 'high'
  resources: string[]
}