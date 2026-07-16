import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import api from '../services/axiosInstance'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ecosurvey_user')) } catch { return null }
  })
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ecosurvey_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      localStorage.setItem('ecosurvey_token', accessToken)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('ecosurvey_token')
    }
  }, [accessToken])

  useEffect(() => {
    const restoreSession = async () => {
      if (!accessToken) { setLoading(false); return }
      try {
        const res = await authService.refresh()
        setAccessToken(res.data.accessToken)
      } catch {
        setUser(null)
        setAccessToken(null)
        localStorage.removeItem('ecosurvey_user')
        localStorage.removeItem('ecosurvey_token')
        authService.logout().catch(() => {})
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, []) // eslint-disable-line

  const login = useCallback(async (loginId, password, captchaToken) => {
    const res = await authService.login(loginId, password, captchaToken)
    const token = res.data.accessToken
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setAccessToken(token)
    setUser(res.data.user)
    localStorage.setItem('ecosurvey_user', JSON.stringify(res.data.user))
    localStorage.setItem('ecosurvey_token', token)
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* ignore */ }
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('ecosurvey_user')
    localStorage.removeItem('ecosurvey_token')
    toast.success('Logged out successfully.')
  }, [])

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('ecosurvey_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const res = await userService.getMe()
      const fetchedUser = res.data.user
      setUser(fetchedUser)
      localStorage.setItem('ecosurvey_user', JSON.stringify(fetchedUser))
      return fetchedUser
    } catch (err) {
      console.error('Failed to fetch user:', err)
      return null
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, accessToken, setAccessToken, login, logout, updateUser, fetchUser, loading, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
