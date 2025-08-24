import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

Object.assign(global, { TextEncoder, TextDecoder })

class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(window, { IntersectionObserver })
Object.assign(global, { IntersectionObserver })

window.scrollTo = jest.fn()
