import { Sparkles } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles size={32} className="text-white animate-spin" />
          </div>
          
          {/* Pulsing rings */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-blue-500/30 animate-ping" />
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-purple-500/20 animate-ping animation-delay-200" />
        </div>

        {/* Loading text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gradient">Loading Experience</h2>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100" />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-200" />
          </div>
        </div>
      </div>
    </div>
  )
}