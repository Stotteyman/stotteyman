'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Star, Zap } from 'lucide-react'

const CalendlyModal = dynamic(
  () => import('./CalendlyModal').then((mod) => mod.CalendlyModal),
  { ssr: false }
)

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
                        { y: 100, opacity: 0, duration: 1, stagger: 0.2 },
                        '-=0.5'
                    )
                    .from('.hero-cta',
                        { y: 50, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' },
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
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            
            {/* Floating Orbs */}
            <motion.div
                animate={{ 
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ 
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    scale: [1, 0.8, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ 
                    x: [0, 50, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"
            />

            {/* Content */}
            <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Animated Logo */}
                <motion.div
                    ref={logoRef}
                    className="mb-12 relative"
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "backOut" }}
                >
                    <div className="relative inline-block">
                        {/* Pulsing Background */}
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl" 
                        />
                        
                        {/* Main Logo */}
                        <motion.div 
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.8 }}
                            className="relative w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center neon-glow"
                        >
                            <Sparkles size={48} className="text-white animate-pulse" />
                        </motion.div>
                        
                        {/* Orbiting Elements */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-32 h-32 mx-auto"
                        >
                            <Star size={16} className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-blue-400" />
                            <Zap size={16} className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-purple-400" />
                            <Star size={16} className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-pink-400" />
                            <Zap size={16} className="absolute top-1/2 -left-2 transform -translate-y-1/2 text-cyan-400" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Heading */}
                <div ref={textRef} className="space-y-6">
                    <motion.h1 
                        className="hero-text text-6xl md:text-8xl lg:text-9xl font-bold leading-tight"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <motion.span 
                            className="block text-gradient font-serif"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            Stotteyman
                        </motion.span>
                        <motion.span 
                            className="block text-white"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            Enterprises
                        </motion.span>
                    </motion.h1>

                    <motion.p 
                        className="hero-text text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.7 }}
                    >
                        Visionary investment opportunities at the intersection of
                        <motion.span 
                            className="text-gradient font-semibold"
                            whileHover={{ scale: 1.1 }}
                            style={{ display: 'inline-block' }}
                        > creativity</motion.span>,
                        <motion.span 
                            className="text-gradient font-semibold"
                            whileHover={{ scale: 1.1 }}
                            style={{ display: 'inline-block' }}
                        > technology</motion.span>, and
                        <motion.span 
                            className="text-gradient font-semibold"
                            whileHover={{ scale: 1.1 }}
                            style={{ display: 'inline-block' }}
                        > innovation</motion.span>
                    </motion.p>

                    <motion.div 
                        className="hero-text text-lg text-gray-400 max-w-3xl mx-auto"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.9 }}
                    >
                        Led by Gary Lee McCullouch Jr. — Building the future across multiple industries
                    </motion.div>
                </div>

                {/* CTA Buttons */}
                <motion.div 
                    className="hero-cta mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                >
                    <motion.button
                        type="button"
                        onClick={() => setIsCalendlyOpen(true)}
                        whileHover={{ 
                            scale: 1.05, 
                            boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)',
                            y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-full neon-glow transition-all duration-300 overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={false}
                        />
                        <span className="relative z-10">Schedule Investment Call</span>
                    </motion.button>

                    <motion.a
                        href="/ventures"
                        whileHover={{ 
                            scale: 1.05,
                            borderColor: 'rgba(59, 130, 246, 0.8)',
                            y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group px-8 py-4 glass border border-white/20 text-white text-lg font-semibold rounded-full hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={false}
                        />
                        <span className="relative z-10">Explore Ventures</span>
                    </motion.a>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ 
                        y: [0, 10, 0],
                        opacity: 1
                    }}
                    transition={{ 
                        y: { duration: 2, repeat: Infinity },
                        opacity: { delay: 2, duration: 1 }
                    }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0 }}
                >
                    <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                    >
                        <span className="text-gray-400 text-sm mb-2">Scroll to explore</span>
                        <ArrowDown size={32} className="text-gray-400" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
        
        {isCalendlyOpen && (
            <CalendlyModal
                isOpen={isCalendlyOpen}
                onClose={() => setIsCalendlyOpen(false)}
            />
        )}
        </>
    )
}

