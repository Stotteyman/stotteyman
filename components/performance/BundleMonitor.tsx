'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Zap,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { 
  getBundleAnalyzer 
} from '@/lib/performance/bundleAnalysis'
import type {
  BundleAnalysisResult,
  BudgetViolation
} from '@/lib/performance/bundleAnalysis'

interface BundleMonitorProps {
  autoRefresh?: boolean
  refreshInterval?: number
  className?: string
}

export function BundleMonitor({ 
  autoRefresh = false, 
  refreshInterval = 60000,
  className = '' 
}: BundleMonitorProps) {
  const [analysis, setAnalysis] = useState<BundleAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [history, setHistory] = useState<BundleAnalysisResult[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'budgets' | 'recommendations' | 'history'>('overview')

  const analyzer = getBundleAnalyzer()

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const result = await analyzer.analyzeCurrentBundle()
      if (result) {
        setAnalysis(result)
        setHistory(analyzer.getAnalysisHistory())
      }
    } catch (error) {
      console.error('Bundle analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    runAnalysis()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runAnalysis, refreshInterval)
      return () => clearInterval(interval)
    }
    return undefined
  }, [autoRefresh, refreshInterval])

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getViolationColor = (violation: BudgetViolation) => {
    return violation.violation === 'error' 
      ? 'border-red-500/50 bg-red-500/10 text-red-400'
      : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: Package },
    { id: 'recommendations', label: 'Recommendations', icon: Zap },
    { id: 'history', label: 'History', icon: TrendingUp }
  ]

  return (
    <div className={`bundle-monitor ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Bundle Monitor</h2>
          <p className="text-gray-400">Bundle size analysis and optimization</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {analysis ? (
              <div className="space-y-6">
                {/* Score Card */}
                <div className="glass rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Bundle Score</h3>
                    <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}/100
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatSize(analysis.stats.totalSize)}
                      </div>
                      <div className="text-sm text-gray-400">Total Size</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatSize(analysis.stats.totalGzippedSize)}
                      </div>
                      <div className="text-sm text-gray-400">Gzipped</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {analysis.stats.chunkCount}
                      </div>
                      <div className="text-sm text-gray-400">Chunks</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {analysis.stats.moduleCount}
                      </div>
                      <div className="text-sm text-gray-400">Modules</div>
                    </div>
                  </div>
                </div>

                {/* Issues Summary */}
                {(analysis.budgets.length > 0 || analysis.stats.duplicateModules.length > 0) && (
                  <div className="glass rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Issues Found</h3>
                    
                    <div className="space-y-3">
                      {analysis.budgets.map((violation, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getViolationColor(violation)}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{violation.budget.name}</span>
                            <span className="text-sm">
                              {formatSize(violation.actualSize)} / {formatSize(violation.budget.maximumSize)}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            {violation.percentageOver.toFixed(1)}% over {violation.violation} threshold
                          </div>
                        </div>
                      ))}
                      
                      {analysis.stats.duplicateModules.length > 0 && (
                        <div className="p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
                          <div className="font-medium">Duplicate Modules</div>
                          <div className="text-sm mt-1">
                            {analysis.stats.duplicateModules.length} modules are duplicated across chunks
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No bundle analysis available</p>
                <p className="text-sm">Click &quot;Analyze&quot; to run bundle analysis</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'budgets' && (
          <motion.div
            key="budgets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-4">
              {analyzer.getBudgets().map((budget, index) => {
                const violation = analysis?.budgets.find(v => v.budget.name === budget.name)
                const actualSize = violation?.actualSize || 0
                const percentage = budget.maximumSize > 0 ? (actualSize / budget.maximumSize) * 100 : 0
                
                return (
                  <div key={index} className="glass rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{budget.name}</h3>
                      <div className="flex items-center gap-2">
                        {violation ? (
                          <AlertTriangle size={16} className={violation.violation === 'error' ? 'text-red-400' : 'text-yellow-400'} />
                        ) : (
                          <CheckCircle size={16} className="text-green-400" />
                        )}
                        <span className="text-sm text-gray-400 capitalize">{budget.type}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Size</span>
                        <span className="text-white">{formatSize(actualSize)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Warning Threshold</span>
                        <span className="text-yellow-400">{formatSize(budget.warningSize)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Maximum Size</span>
                        <span className="text-red-400">{formatSize(budget.maximumSize)}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentage > 100 ? 'bg-red-500' : 
                            percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-gray-400 text-center">
                        {percentage.toFixed(1)}% of maximum size
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {selectedTab === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {analysis?.recommendations.length ? (
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="glass rounded-xl p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getPriorityColor(rec.priority)} bg-current/10`}>
                          {rec.priority}
                        </span>
                        <span className="text-sm text-gray-400 capitalize">{rec.type.replace('-', ' ')}</span>
                      </div>
                      <span className="text-sm text-green-400">
                        Save {formatSize(rec.potentialSavings)}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-white mb-2">{rec.description}</h4>
                    <p className="text-sm text-gray-300 mb-3">{rec.implementation}</p>
                    
                    <div className="text-xs text-gray-400">
                      Potential savings: {((rec.potentialSavings / (analysis.stats.totalSize || 1)) * 100).toFixed(1)}% of total bundle size
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Zap size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recommendations available</p>
                <p className="text-sm">Run an analysis to get optimization suggestions</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.slice().reverse().map((result, index) => (
                  <div key={index} className="glass rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {result.timestamp.toLocaleString()}
                        </span>
                        <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                          {result.score}/100
                        </span>
                      </div>
                      
                      {index < history.length - 1 && result.stats.totalSize !== undefined && history[history.length - 2 - index]?.stats.totalSize !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          {result.stats.totalSize > history[history.length - 2 - index]!.stats.totalSize ? (
                            <TrendingUp size={16} className="text-red-400" />
                          ) : (
                            <TrendingDown size={16} className="text-green-400" />
                          )}
                          <span className="text-gray-400">
                            {formatSize(Math.abs(result.stats.totalSize - history[history.length - 2 - index]!.stats.totalSize))}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Total Size</div>
                        <div className="text-white font-medium">{formatSize(result.stats.totalSize || 0)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Chunks</div>
                        <div className="text-white font-medium">{result.stats.chunkCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Issues</div>
                        <div className="text-white font-medium">{result.budgets.length}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p>No analysis history</p>
                <p className="text-sm">Analysis results will appear here over time</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="glass rounded-xl p-8 border border-white/10">
              <div className="flex items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-blue-400" />
                <span className="text-white">Analyzing bundle...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}