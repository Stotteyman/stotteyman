import { render, screen, fireEvent } from '@testing-library/react'
import { HeroSection } from '@/components/HeroSection'

jest.mock('@/components/CalendlyModal', () => ({
  CalendlyModal: ({ isOpen }: any) => (isOpen ? <div data-testid="calendly-modal">Modal</div> : null),
}))

describe('HeroSection', () => {
  it('renders heading and CTA', () => {
    render(<HeroSection />)
    expect(
      screen.getByRole('heading', { name: /stotteyman enterprises/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /schedule investment call/i })
    ).toBeInTheDocument()
  })

  it('opens Calendly modal when button is clicked', async () => {
    render(<HeroSection />)
    fireEvent.click(
      screen.getByRole('button', { name: /schedule investment call/i })
    )
    expect(await screen.findByTestId('calendly-modal')).toBeInTheDocument()
  })
})
