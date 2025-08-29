'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { CalendlyModal } from './CalendlyModal'
import { MagneticElement } from './animations/MagneticCursor'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/ventures', label: 'Ventures' },
  { href: '/livestream', label: 'Livestream' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [isVisible, setIsVisible] = useState(true)
  const [currentSection, setCurrentSection] = useState('')
  
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const lastScrollY = useRef(0)
  const pathname = usePathname()
  const { prefersReducedMotion } = useReducedMotion()
  const { canUseAdvancedEffects } = useAdaptiveQuality()

  // Smart hide/show navigation based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY.current
      const scrollingUp = currentScrollY < lastScrollY.current
      
      setScrolled(currentScrollY > 50)
      
      // Hide nav when scrolling down, show when scrolling up
      if (scrollingDown && currentScrollY > 100) {
        setScrollDirection('down')
        setIsVisible(false)
      } else if (scrollingUp) {
        setScrollDirection('up')
        setIsVisible(true)
      }
      
      lastScrollY.current = currentScrollY
    }

    const throttledScroll = throttle(handleScroll, 100)
    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [])

  // Detect current section for breadcrumbs
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Focus management for mobile menu
  useEffect(() => {
    if (!isOpen) return

    const menu = menuRef.current
    if (!menu) return

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select'
    const focusable = Array.from(
      menu.querySelectorAll<HTMLElement>(focusableSelectors)
    )
    const firstEl = focusable[0]
    const lastEl = focusable[focusable.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (e.key === 'Tab') {
        if (focusable.length === 0) {
          e.preventDefault()
          return
        }
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault()
            lastEl?.focus()
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault()
            firstEl?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const timer = setTimeout(() => {
      firstEl?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      toggleRef.current?.focus()
    }
    wasOpen.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const body = document.body
    if (isOpen) {
      body.classList.add('overflow-hidden')
    } else {
      body.classList.remove('overflow-hidden')
    }
    return () => body.classList.remove('overflow-hidden')
  }, [isOpen])

  const getNavBackground = () => {
    if (scrolled) {
      return 'glass-dark backdrop-blur-md border-b border-white/10'
    }
    return 'bg-transparent'
  }

  return (
    <>
      <motion.nav
        initial={false}
        animate={{ 
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 0.3, 
          ease: 'easeInOut' 
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavBackground()}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with magnetic effect */}
            <MagneticElement strength={0.2} className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { 
                    scale: 1.05,
                    rotate: [0, -2, 2, 0]
                  }}
                  transition={{ 
                    rotate: { duration: 0.5 },
                    scale: { duration: 0.2 }
                  }}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                >
                  Stotteyman
                  
                  {/* Animated underline */}
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-1"
                    initial={{ width: 0 }}
                    animate={{ width: scrolled ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </MagneticElement>

            {/* Breadcrumb indicator */}
            {currentSection && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden lg:flex items-center text-sm text-gray-400"
              >
                <span>Currently viewing:</span>
                <ChevronDown size={16} className="mx-1 rotate-[-90deg]" />
                <span className="text-blue-400 capitalize">{currentSection}</span>
              </motion.div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <MagneticElement key={item.href} strength={0.15}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className="relative text-gray-300 hover:text-white transition-colors duration-200 group px-3 py-2 rounded-lg"
                  >
                    <motion.span
                      whileHover={prefersReducedMotion ? {} : { y: -1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                    
                    {/* Hover background */}
                    <motion.div
                      className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Animated underline */}
                    <motion.span 
                      className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Active indicator */}
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    {/* Glow effect for active item */}
                    {pathname === item.href && canUseAdvancedEffects && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </Link>
                </MagneticElement>
              ))}
              
              {/* Enhanced CTA Button */}
              <MagneticElement strength={0.3}>
                <motion.button
                  type="button"
                  onClick={() => setIsCalendlyOpen(true)}
                  whileHover={prefersReducedMotion ? {} : { 
                    scale: 1.05,
                    boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)',
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium overflow-hidden group"
                  style={{
                    boxShadow: canUseAdvancedEffects ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                    transition={{ duration: 0.7 }}
                  />
                  
                  {/* Ripple effect */}
                  {canUseAdvancedEffects && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/20"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1, opacity: [0, 1, 0] }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <span className="relative z-10">Book a Call</span>
                </motion.button>
              </MagneticElement>
            </div>

            {/* Mobile menu button with enhanced animation */}
            <MagneticElement strength={0.2}>
              <motion.button
                type="button"
                ref={toggleRef}
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? (
                    <X size={24} aria-hidden="true" focusable="false" />
                  ) : (
                    <Menu size={24} aria-hidden="true" focusable="false" />
                  )}
                </motion.div>
              </motion.button>
            </MagneticElement>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              id="mobile-menu"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="md:hidden glass-dark backdrop-blur-md border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: prefersReducedMotion ? 0 : index * 0.1,
                      duration: prefersReducedMotion ? 0 : 0.3
                    }}
                  >
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? 'page' : undefined}
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-300 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/5"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: prefersReducedMotion ? 0 : navItems.length * 0.1,
                    duration: prefersReducedMotion ? 0 : 0.3
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsCalendlyOpen(true)
                      setIsOpen(false)
                    }}
                    className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium neon-glow mt-4"
                  >
                    Book a Call
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      <CalendlyModal
        isOpen={isCalendlyOpen}
        onClose={() => setIsCalendlyOpen(false)}
      />
    </>
  )
}

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}
