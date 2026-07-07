import { useState } from 'react'
import { Lock, Eye, EyeOff, X, KeyRound, CheckCircle2 } from 'lucide-react'
import api from '../../services/axiosInstance'
import toast from 'react-hot-toast'

export default function ChangePasswordModal({ onClose }) {
  const [current, setCurrent] = useState('')
  const [newPwd,   setNewPwd]  = useState('')
  const [confirm,  setConfirm] = useState('')
  const [show, setShow]  = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading]  = useState(false)

  const toggleShow = (field) => setShow((s) => ({ ...s, [field]: !s[field] }))

  // Password strength checks
  const checks = {
    len:   newPwd.length >= 8,
    upper: /[A-Z]/.test(newPwd),
    num:   /[0-9]/.test(newPwd),
    match: newPwd === confirm && newPwd.length > 0,
  }
  const score = Object.values(checks).filter(Boolean).length
  const strengthColors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-brand-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checks.len || !checks.upper || !checks.num) {
      return toast.error('New password does not meet security requirements.')
    }
    if (!checks.match) return toast.error('Passwords do not match.')
    setLoading(true)
    try {
      await api.patch('/users/me/password', {
        current_password: current,
        new_password:     newPwd,
        confirm_password: confirm,
      })
      toast.success('Password changed successfully!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
              <p className="text-xs text-gray-500">Set a new secure password for your account</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={show.current ? 'text' : 'password'}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter your current password"
                required
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
              <button type="button" onClick={() => toggleShow('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={show.new ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min 8 characters, uppercase & number"
                required
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
              <button type="button" onClick={() => toggleShow('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
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
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= score ? strengthColors[score] : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${score >= 4 ? 'text-brand-600' : score >= 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                  Strength: {strengthLabels[score]}
                </p>
                <div className="flex gap-3 text-xs">
                  {[['len', '8+ chars'], ['upper', 'Uppercase'], ['num', 'Number']].map(([k, label]) => (
                    <span key={k} className={`flex items-center gap-0.5 ${checks[k] ? 'text-brand-600' : 'text-gray-400'}`}>
                      {checks[k] && <CheckCircle2 className="w-3 h-3" />} {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={show.confirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your new password"
                required
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
              <button type="button" onClick={() => toggleShow('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm.length > 0 && (
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${checks.match ? 'text-brand-600' : 'text-red-500'}`}>
                <CheckCircle2 className="w-3 h-3" />
                {checks.match ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
