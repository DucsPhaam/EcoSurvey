import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Eye, EyeOff, ArrowRight, ArrowUpRight, Lock, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import toast from 'react-hot-toast'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const { t } = useTranslation(['auth', 'nav'])
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
    if (!form.login || !form.password) { toast.error(t('auth:toast.fillFields')); return }
    if (!captchaToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) { toast.error(t('auth:toast.captcha')); return }
    setLoading(true)
    try {
      const loggedUser = await login(form.login, form.password, captchaToken)
      applyTheme(loggedUser.ui_theme)
      toast.success(`${t('auth:toast.welcomeBack')}, ${loggedUser.full_name}!`)
      // Admin always goes to /admin; student/staff use saved `from` only if it's not an admin route
      let dest
      if (loggedUser.role === 'Admin') {
        dest = (from && from.startsWith('/admin')) ? from : '/admin'
      } else {
        dest = (from && !from.startsWith('/admin')) ? from : '/dashboard'
      }
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth:toast.loginFailed'))
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
            <p className="font-mono text-xs uppercase tracking-widest mb-3 opacity-80">// {t('auth:leftPanel.accessPortal')}</p>
            <h1 className="font-display text-6xl uppercase leading-none">{t('auth:leftPanel.welcomeBack1')}<br />{t('auth:leftPanel.welcomeBack2')}</h1>
          </div>
          <p className="max-w-md text-lg opacity-90">
            {t('auth:leftPanel.desc')}
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              [t('auth:leftPanel.surveys'), t('auth:leftPanel.take')], 
              [t('auth:leftPanel.reports'), t('auth:leftPanel.submit')], 
              [t('auth:leftPanel.rank'), t('auth:leftPanel.climb')]
            ].map(([tItem, sItem]) => (
              <div key={tItem} className="border-[3px] border-earth-paper p-4">
                <p className="ui-title text-sm">{tItem}</p>
                <p className="font-mono text-xs mt-1 opacity-80">{sItem}</p>
              </div>
            ))}
          </div>

          <div className="border-[3px] border-earth-paper p-5 bg-earth-forest">
            <p className="font-mono text-xs uppercase tracking-widest opacity-80 mb-1">// {t('auth:leftPanel.didYouKnow')}</p>
            <p className="font-display text-lg">{t('auth:leftPanel.fact')}</p>
          </div>
        </div>

        <div className="relative font-mono text-xs uppercase tracking-widest opacity-70">
          {t('auth:leftPanel.version')}
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
              <span className="bg-earth-forest text-earth-paper px-2 py-0.5 font-mono text-xs uppercase tracking-widest">{t('auth:login')}</span>
            </div>
            <h2 className="font-display text-3xl uppercase mt-2">{t('auth:loginNow')}</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60 mt-2">/ {t('auth:welcomeBack')}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="login-field" className="label">{t('auth:username')} / {t('auth:email')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" aria-hidden="true" />
                  <input
                    id="login-field"
                    type="text"
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                    placeholder={`${t('auth:username')} / ${t('auth:email')}`}
                    className="input pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-field" className="label">{t('auth:password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" aria-hidden="true" />
                  <input
                    id="password-field"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input pl-10 pr-12"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-ink/60 hover:text-earth-ink">
                    {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password" className="text-xs text-earth-ink/50 hover:text-earth-forest transition-colors">
                    {t('auth:forgotPassword')}
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
                  <>{t('auth:login')} <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t-[3px] border-earth-ink flex flex-col gap-4">
              <a 
                href={`${import.meta.env.VITE_API_URL}/auth/google`} 
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t('auth:loginGoogle')}
              </a>

              <div className="flex items-center justify-between text-sm">
                <span className="font-mono uppercase tracking-widest text-earth-ink/60 text-xs">{t('auth:dontHaveAccount')}</span>
                <Link to="/register" className="ui-title inline-flex items-center gap-1 hover:text-earth-forest">
                  {t('auth:registerNow')} <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

