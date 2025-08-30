'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Star, Zap } from 'lucide-react'
import { ParticleSystem } from './animations/ParticleSystem'
import { MorphingBackground } from './animations/MorphingBackground'
import { MagneticElement } from './animations/MagneticCursor'
import { RevealText } from './animations/ScrollAnimations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'

const CalendlyModal = dynamic(
  () => import('./CalendlyModal').then((mod) => mod.CalendlyModal),
  { ssr: false }
)

export function HeroSection() {
    const logoRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const [isCalendlyOpen, setIsCalendlyOpen] = useState(false)
    const prefersReducedMotion = useReducedMotion()
    const { canUseAdvancedEffects, qualitySettings } = useAdaptiveQuality()

    useEffect(() => {
        let tl: any
        let floatingAnim: any
        const run = async () => {
            if (prefersReducedMotion) {
                return
            }
            try {
                const { default: gsap } = await import('gsap')
                const { ScrollTrigger } = await import('gsap/ScrollTrigger')
                gsap.registerPlugin(ScrollTrigger)

                tl = gsap.timeline()

                // Enhanced logo reveal animation
                tl.fromTo(logoRef.current,
                    { scale: 0, rotation: -180, opacity: 0, y: 50 },
                    { 
                        scale: 1, 
                        rotation: 0, 
                        opacity: 1, 
                        y: 0,
                        duration: 2, 
                        ease: 'elastic.out(1, 0.5)' 
                    }
                )
                .from('.hero-text',
                    { 
                        y: 100, 
                        opacity: 0, 
                        duration: 1.2, 
                        stagger: 0.15,
                        ease: 'power3.out'
                    },
                    '-=1'
                )
                .from('.hero-cta',
                    { 
                        y: 50, 
                        opacity: 0, 
                        scale: 0.8,
                        duration: 1, 
                        ease: 'back.out(1.7)' 
                    },
                    '-=0.5'
                )

                // Enhanced floating animation for logo
                if (canUseAdvancedEffects) {
                    floatingAnim = gsap.to(logoRef.current, {
                        y: -20,
                        rotation: 5,
                        duration: 4,
                        ease: 'power2.inOut',
                        yoyo: true,
                        repeat: -1
                    })
                }
            } catch (error) {
                console.error('Failed to load GSAP', error)
            }
        }
        run()
        return () => {
            tl?.kill()
            floatingAnim?.kill()
        }
    }, [prefersReducedMotion, canUseAdvancedEffects])

    return (
        <>
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Enhanced Background Effects */}
            {canUseAdvancedEffects && (
                <>
                    <MorphingBackground
                        shapes={[
                            { type: 'blob', size: 400, position: { x: 20, y: 20 }, morphSpeed: 0.8, complexity: 3 },
                            { type: 'blob', size: 500, position: { x: 80, y: 60 }, morphSpeed: 1.2, complexity: 4 },
                            { type: 'blob', size: 300, position: { x: 60, y: 80 }, morphSpeed: 1.0, complexity: 3 }
                        ]}
                        colors={{
                            primary: ['#3b82f6', '#1d4ed8'],
                            secondary: ['#8b5cf6', '#7c3aed'],
                            accent: ['#ec4899', '#db2777'],
                            gradients: [
                                { id: 'gradient1', colors: ['#3b82f6', '#8b5cf6'], direction: 45, type: 'linear' },
                                { id: 'gradient2', colors: ['#8b5cf6', '#ec4899'], direction: 135, type: 'linear' }
                            ]
                        }}
                        animationSpeed={0.6}
                        blendMode="multiply"
                        className="opacity-60"
                    />
                    
                    <ParticleSystem
                        count={qualitySettings.particleCount}
                        speed={1.2}
                        size={{ min: 1, max: 3 }}
                        colors={['#3b82f6', '#8b5cf6', '#ec4899', '#06d6a0']}
                        interactive={true}
                        density={qualitySettings.animationComplexity === 'high' ? 'high' : 'medium'}
                        className="opacity-70"
                    />
                </>
            )}

            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            
            {/* Enhanced Floating Orbs */}
            {!prefersReducedMotion && (
                <>
                    <motion.div
                        animate={{ 
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                            scale: [1, 1.3, 1],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            x: [0, -120, 0],
                            y: [0, 120, 0],
                            scale: [1, 0.7, 1],
                            rotate: [360, 180, 0]
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            x: [0, 60, 0],
                            y: [0, -60, 0],
                            scale: [1, 1.2, 1],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-full blur-3xl"
                    />
                </>
            )}

            {/* Content */}
            <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Enhanced Animated Logo */}
                <MagneticElement strength={0.1}>
                    <motion.div
                        ref={logoRef}
                        className="mb-12 relative"
                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ duration: 2, ease: "elastic.out(1, 0.5)" }}
                    >
                        <div className="relative inline-block">
                            {/* Enhanced Pulsing Background */}
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.3, 1], 
                                    opacity: [0.2, 0.8, 0.2],
                                    rotate: [0, 180, 360]
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl" 
                            />
                            
                            {/* Main Logo with enhanced effects */}
                            <motion.div 
                                whileHover={prefersReducedMotion ? {} : { 
                                    scale: 1.15, 
                                    rotate: 360,
                                    boxShadow: '0 0 60px rgba(59, 130, 246, 0.8)'
                                }}
                                transition={{ duration: 0.8, ease: 'easeInOut' }}
                                className="relative w-40 h-40 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center neon-glow shadow-2xl"
                            >
                                <Sparkles size={56} className="text-white animate-pulse" />
                                
                                {/* Inner glow effect */}
                                <div className="absolute inset-2 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl" />
                            </motion.div>
                            
                            {/* Enhanced Orbiting Elements */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 w-40 h-40 mx-auto"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                                >
                                    <Star size={20} className="text-blue-400 drop-shadow-lg" />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    className="absolute top-1/2 -right-3 transform -translate-y-1/2"
                                >
                                    <Zap size={20} className="text-purple-400 drop-shadow-lg" />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                                >
                                    <Star size={20} className="text-pink-400 drop-shadow-lg" />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1] }}
                                    transition={{ duration: 1.8, repeat: Infinity }}
                                    className="absolute top-1/2 -left-3 transform -translate-y-1/2"
                                >
                                    <Zap size={20} className="text-cyan-400 drop-shadow-lg" />
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </MagneticElement>

                {/* Enhanced Main Heading */}
                <div ref={textRef} className="space-y-8">
                    <motion.h1 
                        className="hero-text text-6xl md:text-8xl lg:text-9xl font-bold leading-tight"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                    >
                        <motion.span 
                            className="block text-shimmer font-serif"
                            whileHover={prefersReducedMotion ? {} : { 
                                scale: 1.05,
                                textShadow: '0 0 30px rgba(59, 130, 246, 0.8)'
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            Stotteyman
                        </motion.span>
                        <motion.span 
                            className="block text-white"
                            whileHover={prefersReducedMotion ? {} : { 
                                scale: 1.05,
                                textShadow: '0 0 30px rgba(255, 255, 255, 0.8)'
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            Enterprises
                        </motion.span>
                    </motion.h1>

                    <RevealText
                        text="Visionary investment opportunities at the intersection of creativity, technology, and innovation"
                        className="hero-text text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
                        animationType="slide"
                        delay={0.7}
                    />

                    <motion.div 
                        className="hero-text text-lg text-gray-400 max-w-3xl mx-auto"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                    >
                        Led by Gary Lee McCullouch Jr. — Building the future across multiple industries
                    </motion.div>
                </div>

                {/* Enhanced CTA Buttons */}
                <motion.div 
                    className="hero-cta mt-16 flex flex-col sm:flex-row gap-8 justify-center items-center"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                >
                    <MagneticElement strength={0.2}>
                        <motion.button
                            type="button"
                            onClick={() => setIsCalendlyOpen(true)}
                            whileHover={prefersReducedMotion ? {} : { 
                                scale: 1.08, 
                                boxShadow: '0 0 50px rgba(59, 130, 246, 0.8)',
                                y: -4
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold rounded-full neon-glow-premium transition-all duration-300 overflow-hidden shadow-2xl"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                initial={false}
                            />
                            
                            {/* Enhanced shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                                initial={false}
                            />
                            
                            <span className="relative z-10">Schedule Investment Call</span>
                        </motion.button>
                    </MagneticElement>

                    <MagneticElement strength={0.15}>
                        <motion.a
                            href="/ventures"
                            whileHover={prefersReducedMotion ? {} : { 
                                scale: 1.05,
                                borderColor: 'rgba(59, 130, 246, 0.8)',
                                y: -2,
                                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="group px-10 py-5 glass-premium border border-white/30 text-white text-xl font-bold rounded-full hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden shadow-xl"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={false}
                            />
                            <span className="relative z-10">Explore Ventures</span>
                        </motion.a>
                    </MagneticElement>
                </motion.div>

                {/* Enhanced Scroll Indicator */}
                <motion.div
                    animate={prefersReducedMotion ? {} : { 
                        y: [0, 15, 0],
                        opacity: 1
                    }}
                    transition={{ 
                        y: { duration: 2.5, repeat: Infinity },
                        opacity: { delay: 2.5, duration: 1 }
                    }}
                    className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0 }}
                >
                    <MagneticElement strength={0.1}>
                        <motion.div
                            whileHover={prefersReducedMotion ? {} : { 
                                scale: 1.3,
                                y: -5
                            }}
                            className="flex flex-col items-center cursor-pointer group"
                            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                        >
                            <span className="text-gray-400 text-sm mb-3 group-hover:text-blue-400 transition-colors">
                                Scroll to explore
                            </span>
                            <motion.div
                                animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowDown size={36} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                            </motion.div>
                        </motion.div>
                    </MagneticElement>
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

