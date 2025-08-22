'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Play, Users, TrendingUp, Award, Calendar, ExternalLink } from 'lucide-react'


if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const collaborators = [
    {
      name: 'itsmesaiman',
      role: 'Content Creator',
      impact: 'Strategic Partnership',
      description: 'Pioneering content creation strategies and audience engagement techniques.'
    },
    {
      name: 'hamptonbrandon',
      role: 'IRL Pioneer',
      impact: 'Cultural Influence',
      description: 'Defining the IRL livestreaming landscape with authentic, unfiltered content.'
    },
    {
      name: 'ebz',
      role: 'Community Builder',
      impact: 'Audience Development',
      description: 'Building loyal communities through consistent engagement and quality content.'
    },
    {
      name: 'yuber',
      role: 'Tech Innovator',
      impact: 'Platform Integration',
      description: 'Integrating cutting-edge technology solutions for enhanced streaming experiences.'
    },
    {
      name: 'iamtrevian',
      role: 'Creative Director',
      impact: 'Brand Development',
      description: 'Crafting compelling brand narratives and visual identities for creators.'
    },
    {
      name: 'jakefuture27',
      role: 'Growth Strategist',
      impact: 'Market Expansion',
      description: 'Developing scalable growth strategies for emerging content creators.'
    },
    {
      name: '1xsboy',
      role: 'Community Manager',
      impact: 'Engagement Optimization',
      description: 'Optimizing community engagement through data-driven strategies.'
    },
  ]

const achievements = [
  {
    title: 'IRL Culture Documentation',
    description: 'Comprehensive archive of pivotal moments in livestreaming history',
    icon: Award
  },
  {
    title: 'Community Growth',
    description: 'Facilitated exponential growth across multiple creator communities',
    icon: TrendingUp
  },
  {
    title: 'Strategic Partnerships',
    description: 'Established key relationships with industry-leading creators',
    icon: Users
  },
]

export default function LivestreamPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.collab-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.collaborators-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      gsap.fromTo('.achievement-card',
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.achievements-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen pt-16">
      {/* Background */}
      <div className="fixed inset-0 -z-10 animated-bg" />

      {/* Hero Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="relative w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center neon-glow">
                <Play size={48} className="text-white ml-2" />
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-6 font-serif">
              Livestream Legacy
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              Pioneering the future of IRL livestreaming through strategic collaborations and cultural innovation
            </p>
            <div className="text-lg text-gray-400 max-w-3xl mx-auto">
              Building bridges between creators, communities, and cutting-edge technology 
              to shape the next generation of livestream culture.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
              Impact & Achievements
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Measurable contributions to the evolution of livestreaming culture and community building.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <motion.div
                  key={achievement.title}
                  className="achievement-card group"
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="glass rounded-2xl p-8 border border-white/10 text-center group-hover:border-purple-500/30 transition-all duration-300 h-full">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      <Icon size={32} className="text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {achievement.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Collaborators Section */}
      <section className="collaborators-section py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
              Key Collaborators
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Strategic partnerships with influential creators shaping the livestreaming landscape.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collaborators.map((collab, index) => (
              <motion.div
                key={collab.name}
                className="collab-card group"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="glass rounded-2xl p-6 border border-white/10 group-hover:border-purple-500/30 transition-all duration-300 h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Play size={20} className="text-white ml-0.5" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
                        {collab.impact}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gradient transition-all duration-300">
                    @{collab.name}
                  </h3>
                  <p className="text-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                    {collab.role}
                  </p>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {collab.description}
                  </p>

                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IRL History Platform Section */}
      <section className="py-32 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
                IRL History Platform
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                The definitive archive and ranking platform for IRL livestreaming culture, 
                documenting pivotal moments and influential creators.
              </p>
            </div>

            <div className="text-center">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-full neon-glow transition-all duration-300"
              >
                Explore IRL History
                <ExternalLink size={20} className="ml-2" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
              Join the Movement
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Partner with us to shape the future of livestreaming culture and community building.
            </p>
            
            <motion.a
              href="https://calendly.com/garymccullouch"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-semibold rounded-full neon-glow transition-all duration-300"
            >
              Schedule Partnership Call
              <Calendar size={24} className="ml-3" />
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}