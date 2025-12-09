import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from './DashboardPage'
import { useAuthStore } from '../stores/authStore'
import * as useCounterModule from '../hooks/useCounter'

// Mock the auth store
vi.mock('../stores/authStore')
const mockUseAuthStore = vi.mocked(useAuthStore)

// Mock the useCounter hook
vi.mock('../hooks/useCounter')

describe('DashboardPage', () => {
  const mockClearAuth = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
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
      clearAuth: mockClearAuth,
      setLoading: vi.fn(),
    })

    // Mock useCounter to return a stable state
    vi.mocked(useCounterModule.useCounter).mockReturnValue({
      value: 0,
      isLoading: false,
      isError: false,
      error: null,
      increment: vi.fn(),
      decrement: vi.fn(),
      setValue: vi.fn(),
      isUpdating: false,
      updateError: null,
    })
  })

  it('renders welcome message with user name', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Welcome,')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('displays PICC Canvas heading', () => {
    render(<DashboardPage />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('PICC Canvas')
  })

  it('shows create canvas message', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Create your first canvas to start building beautiful image compositions.')).toBeInTheDocument()
  })

  it('has logout button that calls clearAuth', () => {
    render(<DashboardPage />)
    
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    expect(mockClearAuth).toHaveBeenCalled()
  })

  it('displays user name in welcome message', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})