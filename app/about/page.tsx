'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Award, Target, Lightbulb, TrendingUp, Users, Zap } from 'lucide-react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'



const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Pushing boundaries and challenging conventional thinking to create breakthrough solutions.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Target,
    title: 'Vision',
    description: 'Maintaining clear focus on long-term goals while adapting to emerging opportunities.',
    color: 'from-blue-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building meaningful connections and fostering collaborative growth across all ventures.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Execution',
    description: 'Transforming ideas into reality through decisive action and relentless pursuit of excellence.',
    color: 'from-purple-500 to-pink-500',
  },
]

const milestones = [
  { year: '2018', title: 'First Venture Launch', description: 'Founded Orange Duck Studios, establishing a foundation in creative media production.' },
  { year: '2019', title: 'Market Expansion', description: 'Diversified into lifestyle brands with Hella Fkn Gas, entering the legal hemp market.' },
  { year: '2020', title: 'Community Building', description: 'Launched Wage Society, creating a platform for community engagement and lifestyle content.' },
  { year: '2021', title: 'Tech Innovation', description: 'Introduced Everyday Stoner Tech, bridging cannabis culture with cutting-edge technology.' },
  { year: '2022', title: 'Cultural Impact', description: 'Established IRL History, documenting and ranking livestream culture evolution.' },
  { year: '2023', title: 'Investment Focus', description: 'Formed Stotteyman Enterprises LLC, consolidating ventures under strategic investment umbrella.' },
]

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    let ctx: any
    const run = async () => {
      if (!prefersReducedMotion) {
        const { gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        ctx = gsap.context(() => {
          // Timeline animations
          gsap.fromTo('.milestone-item',
            { x: -100, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.2,
              scrollTrigger: {
                trigger: '.timeline-section',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
              }
            }
          )

          // Values animation
          gsap.fromTo('.value-card',
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              scrollTrigger: {
                trigger: '.values-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          )
        }, containerRef)
      }
    }
    run()
    return () => ctx && ctx.revert()
  }, [prefersReducedMotion])

  return (
    <div ref={containerRef} className="relative min-h-screen pt-16">
      {/* Animated Background */}
      <motion.div
        style={{ y: prefersReducedMotion ? 0 : backgroundY }}
        className="fixed inset-0 -z-10 animated-bg"
      />

      {/* Hero Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.8 }}
          >
            <div className="relative inline-block mb-8">
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-30 ${prefersReducedMotion ? '' : 'animate-pulse'}`} />
              <div className="relative w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center neon-glow">
                <Award size={48} className="text-white" />
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-6 font-serif">
              Gary Lee McCullouch Jr.
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed">
              Visionary Entrepreneur & Strategic Investor
            </p>
            
            <div className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Building the future through innovative ventures that bridge creativity, 
              technology, and community across multiple industries.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.8 }}
            viewport={prefersReducedMotion ? undefined : { once: true }}
            className="glass rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-8 text-center">
              The Journey
            </h2>
            
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                Gary&apos;s entrepreneurial journey began with a simple yet powerful belief: 
                that innovation thrives at the intersection of creativity, technology, and authentic community building.
              </p>
              
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Through years of building diverse ventures—from creative studios to cannabis tech, 
                from community platforms to cultural archives—Gary has developed a unique perspective 
                on identifying and nurturing opportunities that others might overlook.
              </p>
              
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                His approach combines strategic vision with hands-on execution, always maintaining 
                focus on sustainable growth and meaningful impact. Each venture under the Stotteyman 
                Enterprises umbrella reflects this philosophy: innovative, community-driven, and 
                positioned for long-term success.
              </p>
              
              <p className="text-lg text-gray-400 leading-relaxed">
                Today, Gary continues to push boundaries, exploring new frontiers in AI, 
                livestream culture, and emerging technologies while building a portfolio 
                of ventures that represent the future of their respective industries.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.8 }}
            viewport={prefersReducedMotion ? undefined : { once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
              Core Values
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide every decision and drive sustainable success across all ventures.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  className="value-card group"
                  whileHover={prefersReducedMotion ? undefined : { y: -10, scale: 1.02 }}
                >
                  <div className="glass rounded-2xl p-6 border border-white/10 h-full text-center group-hover:border-blue-500/30 transition-all duration-300">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${value.color} rounded-xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                      <Icon size={32} className="text-white" />
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${value.color} bg-clip-text text-transparent`}>
                      {value.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.8 }}
            viewport={prefersReducedMotion ? undefined : { once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
              Milestones
            </h2>
            <p className="text-xl text-gray-300">
              Key moments in building a diverse portfolio of innovative ventures.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className="milestone-item relative flex items-start"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-black" />
                  
                  {/* Content */}
                  <div className="ml-20 glass rounded-xl p-6 border border-white/10">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl font-bold text-gradient mr-4">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-semibold text-white">
                        {milestone.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.8 }}
            viewport={prefersReducedMotion ? undefined : { once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              Let&apos;s Build Together
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Ready to explore investment opportunities and strategic partnerships?
            </p>
            
            <motion.a
              href="https://calendly.com/garymccullouch"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05, boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-semibold rounded-full neon-glow transition-all duration-300"
            >
              Schedule a Consultation
              <TrendingUp size={24} className="ml-3" />
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}