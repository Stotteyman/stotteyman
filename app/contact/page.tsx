'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Mail, Phone, MapPin, Send, CheckCircle, ExternalLink } from 'lucide-react'


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    investmentInterest: false,
    partnershipInterest: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        investmentInterest: false,
        partnershipInterest: false,
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="relative min-h-screen pt-16">
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
            <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-6 font-serif">
              Get in Touch
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              Ready to explore investment opportunities or discuss strategic partnerships?
            </p>
              <div className="text-lg text-gray-400 max-w-3xl mx-auto">
                Let&apos;s connect and build something extraordinary together.
              </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Calendar,
                title: 'Schedule a Call',
                description: 'Book a personalized consultation to discuss investment opportunities.',
                action: 'Book Now',
                href: 'https://calendly.com/garymccullouch',
                color: 'from-blue-500 to-purple-500',
              },
              {
                icon: Mail,
                title: 'Send an Email',
                description: 'Reach out directly for inquiries and partnership discussions.',
                action: 'Email Us',
                href: 'mailto:gary@stotteyman.com',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Phone,
                title: 'Quick Connect',
                description: 'For urgent matters or immediate consultation needs.',
                action: 'Contact',
                href: 'tel:+1234567890',
                color: 'from-purple-500 to-pink-500',
              },
            ].map((method, index) => {
              const Icon = method.icon
              return (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <div className="glass rounded-2xl p-8 border border-white/10 text-center group-hover:border-blue-500/30 transition-all duration-300 h-full">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${method.color} rounded-xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                      <Icon size={32} className="text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {method.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed mb-6">
                      {method.description}
                    </p>
                    
                    <motion.a
                      href={method.href}
                      target={method.href.startsWith('http') ? '_blank' : undefined}
                      rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${method.color} text-white font-semibold rounded-full neon-glow transition-all duration-300`}
                    >
                      {method.action}
                      {method.href.startsWith('http') && <ExternalLink size={16} className="ml-2" />}
                    </motion.a>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
                Send a Message
              </h2>
                <p className="text-xl text-gray-300">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-white font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-white font-medium mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-white font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                    placeholder="What's this about?"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-white font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300 resize-none"
                  placeholder="Tell us about your project, investment interest, or partnership opportunity..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="investmentInterest"
                    name="investmentInterest"
                    checked={formData.investmentInterest}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500 bg-transparent border-2 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                    <label htmlFor="investmentInterest" className="ml-3 text-gray-300">
                      I&apos;m interested in investment opportunities
                    </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="partnershipInterest"
                    name="partnershipInterest"
                    checked={formData.partnershipInterest}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500 bg-transparent border-2 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                    <label htmlFor="partnershipInterest" className="ml-3 text-gray-300">
                      I&apos;m interested in strategic partnerships
                    </label>
                </div>
              </div>

              <div className="text-center pt-6">
                <motion.button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  whileHover={{ scale: isSubmitting || isSubmitted ? 1 : 1.05 }}
                  whileTap={{ scale: isSubmitting || isSubmitted ? 1 : 0.95 }}
                  className={`inline-flex items-center px-10 py-4 text-white text-lg font-semibold rounded-full transition-all duration-300 ${
                    isSubmitted
                      ? 'bg-green-500 neon-glow'
                      : isSubmitting
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 neon-glow hover:shadow-lg'
                  }`}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle size={20} className="mr-2" />
                      Message Sent!
                    </>
                  ) : isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} className="mr-2" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Location & Additional Info */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
                <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
                  Let&apos;s Connect
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Whether you&apos;re an investor looking for the next big opportunity,
                  a potential partner with complementary expertise, or someone with
                  an innovative idea, we&apos;d love to hear from you.
                </p>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <MapPin size={20} className="mr-3 text-blue-400" />
                  <span>Based in the United States</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail size={20} className="mr-3 text-blue-400" />
                  <span>gary@stotteyman.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar size={20} className="mr-3 text-blue-400" />
                  <span>Available for consultations worldwide</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 border border-white/10"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                Response Time Commitment
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <span className="text-white font-medium">Investment Inquiries</span>
                  <span className="text-green-400 font-bold">Within 4 hours</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <span className="text-white font-medium">Partnership Discussions</span>
                  <span className="text-blue-400 font-bold">Within 12 hours</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <span className="text-white font-medium">General Inquiries</span>
                  <span className="text-purple-400 font-bold">Within 24 hours</span>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mt-6">
                * Response times are based on business days (Monday-Friday, 9 AM - 6 PM EST)
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}