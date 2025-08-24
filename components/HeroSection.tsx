'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'

const CalendlyModal = dynamic(
  () => import('./CalendlyModal').then((mod) => mod.CalendlyModal),
  { ssr: false }
)

export function HeroSection() {
    const logoRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const [isCalendlyOpen, setIsCalendlyOpen] = useState(false)

    // Debug log
    console.log('HeroSection is rendering')

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
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(-45deg, #0a0a0a, #1a1a2e, #16213e, #0f3460)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative'
        }}>
            <div style={{ textAlign: 'center', maxWidth: '800px' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 40px',
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                }}>
                    <Sparkles size={48} color="white" />
                </div>
                
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Stotteyman Enterprises
                </h1>
                
                <p style={{
                    fontSize: '1.5rem',
                    marginBottom: '30px',
                    color: '#ccc',
                    lineHeight: '1.6'
                }}>
                    Visionary investment opportunities at the intersection of creativity, technology, and innovation
                </p>
                
                <p style={{
                    fontSize: '1.1rem',
                    marginBottom: '40px',
                    color: '#999'
                }}>
                    Led by Gary Lee McCullouch Jr. — Building the future across multiple industries
                </p>
                
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setIsCalendlyOpen(true)}
                        style={{
                            padding: '15px 30px',
                            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        Schedule Investment Call
                    </button>
                    
                    <a
                        href="/ventures"
                        style={{
                            padding: '15px 30px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '25px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'inline-block'
                        }}
                    >
                        Explore Ventures
                    </a>
                </div>
            </div>
            
            {isCalendlyOpen && (
                <CalendlyModal
                    isOpen={isCalendlyOpen}
                    onClose={() => setIsCalendlyOpen(false)}
                />
            )}
        </div>
    )
}

