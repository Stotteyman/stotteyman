'use client'

export interface UnusedExport {
  module: string
  export: string
  size: number
  importedBy: string[]
  potentialSavings: number
}

export interface TreeShakingAnalysis {
  unusedExports: UnusedExport[]
  sideEffectModules: string[]
  circularDependencies: string[]
  duplicateModules: string[]
  optimizationOpportunities: TreeShakingOpportunity[]
  totalPotentialSavings: number
  score: number
}

export interface TreeShakingOpportunity {
  type: 'unused-export' | 'side-effect' | 'circular-dependency' | 'duplicate-module' | 'barrel-export'
  description: string
  module: string
  impact: 'high' | 'medium' | 'low'
  potentialSavings: number
  recommendation: string
}

export interface ModuleDependency {
  name: string
  imports: string[]
  exports: string[]
  sideEffects: boolean
  size: number
  dependencies: string[]
}

export class TreeShakingAnalyzer {
  private moduleMap = new Map<string, ModuleDependency>()
  private analysisCache = new Map<string, TreeShakingAnalysis>()

  /**
   * Analyze tree shaking opportunities in the current bundle
   */
  public async analyzeTreeShaking(): Promise<TreeShakingAnalysis> {
    const cacheKey = 'current-analysis'
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!
    }

    try {
      // In a real implementation, this would analyze webpack stats
      // For now, we'll simulate with common patterns
      const analysis = await this.performAnalysis()
      this.analysisCache.set(cacheKey, analysis)
      return analysis
    } catch (error) {
      console.error('Tree shaking analysis failed:', error)
      return this.getEmptyAnalysis()
    }
  }

  private async performAnalysis(): Promise<TreeShakingAnalysis> {
    // Simulate analysis of common problematic patterns
    const unusedExports = this.findUnusedExports()
    const sideEffectModules = this.findSideEffectModules()
    const circularDependencies = this.findCircularDependencies()
    const duplicateModules = this.findDuplicateModules()
    const optimizationOpportunities = this.generateOptimizationOpportunities(
      unusedExports,
      sideEffectModules,
      circularDependencies,
      duplicateModules
    )

    const totalPotentialSavings = optimizationOpportunities.reduce(
      (sum, opp) => sum + opp.potentialSavings,
      0
    )

    const score = this.calculateTreeShakingScore(
      unusedExports,
      sideEffectModules,
      circularDependencies,
      duplicateModules
    )

    return {
      unusedExports,
      sideEffectModules,
      circularDependencies,
      duplicateModules,
      optimizationOpportunities,
      totalPotentialSavings,
      score
    }
  }

  private findUnusedExports(): UnusedExport[] {
    // Simulate finding unused exports
    const commonUnusedExports: UnusedExport[] = [
      {
        module: 'lodash',
        export: 'debounce',
        size: 2048,
        importedBy: [],
        potentialSavings: 2048
      },
      {
        module: 'date-fns',
        export: 'formatDistance',
        size: 1536,
        importedBy: [],
        potentialSavings: 1536
      }
    ]

    return commonUnusedExports
  }

  private findSideEffectModules(): string[] {
    // Common modules that have side effects and prevent tree shaking
    return [
      'core-js/stable',
      'regenerator-runtime/runtime',
      'intersection-observer'
    ]
  }

  private findCircularDependencies(): string[] {
    // Simulate finding circular dependencies
    return [
      'components/ui/Button -> components/ui/Icon -> components/ui/Button',
      'lib/utils -> lib/helpers -> lib/utils'
    ]
  }

  private findDuplicateModules(): string[] {
    // Simulate finding duplicate modules
    return [
      'react (multiple versions)',
      'lodash (imported differently)',
      'date-fns (barrel imports)'
    ]
  }

  private generateOptimizationOpportunities(
    unusedExports: UnusedExport[],
    sideEffectModules: string[],
    circularDependencies: string[],
    duplicateModules: string[]
  ): TreeShakingOpportunity[] {
    const opportunities: TreeShakingOpportunity[] = []

    // Unused exports opportunities
    unusedExports.forEach(exp => {
      opportunities.push({
        type: 'unused-export',
        description: `Unused export '${exp.export}' in ${exp.module}`,
        module: exp.module,
        impact: exp.size > 5000 ? 'high' : exp.size > 1000 ? 'medium' : 'low',
        potentialSavings: exp.potentialSavings,
        recommendation: `Remove unused import or use specific imports instead of barrel imports`
      })
    })

    // Side effect modules opportunities
    sideEffectModules.forEach(module => {
      opportunities.push({
        type: 'side-effect',
        description: `Module '${module}' has side effects preventing tree shaking`,
        module,
        impact: 'medium',
        potentialSavings: 3000, // Estimated
        recommendation: `Mark as side-effect-free in package.json or use dynamic imports`
      })
    })

    // Circular dependency opportunities
    circularDependencies.forEach(dep => {
      opportunities.push({
        type: 'circular-dependency',
        description: `Circular dependency: ${dep}`,
        module: dep.split(' -> ')[0],
        impact: 'high',
        potentialSavings: 5000, // Estimated
        recommendation: `Refactor to remove circular dependency, extract shared code to separate module`
      })
    })

    // Duplicate module opportunities
    duplicateModules.forEach(module => {
      opportunities.push({
        type: 'duplicate-module',
        description: `Duplicate module: ${module}`,
        module: module.split(' (')[0],
        impact: 'high',
        potentialSavings: 8000, // Estimated
        recommendation: `Ensure consistent import patterns and resolve version conflicts`
      })
    })

    // Barrel export opportunities
    opportunities.push({
      type: 'barrel-export',
      description: 'Barrel imports detected that may prevent tree shaking',
      module: 'various',
      impact: 'medium',
      potentialSavings: 4000,
      recommendation: 'Use specific imports instead of barrel imports where possible'
    })

    return opportunities.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }

  private calculateTreeShakingScore(
    unusedExports: UnusedExport[],
    sideEffectModules: string[],
    circularDependencies: string[],
    duplicateModules: string[]
  ): number {
    let score = 100

    // Deduct points for issues
    score -= unusedExports.length * 5
    score -= sideEffectModules.length * 10
    score -= circularDependencies.length * 15
    score -= duplicateModules.length * 20

    return Math.max(0, score)
  }

  private getEmptyAnalysis(): TreeShakingAnalysis {
    return {
      unusedExports: [],
      sideEffectModules: [],
      circularDependencies: [],
      duplicateModules: [],
      optimizationOpportunities: [],
      totalPotentialSavings: 0,
      score: 100
    }
  }

  /**
   * Get recommendations for improving tree shaking
   */
  public getTreeShakingRecommendations(): string[] {
    return [
      'Use ES6 modules (import/export) instead of CommonJS (require/module.exports)',
      'Avoid importing entire libraries, use specific imports instead',
      'Mark packages as side-effect-free in package.json',
      'Use webpack-bundle-analyzer to identify large modules',
      'Configure webpack to eliminate dead code with optimization.usedExports',
      'Avoid circular dependencies between modules',
      'Use dynamic imports for code that is not immediately needed',
      'Configure babel to preserve ES6 modules for webpack tree shaking',
      'Use tools like webpack-unused to find unused files',
      'Regularly audit dependencies and remove unused packages'
    ]
  }

  /**
   * Generate webpack configuration for optimal tree shaking
   */
  public generateWebpackConfig(): any {
    return {
      mode: 'production',
      optimization: {
        usedExports: true,
        sideEffects: false,
        minimize: true,
        concatenateModules: true,
        providedExports: true,
        innerGraph: true,
        mangleExports: true
      },
      resolve: {
        mainFields: ['es2015', 'module', 'main'],
        aliasFields: ['es2015', 'module']
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            sideEffects: false
          }
        ]
      }
    }
  }

  /**
   * Analyze specific module for tree shaking opportunities
   */
  public analyzeModule(moduleName: string): {
    isTreeShakeable: boolean
    issues: string[]
    recommendations: string[]
    potentialSavings: number
  } {
    const issues: string[] = []
    const recommendations: string[] = []
    let potentialSavings = 0

    // Check for common tree shaking issues
    if (moduleName.includes('lodash') && !moduleName.includes('lodash-es')) {
      issues.push('Using CommonJS version of lodash')
      recommendations.push('Switch to lodash-es for better tree shaking')
      potentialSavings += 50000 // Estimated savings
    }

    if (moduleName.includes('moment') && !moduleName.includes('date-fns')) {
      issues.push('Moment.js is not tree-shakeable')
      recommendations.push('Consider switching to date-fns or day.js')
      potentialSavings += 60000
    }

    if (moduleName.includes('rxjs') && !moduleName.includes('rxjs/operators')) {
      issues.push('Importing entire RxJS library')
      recommendations.push('Use specific operator imports from rxjs/operators')
      potentialSavings += 30000
    }

    const isTreeShakeable = issues.length === 0

    return {
      isTreeShakeable,
      issues,
      recommendations,
      potentialSavings
    }
  }

  /**
   * Clear analysis cache
   */
  public clearCache(): void {
    this.analysisCache.clear()
  }

  /**
   * Export analysis results
   */
  public exportAnalysis(): string {
    const analyses = Array.from(this.analysisCache.entries())
    return JSON.stringify(analyses, null, 2)
  }
}

// Global instance
let globalTreeShakingAnalyzer: TreeShakingAnalyzer | null = null

export function getTreeShakingAnalyzer(): TreeShakingAnalyzer {
  if (!globalTreeShakingAnalyzer) {
    globalTreeShakingAnalyzer = new TreeShakingAnalyzer()
  }
  return globalTreeShakingAnalyzer
}

// Utility functions
export function checkModuleTreeShaking(moduleName: string) {
  const analyzer = getTreeShakingAnalyzer()
  return analyzer.analyzeModule(moduleName)
}

export function getTreeShakingRecommendations() {
  const analyzer = getTreeShakingAnalyzer()
  return analyzer.getTreeShakingRecommendations()
}