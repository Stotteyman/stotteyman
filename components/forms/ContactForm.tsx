'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2, User, MessageSquare, Briefcase } from 'lucide-react'
import { FormField } from '../ui/FormField'
import { InteractiveButton } from '../ui/InteractiveButton'
import { GlassmorphicCard } from '../ui/GlassmorphicCard'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface FormData {
  name: string
  email: string
  company: string
  message: string
  type: 'investment' | 'partnership' | 'general'
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    type: 'general'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const prefersReducedMotion = useReducedMotion()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage(result.message || 'Thank you for your message! We&apos;ll get back to you soon.')
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            company: '',
            message: '',
            type: 'general'
          })
          setSubmitStatus('idle')
        }, 3000)
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const contactTypes = [
    { value: 'investment', label: 'Investment Inquiry', icon: Briefcase },
    { value: 'partnership', label: 'Partnership Opportunity', icon: User },
    { value: 'general', label: 'General Inquiry', icon: MessageSquare }
  ]

  return (
    <GlassmorphicCard variant="premium" className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold text-gradient mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Get In Touch
          </motion.h2>
          <motion.p 
            className="text-gray-300 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ready to explore investment opportunities? Let&apos;s start a conversation.
          </motion.p>
        </div>

        {/* Contact Type Selection */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-4">
            What can we help you with?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {contactTypes.map((type) => {
              const Icon = type.icon
              return (
                <motion.button
                  key={type.value}
                  type="button"
                  onClick={() => updateField('type')(type.value)}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 hover:border-gray-500 text-gray-300'
                  }`}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={24} className="mx-auto mb-2" />
                  <div className="text-sm font-medium">{type.label}</div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FormField
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              value={formData.name}
              onChange={updateField('name')}
              error={errors.name}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <FormField
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={formData.email}
              onChange={updateField('email')}
              error={errors.email}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <FormField
              label="Company (Optional)"
              name="company"
              type="text"
              placeholder="Enter your company name"
              value={formData.company}
              onChange={updateField('company')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <FormField
              label="Message"
              name="message"
              type="textarea"
              placeholder="Tell us about your inquiry, investment goals, or how we can help..."
              required
              value={formData.message}
              onChange={updateField('message')}
              error={errors.message}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <InteractiveButton
              type="submit"
              variant="primary"
              size="lg"
              animation="magnetic"
              loadingState={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
              onClick={() => {}}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Send Message
                </>
              )}
            </InteractiveButton>
          </motion.div>
        </form>

        {/* Status Messages */}
        <AnimatePresence>
          {submitStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-6 p-4 rounded-lg flex items-center ${
                submitStatus === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {submitStatus === 'success' ? (
                <CheckCircle size={20} className="mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="mr-3 flex-shrink-0" />
              )}
              <p>{submitMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400"
        >
          <p>
            We typically respond within 24 hours. For urgent matters, you can also{' '}
            <a href="https://calendly.com/garymccullouch" className="text-blue-400 hover:text-blue-300 transition-colors">
              schedule a direct call
            </a>.
          </p>
        </motion.div>
      </motion.div>
    </GlassmorphicCard>
  )
}