/**
 * Performance monitoring and optimization type definitions
 * For Next.js 15.5.0 with enhanced Web Vitals and metrics tracking
 */

// Core Web Vitals interfaces
export interface WebVitalsMetrics {
  // Core Web Vitals
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  cls: number // Cumulative Layout Shift
  fid: number // First Input Delay
  inp: number // Interaction to Next Paint (replacing FID)
  ttfb: number // Time to First Byte
  
  // Additional performance metrics
  fcpAttribution?: FCPAttribution
  lcpAttribution?: LCPAttribution
  clsAttribution?: CLSAttribution
  fidAttribution?: FIDAttribution
  inpAttribution?: INPAttribution
  ttfbAttribution?: TTFBAttribution
}

export interface FCPAttribution {
  timeToFirstByte: number
  firstByteToFCP: number
  loadState: 'loading' | 'dom-interactive' | 'dom-content-loaded' | 'complete'
  navigationEntry?: PerformanceNavigationTiming
}

export interface LCPAttribution {
  element?: Element
  url?: string
  timeToFirstByte: number
  resourceLoadDelay: number
  resourceLoadTime: number
  elementRenderDelay: number
  navigationEntry?: PerformanceNavigationTiming
  lcpEntry?: PerformanceEntry
}

export interface CLSAttribution {
  largestShiftTarget?: Element
  largestShiftTime?: number
  largestShiftValue?: number
  largestShiftSource?: CLSSource
  largestShiftEntry?: PerformanceEntry
  loadState: 'loading' | 'dom-interactive' | 'dom-content-loaded' | 'complete'
}

export interface FIDAttribution {
  eventTarget?: Element
  eventType?: string
  eventTime?: number
  eventEntry?: PerformanceEventTiming
  loadState: 'loading' | 'dom-interactive' | 'dom-content-loaded' | 'complete'
}

export interface INPAttribution {
  eventTarget?: Element
  eventType?: string
  eventTime?: number
  processingStart?: number
  processingEnd?: number
  presentationTime?: number
  inputDelay?: number
  processingDuration?: number
  presentationDelay?: number
  loadState: 'loading' | 'dom-interactive' | 'dom-content-loaded' | 'complete'
}

export interface TTFBAttribution {
  waitingTime: number
  dnsTime: number
  connectionTime: number
  requestTime: number
  navigationEntry?: PerformanceNavigationTiming
}

export type CLSSource = 'unknown' | 'image-without-dimensions' | 'dynamic-content' | 'font-loading'

// Performance metrics collection
export interface PerformanceMetrics {
  webVitals: WebVitalsMetrics
  customMetrics: CustomMetrics
  resourceMetrics: ResourceMetrics
  animationMetrics: AnimationMetrics
  bundleMetrics: BundleMetrics
  timestamp: Date
  sessionId: string
  userId?: string
  pageUrl: string
  userAgent: string
  connectionType?: string
  deviceMemory?: number
  hardwareConcurrency?: number
}

export interface CustomMetrics {
  bundleSize: number
  chunkCount: number
  animationFrameRate: number
  memoryUsage: number
  domNodes: number
  scriptExecutionTime: number
  styleRecalcTime: number
  layoutTime: number
  paintTime: number
  compositeTime: number
  taskDuration: number
  longTaskCount: number
  interactionLatency: number
}

export interface ResourceMetrics {
  totalResources: number
  totalSize: number
  totalTransferSize: number
  imageCount: number
  imageSize: number
  scriptCount: number
  scriptSize: number
  stylesheetCount: number
  stylesheetSize: number
  fontCount: number
  fontSize: number
  cacheHitRate: number
  compressionRatio: number
}

export interface AnimationMetrics {
  averageFPS: number
  minFPS: number
  maxFPS: number
  frameDrops: number
  animationCount: number
  activeAnimations: number
  gpuMemoryUsage?: number
  renderingTime: number
  compositorTime: number
  rasterTime: number
  quality: 'low' | 'medium' | 'high'
}

export interface BundleMetrics {
  totalSize: number
  gzippedSize: number
  brotliSize?: number
  chunkSizes: ChunkSize[]
  duplicateModules: string[]
  unusedCode: number
  treeshakingEfficiency: number
  compressionRatio: number
  loadTime: number
  parseTime: number
  evaluationTime: number
}

export interface ChunkSize {
  name: string
  size: number
  gzippedSize: number
  modules: string[]
  isInitial: boolean
  isAsync: boolean
}

// Performance thresholds and budgets
export interface PerformanceThresholds {
  webVitals: WebVitalsThresholds
  custom: CustomThresholds
  bundle: BundleThresholds
  animation: AnimationThresholds
}

export interface WebVitalsThresholds {
  fcp: { good: number; needsImprovement: number }
  lcp: { good: number; needsImprovement: number }
  cls: { good: number; needsImprovement: number }
  fid: { good: number; needsImprovement: number }
  inp: { good: number; needsImprovement: number }
  ttfb: { good: number; needsImprovement: number }
}

export interface CustomThresholds {
  memoryUsage: number
  domNodes: number
  longTaskDuration: number
  interactionLatency: number
  scriptExecutionTime: number
}

export interface BundleThresholds {
  totalSize: number
  chunkSize: number
  unusedCodePercentage: number
  duplicateModulesCount: number
  loadTime: number
}

export interface AnimationThresholds {
  minFPS: number
  maxFrameDrops: number
  maxRenderTime: number
  maxGPUMemory?: number
}

// Performance monitoring configuration
export interface PerformanceConfig {
  enabled: boolean
  sampleRate: number
  thresholds: PerformanceThresholds
  reportingEndpoint?: string
  enableLongTaskObserver: boolean
  enableLayoutShiftObserver: boolean
  enableLargestContentfulPaintObserver: boolean
  enableFirstInputDelayObserver: boolean
  enableNavigationTimingObserver: boolean
  enableResourceTimingObserver: boolean
  enablePaintTimingObserver: boolean
  enableMemoryObserver: boolean
  bufferSize: number
  flushInterval: number
}

// Performance alerts and notifications
export interface PerformanceAlert {
  id: string
  type: 'threshold' | 'regression' | 'anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  metric: string
  value: number
  threshold: number
  message: string
  timestamp: Date
  url: string
  userAgent: string
  resolved: boolean
  resolvedAt?: Date
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  cooldown: number
  notifications: NotificationChannel[]
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'console'
  config: Record<string, any>
  enabled: boolean
}

// Performance optimization interfaces
export interface OptimizationRecommendation {
  id: string
  type: 'bundle' | 'image' | 'font' | 'script' | 'style' | 'animation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  potentialSavings: {
    size?: number
    time?: number
    score?: number
  }
  implementation: string[]
  resources: string[]
}

// Bundle analysis interfaces
export interface BundleAnalysis {
  totalSize: number
  gzippedSize: number
  brotliSize?: number
  chunks: ChunkInfo[]
  modules: ModuleInfo[]
  dependencies: DependencyInfo[]
  duplicates: DuplicateModule[]
  unusedExports: UnusedExport[]
  recommendations: OptimizationRecommendation[]
  treemap: TreemapNode[]
}

export interface ChunkInfo {
  id: string
  name: string
  size: number
  gzippedSize: number
  modules: string[]
  parents: string[]
  children: string[]
  isInitial: boolean
  isAsync: boolean
  reason: string
}

export interface ModuleInfo {
  id: string
  name: string
  size: number
  chunks: string[]
  reasons: ModuleReason[]
  source?: string
  dependencies: string[]
  exports: string[]
  usedExports: string[]
  providedExports: string[]
}

export interface ModuleReason {
  type: string
  userRequest: string
  module: string
  loc: string
}

export interface DependencyInfo {
  name: string
  version: string
  size: number
  gzippedSize: number
  modules: string[]
  license: string
  repository?: string
  homepage?: string
}

export interface DuplicateModule {
  name: string
  versions: string[]
  size: number
  chunks: string[]
  reason: string
}

export interface UnusedExport {
  module: string
  export: string
  size: number
  reason: string
}

export interface TreemapNode {
  name: string
  size: number
  children?: TreemapNode[]
  color?: string
  depth: number
}

// Performance monitoring hooks and utilities
export interface UsePerformanceMonitorOptions {
  enabled?: boolean
  sampleRate?: number
  reportingEndpoint?: string
  onMetric?: (metric: PerformanceMetrics) => void
  onAlert?: (alert: PerformanceAlert) => void
}

export interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics | null
  isMonitoring: boolean
  startMonitoring: () => void
  stopMonitoring: () => void
  reportMetric: (metric: Partial<PerformanceMetrics>) => void
  getHistory: () => PerformanceMetrics[]
  clearHistory: () => void
}

// Performance observer interfaces
export interface PerformanceObserverConfig {
  entryTypes: string[]
  buffered?: boolean
  callback: (entries: PerformanceEntry[]) => void
}

export interface LongTaskEntry extends PerformanceEntry {
  attribution: TaskAttributionTiming[]
}

export interface TaskAttributionTiming {
  containerType: string
  containerSrc: string
  containerId: string
  containerName: string
}

export interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
  lastInputTime: number
  sources: LayoutShiftSource[]
}

export interface LayoutShiftSource {
  node?: Node
  previousRect: DOMRectReadOnly
  currentRect: DOMRectReadOnly
}

// Memory monitoring interfaces
export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  pressure?: 'nominal' | 'fair' | 'serious' | 'critical'
}

export interface MemoryPressureEvent {
  level: 'nominal' | 'fair' | 'serious' | 'critical'
  timestamp: Date
  memoryInfo: MemoryInfo
}

// Network monitoring interfaces
export interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g'
  downlink: number
  rtt: number
  saveData: boolean
}

export interface NetworkChangeEvent {
  type: 'online' | 'offline' | 'change'
  networkInfo: NetworkInfo
  timestamp: Date
}

// Device monitoring interfaces
export interface DeviceInfo {
  deviceMemory?: number
  hardwareConcurrency: number
  maxTouchPoints: number
  platform: string
  userAgent: string
  vendor: string
  cookieEnabled: boolean
  onLine: boolean
  language: string
  languages: string[]
  doNotTrack: string | null
}

// Performance reporting interfaces
export interface PerformanceReport {
  id: string
  timestamp: Date
  url: string
  metrics: PerformanceMetrics
  alerts: PerformanceAlert[]
  recommendations: OptimizationRecommendation[]
  deviceInfo: DeviceInfo
  networkInfo?: NetworkInfo
  sessionDuration: number
  pageViews: number
}

export interface PerformanceReportingConfig {
  endpoint: string
  apiKey?: string
  batchSize: number
  flushInterval: number
  retryAttempts: number
  retryDelay: number
  enableCompression: boolean
  enableEncryption: boolean
}