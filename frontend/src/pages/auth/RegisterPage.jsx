import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, Check, X, ChevronRight, ChevronLeft, User, Mail, Lock, Briefcase, Calendar, ArrowRight, ArrowUpRight } from 'lucide-react'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const STEPS = ['Account', 'Personal', 'Review']

const ROLES = [
  { id: 'Student', label: 'Student', sub: 'For enrolled students' },
  { id: 'Staff',   label: 'Staff',   sub: 'For university staff' },
]

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className={`flex items-center gap-2 ${i <= current ? 'text-earth-ink' : 'text-earth-ink/30'}`}>
            <div className={`w-9 h-9 border-[3px] border-earth-ink flex items-center justify-center font-display text-sm transition-colors ${
              i < current  ? 'bg-earth-forest text-earth-paper' :
              i === current ? 'bg-earth-paper text-earth-ink' :
                              'bg-earth-paper text-earth-ink/30'
            }`}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className="hidden sm:inline ui-title text-xs">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-[3px] ${i < current ? 'bg-earth-forest' : 'bg-earth-ink/20'}`} />}
        </div>
      ))}
    </div>
  )
}

function PasswordStrength({ password }) {
  const checks = [
    { ok: password.length >= 8,           label: '≥8 characters' },
    { ok: /[A-Z]/.test(password),         label: 'Uppercase letter' },
    { ok: /[0-9]/.test(password),         label: 'Number' },
  ]
  return (
    <div className="mt-2 grid grid-cols-3 gap-1">
      {checks.map(({ ok, label }) => (
        <div key={label} className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider ${ok ? 'text-earth-forest' : 'text-earth-ink/40'}`}>
          {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {label}
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [checking, setChecking] = useState({ username: false, email: false })
  const [availability, setAvailability] = useState({ username: null, email: null })

  const [form, setForm] = useState({
    full_name: '', username: '', email: '', password: '', confirm_password: '',
    role: 'Student', student_staff_id: '', class_name: '', department: '', joined_date: '',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const checkField = useCallback(async (field, value) => {
    if (!value || value.length < 3) return
    setChecking((c) => ({ ...c, [field]: true }))
    try {
      const res = field === 'username'
        ? await authService.checkUsername(value)
        : await authService.checkEmail(value)
      setAvailability((a) => ({ ...a, [field]: res.data.available }))
    } catch { /* ignore */ } finally {
      setChecking((c) => ({ ...c, [field]: false }))
    }
  }, [])

  const validateStep0 = () => {
    if (!form.username || !form.email || !form.password || !form.confirm_password) return 'Fill in all fields.'
    if (availability.username === false) return 'Username is already taken.'
    if (availability.email === false) return 'Email is already in use.'
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      return 'Password must be ≥8 chars with uppercase & number.'
    if (form.password !== form.confirm_password) return 'Passwords do not match.'
    return null
  }

  const next = () => {
    if (step === 0) { const e = validateStep0(); if (e) { toast.error(e); return } }
    if (step === 1) { if (!form.full_name || !form.role) { toast.error('Name and role are required.'); return } }
    setStep((s) => Math.min(s + 1, 2))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await authService.register(form)
      toast.success('Registered! Awaiting admin approval.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-paper-warm py-8 px-4">
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-earth-forest border-[3px] border-earth-ink shadow-brutal-sm flex items-center justify-center">
              <Leaf className="w-6 h-6 text-earth-cream" />
            </div>
            <span className="font-display text-2xl uppercase">EcoSurvey</span>
          </Link>
          <h1 className="font-display text-4xl md:text-5xl uppercase mt-6">Create Account</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60 mt-2">// join the movement</p>
        </div>

        <div className="card p-8">
          <StepIndicator current={step} />

          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="label">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input type="text" placeholder="e.g. nguyenvan_a" value={form.username}
                    onChange={(e) => { set('username', e.target.value); setAvailability((a) => ({...a, username: null})) }}
                    onBlur={(e) => checkField('username', e.target.value)}
                    className={`input pl-10 ${availability.username === false ? 'border-earth-terracotta' : availability.username === true ? 'border-earth-forest' : ''}`} />
                  {availability.username === true  && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-forest" />}
                  {availability.username === false && <X    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-terracotta" />}
                </div>
                {availability.username === false && <p className="text-earth-terracotta font-mono text-xs uppercase tracking-wider mt-1">/ username taken</p>}
              </div>

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input type="email" placeholder="you@example.com" value={form.email}
                    onChange={(e) => { set('email', e.target.value); setAvailability((a) => ({...a, email: null})) }}
                    onBlur={(e) => checkField('email', e.target.value)}
                    className={`input pl-10 ${availability.email === false ? 'border-earth-terracotta' : availability.email === true ? 'border-earth-forest' : ''}`} />
                  {availability.email === true  && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-forest" />}
                  {availability.email === false && <X    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-terracotta" />}
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                    onChange={(e) => set('password', e.target.value)} className="input pl-10 pr-12" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-ink/60 hover:text-earth-ink">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && <PasswordStrength password={form.password} />}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.confirm_password}
                    onChange={(e) => set('confirm_password', e.target.value)}
                    className={`input pl-10 ${form.confirm_password && form.password !== form.confirm_password ? 'border-earth-terracotta' : ''}`} />
                </div>
                {form.confirm_password && form.password !== form.confirm_password && (
                  <p className="text-earth-terracotta font-mono text-xs uppercase tracking-wider mt-1">/ mismatch</p>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input type="text" placeholder="Nguyen Van A" value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)} className="input pl-10" />
                </div>
              </div>

              <div>
                <label className="label">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(({ id, label, sub }) => (
                    <button key={id} type="button" onClick={() => set('role', id)}
                      className={`text-left p-4 border-[3px] border-earth-ink transition-all ${
                        form.role === id ? 'bg-earth-forest text-earth-paper shadow-brutal-sm' : 'bg-earth-paper hover:bg-earth-cream'
                      }`}>
                      <p className="ui-title">{label}</p>
                      <p className={`font-mono text-[10px] uppercase tracking-wider mt-1 ${form.role === id ? 'opacity-80' : 'text-earth-ink/60'}`}>{sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Student/Staff ID</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input type="text" placeholder={form.role === 'Student' ? 'SV2023001' : 'NV001'} value={form.student_staff_id}
                    onChange={(e) => set('student_staff_id', e.target.value)} className="input pl-10" />
                </div>
              </div>

              {form.role === 'Student' && (
                <div>
                  <label className="label">Class</label>
                  <input type="text" placeholder="e.g. CNTT01K20" value={form.class_name}
                    onChange={(e) => set('class_name', e.target.value)} className="input" />
                </div>
              )}

              <div>
                <label className="label">{form.role === 'Student' ? 'Faculty/Major' : 'Department'}</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input type="text" placeholder={form.role === 'Student' ? 'Faculty of Information Technology' : 'IT Department'} value={form.department}
                    onChange={(e) => set('department', e.target.value)} className="input pl-10" />
                </div>
              </div>

              <div>
                <label className="label">{form.role === 'Student' ? 'Enrollment Date' : 'Start Date'}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
                  <input type="date" value={form.joined_date}
                    onChange={(e) => set('joined_date', e.target.value)} className="input pl-10" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60">/ confirm & submit</p>
              <div className="space-y-0">
                {[
                  ['Username',    form.username],
                  ['Email',       form.email],
                  ['Full Name',   form.full_name],
                  ['Role',        form.role],
                  ['ID',          form.student_staff_id || '—'],
                  ['Department',  form.department || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-3 border-b-[2px] border-earth-ink/30">
                    <span className="font-mono text-xs uppercase tracking-widest text-earth-ink/60">{label}</span>
                    <span className="ui-title">{val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-earth-sand border-[3px] border-earth-ink p-4">
                <p className="font-mono text-xs uppercase tracking-widest">⚠ Note: After submitting, your account will be pending admin approval.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t-[3px] border-earth-ink">
            {step > 0 && (
              <button onClick={back} className="btn-secondary flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={next} className="btn-primary flex-1">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                {loading ? (
                  <span className="w-5 h-5 border-[3px] border-earth-paper/30 border-t-earth-paper" />
                ) : (
                  <>Submit <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center font-mono text-xs uppercase tracking-widest text-earth-ink/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-display text-earth-ink underline">Sign In <ArrowUpRight className="inline w-3 h-3" /></Link>
        </p>
      </div>
    </div>
  )
}

