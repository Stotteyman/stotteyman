import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, url, category, commission_rate, requirements } = await request.json()
    
    const newReferral = await sql`
      INSERT INTO referrals (title, description, url, category, commission_rate, requirements, created_by)
      VALUES (${title}, ${description}, ${url}, ${category}, ${commission_rate}, ${requirements}, ${(session.user as any).id})
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