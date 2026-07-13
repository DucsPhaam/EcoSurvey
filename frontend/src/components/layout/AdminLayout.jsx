import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList,
  FileText, HelpCircle, Leaf,
} from 'lucide-react'
import Navbar from './Navbar'
import FAQChatWidget from '../features/FAQChatWidget'

const navItems = [
  { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/users',        label: 'Users',         icon: Users },
  { to: '/admin/surveys',      label: 'Surveys',       icon: ClipboardList },
  { to: '/admin/participations', label: 'Reports',     icon: FileText },
  { to: '/admin/faqs',         label: 'FAQs',          icon: HelpCircle },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-earth-paper flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-earth-cream border-r-[3px] border-earth-ink flex-shrink-0 hidden lg:block">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center">
                <Leaf className="w-4 h-4 text-earth-cream" />
              </div>
              <span className="ui-title text-earth-forest">Admin Panel</span>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60 mb-6">EcoSurvey Management</p>
            <nav className="space-y-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to} to={to} end={end}
                  className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <FAQChatWidget />
    </div>
  )
}
