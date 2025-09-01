'use client'

import { useState } from 'react'
import Link from 'next/link'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/ventures', label: 'Ventures' },
  { href: '/referrals', label: 'Referrals' },
  { href: '/livestream', label: 'Livestream' },
  { href: '/blog', label: 'Blog' },
  { href: '/chat', label: 'Chat' },
  { href: '/contact', label: 'Contact' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Stotteyman
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="relative text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg"
                >
                  {item.label}
                </Link>
              </div>
            ))}
            
            {/* CTA Button */}
            <button
              type="button"
              className="relative px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium"
            >
              Book a Call
            </button>
            
            {/* Dashboard Link for Admins */}
            <Link
              href="/dashboard"
              className="relative px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-medium"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? (
              <span>✕</span>
            ) : (
              <span>☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/5"
                >
                  {item.label}
                </Link>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
              }}
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium mt-4"
            >
              Book a Call
            </button>
            
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-medium mt-2"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

