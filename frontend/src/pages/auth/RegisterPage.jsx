import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, Check, X, ChevronRight, ChevronLeft, User, Mail, Lock, Briefcase, Calendar, ArrowRight } from 'lucide-react'
import api from '../../services/axiosInstance'
import toast from 'react-hot-toast'

const STEPS = ['Account', 'Personal', 'Review']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${i <= current ? 'text-brand-400' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < current  ? 'bg-brand-600 border-brand-600 text-white' :
              i === current ? 'border-brand-500 text-brand-400' :
                              'border-gray-600 text-gray-600'}`}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className="hidden sm:block text-xs font-medium">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-px w-6 sm:w-12 ${i < current ? 'bg-brand-600' : 'bg-gray-700'}`} />}
        </div>
      ))}
    </div>
  )
}

function PasswordStrength({ password }) {
  const checks = [
    { ok: password.length >= 8,        label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(password),      label: 'Uppercase letter' },
    { ok: /[0-9]/.test(password),      label: 'Number' },
    { ok: /[^A-Za-z0-9]/.test(password), label: 'Special character (optional)' },
  ]
  return (
    <div className="mt-2 space-y-1">
      {checks.slice(0, 3).map(({ ok, label }) => (
        <div key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-green-400' : 'text-gray-500'}`}>
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
      const endpoint = field === 'username' ? `/auth/check-username?username=${value}` : `/auth/check-email?email=${value}`
      const res = await api.get(endpoint)
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
      await api.post('/auth/register', form)
      toast.success('Registered successfully! Awaiting admin approval.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const FieldIcon = ({ icon: Icon }) => <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
  const inputClass = "w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5"

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center shadow-glow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">EcoSurvey</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-2">Join the sustainability movement</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-card-hover">
          <StepIndicator current={step} />

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-semibold text-white mb-4">Account Credentials</h3>
              <div>
                <label className={labelClass}>Username</label>
                <div className="relative">
                  <FieldIcon icon={User} />
                  <input id="reg-username" type="text" placeholder="e.g. nguyenvan_a" value={form.username}
                    onChange={(e) => { set('username', e.target.value); setAvailability((a) => ({...a, username: null})) }}
                    onBlur={(e) => checkField('username', e.target.value)}
                    className={`${inputClass} ${availability.username === false ? 'border-red-500' : availability.username === true ? 'border-green-500' : ''}`} />
                  {availability.username === true  && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />}
                  {availability.username === false && <X    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />}
                </div>
                {availability.username === false && <p className="text-red-400 text-xs mt-1">Username already taken</p>}
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <FieldIcon icon={Mail} />
                  <input id="reg-email" type="email" placeholder="you@example.com" value={form.email}
                    onChange={(e) => { set('email', e.target.value); setAvailability((a) => ({...a, email: null})) }}
                    onBlur={(e) => checkField('email', e.target.value)}
                    className={`${inputClass} ${availability.email === false ? 'border-red-500' : availability.email === true ? 'border-green-500' : ''}`} />
                  {availability.email === true  && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />}
                  {availability.email === false && <X    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />}
                </div>
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <FieldIcon icon={Lock} />
                  <input id="reg-password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && <PasswordStrength password={form.password} />}
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <FieldIcon icon={Lock} />
                  <input id="reg-confirm" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.confirm_password}
                    onChange={(e) => set('confirm_password', e.target.value)}
                    className={`${inputClass} ${form.confirm_password && form.password !== form.confirm_password ? 'border-red-500' : ''}`} />
                </div>
                {form.confirm_password && form.password !== form.confirm_password && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-semibold text-white mb-4">Personal Information</h3>
              <div>
                <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FieldIcon icon={User} />
                  <input id="reg-fullname" type="text" placeholder="Nguyen Van A" value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Role <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {['Student', 'Staff'].map((r) => (
                    <button key={r} type="button" onClick={() => set('role', r)}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.role === r
                          ? 'border-brand-500 bg-brand-900/40 text-brand-400'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Student/Staff ID</label>
                <div className="relative">
                  <FieldIcon icon={Briefcase} />
                  <input type="text" placeholder={form.role === 'Student' ? 'SV2023001' : 'NV001'} value={form.student_staff_id}
                    onChange={(e) => set('student_staff_id', e.target.value)} className={inputClass} />
                </div>
              </div>
              {form.role === 'Student' && (
                <div>
                  <label className={labelClass}>Class</label>
                  <div className="relative">
                    <FieldIcon icon={User} />
                    <input type="text" placeholder="e.g. CNTT01K20" value={form.class_name}
                      onChange={(e) => set('class_name', e.target.value)} className={inputClass} />
                  </div>
                </div>
              )}
              <div>
                <label className={labelClass}>{form.role === 'Student' ? 'Faculty/Major' : 'Department'}</label>
                <div className="relative">
                  <FieldIcon icon={Briefcase} />
                  <input type="text" placeholder={form.role === 'Student' ? 'Faculty of Information Technology' : 'IT Department'} value={form.department}
                    onChange={(e) => set('department', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{form.role === 'Student' ? 'Enrollment Date' : 'Start Date'}</label>
                <div className="relative">
                  <FieldIcon icon={Calendar} />
                  <input type="date" value={form.joined_date}
                    onChange={(e) => set('joined_date', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-3 animate-slide-up">
              <h3 className="font-semibold text-white mb-4">Review & Submit</h3>
              {[
                ['Username',    form.username],
                ['Email',       form.email],
                ['Full Name',   form.full_name],
                ['Role',        form.role],
                ['ID',          form.student_staff_id || '—'],
                ['Department',  form.department || '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-800 text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white font-medium">{val}</span>
                </div>
              ))}
              <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700/40 rounded-xl text-xs text-amber-300">
                ⏳ After submitting, your account will be <strong>pending admin approval</strong>. You'll be notified once approved.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={back}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={next}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold transition-all shadow-glow-sm hover:shadow-glow-green flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold transition-all shadow-glow-sm hover:shadow-glow-green flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Submit Registration</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
