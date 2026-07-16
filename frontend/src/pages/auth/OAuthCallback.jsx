import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const { fetchUser, setAccessToken } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const accessToken = params.get('accessToken')

    if (accessToken) {
      setAccessToken(accessToken)
      import('../../services/axiosInstance').then(({ default: api }) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        fetchUser().then(user => {
        if (user) {
          toast.success(`Welcome back, ${user.full_name}!`)
          navigate(user.role === 'Admin' ? '/admin' : '/dashboard', { replace: true })
        } else {
          toast.error('Failed to load user profile.')
          navigate('/login', { replace: true })
        }
      })
      })
    } else {
      toast.error('Authentication failed.')
      navigate('/login', { replace: true })
    }
  }, [location, navigate, fetchUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-paper">
      <div className="card p-8 flex flex-col items-center">
        <div className="w-10 h-10 border-[3px] border-earth-forest border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest">Authenticating...</p>
      </div>
    </div>
  )
}
