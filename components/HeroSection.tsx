'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'
import { CalendlyModal } from './CalendlyModal'

export function HeroSection() {
    const logoRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const [isCalendlyOpen, setIsCalendlyOpen] = useState(false)

    useEffect(() => {
        let tl: any
        let floatingAnim: any
        const run = async () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return
            }
            try {
                const { gsap } = await import('gsap')
                const { ScrollTrigger } = await import('gsap/ScrollTrigger')
                gsap.registerPlugin(ScrollTrigger)

                tl = gsap.timeline()

                // Logo reveal animation
                tl.fromTo(logoRef.current,
                    { scale: 0, rotation: -180, opacity: 0 },
                    { scale: 1, rotation: 0, opacity: 1, duration: 1.5, ease: 'back.out(1.7)' }
                )
                    .from('.hero-text',
                        { y: 100, duration: 1, stagger: 0.2 },
                        '-=0.5'
                    )
                    .from('.hero-cta',
                        { y: 50, duration: 0.8, ease: 'back.out(1.7)' },
                        '-=0.3'
                    )

                // Floating animation for logo
                floatingAnim = gsap.to(logoRef.current, {
                    y: -20,
                    duration: 3,
                    ease: 'power2.inOut',
                    yoyo: true,
                    repeat: -1
                })
            } catch (error) {
                console.error('Failed to load GSAP', error)
            }
        }
        run()
        return () => {
            tl?.kill()
            floatingAnim?.kill()
        }
    }, [])

    return (
        <>
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Animated Logo */}
                <motion.div
                    ref={logoRef}
                    className="mb-12 relative"
                >
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                        <div className="relative w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center neon-glow">
                            <Sparkles size={48} className="text-white animate-pulse" aria-hidden="true" focusable="false" />
                        </div>
                    </div>
                </motion.div>

                {/* Main Heading */}
                <div ref={textRef} className="space-y-6">
                    <h1 className="hero-text text-6xl md:text-8xl lg:text-9xl font-bold leading-tight">
                        <span className="block text-gradient font-serif">Stotteyman</span>
                        <span className="block text-white">Enterprises</span>
                    </h1>

                    <p className="hero-text text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Visionary investment opportunities at the intersection of
                        <span className="text-gradient font-semibold"> creativity</span>,
                        <span className="text-gradient font-semibold"> technology</span>, and
                        <span className="text-gradient font-semibold"> innovation</span>
                    </p>

                    <div className="hero-text text-lg text-gray-400 max-w-3xl mx-auto">
                        Led by Gary Lee McCullouch Jr. — Building the future across multiple industries
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="hero-cta mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <motion.button
                        type="button"
                        onClick={() => setIsCalendlyOpen(true)}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-full neon-glow transition-all duration-300"
                    >
                        Schedule Investment Call
                    </motion.button>

                    <motion.a
                        href="/ventures"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 glass border border-white/20 text-white text-lg font-semibold rounded-full hover:border-blue-500/50 transition-all duration-300"
                    >
                        Explore Ventures
                    </motion.a>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    aria-label="Scroll down"
                >
                    <ArrowDown size={32} className="text-gray-400" aria-hidden="true" focusable="false" />
                </motion.div>
            </div>

            {/* Ambient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </section>
        <CalendlyModal
            isOpen={isCalendlyOpen}
            onClose={() => setIsCalendlyOpen(false)}
        />
        </>
    )
}