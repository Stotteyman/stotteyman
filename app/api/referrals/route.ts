import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const referrals = await sql`
      SELECT 
        id,
        title,
        description,
        url,
        category,
        commission_rate,
        requirements,
        status,
        created_at
      FROM referrals 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `
    
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
    
    const newReferral = await sql`
      INSERT INTO referrals (title, description, url, category, commission_rate, requirements)
      VALUES (${title}, ${description}, ${url}, ${category}, ${commission_rate}, ${requirements})
      RETURNING *
    `
    
    return NextResponse.json(newReferral[0])
  } catch (error) {
    console.error('Error creating referral:', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}