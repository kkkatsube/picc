import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AuthPage from './AuthPage'
import { useAuthStore } from '../stores/authStore'
import { AuthService } from '../services/authService'

// Mock dependencies
vi.mock('../stores/authStore')
vi.mock('../services/authService')
vi.mock('../components/auth/LoginForm', () => ({
  default: ({ onSubmit, onSwitchToRegister, isLoading }: any) => (
    <div data-testid="login-form">
      <button onClick={() => onSubmit({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={onSwitchToRegister}>Switch to Register</button>
      {isLoading && <div data-testid="loading">Loading...</div>}
    </div>
  )
}))

vi.mock('../components/auth/RegisterForm', () => ({
  default: ({ onSubmit, onSwitchToLogin, isLoading }: any) => (
    <div data-testid="register-form">
      <button onClick={() => onSubmit({ 
        name: 'Test User',
        email: 'test@example.com', 
        password: 'password',
        password_confirmation: 'password'
      })}>
        Register
      </button>
      <button onClick={onSwitchToLogin}>Switch to Login</button>
      {isLoading && <div data-testid="loading">Loading...</div>}
    </div>
  )
}))

const mockUseAuthStore = vi.mocked(useAuthStore)
const mockAuthService = vi.mocked(AuthService)

describe('AuthPage', () => {
  const mockSetAuth = vi.fn()
  const mockSetLoading = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      setAuth: mockSetAuth,
      clearAuth: vi.fn(),
      setLoading: mockSetLoading,
    })
  })

  it('renders login form by default', () => {
    render(<AuthPage />)
    
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument()
  })

  it('switches to register form when clicking switch button', () => {
    render(<AuthPage />)
    
    fireEvent.click(screen.getByText('Switch to Register'))
    
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
  })

  it('switches back to login form from register form', () => {
    render(<AuthPage />)
    
    // Switch to register
    fireEvent.click(screen.getByText('Switch to Register'))
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
    
    // Switch back to login
    fireEvent.click(screen.getByText('Switch to Login'))
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    const mockResponse = {
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      access_token: 'mock-token'
    }
    mockAuthService.login.mockResolvedValueOnce(mockResponse as any)

    render(<AuthPage />)
    
    fireEvent.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true)
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
      expect(mockSetAuth).toHaveBeenCalledWith(mockResponse.user, mockResponse.access_token)
    })
  })

  it('handles successful registration', async () => {
    const mockResponse = {
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      access_token: 'mock-token'
    }
    mockAuthService.register.mockResolvedValueOnce(mockResponse as any)

    render(<AuthPage />)
    
    // Switch to register form
    fireEvent.click(screen.getByText('Switch to Register'))
    
    fireEvent.click(screen.getByText('Register'))
    
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true)
      expect(mockAuthService.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        password_confirmation: 'password'
      })
      expect(mockSetAuth).toHaveBeenCalledWith(mockResponse.user, mockResponse.access_token)
    })
  })

  it('displays error message when login fails', async () => {
    mockAuthService.login.mockRejectedValueOnce({
      message: 'Invalid credentials'
    })

    render(<AuthPage />)
    
    fireEvent.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      expect(mockSetLoading).toHaveBeenCalledWith(false)
    })
  })
})