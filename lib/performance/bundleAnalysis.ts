'use client'

export interface BundleChunk {
  id: string
  name: string
  size: number
  gzippedSize?: number
  modules: BundleModule[]
  isEntry: boolean
  isInitial: boolean
  files: string[]
}

export interface BundleModule {
  id: string
  name: string
  size: number
  chunks: string[]
  depth: number
  issuer?: string
  reasons: ModuleReason[]
}

export interface ModuleReason {
  type: string
  userRequest: string
  module: string
}

export interface BundleStats {
  totalSize: number
  totalGzippedSize: number
  chunkCount: number
  moduleCount: number
  duplicateModules: BundleModule[]
  largestChunks: BundleChunk[]
  largestModules: BundleModule[]
  unusedModules: BundleModule[]
}

export interface BundleBudget {
  name: string
  type: 'bundle' | 'chunk' | 'asset'
  maximumSize: number
  warningSize: number
  baseline?: number
}

export interface BundleAnalysisResult {
  stats: BundleStats
  budgets: BundgetViolation[]
  recommendations: BundleRecommendation[]
  score: number
  timestamp: Date
}

export interface BudgetViolation {
  budget: BundleBudget
  actualSize: number
  violation: 'warning' | 'error'
  percentageOver: number
}

export interface BundleRecommendation {
  type: 'code-splitting' | 'tree-shaking' | 'compression' | 'lazy-loading' | 'dependency-optimization'
  priority: 'high' | 'medium' | 'low'
  description: string
  potentialSavings: number
  implementation: string
}

export class BundleAnalyzer {
  private budgets: BundleBudget[] = []
  private analysisHistory: BundleAnalysisResult[] = []

  constructor() {
    this.initializeDefaultBudgets()
  }

  private initializeDefaultBudgets(): void {
    this.budgets = [
      {
        name: 'Main Bundle',
        type: 'bundle',
        maximumSize: 250 * 1024, // 250KB
        warningSize: 200 * 1024   // 200KB
      },
      {
        name: 'Vendor Chunk',
        type: 'chunk',
        maximumSize: 150 * 1024, // 150KB
        warningSize: 120 * 1024   // 120KB
      },
      {
        name: 'Individual Assets',
        type: 'asset',
        maximumSize: 100 * 1024, // 100KB
        warningSize: 80 * 1024    // 80KB
      }
    ]
  }

  public async analyzeBundleFromWebpack(stats: any): Promise<BundleAnalysisResult> {
    const chunks = this.parseChunks(stats)
    const modules = this.parseModules(stats)
    
    const bundleStats = this.calculateStats(chunks, modules)
    const budgetViolations = this.checkBudgets(bundleStats, chunks)
    const recommendations = this.generateRecommendations(bundleStats, chunks, modules)
    const score = this.calculateScore(bundleStats, budgetViolations)

    const result: BundleAnalysisResult = {
      stats: bundleStats,
      budgets: budgetViolations,
      recommendations,
      score,
      timestamp: new Date()
    }

    this.analysisHistory.push(result)
    
    // Keep only last 10 analyses
    if (this.analysisHistory.length > 10) {
      this.analysisHistory = this.analysisHistory.slice(-10)
    }

    return result
  }

  public async analyzeCurrentBundle(): Promise<BundleAnalysisResult | null> {
    try {
      // In a real implementation, this would fetch webpack stats
      // For now, we'll simulate with performance API data
      const performanceEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      if (performanceEntries.length === 0) {
        return null
      }

      const jsResources = resourceEntries.filter(entry => 
        entry.name.includes('.js') && 
        (entry.name.includes('_next') || entry.name.includes('chunks'))
      )

      // Estimate bundle size from transfer sizes
      const totalSize = jsResources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0)
      const chunkCount = jsResources.length

      const mockStats: BundleStats = {
        totalSize,
        totalGzippedSize: totalSize * 0.7, // Estimate gzipped size
        chunkCount,
        moduleCount: chunkCount * 10, // Rough estimate
        duplicateModules: [],
        largestChunks: [],
        largestModules: [],
        unusedModules: []
      }

      const budgetViolations = this.checkBudgets(mockStats, [])
      const recommendations = this.generateRecommendations(mockStats, [], [])
      const score = this.calculateScore(mockStats, budgetViolations)

      return {
        stats: mockStats,
        budgets: budgetViolations,
        recommendations,
        score,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error analyzing bundle:', error)
      return null
    }
  }

  private parseChunks(stats: any): BundleChunk[] {
    if (!stats.chunks) return []

    return stats.chunks.map((chunk: any) => ({
      id: chunk.id?.toString() || '',
      name: chunk.names?.[0] || `chunk-${chunk.id}`,
      size: chunk.size || 0,
      modules: chunk.modules || [],
      isEntry: chunk.entry || false,
      isInitial: chunk.initial || false,
      files: chunk.files || []
    }))
  }

  private parseModules(stats: any): BundleModule[] {
    if (!stats.modules) return []

    return stats.modules.map((module: any) => ({
      id: module.id?.toString() || '',
      name: module.name || '',
      size: module.size || 0,
      chunks: module.chunks || [],
      depth: module.depth || 0,
      issuer: module.issuer,
      reasons: module.reasons || []
    }))
  }

  private calculateStats(chunks: BundleChunk[], modules: BundleModule[]): BundleStats {
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    const totalGzippedSize = chunks.reduce((sum, chunk) => sum + (chunk.gzippedSize || chunk.size * 0.7), 0)

    // Find duplicate modules
    const moduleNames = new Map<string, BundleModule[]>()
    modules.forEach(module => {
      const name = module.name
      if (!moduleNames.has(name)) {
        moduleNames.set(name, [])
      }
      moduleNames.get(name)!.push(module)
    })

    const duplicateModules = Array.from(moduleNames.entries())
      .filter(([_, mods]) => mods.length > 1)
      .flatMap(([_, mods]) => mods)

    // Find largest chunks and modules
    const largestChunks = [...chunks]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)

    const largestModules = [...modules]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)

    // Identify potentially unused modules (simplified heuristic)
    const unusedModules = modules.filter(module => 
      module.chunks.length === 0 || 
      (module.reasons.length === 0 && !module.name.includes('entry'))
    )

    return {
      totalSize,
      totalGzippedSize,
      chunkCount: chunks.length,
      moduleCount: modules.length,
      duplicateModules,
      largestChunks,
      largestModules,
      unusedModules
    }
  }

  private checkBudgets(stats: BundleStats, chunks: BundleChunk[]): BudgetViolation[] {
    const violations: BudgetViolation[] = []

    this.budgets.forEach(budget => {
      let actualSize = 0

      switch (budget.type) {
        case 'bundle':
          actualSize = stats.totalSize
          break
        case 'chunk':
          // Check largest chunk
          actualSize = chunks.length > 0 ? Math.max(...chunks.map(c => c.size)) : 0
          break
        case 'asset':
          // Check largest individual asset
          actualSize = chunks.length > 0 ? Math.max(...chunks.map(c => c.size)) : 0
          break
      }

      if (actualSize > budget.maximumSize) {
        violations.push({
          budget,
          actualSize,
          violation: 'error',
          percentageOver: ((actualSize - budget.maximumSize) / budget.maximumSize) * 100
        })
      } else if (actualSize > budget.warningSize) {
        violations.push({
          budget,
          actualSize,
          violation: 'warning',
          percentageOver: ((actualSize - budget.warningSize) / budget.warningSize) * 100
        })
      }
    })

    return violations
  }

  private generateRecommendations(
    stats: BundleStats, 
    chunks: BundleChunk[], 
    modules: BundleModule[]
  ): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = []

    // Code splitting recommendations
    if (stats.totalSize > 200 * 1024) {
      recommendations.push({
        type: 'code-splitting',
        priority: 'high',
        description: 'Bundle size is large. Consider implementing route-based code splitting.',
        potentialSavings: stats.totalSize * 0.3,
        implementation: 'Use dynamic imports for routes and heavy components'
      })
    }

    // Duplicate module recommendations
    if (stats.duplicateModules.length > 0) {
      const duplicateSize = stats.duplicateModules.reduce((sum, mod) => sum + mod.size, 0)
      recommendations.push({
        type: 'dependency-optimization',
        priority: 'medium',
        description: `Found ${stats.duplicateModules.length} duplicate modules`,
        potentialSavings: duplicateSize * 0.8,
        implementation: 'Optimize webpack splitChunks configuration to deduplicate modules'
      })
    }

    // Tree shaking recommendations
    if (stats.unusedModules.length > 0) {
      const unusedSize = stats.unusedModules.reduce((sum, mod) => sum + mod.size, 0)
      recommendations.push({
        type: 'tree-shaking',
        priority: 'medium',
        description: `Found ${stats.unusedModules.length} potentially unused modules`,
        potentialSavings: unusedSize,
        implementation: 'Enable tree shaking and remove unused imports'
      })
    }

    // Compression recommendations
    const compressionRatio = stats.totalGzippedSize / stats.totalSize
    if (compressionRatio > 0.8) {
      recommendations.push({
        type: 'compression',
        priority: 'low',
        description: 'Bundle compression ratio could be improved',
        potentialSavings: stats.totalSize * 0.2,
        implementation: 'Enable Brotli compression and optimize asset formats'
      })
    }

    // Large module recommendations
    const largeModules = modules.filter(mod => mod.size > 50 * 1024)
    if (largeModules.length > 0) {
      recommendations.push({
        type: 'lazy-loading',
        priority: 'high',
        description: `Found ${largeModules.length} large modules that could be lazy loaded`,
        potentialSavings: largeModules.reduce((sum, mod) => sum + mod.size, 0) * 0.5,
        implementation: 'Implement lazy loading for large components and libraries'
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private calculateScore(stats: BundleStats, violations: BudgetViolation[]): number {
    let score = 100

    // Deduct points for budget violations
    violations.forEach(violation => {
      if (violation.violation === 'error') {
        score -= Math.min(30, violation.percentageOver)
      } else {
        score -= Math.min(15, violation.percentageOver / 2)
      }
    })

    // Deduct points for duplicate modules
    if (stats.duplicateModules.length > 0) {
      score -= Math.min(20, stats.duplicateModules.length * 2)
    }

    // Deduct points for unused modules
    if (stats.unusedModules.length > 0) {
      score -= Math.min(15, stats.unusedModules.length)
    }

    return Math.max(0, Math.round(score))
  }

  public addBudget(budget: BundleBudget): void {
    this.budgets.push(budget)
  }

  public updateBudget(name: string, updates: Partial<BundleBudget>): boolean {
    const budget = this.budgets.find(b => b.name === name)
    if (budget) {
      Object.assign(budget, updates)
      return true
    }
    return false
  }

  public getBudgets(): BundleBudget[] {
    return [...this.budgets]
  }

  public getAnalysisHistory(): BundleAnalysisResult[] {
    return [...this.analysisHistory]
  }

  public getLatestAnalysis(): BundleAnalysisResult | null {
    return this.analysisHistory.length > 0 
      ? this.analysisHistory[this.analysisHistory.length - 1] 
      : null
  }

  public exportAnalysis(): string {
    return JSON.stringify({
      budgets: this.budgets,
      history: this.analysisHistory
    }, null, 2)
  }

  public importAnalysis(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.budgets) {
        this.budgets = parsed.budgets
      }
      if (parsed.history) {
        this.analysisHistory = parsed.history
      }
      return true
    } catch (error) {
      console.error('Error importing analysis:', error)
      return false
    }
  }
}

// Global instance
let globalAnalyzer: BundleAnalyzer | null = null

export function getBundleAnalyzer(): BundleAnalyzer {
  if (!globalAnalyzer) {
    globalAnalyzer = new BundleAnalyzer()
  }
  return globalAnalyzer
}