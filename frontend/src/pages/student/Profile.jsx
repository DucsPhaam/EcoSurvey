import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import { Award, Star, History, ArrowLeft, KeyRound, Camera, Shield, Edit3, Save, X, Mail, User as UserIcon, Building2, Calendar, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import ChangePasswordModal from '../../components/features/ChangePasswordModal'
import { useTranslation } from 'react-i18next'

export default function Profile() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const [logs, setLogs] = useState([])
  const [badges, setBadges] = useState([])
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', email: '', department: '' })
  const fileInputRef = useRef(null)

  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    if (user) {
      fetchData()
      setEditForm({
        full_name: user.full_name || '',
        email: user.email || '',
        department: user.department || '',
      })
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (isAdmin) {
        setLoading(false)
        return
      }
      const [pointsRes, badgesRes] = await Promise.all([
        userService.getPointHistory(),
        userService.getBadges().catch(() => ({ badges: [] }))
      ])
      setLogs(pointsRes.data.logs || [])
      setPoints(pointsRes.data.total || 0)
      setBadges(badgesRes.data?.badges || badgesRes.badges || [])
    } catch (err) {
      console.error('Failed to fetch profile data', err)
      toast.error('Could not load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Your image size is too large. Maximum size allowed is 5MB.')
    }
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      setUploadingAvatar(true)
      const res = await userService.uploadAvatar(formData)
      updateUser({ avatar_url: res.data.avatar_url })
      toast.success('Avatar updated successfully')
    } catch (err) {
      if (err.response?.status === 413) {
        toast.error('Your image size is too large. Maximum size allowed is 5MB.')
      } else {
        toast.error(err.response?.data?.message || 'Failed to update avatar')
      }
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveProfile = async () => {
    if (!editForm.full_name.trim() || !editForm.email.trim()) {
      return toast.error(t('profile.admin.requiredFields'))
    }
    try {
      setSavingProfile(true)
      const res = await userService.updateProfile(editForm)
      updateUser(res.data.user)
      setEditMode(false)
      toast.success(t('profile.admin.profileUpdated'))
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.admin.profileUpdateFailed'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      department: user.department || '',
    })
    setEditMode(false)
  }

  // ─── Rank calculation (for students/staff) ───────────────────────────────
  let rank = { nameKey: 'bronze', color: 'text-[#cd7f32]', bg: 'bg-[#cd7f32]/10', border: 'border-[#cd7f32]' }
  if (points >= 100) rank = { nameKey: 'platinum', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400' }
  else if (points >= 50) rank = { nameKey: 'gold', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500' }
  else if (points >= 30) rank = { nameKey: 'silver', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400' }

  // ─── Admin Profile: Phương án D ──────────────────────────────────────────
  const renderAdminProfile = () => (
    <div className="space-y-6">
      {/* ─ Banner Header ─────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* Decorative stripe */}
        <div className="h-2 bg-gradient-to-r from-earth-forest via-earth-terracotta to-earth-sun" />
        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div
            className="relative flex-shrink-0 w-24 h-24 rounded-full bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center text-4xl text-earth-cream font-bold uppercase shadow-brutal-sm group cursor-pointer overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              : user?.full_name?.[0]}
            <div className="absolute inset-0 bg-earth-ink/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar
                ? <div className="w-6 h-6 border-[2px] border-earth-cream border-t-transparent rounded-full animate-spin" />
                : <Camera className="w-6 h-6 text-earth-cream" />}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/jpeg,image/png,image/webp" className="hidden" />
          </div>

          {/* Name block */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
              <h2 className="text-2xl font-bold text-earth-ink">{user?.full_name}</h2>
              <span className="badge-approved text-xs">Admin</span>
            </div>
            <p className="text-sm font-mono text-earth-ink/60 mt-1">@{user?.username}</p>
            <p className="text-xs text-earth-ink/50 font-mono mt-1">{user?.email}</p>
            {user?.department && (
              <p className="text-xs text-earth-ink/50 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                <Building2 className="w-3 h-3" /> {user.department}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {editMode ? (
              <>
                <button onClick={handleCancelEdit} className="btn-secondary flex items-center gap-1 text-sm px-3 py-2">
                  <X className="w-4 h-4" /> {t('profile.admin.cancelBtn')}
                </button>
                <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary flex items-center gap-1 text-sm px-3 py-2">
                  {savingProfile
                    ? <div className="w-4 h-4 border-[2px] border-white border-t-transparent rounded-full animate-spin" />
                    : <Save className="w-4 h-4" />}
                  {t('profile.admin.saveBtn')}
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="btn-secondary flex items-center gap-1 text-sm px-3 py-2">
                <Edit3 className="w-4 h-4" /> {t('profile.admin.editBtn')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─ Two-column grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ─ Account Info (editable) ─────────────────── */}
        <div className="card p-6">
          <h3 className="ui-title text-lg flex items-center gap-2 mb-5">
            <UserIcon className="w-5 h-5 text-earth-forest" /> {t('profile.admin.accountInfo')}
          </h3>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest block mb-1">{t('profile.admin.fullName')}</label>
              {editMode ? (
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  className="input w-full"
                  placeholder={t('profile.admin.fullNamePlaceholder')}
                />
              ) : (
                <p className="text-sm font-semibold text-earth-ink border-b border-earth-ink/10 pb-2">{user?.full_name || '—'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest flex items-center gap-1 mb-1">
                <Mail className="w-3 h-3" /> {t('profile.admin.email')}
              </label>
              {editMode ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="input w-full"
                  placeholder="email@domain.com"
                />
              ) : (
                <p className="text-sm text-earth-ink border-b border-earth-ink/10 pb-2 flex items-center gap-2">
                  {user?.email}
                  {user?.email_verified
                    ? <span className="flex items-center gap-1 text-[10px] text-earth-forest font-mono"><CheckCircle2 className="w-3 h-3" /> {t('profile.admin.emailVerified')}</span>
                    : <span className="flex items-center gap-1 text-[10px] text-earth-terracotta font-mono"><AlertCircle className="w-3 h-3" /> {t('profile.admin.emailNotVerified')}</span>}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest flex items-center gap-1 mb-1">
                <Building2 className="w-3 h-3" /> {t('profile.admin.department')}
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editForm.department}
                  onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                  className="input w-full"
                  placeholder={t('profile.admin.departmentPlaceholder')}
                />
              ) : (
                <p className="text-sm text-earth-ink border-b border-earth-ink/10 pb-2">{user?.department || '—'}</p>
              )}
            </div>

            {/* Username (readonly) */}
            <div>
              <label className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest block mb-1">{t('profile.admin.username')}</label>
              <p className="text-sm font-mono text-earth-ink/70 bg-earth-sand/30 px-3 py-2 border border-earth-ink/10 select-all">
                @{user?.username}
                <span className="text-[10px] ml-2 text-earth-ink/40">{t('profile.admin.usernameReadonly')}</span>
              </p>
            </div>

            {/* Role (readonly) */}
            <div>
              <label className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest block mb-1">{t('profile.admin.role')}</label>
              <p className="text-sm text-earth-ink border-b border-earth-ink/10 pb-2">
                <span className="badge-approved">{user?.role}</span>
              </p>
            </div>

            {/* Joined date */}
            {user?.created_at && (
              <div>
                <label className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> {t('profile.admin.createdAt')}
                </label>
                <p className="text-sm text-earth-ink/70 border-b border-earth-ink/10 pb-2">
                  {new Date(user.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─ Security Panel ──────────────────────────── */}
        <div className="card p-6">
          <h3 className="ui-title text-lg flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-earth-terracotta" /> {t('profile.admin.security')}
          </h3>

          <div className="space-y-4">
            {/* Password change */}
            <div className="border-[2px] border-earth-ink p-4 shadow-brutal-sm bg-earth-cream/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-earth-ink flex items-center gap-2">
                    <Lock className="w-4 h-4" /> {t('profile.admin.password')}
                  </p>
                  <p className="text-xs text-earth-ink/60 mt-1 font-mono">
                    {t('profile.admin.passwordHint')}
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="btn-secondary flex items-center gap-1 text-xs px-3 py-2 flex-shrink-0"
                >
                  <KeyRound className="w-3 h-3" /> {t('profile.changePassword')}
                </button>
              </div>
            </div>

            {/* Auth provider */}
            <div className="border-[1px] border-earth-ink/20 p-4">
              <p className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest mb-1">{t('profile.admin.authProvider')}</p>
              <p className="text-sm font-semibold text-earth-ink">
                {user?.auth_provider === 'google' ? t('profile.admin.authGoogle') : t('profile.admin.authLocal')}
              </p>
            </div>

            {/* Email verification status */}
            <div className="border-[1px] border-earth-ink/20 p-4">
              <p className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest mb-2">{t('profile.admin.emailVerification')}</p>
              {user?.email_verified ? (
                <div className="flex items-center gap-2 text-earth-forest">
                  <CheckCircle2 className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">{t('profile.admin.emailVerified')}</p>
                    <p className="text-xs text-earth-ink/50 font-mono">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-earth-terracotta">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">{t('profile.admin.emailNotVerified')}</p>
                    <p className="text-xs text-earth-ink/50 font-mono">{t('profile.admin.emailNotVerifiedHint')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Account status */}
            <div className="border-[1px] border-earth-ink/20 p-4">
              <p className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest mb-2">{t('profile.admin.accountStatus')}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-earth-forest animate-pulse" />
                <p className="text-sm font-semibold text-earth-forest">{user?.status}</p>
              </div>
            </div>

            {/* Avatar hint */}
            <div className="border-[1px] border-earth-ink/20 p-4">
              <p className="text-xs font-mono text-earth-ink/60 uppercase tracking-widest mb-1">{t('profile.admin.avatar')}</p>
              <p className="text-xs text-earth-ink/50">{t('profile.avatarConstraint')}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs text-earth-forest hover:underline font-mono font-bold flex items-center gap-1"
              >
                <Camera className="w-3 h-3" /> {t('profile.admin.updateAvatarBtn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Student / Staff profile (existing layout) ─────────────────────────
  const renderProfileCard = () => (
    <div className="card p-6 flex flex-col items-center text-center space-y-4">
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-24 h-24 rounded-full bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center text-4xl text-earth-cream font-bold uppercase shadow-brutal-sm relative group cursor-pointer overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            : user?.full_name?.[0]}
          <div className="absolute inset-0 bg-earth-ink/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploadingAvatar
              ? <div className="w-6 h-6 border-[2px] border-earth-cream border-t-transparent rounded-full animate-spin" />
              : <Camera className="w-6 h-6 text-earth-cream" />}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/jpeg,image/png,image/webp" className="hidden" />
        </div>
        <p className="text-xs text-earth-ink/60 font-mono mt-1 text-center max-w-[160px] whitespace-pre-line">
          {t('profile.avatarConstraint')}
        </p>
      </div>
      <div>
        <h2 className="text-xl font-bold text-earth-ink">{user?.full_name}</h2>
        <p className="text-sm font-mono text-earth-ink/60">@{user?.username}</p>
        <span className="inline-block mt-2 text-xs badge-approved">{user?.role}</span>
      </div>
      <button onClick={() => setShowPasswordModal(true)} className="w-full btn-secondary flex items-center justify-center gap-2 mt-4">
        <KeyRound className="w-4 h-4" /> {t('profile.changePassword')}
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="ui-title text-3xl">{t('profile.title')}</h1>
          <p className="text-earth-ink/70 mt-1">{t('profile.subtitle')}</p>
        </div>
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('profile.backToDashboard')}
        </Link>
      </div>

      {isAdmin ? renderAdminProfile() : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            {renderProfileCard()}
            <div className="card p-6 mt-6">
              <h3 className="ui-title text-lg flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-earth-terracotta" /> {t('profile.currentRank')}
              </h3>
              <div className={`p-4 border-[2px] ${rank.border} ${rank.bg} flex flex-col items-center justify-center shadow-brutal-sm`}>
                <Star className={`w-10 h-10 ${rank.color} mb-2`} fill="currentColor" />
                <span className={`text-xl font-bold uppercase tracking-widest ${rank.color}`}>{t(`profile.rank.${rank.nameKey}`)}</span>
              </div>
              <div className="mt-4 text-center">
                <span className="text-4xl font-display text-earth-ink">{points}</span>
                <span className="text-sm text-earth-ink/60 ml-2 font-mono uppercase">{t('profile.points')}</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="card p-6 h-full flex flex-col">
              <h3 className="ui-title text-xl flex items-center gap-2 mb-4">
                <History className="w-5 h-5" /> {t('profile.pointHistory')}
              </h3>
              {loading ? (
                <div className="flex-1 flex justify-center items-center">
                  <div className="w-8 h-8 border-[3px] border-earth-ink border-t-earth-forest rounded-full animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-earth-ink/50 py-12">
                  <History className="w-12 h-12 mb-4 opacity-20" />
                  <p>{t('profile.noPoints')}</p>
                  <Link to="/surveys" className="text-earth-forest font-bold hover:underline mt-2">{t('profile.earnPointsLink')}</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-earth-sand/30 border-b-[2px] border-earth-ink text-left text-xs font-mono uppercase tracking-widest text-earth-ink/70">
                        <th className="p-3">{t('profile.table.date')}</th>
                        <th className="p-3">{t('profile.table.action')}</th>
                        <th className="p-3 text-right">{t('profile.table.points')}</th>
                        <th className="p-3">{t('profile.table.note')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b-[1px] border-earth-ink/20 hover:bg-earth-cream transition-colors text-sm">
                          <td className="p-3 whitespace-nowrap text-earth-ink/70 font-mono text-xs">{new Date(log.created_at).toLocaleDateString()}</td>
                          <td className="p-3 font-semibold text-earth-ink">{log.action_type.replace('_', ' ')}</td>
                          <td className="p-3 text-right font-bold text-earth-forest">+{log.points}</td>
                          <td className="p-3 text-earth-ink/70 max-w-xs truncate" title={log.note}>{log.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-3">
            <div className="card p-6">
              <h3 className="ui-title text-xl flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-earth-sun" /> {t('profile.badges')}
              </h3>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-[3px] border-earth-ink border-t-earth-forest rounded-full animate-spin" />
                </div>
              ) : badges.length === 0 ? (
                <p className="text-center text-earth-ink/50 py-4 font-mono">{t('profile.noBadges')}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {badges.map(badge => (
                    <div key={badge.id} className={`border-[2px] border-earth-ink p-4 flex flex-col items-center text-center shadow-brutal-sm transition-all duration-300 ${badge.is_earned ? 'bg-white transform hover:-translate-y-1' : 'bg-earth-sand/30 grayscale opacity-60'}`}>
                      <div className="text-4xl mb-3">{badge.icon_emoji}</div>
                      <h4 className={`font-bold mb-1 ${badge.is_earned ? 'text-earth-terracotta' : 'text-earth-ink'}`}>
                        {t(`badgesData.${badge.id}.name`, { defaultValue: badge.name })}
                      </h4>
                      <p className="text-xs text-earth-ink/70 mb-3">
                        {t(`badgesData.${badge.id}.desc`, { defaultValue: badge.description })}
                      </p>
                      {badge.is_earned
                        ? <span className="text-[10px] font-mono font-bold text-earth-forest uppercase bg-earth-cream px-2 py-1 border-[1px] border-earth-forest mt-auto">{t('profile.earnedAt')} {new Date(badge.earned_at).toLocaleDateString()}</span>
                        : <span className="text-[10px] font-mono text-earth-ink/50 uppercase mt-auto border-[1px] border-earth-ink/20 px-2 py-1 bg-white/50">{t('profile.notEarned')}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  )
}
