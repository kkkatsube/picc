import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import { AuthService } from '../services/authService'

// Mock AuthService
vi.mock('../services/authService')
const mockAuthService = vi.mocked(AuthService)

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('has correct initial state', () => {
    const store = useAuthStore.getState()
    
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isLoading).toBe(false)
  })

  it('setAuth updates state and calls AuthService.setAuthToken', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      email_verified_at: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }
    const token = 'mock-token'

    const { setAuth } = useAuthStore.getState()
    setAuth(user, token)

    const store = useAuthStore.getState()
    expect(store.user).toEqual(user)
    expect(store.token).toBe(token)
    expect(store.isAuthenticated).toBe(true)
    expect(store.isLoading).toBe(false)
    expect(mockAuthService.setAuthToken).toHaveBeenCalledWith(token)
  })

  it('clearAuth resets state and calls AuthService.clearAuthToken', () => {
    // First set some state
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      email_verified_at: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }
    const { setAuth, clearAuth } = useAuthStore.getState()
    setAuth(user, 'mock-token')

    // Then clear it
    clearAuth()

    const store = useAuthStore.getState()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isLoading).toBe(false)
    expect(mockAuthService.clearAuthToken).toHaveBeenCalled()
  })

  it('setLoading updates loading state', () => {
    const { setLoading } = useAuthStore.getState()
    
    setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    
    setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})