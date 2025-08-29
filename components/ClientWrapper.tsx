'use client'

import dynamic from 'next/dynamic'
import { PerformanceProvider, PerformanceMonitor } from './performance/PerformanceProvider'

const FloatingCTA = dynamic(
  () => import('./FloatingCTA').then((mod) => mod.FloatingCTA),
  { ssr: false }
)

export function ClientWrapper() {
  return (
    <PerformanceProvider autoStart={true}>
      <FloatingCTA />
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <PerformanceMonitor showAlerts={true} />
        </div>
      )}
    </PerformanceProvider>
  )
}