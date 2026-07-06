import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList,
  FileText, HelpCircle, Menu, X, Leaf,
} from 'lucide-react'
import { useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 
          bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 
          flex-shrink-0 hidden lg:block`}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-brand-700 dark:text-brand-400">Admin Panel</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">EcoSurvey Management</p>
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
