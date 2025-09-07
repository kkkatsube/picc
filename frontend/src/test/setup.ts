import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IntersectionObserver
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: class IntersectionObserver {
    constructor() {}
    observe() {
      return null
    }
    disconnect() {
      return null
    }
    unobserve() {
      return null
    }
  }
})

// Mock ResizeObserver  
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: class ResizeObserver {
    constructor() {}
    observe() {
      return null
    }
    disconnect() {
      return null
    }
    unobserve() {
      return null
    }
  }
})

// Mock fetch API
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: vi.fn()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})