import { NextResponse } from 'next/server'
import { sampleReferrals } from '@/lib/seed-data'

export async function GET() {
  try {
    // Return mock data with proper structure
    const referrals = sampleReferrals.map((referral, index) => ({
      id: `ref-${index + 1}`,
      title: referral.title,
      description: referral.description,
      url: referral.url,
      category: referral.category,
      commission_rate: referral.commission_rate,
      requirements: referral.requirements,
      status: referral.status,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
    }))
    
    return NextResponse.json(referrals)
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, url, category, commission_rate, requirements } = await request.json()
    
    // Create a new referral object (mock implementation)
    const newReferral = {
      id: `ref-${Date.now()}`, // Generate unique ID
      title,
      description,
      url,
      category,
      commission_rate,
      requirements,
      status: 'active',
      created_at: new Date().toISOString()
    }
    
    // In a real implementation, you would save this to a database
    // For now, we'll just return the created object
    console.log('New referral created:', newReferral)
    
    return NextResponse.json(newReferral)
  } catch (error) {
    console.error('Error creating referral:', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}