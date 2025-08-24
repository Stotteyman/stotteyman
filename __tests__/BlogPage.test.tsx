import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BlogPage from '@/app/blog/page'
import { blogPosts } from '@/app/blog/posts'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

describe('BlogPage', () => {
  it('filters posts by category', async () => {
    render(<BlogPage />)
    const category = 'Cannabis Tech'
    fireEvent.click(screen.getByRole('button', { name: category }))
    await waitFor(() => {
      const articles = screen.getAllByRole('article')
      const expected = blogPosts.filter(
        (p) => p.category === category && !p.featured
      ).length
      expect(articles).toHaveLength(expected)
    })
  })

  it('filters posts by search term', async () => {
    render(<BlogPage />)
    const searchInput = screen.getByLabelText(/search articles/i)
    fireEvent.change(searchInput, { target: { value: 'wage' } })
    await waitFor(() => {
      const articles = screen.getAllByRole('article')
      const expected = blogPosts.filter(
        (p) =>
          (p.title.toLowerCase().includes('wage') ||
            p.excerpt.toLowerCase().includes('wage') ||
            p.tags.some((t) => t.toLowerCase().includes('wage'))) &&
          !p.featured
      ).length
      expect(articles).toHaveLength(expected)
    })
  })

  it('allows typing into newsletter email field', () => {
    render(<BlogPage />)
    const input = screen.getByPlaceholderText(/enter your email/i)
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    expect(input).toHaveValue('test@example.com')
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })
})
