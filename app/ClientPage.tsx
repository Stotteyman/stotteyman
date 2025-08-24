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
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '20px', marginBottom: '20px', background: '#1a1a2e' }}>
        <p style={{ color: '#3b82f6', fontSize: '1.2rem' }}>
          ✅ ClientPage is loading successfully!
        </p>
      </div>
      
      {/* Hero Section */}
      <HeroSection />

      {/* Ventures Preview */}
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Our Ventures
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '40px' }}>
          Pioneering the future across multiple industries with innovative solutions and disruptive technologies.
        </p>
        <VenturesPreview />
      </div>

      {/* Livestream Preview */}
      <div style={{ padding: '60px 20px' }}>
        <LivestreamPreview />
      </div>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

