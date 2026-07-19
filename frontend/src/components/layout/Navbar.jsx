import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Leaf, Bell, Moon, Sun, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { notificationService } from '../../services/notificationService'
import ChangePasswordModal from '../features/ChangePasswordModal'
import { useSocket } from '../../contexts/SocketContext'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showChangePwd, setShowChangePwd] = useState(false)
  const notifRef  = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      try {
        const res = await notificationService.getNotifications({ limit: 8 })
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unread_count)
      } catch { /* ignore */ }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60000)
    return () => clearInterval(interval)
  }, [user])

  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleNewNotif = (notif) => {
      // Add new notification to the list, increment unread count
      setNotifications((prev) => [notif, ...prev].slice(0, 8))
      setUnreadCount((prev) => prev + 1)
      toast.success(notif.title, {
        icon: '🔔',
        style: {
          border: '2px solid #202020',
          boxShadow: '4px 4px 0px #202020',
          borderRadius: '0',
          padding: '16px',
        },
      })
    }

    socket.on('new_notification', handleNewNotif)

    return () => {
      socket.off('new_notification', handleNewNotif)
    }
  }, [socket])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead()
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })))
    setUnreadCount(0)
  }

  const navLinks = isAdmin
    ? [{ to: '/admin', label: t('nav.dashboard') }, { to: '/admin/users', label: t('nav.users') }, { to: '/admin/surveys', label: t('nav.surveys') }, { to: '/admin/participations', label: t('nav.participations') }]
    : [{ to: '/dashboard', label: t('nav.dashboard') }, { to: '/surveys', label: t('nav.surveys') }, { to: '/participations', label: t('nav.participations') }, { to: '/leaderboard', label: t('nav.leaderboard') }]

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-50 bg-earth-paper border-b-[3px] border-earth-ink" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-transform">
                <Leaf className="w-5 h-5 text-earth-cream" aria-hidden="true" />
              </div>
              <div>
                <span className="font-display text-lg uppercase text-earth-ink">EcoSurvey</span>
                {isAdmin && <span className="ml-1.5 text-xs badge-approved">Admin</span>}
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map(({ to, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `px-4 py-2 border-[2px] text-sm ui-title transition-all ${
                      isActive
                        ? 'bg-earth-forest text-earth-paper border-earth-ink'
                        : 'bg-earth-paper text-earth-ink border-transparent hover:border-earth-ink hover:bg-earth-cream'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

              {/* Right actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
                className="p-2 border-[2px] border-transparent text-earth-ink hover:border-earth-ink hover:bg-earth-cream transition-colors font-bold text-sm uppercase"
                title="Change Language">
                {i18n.language === 'vi' ? 'VI' : 'EN'}
              </button>

              <button onClick={toggleTheme}
                className="p-2 border-[2px] border-transparent text-earth-ink hover:border-earth-ink hover:bg-earth-cream transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                title="Toggle theme">
                {theme === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen((o) => !o)}
                  className="relative p-2 border-[2px] border-transparent text-earth-ink hover:border-earth-ink hover:bg-earth-cream transition-colors"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  aria-expanded={notifOpen}
                  aria-haspopup="true">
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-earth-terracotta text-earth-paper text-[10px] font-bold border border-earth-ink flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 card shadow-brutal animate-slide-up z-50">
                    <div className="p-4 flex items-center justify-between border-b-[2px] border-earth-ink/20">
                      <h3 className="ui-title text-sm">{t('nav.notifications')}</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-earth-forest ui-title hover:underline">
                          {t('nav.markAllRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm font-mono uppercase tracking-widest text-earth-ink/60 text-center">{t('nav.noNotifications')}</p>
                      ) : notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b-[2px] border-earth-ink/20 last:border-0 hover:bg-earth-cream transition-colors ${!n.is_read ? 'bg-earth-sand/40' : ''}`}>
                          <p className={`text-sm font-semibold ${!n.is_read ? 'text-earth-forest' : 'text-earth-ink'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-earth-ink/70 mt-0.5">{n.message}</p>
                          <p className="text-xs font-mono uppercase tracking-widest text-earth-ink/50 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative flex items-center gap-2 pl-2 border-l-[3px] border-earth-ink/30" ref={userMenuRef}>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-earth-ink leading-none">{user?.full_name}</p>
                  <p className="text-xs font-mono uppercase tracking-widest text-earth-ink/60 mt-0.5">{user?.role}</p>
                </div>
                <button onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1 group"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true">
                  <div className="w-9 h-9 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center text-earth-cream font-bold text-sm overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.full_name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-earth-ink transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
                  <div className="absolute right-0 top-full mt-2 w-52 card shadow-brutal animate-slide-up z-50" role="menu" aria-label="User menu">
                    <div className="p-3 border-b-[2px] border-earth-ink/20">
                      <p className="text-sm font-semibold text-earth-ink truncate">{user?.full_name}</p>
                      <p className="text-xs font-mono uppercase tracking-widest text-earth-ink/60">{user?.role}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-earth-ink hover:bg-earth-cream transition-colors">
                        <UserIcon className="w-4 h-4" /> {t('nav.myProfile')}
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); logout() }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-earth-terracotta hover:bg-earth-cream transition-colors">
                        <LogOut className="w-4 h-4" /> {t('nav.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
    </>
  )
}
