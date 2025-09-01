import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDB } from '@/lib/db'

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
    
    const sql = getDB()
    const updatedBlogPost = await sql`
      UPDATE blog_posts 
      SET 
        title = COALESCE(${updates.title}, title),
        slug = COALESCE(${updates.slug}, slug),
        content = COALESCE(${updates.content}, content),
        excerpt = COALESCE(${updates.excerpt}, excerpt),
        featured_image = COALESCE(${updates.featured_image}, featured_image),
        status = COALESCE(${updates.status}, status)
      WHERE id = ${params.id}
      RETURNING *
    `
    
    if (updatedBlogPost.length === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedBlogPost[0])
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
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

    const sql = getDB()
    const deletedBlogPost = await sql`
      DELETE FROM blog_posts 
      WHERE id = ${params.id}
      RETURNING id
    `
    
    if (deletedBlogPost.length === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}