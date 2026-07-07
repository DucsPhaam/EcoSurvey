import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Leaf, Bell, Moon, Sun, LogOut, KeyRound, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import api from '../../services/axiosInstance'
import ChangePasswordModal from '../features/ChangePasswordModal'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showChangePwd, setShowChangePwd] = useState(false)
  const notifRef  = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications?limit=8')
        setNotifications(res.data.notifications)
        setUnreadCount(res.data.unread_count)
      } catch { /* ignore */ }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60000) // poll every minute
    return () => clearInterval(interval)
  }, [user])

  // Close panels on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkAllRead = async () => {
    await api.patch('/notifications/read-all')
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })))
    setUnreadCount(0)
  }

  const navLinks = isAdmin
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/users', label: 'Users' }, { to: '/admin/surveys', label: 'Surveys' }, { to: '/admin/participations', label: 'Reports' }]
    : [{ to: '/dashboard', label: 'Dashboard' }, { to: '/surveys', label: 'Surveys' }, { to: '/participations', label: 'My Reports' }, { to: '/leaderboard', label: 'Leaderboard' }]

  return (
    <>
    <header className="sticky top-0 z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-400 
              flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-green transition-all duration-300">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg gradient-text">EcoSurvey</span>
              {isAdmin && <span className="ml-1.5 text-xs badge-approved">Admin</span>}
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                             : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle theme">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 card shadow-card-hover animate-slide-down z-50">
                  <div className="p-4 flex items-center justify-between border-b dark:border-gray-800">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-brand-600 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-400 text-center">No notifications yet.</p>
                    ) : notifications.map((n) => (
                      <div key={n.id} className={`p-4 border-b dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.is_read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                        <p className={`text-sm font-medium ${!n.is_read ? 'text-brand-700 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative flex items-center gap-2 pl-2 border-l dark:border-gray-700" ref={userMenuRef}>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none">{user?.full_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.role}</p>
              </div>
              <button onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
                  {user?.full_name?.[0]?.toUpperCase()}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 card shadow-card-hover animate-slide-down z-50">
                  <div className="p-3 border-b dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); setShowChangePwd(true) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <KeyRound className="w-4 h-4" /> Change Password
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); logout() }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
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
