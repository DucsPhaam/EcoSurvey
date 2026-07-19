import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList,
  FileText, HelpCircle, Leaf,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'
import FAQChatWidget from '../features/FAQChatWidget'

export default function AdminLayout() {
  const { t } = useTranslation('nav')

  const navItems = [
    { to: '/admin',              label: t('dashboard'),     icon: LayoutDashboard, end: true },
    { to: '/admin/users',        label: t('users'),         icon: Users },
    { to: '/admin/surveys',      label: t('surveys'),       icon: ClipboardList },
    { to: '/admin/participations', label: t('participations'),     icon: FileText },
    { to: '/admin/faqs',         label: t('faqs'),          icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-earth-paper flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-earth-cream border-r-[3px] border-earth-ink flex-shrink-0 hidden lg:block" role="complementary" aria-label="Admin sidebar">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center">
                <Leaf className="w-4 h-4 text-earth-cream" aria-hidden="true" />
              </div>
              <span className="ui-title text-earth-forest">{t('adminPanel')}</span>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60 mb-6">{t('management')}</p>
            <nav className="space-y-1" aria-label="Admin navigation">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to} to={to} end={end}
                  className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main id="main-content" className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <FAQChatWidget />
    </div>
  )
}
