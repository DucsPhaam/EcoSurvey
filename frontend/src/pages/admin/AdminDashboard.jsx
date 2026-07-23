import { useEffect, useState } from 'react'
import { Users, ClipboardList, FileText, TrendingUp, AlertCircle, BarChart2, Download } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { dashboardService } from '../../services/dashboardService'
import { exportService, downloadBlob } from '../../services/exportService'
import { SpinnerPage } from '../../components/ui/Spinner'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const COLORS = ['#1a7f4b', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

// Fix: dùng axios (gửi Bearer token) thay vì <a href> — browser navigation không gửi auth header
const downloadFile = async (fn, filename, t) => {
  try {
    const res = await fn()
    downloadBlob(res.data, filename)
  } catch (err) {
    toast.error(err.response?.data?.message || t('adminDashboard.exportFailed'))
  }
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = { green: 'from-brand-500 to-brand-600', amber: 'from-amber-400 to-orange-500', blue: 'from-blue-500 to-cyan-500', purple: 'from-purple-500 to-pink-500' }
  return (
    <div className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color] || colors.green} flex items-center justify-center shadow-lg flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { t } = useTranslation('admin')
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getDashboard().then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <SpinnerPage />

  const totalUsers   = data?.total_users || 0
  const surveys      = data?.surveys_by_status || []
  const roles        = data?.users_by_role    || []
  const statuses     = data?.users_by_status  || []
  const chartData    = (data?.chart_daily_responses || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    responses: parseInt(d.count),
  }))
  const published = surveys.find((s) => s.status === 'Published')?.count || 0
  const draft     = surveys.find((s) => s.status === 'Draft')?.count    || 0
  const closed    = surveys.find((s) => s.status === 'Closed')?.count   || 0

  const roleData   = roles.map((r)   => ({ name: r.role,   value: parseInt(r.count) }))
  const statusData = statuses.map((s) => ({ name: s.status, value: parseInt(s.count) }))

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadFile(() => exportService.exportParticipationsPDF(), 'participations_report.pdf', t)}
            className="btn-secondary text-sm">
            <Download className="w-4 h-4" /> {t('dashboard.exportPdf')}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}        label={t('dashboard.totalUsers')}          value={totalUsers}                          color="green" />
        <StatCard icon={ClipboardList} label={t('dashboard.totalSurveys')}   value={published} sub={`${draft} ${t('dashboard.draft')}, ${closed} ${t('dashboard.closed')}`} color="blue" />
        <StatCard icon={TrendingUp}   label={t('dashboard.responses7d')}   value={data?.recent_responses_7d || 0}       color="purple" />
        <StatCard icon={AlertCircle}  label={t('dashboard.pendingReports')}      value={data?.pending_participations || 0} sub={t('dashboard.awaitingReview')} color="amber" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Line chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-500" /> {t('dashboard.surveyResponses')}
          </h2>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">{t('dashboard.noData')}</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="responses" stroke="#1a7f4b" strokeWidth={2.5} dot={{ fill: '#1a7f4b', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart: users by role */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">{t('dashboard.usersByRole')}</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" nameKey="name">
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart: surveys by status */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">{t('dashboard.surveysByStatus')}</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={surveys.map((s) => ({ status: s.status, count: parseInt(s.count) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a7f4b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick admin actions */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-2">
            {[
              { to: '/admin/users?status=Pending', label: t('dashboard.reviewPendingAccounts'), icon: Users, badge: statuses.find((s) => s.status === 'Pending')?.count },
              { to: '/admin/participations?status=Pending', label: t('dashboard.reviewPendingReports'), icon: FileText, badge: data?.pending_participations },
              { to: '/admin/surveys/new',    label: t('dashboard.createNewSurvey'),  icon: ClipboardList },
              { to: '/admin/faqs',           label: t('dashboard.manageFaqs'),        icon: AlertCircle },
            ].map(({ to, label, icon: Icon, badge }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                {badge > 0 && <span className="badge-pending">{badge}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
