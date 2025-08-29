import { NextRequest, NextResponse } from 'next/server'
import { setCSRFCookie } from '@/lib/security/csrfProtection'

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    const token = setCSRFCookie(response)
    
    return NextResponse.json({ token }, { 
      status: 200,
      headers: response.headers
    })
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}