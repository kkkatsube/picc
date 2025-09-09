import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock the fetch function
const mockFetch = vi.fn()
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: mockFetch
})

describe('App', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('renders the main heading', () => {
    render(<App />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/PICC Development Environment/i)
  })

  it('displays frontend and backend status', () => {
    render(<App />)
    
    // Should show frontend status
    expect(screen.getByText(/Frontend \(React \+ Vite\)/)).toBeInTheDocument()
    expect(screen.getByText(/Backend API/)).toBeInTheDocument()
  })

  it('has test connection button', () => {
    render(<App />)
    
    const testButton = screen.getByText(/Test Connection/i)
    expect(testButton).toBeInTheDocument()
  })

  it('handles API health check success', async () => {
    const mockHealthResponse = {
      status: 'ok',
      message: 'All systems operational',
      version: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z',
      checks: {
        api: { status: 'ok', message: 'API is healthy' },
        database: { 
          status: 'ok', 
          message: 'Database connection successful',
          connection_time_ms: 1.23,
          driver: 'pgsql'
        },
        redis: { 
          status: 'ok', 
          message: 'Redis connection successful',
          connection_time_ms: 0.45
        }
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthResponse,
    })

    render(<App />)
    
    const testButton = screen.getByText(/Test Connection/i)
    fireEvent.click(testButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Testing.../i)).toBeInTheDocument()
    })

    // Should show success result
    await waitFor(() => {
      expect(screen.getByText(/All systems operational/i)).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/health')
  })

  it('handles API health check failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<App />)
    
    const testButton = screen.getByText(/Test Connection/i)
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/Testing.../i)).toBeInTheDocument()
    })

    // Should return to Test Connection after error
    await waitFor(() => {
      expect(screen.getByText(/Test Connection/i)).toBeInTheDocument()
    })
  })

  it('displays service details when health check returns data', async () => {
    const mockHealthResponse = {
      status: 'error',
      message: 'Some systems have issues',
      version: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z',
      checks: {
        api: { status: 'ok', message: 'API is healthy' },
        database: { 
          status: 'error', 
          message: 'Database connection failed',
          error: 'Connection timeout'
        },
        redis: { 
          status: 'ok', 
          message: 'Redis connection successful',
          connection_time_ms: 0.45
        }
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => mockHealthResponse,
    })

    render(<App />)
    
    const testButton = screen.getByText(/Test Connection/i)
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/Some systems have issues/i)).toBeInTheDocument()
      expect(screen.getByText(/API is healthy/i)).toBeInTheDocument()
      expect(screen.getByText(/Database connection failed/i)).toBeInTheDocument()
    })
  })
})