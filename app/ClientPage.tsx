'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HeroSection } from '@/components/HeroSection'
import { VenturesPreview } from '@/components/VenturesPreview'
import { LivestreamPreview } from '@/components/LivestreamPreview'
import { CTASection } from '@/components/CTASection'


export default function ClientPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  const [particles, setParticles] = useState<
    { left: string; top: string; duration: number; delay: number }[]
  >([])

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  // Debug log
  console.log('ClientPage is rendering')

  useEffect(() => {
    let ctx: any
    const run = async () => {
      try {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          const { gsap } = await import('gsap')
          const { ScrollTrigger } = await import('gsap/ScrollTrigger')
          gsap.registerPlugin(ScrollTrigger)

          ctx = gsap.context(() => {
            // Parallax animations
            gsap.to('.parallax-bg', {
              yPercent: -50,
              ease: 'none',
              scrollTrigger: {
                trigger: '.parallax-bg',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            })

            // Stagger animations for cards
            gsap.fromTo(
              '.venture-card',
              { y: 100, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                  trigger: '.ventures-section',
                  start: 'top 80%',
                  end: 'bottom 20%',
                  toggleActions: 'play none none reverse',
                },
              },
            )

            // Text reveal animations
            gsap.fromTo(
              '.reveal-text',
              { y: 50, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.1,
                scrollTrigger: {
                  trigger: '.reveal-text',
                  start: 'top 85%',
                  toggleActions: 'play none none reverse',
                },
              },
            )
          }, containerRef)
        }
      } catch (error) {
        console.error('GSAP loading error:', error)
        // Ensure content is visible even if GSAP fails
        const elements = document.querySelectorAll('.venture-card, .reveal-text')
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          }
        })
      }
    }
    run()
    return () => ctx && ctx.revert()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const configs = Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      }))
      setParticles(configs)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="fixed inset-0 -z-10 animated-bg"
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
            style={{
              left: p.left,
              top: p.top,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Ventures Preview */}
      <section className="ventures-section py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6 reveal-text">
              Our Ventures
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto reveal-text">
              Pioneering the future across multiple industries with innovative solutions and disruptive technologies.
            </p>
          </motion.div>
          <VenturesPreview />
        </div>
      </section>

      {/* Livestream Preview */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LivestreamPreview />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

