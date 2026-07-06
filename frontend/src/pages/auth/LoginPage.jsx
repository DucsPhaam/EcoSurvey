import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Eye, EyeOff, ArrowRight, Lock, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, user } = useAuth()
  const { applyTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || null

  const [form, setForm] = useState({ login: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    navigate(user.role === 'Admin' ? '/admin' : '/dashboard', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.login || !form.password) { toast.error('Please fill in all fields.'); return }
    setLoading(true)
    try {
      const loggedUser = await login(form.login, form.password)
      applyTheme(loggedUser.ui_theme)
      toast.success(`Welcome back, ${loggedUser.full_name}!`)
      const dest = from || (loggedUser.role === 'Admin' ? '/admin' : '/dashboard')
      navigate(dest, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-gray-900">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent-400/15 rounded-full blur-3xl" />
        <div className="relative text-center p-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center mx-auto mb-6 shadow-glow-green">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-4">Welcome Back</h1>
          <p className="text-brand-200 text-lg max-w-sm">Continue your journey toward a more sustainable campus community.</p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[['Surveys', 'Complete & earn'], ['Reports', 'Document impact'], ['Rank', 'Climb the board']].map(([t, s]) => (
              <div key={t} className="bg-brand-900/50 border border-brand-700/40 rounded-xl p-4">
                <p className="font-bold text-white text-sm">{t}</p>
                <p className="text-brand-300 text-xs mt-1">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">EcoSurvey</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-white mb-2">Sign in</h2>
          <p className="text-gray-400 mb-8">Enter your credentials to access your account.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username or Email</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="login-field"
                  type="text"
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  placeholder="admin or admin@ecosurvey.edu.vn"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="password-field"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-glow-sm hover:shadow-glow-green flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Create one</Link>
          </p>

          <div className="mt-6 p-4 bg-gray-800/60 border border-gray-700 rounded-xl">
            <p className="text-xs text-gray-400 font-medium mb-1">🔑 Default Admin Credentials</p>
            <p className="text-xs text-gray-500">Username: <span className="text-gray-300 font-mono">admin</span></p>
            <p className="text-xs text-gray-500">Password: <span className="text-gray-300 font-mono">Admin@123456</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
