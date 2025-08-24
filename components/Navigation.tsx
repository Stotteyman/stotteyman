'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { CalendlyModal } from './CalendlyModal'

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
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    firstEl?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
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

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-dark backdrop-blur-md' : 'bg-transparent'
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-gradient"
            >
              Stotteyman
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className="relative text-gray-300 hover:text-white transition-colors duration-200 group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            <motion.button
              type="button"
              onClick={() => setIsCalendlyOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium neon-glow transition-all duration-300"
            >
              Book a Call
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X size={24} aria-hidden="true" focusable="false" />
            ) : (
              <Menu size={24} aria-hidden="true" focusable="false" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark backdrop-blur-md border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCalendlyOpen(true)
                  setIsOpen(false)
                }}
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium neon-glow"
              >
                Book a Call
              </button>
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