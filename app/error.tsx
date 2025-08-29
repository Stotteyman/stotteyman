'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <AlertTriangle size={32} className="text-white" />
          </div>
          
          {/* Glowing effect */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-red-500/20 blur-xl animate-pulse" />
        </div>

        {/* Error content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Oops!</h1>
            <h2 className="text-xl text-gray-300 mb-4">Something went wrong</h2>
            <p className="text-gray-400 text-sm">
              We encountered an unexpected error. Our team has been notified.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium hover:scale-105 transition-transform duration-200"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 glass border border-white/20 text-white rounded-full font-medium hover:border-blue-500/50 transition-colors duration-200"
            >
              <Home size={16} />
              Go Home
            </Link>
          </div>

          {/* Error details (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left">
              <summary className="text-gray-400 cursor-pointer hover:text-white transition-colors">
                Error Details
              </summary>
              <pre className="mt-4 p-4 bg-gray-900 rounded-lg text-xs text-red-400 overflow-auto">
                {error.message}
                {error.stack && (
                  <>
                    {'\n\n'}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}