import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Eye, EyeOff, ArrowRight, ArrowUpRight, Lock, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'
import { Turnstile } from '@marsidev/react-turnstile'

export default function LoginPage() {
  const { login, user } = useAuth()
  const { applyTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || null

  const [form, setForm] = useState({ login: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  useEffect(() => {
    if (user) {
      navigate(user.role === 'Admin' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.login || !form.password) { toast.error('Please fill in all fields.'); return }
    if (!captchaToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) { toast.error('Please complete the CAPTCHA.'); return }
    setLoading(true)
    try {
      const loggedUser = await login(form.login, form.password, captchaToken)
      applyTheme(loggedUser.ui_theme)
      toast.success(`Welcome back, ${loggedUser.full_name}!`)
      const dest = from || (loggedUser.role === 'Admin' ? '/admin' : '/dashboard')
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-earth-paper grid lg:grid-cols-2">
      {/* Left brutalist panel */}
      <aside className="relative bg-earth-forest text-earth-paper border-r-[3px] border-earth-ink hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(250,246,233,0.2) 12px 14px)'
        }} />
        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-earth-cream border-[3px] border-earth-paper flex items-center justify-center">
              <Leaf className="w-6 h-6 text-earth-forest" />
            </div>
            <p className="font-display text-xl uppercase">EcoSurvey</p>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-3 opacity-80">// Access portal</p>
            <h1 className="font-display text-6xl uppercase leading-none">Welcome<br />Back.</h1>
          </div>
          <p className="max-w-md text-lg opacity-90">
            Continue your journey toward a more sustainable campus community.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[['Surveys', 'Take'], ['Reports', 'Submit'], ['Rank', 'Climb']].map(([t, s]) => (
              <div key={t} className="border-[3px] border-earth-paper p-4">
                <p className="ui-title text-sm">{t}</p>
                <p className="font-mono text-xs mt-1 opacity-80">{s}</p>
              </div>
            ))}
          </div>

          <div className="border-[3px] border-earth-paper p-5 bg-earth-forest">
            <p className="font-mono text-xs uppercase tracking-widest opacity-80 mb-1">// Did you know?</p>
            <p className="font-display text-lg">Every approved report saves ~2.4kg of CO₂ equivalent on campus.</p>
          </div>
        </div>

        <div className="relative font-mono text-xs uppercase tracking-widest opacity-70">
          v1.0 · environmental portal
        </div>
      </aside>

      {/* Right form */}
      <main className="flex items-center justify-center p-6 sm:p-12 bg-paper-warm">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center">
              <Leaf className="w-5 h-5 text-earth-cream" />
            </div>
            <span className="font-display uppercase text-lg">EcoSurvey</span>
          </Link>

          <div className="card p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-earth-forest text-earth-paper px-2 py-0.5 font-mono text-xs uppercase tracking-widest">Sign In</span>
            </div>
            <h2 className="font-display text-3xl uppercase mt-2">Authenticate</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60 mt-2">/ enter credentials</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="label">Username or Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input
                    type="text"
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                    placeholder="username or email"
                    className="input pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input pl-10 pr-12"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-ink/60 hover:text-earth-ink">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password" className="text-xs text-earth-ink/50 hover:text-earth-forest transition-colors">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                <div className="flex justify-center">
                  <Turnstile 
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
                    onSuccess={(token) => setCaptchaToken(token)} 
                  />
                </div>
              )}

              <button type="submit" disabled={loading || (!captchaToken && !!import.meta.env.VITE_TURNSTILE_SITE_KEY)} className="btn-primary w-full">
                {loading ? (
                  <span className="w-5 h-5 border-[3px] border-earth-paper/30 border-t-earth-paper" />
                ) : (
                  <>Sign In <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t-[3px] border-earth-ink flex items-center justify-between text-sm">
              <span className="font-mono uppercase tracking-widest text-earth-ink/60 text-xs">No account?</span>
              <Link to="/register" className="ui-title inline-flex items-center gap-1 hover:text-earth-forest">
                Register <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

