import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import { useAuthStore } from './stores/authStore'

// Mock the auth store
vi.mock('./stores/authStore')
const mockUseAuthStore = vi.mocked(useAuthStore)

// Mock the page components
vi.mock('./pages/AuthPage', () => ({
  default: () => <div data-testid="auth-page">Auth Page</div>
}))

vi.mock('./pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders AuthPage when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
      setLoading: vi.fn(),
    })

    render(<App />)
    
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
  })

  it('renders DashboardPage when user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        email_verified_at: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      token: 'mock-token',
      isLoading: false,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
      setLoading: vi.fn(),
    })

    render(<App />)
    
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    expect(screen.queryByTestId('auth-page')).not.toBeInTheDocument()
  })

  it('calls useAuthStore to get authentication state', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
      setLoading: vi.fn(),
    })

    render(<App />)
    
    expect(mockUseAuthStore).toHaveBeenCalled()
  })
})