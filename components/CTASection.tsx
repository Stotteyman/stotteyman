'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Sparkles } from 'lucide-react'
import { CalendlyModal } from './CalendlyModal'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export function CTASection() {
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <>
    <section className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.8 }}
          viewport={prefersReducedMotion ? undefined : { once: true }}
        >
          {/* Icon */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { rotate: [0, 360] }}
            transition={prefersReducedMotion ? undefined : { duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8 neon-glow"
          >
            <Sparkles size={32} className="text-white" />
          </motion.div>

          {/* Heading */}
          <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
            Ready to Invest?
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Join Gary Lee McCullouch Jr. in building the future across multiple industries
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Schedule a personalized investment consultation to explore opportunities 
            in our innovative venture portfolio.
          </p>

          {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                onClick={() => setIsCalendlyOpen(true)}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.05, boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                className="group flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-semibold rounded-full neon-glow transition-all duration-300"
              >
                <Calendar size={24} className="mr-3" />
                Book Investment Call
                <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>

            <motion.a
              href="/contact"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              className="px-10 py-5 glass border border-white/20 text-white text-xl font-semibold rounded-full hover:border-blue-500/50 transition-all duration-300"
            >
              Get in Touch
            </motion.a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <p className="text-gray-400 mb-6">Trusted by investors and partners worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Innovative', 'Scalable', 'Profitable', 'Sustainable'].map((trait) => (
                <div key={trait} className="text-gray-500 font-medium">
                  {trait}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    <CalendlyModal
      isOpen={isCalendlyOpen}
      onClose={() => setIsCalendlyOpen(false)}
    />
    </>
  )
}