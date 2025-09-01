import { NextRequest, NextResponse } from 'next/server'
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
    const chatMessages = await sql`
      SELECT 
        cm.id,
        cm.content,
        cm.room_id,
        cm.created_at,
        u.name as user_name,
        u.email as user_email
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      ORDER BY cm.created_at DESC
      LIMIT 100
    `
    
    return NextResponse.json(chatMessages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = await request.json()
    
    const sql = getDB()
    const deletedMessage = await sql`
      DELETE FROM chat_messages 
      WHERE id = ${messageId}
      RETURNING id
    `
    
    if (deletedMessage.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Chat message deleted successfully' })
  } catch (error) {
    console.error('Error deleting chat message:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat message' },
      { status: 500 }
    )
  }
}