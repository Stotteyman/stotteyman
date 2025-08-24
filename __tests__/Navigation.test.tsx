import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from '@/components/Navigation'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

jest.mock('@/components/CalendlyModal', () => ({
  CalendlyModal: ({ isOpen }: any) => (isOpen ? <div data-testid="calendly-modal">Modal</div> : null),
}))

describe('Navigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders navigation links', () => {
    render(<Navigation />)
    const links = ['Home', 'About', 'Ventures', 'Livestream', 'Blog', 'Contact']
    links.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })

  it('toggles mobile menu', () => {
    render(<Navigation />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    const initialCount = screen.getAllByText('Book a Call').length
    fireEvent.click(toggle)
    expect(screen.getAllByText('Book a Call').length).toBe(initialCount + 1)
  })
})
