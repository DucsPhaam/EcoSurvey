import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import ProtectedRoute from '../ProtectedRoute'
import * as AuthContext from '../../../contexts/AuthContext'

// Mock the useAuth hook
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const TestComponent = () => <div>Protected Content</div>
const LoginComponent = () => <div>Login Page</div>
const AdminDashboard = () => <div>Admin Dashboard</div>
const StudentDashboard = () => <div>Student Dashboard</div>

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route element={ui}>
          <Route path="/protected" element={<TestComponent />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('redirects to /login if user is not authenticated', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({ user: null })
    renderWithRouter(<ProtectedRoute />, { route: '/protected' })
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders Outlet if user is authenticated and no allowedRoles specified', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({ user: { role: 'Student' } })
    renderWithRouter(<ProtectedRoute />, { route: '/protected' })
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders Outlet if user role is in allowedRoles', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({ user: { role: 'Admin' } })
    renderWithRouter(<ProtectedRoute allowedRoles={['Admin']} />, { route: '/protected' })
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects Student to /dashboard if role not allowed', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({ user: { role: 'Student' } })
    renderWithRouter(<ProtectedRoute allowedRoles={['Admin']} />, { route: '/protected' })
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
  })

  it('redirects Admin to /admin if role not allowed', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({ user: { role: 'Admin' } })
    renderWithRouter(<ProtectedRoute allowedRoles={['Student']} />, { route: '/protected' })
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
  })
})
