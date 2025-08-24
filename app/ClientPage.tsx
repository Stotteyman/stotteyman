'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HeroSection } from '@/components/HeroSection'
import { VenturesPreview } from '@/components/VenturesPreview'
import { LivestreamPreview } from '@/components/LivestreamPreview'
import { CTASection } from '@/components/CTASection'


export default function ClientPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '200%'])

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    let ctx: any
    const run = async () => {
      if (!prefersReducedMotion) {
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
    }
    run()
    return () => ctx && ctx.revert()
  }, [prefersReducedMotion])

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="fixed inset-0 -z-10 animated-bg"
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const style = {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }
          return prefersReducedMotion ? (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
              style={style}
            />
          ) : (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={style}
            />
          )
        })}
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

