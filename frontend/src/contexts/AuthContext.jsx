import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/axiosInstance'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ecosurvey_user')) } catch { return null }
  })
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ecosurvey_token') || null)
  const [loading, setLoading] = useState(true)

  // Inject token into axios defaults whenever it changes
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      localStorage.setItem('ecosurvey_token', accessToken)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('ecosurvey_token')
    }
  }, [accessToken])

  // Restore session on mount: try refresh token
  useEffect(() => {
    const restoreSession = async () => {
      if (!accessToken) { setLoading(false); return }
      try {
        const res = await api.post('/auth/refresh')
        setAccessToken(res.data.accessToken)
      } catch {
        // Refresh token invalid or DB was wiped — clear everything
        setUser(null)
        setAccessToken(null)
        localStorage.removeItem('ecosurvey_user')
        localStorage.removeItem('ecosurvey_token')
        // Fire-and-forget logout to clear the stale httpOnly cookie (do NOT await — avoid blocking the loading state)
        api.post('/auth/logout').catch(() => {})
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, []) // eslint-disable-line

  const login = useCallback(async (login, password) => {
    const res = await api.post('/auth/login', { login, password })
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    localStorage.setItem('ecosurvey_user', JSON.stringify(res.data.user))
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch { /* ignore */ }
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

  return (
    <AuthContext.Provider value={{ user, accessToken, setAccessToken, login, logout, updateUser, loading, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
