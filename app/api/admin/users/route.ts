import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDB } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = getDB()
    const users = await sql`
      SELECT 
        id,
        name,
        email,
        role,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}