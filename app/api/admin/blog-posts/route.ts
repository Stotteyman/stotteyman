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

    const blogPosts = await sql`
      SELECT 
        id,
        title,
        slug,
        excerpt,
        status,
        author_id,
        created_at
      FROM blog_posts 
      ORDER BY created_at DESC
    `
    
    return NextResponse.json(blogPosts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
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

    const { title, slug, content, excerpt, featured_image, status } = await request.json()
    
    const newBlogPost = await sql`
      INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, status, author_id)
      VALUES (${title}, ${slug}, ${content}, ${excerpt}, ${featured_image}, ${status}, ${(session.user as any).id})
      RETURNING *
    `
    
    return NextResponse.json(newBlogPost[0])
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}