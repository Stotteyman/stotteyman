'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react'
import { FormFieldProps } from '@/types/components'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
  className = ''
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    // Validate field based on type and requirements
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setIsValid(emailRegex.test(value))
    } else if (required) {
      setIsValid(value.trim().length > 0)
    } else {
      setIsValid(true)
    }
  }, [value, type, required])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const inputType = type === 'password' && showPassword ? 'text' : type

  const getInputClasses = () => {
    const baseClasses = 'w-full px-4 py-3 bg-transparent border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black text-white placeholder-gray-400'
    
    if (error) {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500`
    } else if (isValid && value.length > 0) {
      return `${baseClasses} border-green-500 focus:border-green-500 focus:ring-green-500`
    } else if (isFocused) {
      return `${baseClasses} border-blue-500 focus:border-blue-500 focus:ring-blue-500`
    } else {
      return `${baseClasses} border-gray-600 hover:border-gray-500`
    }
  }

  const InputComponent = type === 'textarea' ? 'textarea' : 'input'

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      <motion.label
        htmlFor={name}
        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
          isFocused || value
            ? 'top-0 text-xs bg-black px-2 -translate-y-1/2'
            : 'top-1/2 -translate-y-1/2 text-base'
        } ${
          error
            ? 'text-red-400'
            : isFocused
            ? 'text-blue-400'
            : 'text-gray-400'
        }`}
        animate={prefersReducedMotion ? {} : {
          scale: isFocused || value ? 0.85 : 1,
          y: isFocused || value ? -24 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </motion.label>

      {/* Input Field */}
      <div className="relative">
        <InputComponent
          ref={inputRef as any}
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          className={getInputClasses()}
          rows={type === 'textarea' ? 4 : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* Validation Icon */}
        {value.length > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              type === 'password' ? 'right-12' : 'right-3'
            }`}
          >
            {error ? (
              <AlertCircle size={20} className="text-red-400" />
            ) : isValid ? (
              <Check size={20} className="text-green-400" />
            ) : null}
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            id={`${name}-error`}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-red-400 flex items-center"
          >
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Count for textarea */}
      {type === 'textarea' && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          {value.length} characters
        </div>
      )}

      {/* Focus Ring Animation */}
      {!prefersReducedMotion && isFocused && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.02, opacity: 0 }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </div>
  )
}