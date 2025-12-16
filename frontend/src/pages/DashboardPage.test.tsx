import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'
import { useAuthStore } from '../stores/authStore'
import * as useCounterModule from '../hooks/useCounter'
import * as useCanvasesModule from '../hooks/useCanvases'

// Mock the auth store
vi.mock('../stores/authStore')
const mockUseAuthStore = vi.mocked(useAuthStore)

// Mock the useCounter hook
vi.mock('../hooks/useCounter')

// Mock the useCanvases hook
vi.mock('../hooks/useCanvases')

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

    // Mock useCanvases to return a stable state
    vi.mocked(useCanvasesModule.useCanvases).mockReturnValue({
      canvases: [],
      isLoading: false,
      isError: false,
      error: null,
      createCanvas: vi.fn(),
      isCreating: false,
      createError: null,
      updateCanvas: vi.fn(),
      isUpdating: false,
      updateError: null,
      deleteCanvas: vi.fn(),
      isDeleting: false,
      deleteError: null,
    })
  })

  it('renders welcome message with user name', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Welcome,')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('displays PICC Canvas heading', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('PICC Canvas')
  })

  it('shows create canvas message', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Create your first canvas to start building beautiful image compositions.')).toBeInTheDocument()
  })

  it('has logout button that calls clearAuth', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(mockClearAuth).toHaveBeenCalled()
  })

  it('displays user name in welcome message', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})