import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Leaf, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../services/axiosInstance'
import toast from 'react-hot-toast'

const RULES = [
  { label: 'Ít nhất 8 ký tự', test: (p) => p.length >= 8 },
  { label: 'Có chữ hoa (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Có chữ số (0-9)', test: (p) => /[0-9]/.test(p) },
]

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [form, setForm] = useState({ password: '', confirm_password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token || !email) {
      toast.error('Liên kết không hợp lệ.')
    }
  }, [token, email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.password || !form.confirm_password) { toast.error('Vui lòng điền đầy đủ.'); return }
    if (form.password !== form.confirm_password) { toast.error('Mật khẩu xác nhận không khớp.'); return }
    if (!RULES.every(r => r.test(form.password))) { toast.error('Mật khẩu chưa đủ mạnh.'); return }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, email, ...form })
      setDone(true)
      toast.success('Mật khẩu đã được đặt lại!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-earth-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center">
            <Leaf className="w-5 h-5 text-earth-paper" />
          </div>
          <span className="font-display text-2xl uppercase text-earth-ink">EcoSurvey</span>
        </Link>

        <div className="bg-white border-[3px] border-earth-ink p-8 shadow-[6px_6px_0px_#1a1a1a]">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-earth-forest/10 border-[3px] border-earth-forest rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-earth-forest" />
              </div>
              <h2 className="font-display text-2xl uppercase mb-3">Hoàn tất!</h2>
              <p className="text-sm text-earth-ink/70 mb-6">
                Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.
              </p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                Đăng nhập ngay
              </button>
            </div>
          ) : !token || !email ? (
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="font-display text-2xl uppercase mb-3">Liên kết không hợp lệ</h2>
              <p className="text-sm text-earth-ink/60 mb-6">
                Liên kết này đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại.
              </p>
              <Link to="/forgot-password" className="btn-primary w-full text-center block">
                Yêu cầu liên kết mới
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-earth-ink/50">/ auth</span>
                <h2 className="font-display text-3xl uppercase mt-1">Đặt lại mật khẩu</h2>
                <p className="text-sm text-earth-ink/60 mt-2">
                  Tạo mật khẩu mới cho tài khoản <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="rp-password" className="label">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" aria-hidden="true" />
                    <input
                      id="rp-password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="input pl-10 pr-12"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-ink/60 hover:text-earth-ink"
                      aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength rules */}
                  {form.password && (
                    <ul className="mt-2 space-y-1" aria-label="Yêu cầu mật khẩu">
                      {RULES.map((rule) => (
                        <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${rule.test(form.password) ? 'text-earth-forest' : 'text-earth-ink/40'}`}>
                          <CheckCircle className="w-3 h-3" />
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label htmlFor="rp-confirm" className="label">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" aria-hidden="true" />
                    <input
                      id="rp-confirm"
                      type={showPass ? 'text' : 'password'}
                      value={form.confirm_password}
                      onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                      placeholder="••••••••"
                      className="input pl-10"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  {form.confirm_password && form.password !== form.confirm_password && (
                    <p className="text-xs text-red-500 mt-1" role="alert">Mật khẩu không khớp</p>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <span className="w-5 h-5 border-[3px] border-earth-paper/30 border-t-earth-paper rounded-full animate-spin" />
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
