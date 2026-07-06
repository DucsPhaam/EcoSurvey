import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ClipboardCheck, FileText, Star, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/axiosInstance'
import { SpinnerPage } from '../../components/ui/Spinner'

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:  'from-brand-500 to-brand-600',
    amber:  'from-amber-400 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
    teal:   'from-teal-400 to-cyan-500',
  }
  return (
    <div className="card p-6 flex items-center gap-4 hover:shadow-card-hover transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg flex-shrink-0`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function MyDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <SpinnerPage />

  const partStats = data?.participation_stats || []
  const approved = partStats.find((s) => s.status === 'Approved')?.count || 0
  const pending  = partStats.find((s) => s.status === 'Pending')?.count  || 0

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's your environmental impact summary.</p>
        </div>
        <Link to="/surveys" className="btn-primary hidden sm:inline-flex">
          Browse Surveys <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Star}          label="Total Points"         value={data?.total_points || 0}            color="brand" />
        <StatCard icon={Trophy}        label="Current Rank"         value={data?.rank ? `#${data.rank}` : '—'} color="amber" sub="on the leaderboard" />
        <StatCard icon={ClipboardCheck} label="Surveys Completed"  value={data?.surveys_completed || 0}        color="teal" />
        <StatCard icon={FileText}      label="Reports Approved"     value={approved}                            color="purple" sub={`${pending} pending`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" /> Recent Activity
            </h2>
          </div>
          {data?.recent_activity?.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No activity yet. Complete a survey to get started!</p>
              <Link to="/surveys" className="btn-primary mt-4 text-sm">View Surveys</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.recent_activity || []).map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    a.points > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {a.points > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{a.note || a.action_type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold ${a.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {a.points >= 0 ? '+' : ''}{a.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-500" /> Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { to: '/surveys',                label: 'Take a Survey',       icon: ClipboardCheck, sub: `${data?.surveys_available || 0} available` },
                { to: '/participations/submit',  label: 'Submit Activity Report', icon: FileText, sub: 'Earn 50 points' },
                { to: '/leaderboard',            label: 'View Leaderboard',    icon: Trophy, sub: `You're #${data?.rank || '?'}` },
                { to: '/participations',         label: 'My Reports',          icon: AlertCircle, sub: `${pending} pending` },
              ].map(({ to, label, icon: Icon, sub }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/40 transition-colors">
                    <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Points progress */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Points Breakdown
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>From Surveys</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{(data?.surveys_completed || 0) * 10} pts</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>From Reports</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{approved * 50} pts</span>
              </div>
              <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-bold">
                <span className="text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-brand-600 dark:text-brand-400">{data?.total_points || 0} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
