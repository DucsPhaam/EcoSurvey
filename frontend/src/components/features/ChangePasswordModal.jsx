import { useState } from 'react'
import { Lock, Eye, EyeOff, X, KeyRound, CheckCircle2 } from 'lucide-react'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

export default function ChangePasswordModal({ onClose }) {
  const [current, setCurrent] = useState('')
  const [newPwd,   setNewPwd]  = useState('')
  const [confirm,  setConfirm] = useState('')
  const [show, setShow]  = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading]  = useState(false)

  const toggleShow = (field) => setShow((s) => ({ ...s, [field]: !s[field] }))

  const checks = {
    len:   newPwd.length >= 8,
    upper: /[A-Z]/.test(newPwd),
    num:   /[0-9]/.test(newPwd),
    match: newPwd === confirm && newPwd.length > 0,
  }
  const score = Object.values(checks).filter(Boolean).length
  const strengthColors = ['', 'bg-red-500', 'bg-orange-400', 'bg-earth-clay', 'bg-earth-forest']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checks.len || !checks.upper || !checks.num) {
      return toast.error('New password does not meet security requirements.')
    }
    if (!checks.match) return toast.error('Passwords do not match.')
    setLoading(true)
    try {
      await userService.changePassword(current, newPwd, confirm)
      toast.success('Password changed successfully!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-earth-ink/70 animate-fade-in">
      <div className="bg-earth-paper border-[3px] border-earth-ink shadow-brutal-lg w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-[3px] border-earth-ink">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-earth-cream" />
            </div>
            <div>
              <h2 className="font-display text-xl uppercase text-earth-ink">Change Password</h2>
              <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60">Set a new secure password</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 border-2 border-transparent text-earth-ink hover:border-earth-ink hover:bg-earth-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Current Password */}
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
              <input
                type={show.current ? 'text' : 'password'}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter your current password"
                required
                className="input pl-9 pr-10"
              />
              <button type="button" onClick={() => toggleShow('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-ink/60 hover:text-earth-ink">
                {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
              <input
                type={show.new ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min 8 chars, uppercase & number"
                required
                className="input pl-9 pr-10"
              />
              <button type="button" onClick={() => toggleShow('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-ink/60 hover:text-earth-ink">
                {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Strength indicator */}
          {newPwd.length > 0 && (
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}
                    className={`h-1.5 flex-1 transition-all duration-300 ${
                      i <= score ? strengthColors[score] : 'bg-earth-cream border border-earth-ink/30'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-mono uppercase tracking-widest ${score >= 4 ? 'text-earth-forest' : score >= 3 ? 'text-earth-clay' : 'text-earth-terracotta'}`}>
                  Strength: {strengthLabels[score]}
                </p>
                <div className="flex gap-3 text-xs font-mono uppercase tracking-widest">
                  {[['len', '8+'], ['upper', 'ABC'], ['num', '123']].map(([k, label]) => (
                    <span key={k} className={`flex items-center gap-0.5 ${checks[k] ? 'text-earth-forest' : 'text-earth-ink/40'}`}>
                      {checks[k] && <CheckCircle2 className="w-3 h-3" />} {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
              <input
                type={show.confirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your new password"
                required
                className="input pl-9 pr-10"
              />
              <button type="button" onClick={() => toggleShow('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-ink/60 hover:text-earth-ink">
                {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm.length > 0 && (
              <p className={`text-xs mt-1.5 flex items-center gap-1 font-mono uppercase tracking-widest ${checks.match ? 'text-earth-forest' : 'text-earth-terracotta'}`}>
                <CheckCircle2 className="w-3 h-3" />
                {checks.match ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50">
              {loading
                ? <><span className="w-4 h-4 border-2 border-earth-paper/30 border-t-earth-paper animate-spin" /> Saving...</>
                : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
