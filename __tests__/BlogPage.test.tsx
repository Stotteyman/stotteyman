import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BlogPageClient from '@/app/blog/BlogPageClient'
import { getAllPosts } from '@/lib/posts'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

describe('BlogPage', () => {
  it('filters posts by category', async () => {
    const posts = await getAllPosts()
    render(<BlogPageClient posts={posts} />)
    const category = 'Cannabis Tech'
    fireEvent.click(screen.getByRole('button', { name: category }))
    await waitFor(() => {
      const articles = screen.getAllByRole('article')
      const expected = posts.filter(
        (p) => p.category === category && !p.featured
      ).length
      expect(articles).toHaveLength(expected)
    })
  })

  it('filters posts by search term', async () => {
    const posts = await getAllPosts()
    render(<BlogPageClient posts={posts} />)
    const searchInput = screen.getByLabelText(/search articles/i)
    fireEvent.change(searchInput, { target: { value: 'wage' } })
    await waitFor(() => {
      const articles = screen.getAllByRole('article')
      const expected = posts.filter(
        (p) =>
          (p.title.toLowerCase().includes('wage') ||
            p.excerpt.toLowerCase().includes('wage') ||
            p.tags.some((t: string) => t.toLowerCase().includes('wage'))) &&
          !p.featured
      ).length
      expect(articles).toHaveLength(expected)
    })
  })

  it('allows typing into newsletter email field', async () => {
    const posts = await getAllPosts()
    render(<BlogPageClient posts={posts} />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    expect(input).toHaveValue('test@example.com')
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })
})
