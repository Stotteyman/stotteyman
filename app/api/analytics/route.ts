import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data } = body

    // Handle different data types
    const { type, data: eventData } = body

    // Validate event/data type
    const allowedTypes = [
      'page_view',
      'animation_performance',
      'user_interaction',
      'error_boundary',
      'performance_metric',
      'web_vitals'
    ]

    const eventType = event || type // Support both formats

    if (!allowedTypes.includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    // Special handling for Web Vitals data
    if (eventType === 'web_vitals') {
      const webVitalsData = eventData || data
      
      // Validate Web Vitals data structure
      if (!webVitalsData || typeof webVitalsData !== 'object') {
        return NextResponse.json(
          { error: 'Invalid Web Vitals data' },
          { status: 400 }
        )
      }

      // Log Web Vitals metrics (in production, send to monitoring service)
      console.log('Web Vitals metrics:', {
        type: 'web_vitals',
        metrics: webVitalsData,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Web Vitals metrics recorded' 
      })
    }

    // Log analytics event (in production, send to analytics service)
    console.log('Analytics event:', {
      event: eventType,
      data: eventData || data,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics error:', error)
    
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}