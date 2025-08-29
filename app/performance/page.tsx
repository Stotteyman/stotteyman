'use client'

import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard'
import { PerformanceProvider } from '@/components/performance/PerformanceProvider'

export default function PerformancePage() {
  return (
    <PerformanceProvider>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PerformanceDashboard />
        </div>
      </div>
    </PerformanceProvider>
  )
}