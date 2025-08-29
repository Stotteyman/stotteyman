'use client'

import { useState, useEffect } from 'react'

/**
 * Generate CSRF token for client-side use
 */
export async function getCSRFToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'same-origin'
    })
    
    if (!response.ok) {
      throw new Error('Failed to get CSRF token')
    }
    
    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('Error getting CSRF token:', error)
    throw error
  }
}

/**
 * React hook for CSRF token management
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchToken = async () => {
      try {
        setLoading(true)
        setError(null)
        const csrfToken = await getCSRFToken()
        
        if (mounted) {
          setToken(csrfToken)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to get CSRF token')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchToken()

    return () => {
      mounted = false
    }
  }, [])

  const refreshToken = async () => {
    try {
      setError(null)
      const csrfToken = await getCSRFToken()
      setToken(csrfToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh CSRF token')
    }
  }

  return { token, loading, error, refreshToken }
}