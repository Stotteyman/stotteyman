'use client'

import { Search, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        {/* 404 Animation */}
        <div className="relative mb-12">
          <div className="text-8xl md:text-9xl font-bold text-gradient opacity-20 select-none">
            404
          </div>
          
          {/* Floating elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-blue-500/30 rounded-full animate-spin" />
            <div className="absolute w-24 h-24 border-2 border-purple-500/20 rounded-full animate-ping" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              The page you&apos;re looking for doesn&apos;t exist
            </p>
            <p className="text-gray-400">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Search suggestion */}
          <div className="glass p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Search size={20} className="text-blue-400" />
              <span className="text-gray-300">Looking for something specific?</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Link href="/about" className="text-blue-400 hover:text-blue-300 transition-colors">
                About Gary McCullouch
              </Link>
              <Link href="/ventures" className="text-blue-400 hover:text-blue-300 transition-colors">
                Investment Ventures
              </Link>
              <Link href="/livestream" className="text-blue-400 hover:text-blue-300 transition-colors">
                Livestream Culture
              </Link>
              <Link href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">
                Contact & Schedule
              </Link>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium hover:scale-105 transition-transform duration-200 neon-glow"
            >
              <Home size={16} />
              Back to Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-8 py-4 glass border border-white/20 text-white rounded-full font-medium hover:border-blue-500/50 transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}