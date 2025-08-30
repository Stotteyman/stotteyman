'use client'

import Link from 'next/link'

export function HeroSection() {
    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Simple Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
            
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            
            {/* Content */}
            <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="mb-12 relative">
                    <div className="relative inline-block">
                        <div className="w-40 h-40 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                            <span className="text-6xl">✨</span>
                        </div>
                    </div>
                </div>

                {/* Main Heading */}
                <div className="space-y-8">
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight">
                        <span className="block text-shimmer font-serif">
                            Stotteyman
                        </span>
                        <span className="block text-white">
                            Enterprises
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Visionary investment opportunities at the intersection of creativity, technology, and innovation
                    </p>

                    <div className="text-lg text-gray-400 max-w-3xl mx-auto">
                        Led by Stotteyman — Building the future across multiple industries
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-16 flex flex-col sm:flex-row gap-8 justify-center items-center">
                    <button
                        type="button"
                        className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold rounded-full shadow-2xl hover:scale-105 transition-transform duration-300"
                    >
                        Schedule Investment Call
                    </button>

                    <Link
                        href="/ventures"
                        className="px-10 py-5 border border-white/30 text-white text-xl font-bold rounded-full hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                    >
                        Explore Ventures
                    </Link>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-col items-center cursor-pointer group">
                        <span className="text-gray-400 text-sm mb-3 group-hover:text-blue-400 transition-colors">
                            Scroll to explore
                        </span>
                        <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
                            ↓
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

