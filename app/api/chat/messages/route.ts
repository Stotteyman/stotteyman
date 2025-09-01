import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await sql`
      SELECT 
        cm.id,
        cm.content,
        cm.room_id,
        cm.created_at,
        u.name as user_name,
        u.email as user_email
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.room_id = 'general'
      ORDER BY cm.created_at ASC
      LIMIT 100
    `
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, room_id = 'general' } = await request.json()
    
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    const newMessage = await sql`
      INSERT INTO chat_messages (content, user_id, room_id)
      VALUES (${content}, ${(session.user as any).id}, ${room_id})
      RETURNING id, content, room_id, created_at
    `
    
    // Get user info for the message
    const messageWithUser = await sql`
      SELECT 
        cm.id,
        cm.content,
        cm.room_id,
        cm.created_at,
        u.name as user_name,
        u.email as user_email
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ${newMessage[0]?.['id']}
    `
    
    return NextResponse.json(messageWithUser[0])
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}