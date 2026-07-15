import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../AuthContext'
import { authService } from '../../services/authService'
import api from '../../services/axiosInstance'

vi.mock('../../services/authService', () => ({
  authService: {
    refresh: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  }
}))

vi.mock('../../services/axiosInstance', () => ({
  default: {
    defaults: { headers: { common: {} } }
  }
}))

const TestComponent = () => {
  const { user, login, logout, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return (
    <div>
      <div data-testid="user">{user ? user.full_name : 'No User'}</div>
      <button onClick={() => login('test', '123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    api.defaults.headers.common = {}
  })

  it('shows loading initially, then fetches user if token exists', async () => {
    localStorage.setItem('ecosurvey_token', 'fake-token')
    localStorage.setItem('ecosurvey_user', JSON.stringify({ id: 1, full_name: 'Test User' }))
    vi.mocked(authService.refresh).mockResolvedValue({ data: { accessToken: 'new-fake-token' } })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for the async effect to complete
    expect(await screen.findByTestId('user')).toHaveTextContent('Test User')
    expect(authService.refresh).toHaveBeenCalledTimes(1)
  })

  it('does not fetch user if no token exists', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(await screen.findByTestId('user')).toHaveTextContent('No User')
    expect(authService.refresh).not.toHaveBeenCalled()
  })

  it('updates state and stores token on login', async () => {
    vi.mocked(authService.login).mockResolvedValue({ data: { accessToken: 'new-token', user: { full_name: 'New User' } } })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Login'))

    expect(await screen.findByTestId('user')).toHaveTextContent('New User')
    expect(localStorage.getItem('ecosurvey_token')).toBe('new-token')
    expect(authService.login).toHaveBeenCalledWith('test', '123')
  })

  it('clears state and removes token on logout', async () => {
    localStorage.setItem('ecosurvey_token', 'fake-token')
    localStorage.setItem('ecosurvey_user', JSON.stringify({ id: 1, full_name: 'Test User' }))
    vi.mocked(authService.refresh).mockResolvedValue({ data: { accessToken: 'new-fake-token' } })
    vi.mocked(authService.logout).mockResolvedValue({})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // wait for initial load
    expect(await screen.findByTestId('user')).toHaveTextContent('Test User')

    const user = userEvent.setup()
    await user.click(screen.getByText('Logout'))

    expect(await screen.findByTestId('user')).toHaveTextContent('No User')
    expect(localStorage.getItem('ecosurvey_token')).toBeNull()
  })
})
