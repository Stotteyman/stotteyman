'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Shield, AlertTriangle } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import FocusTrap from 'focus-trap-react'

interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
  calendlyUrl?: string
}

// Security configuration for Calendly integration
const CALENDLY_CONFIG = {
  allowedOrigins: [
    'https://calendly.com',
    'https://assets.calendly.com'
  ],
  maxLoadTime: 10000, // 10 seconds
  retryAttempts: 3
}

export function CalendlyModal({ 
  isOpen, 
  onClose, 
  calendlyUrl = 'https://calendly.com/garymccullouch' 
}: CalendlyModalProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error' | 'timeout'>('loading')
  const [securityWarning, setSecurityWarning] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout>()

  // Validate Calendly URL
  const isValidCalendlyUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname === 'calendly.com' && urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Security check for postMessage events
  useEffect(() => {
    if (!isOpen) return

    const handleMessage = (event: MessageEvent) => {
      // Verify origin
      if (!CALENDLY_CONFIG.allowedOrigins.includes(event.origin)) {
        console.warn('Blocked message from unauthorized origin:', event.origin)
        setSecurityWarning(`Blocked unauthorized communication from ${event.origin}`)
        return
      }

      // Handle Calendly-specific messages
      if (event.data && typeof event.data === 'object') {
        switch (event.data.type) {
          case 'calendly.event_scheduled':
            // Handle successful booking
            console.log('Event scheduled successfully')
            // You could track this event or show a success message
            break
          case 'calendly.profile_page_viewed':
            // Handle profile view
            console.log('Calendly profile viewed')
            break
          case 'calendly.date_and_time_selected':
            // Handle date/time selection
            console.log('Date and time selected')
            break
          default:
            // Log unknown message types for monitoring
            console.log('Unknown Calendly message:', event.data.type)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isOpen])

  // Handle iframe loading with timeout
  useEffect(() => {
    if (!isOpen) {
      setLoadState('loading')
      setSecurityWarning(null)
      setRetryCount(0)
      return
    }

    // Validate URL before loading
    if (!isValidCalendlyUrl(calendlyUrl)) {
      setLoadState('error')
      setSecurityWarning('Invalid Calendly URL detected')
      return
    }

    // Set loading timeout
    loadTimeoutRef.current = setTimeout(() => {
      if (loadState === 'loading') {
        setLoadState('timeout')
      }
    }, CALENDLY_CONFIG.maxLoadTime)

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [isOpen, calendlyUrl, loadState])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove('overflow-hidden')
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.body.classList.add('overflow-hidden')
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen, onClose])

  const handleIframeLoad = () => {
    setLoadState('loaded')
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }
  }

  const handleIframeError = () => {
    setLoadState('error')
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }
  }

  const handleRetry = () => {
    if (retryCount < CALENDLY_CONFIG.retryAttempts) {
      setRetryCount(prev => prev + 1)
      setLoadState('loading')
      setSecurityWarning(null)
      
      // Force iframe reload
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src
      }
    }
  }

  const renderContent = () => {
    switch (loadState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-lg mb-2">Loading Calendly...</p>
            <p className="text-sm text-gray-400">Establishing secure connection</p>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white p-8">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
            <p className="text-gray-300 text-center mb-4">
              Unable to load the scheduling interface. Please check your connection and try again.
            </p>
            {retryCount < CALENDLY_CONFIG.retryAttempts && (
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Retry ({CALENDLY_CONFIG.retryAttempts - retryCount} attempts left)
              </button>
            )}
          </div>
        )

      case 'timeout':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white p-8">
            <AlertTriangle size={48} className="text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Timeout</h3>
            <p className="text-gray-300 text-center mb-4">
              The scheduling interface is taking longer than expected to load.
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )

      case 'loaded':
        return (
          <iframe
            ref={iframeRef}
            src={calendlyUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Schedule a meeting with Gary McCullouch"
            className="rounded-2xl"
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <FocusTrap active={isOpen} focusTrapOptions={{ escapeDeactivates: false }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[80vh] glass rounded-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="calendly-modal-title"
            >
              {/* Header with security indicator */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Shield size={16} className="text-green-400" />
                  <span className="text-sm text-white font-medium" id="calendly-modal-title">
                    Secure Scheduling
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg hover:bg-white/10"
                  aria-label="Close modal"
                >
                  <X size={20} aria-hidden="true" focusable="false" />
                </button>
              </div>

              {/* Security warning */}
              {securityWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-16 left-4 right-4 z-10 p-3 bg-red-500/90 text-white rounded-lg flex items-center space-x-2"
                >
                  <AlertTriangle size={16} />
                  <span className="text-sm">{securityWarning}</span>
                </motion.div>
              )}

              {/* Main content */}
              <div className="pt-16 h-full">
                {renderContent()}
              </div>

              {/* Loading state for iframe */}
              {loadState === 'loaded' && (
                <iframe
                  ref={iframeRef}
                  src={calendlyUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Schedule a meeting with Gary McCullouch"
                  className="absolute inset-0 pt-16 rounded-2xl"
                  loading="lazy"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

