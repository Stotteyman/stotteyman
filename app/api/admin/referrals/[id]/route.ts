import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import sql from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    
    const updatedReferral = await sql`
      UPDATE referrals 
      SET 
        title = COALESCE(${updates.title}, title),
        description = COALESCE(${updates.description}, description),
        url = COALESCE(${updates.url}, url),
        category = COALESCE(${updates.category}, category),
        commission_rate = COALESCE(${updates.commission_rate}, commission_rate),
        requirements = COALESCE(${updates.requirements}, requirements),
        status = COALESCE(${updates.status}, status)
      WHERE id = ${params.id}
      RETURNING *
    `
    
    if (updatedReferral.length === 0) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedReferral[0])
  } catch (error) {
    console.error('Error updating referral:', error)
    return NextResponse.json(
      { error: 'Failed to update referral' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deletedReferral = await sql`
      DELETE FROM referrals 
      WHERE id = ${params.id}
      RETURNING id
    `
    
    if (deletedReferral.length === 0) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Referral deleted successfully' })
  } catch (error) {
    console.error('Error deleting referral:', error)
    return NextResponse.json(
      { error: 'Failed to delete referral' },
      { status: 500 }
    )
  }
}