import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock the fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('App', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('renders the main heading', () => {
    render(<App />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/PICC/i)
  })

  it('displays initial API status', () => {
    render(<App />)
    
    // Should show error status initially
    expect(screen.getByText(/API Status:/)).toBeInTheDocument()
  })

  it('handles API health check', async () => {
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
    
    const testButton = screen.getByText(/test api/i)
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/health')
  })

  it('handles API health check failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<App />)
    
    const testButton = screen.getByText(/test api/i)
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('displays service status when available', async () => {
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
    
    const testButton = screen.getByText(/test api/i)
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(screen.getByText(/Database: error/i)).toBeInTheDocument()
      expect(screen.getByText(/Redis: ok/i)).toBeInTheDocument()
    })
  })
})