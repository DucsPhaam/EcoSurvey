import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ClipboardCheck, FileText, Star, TrendingUp, ArrowRight, ArrowUpRight, AlertCircle, Zap, Leaf, Activity } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardService } from '../../services/dashboardService'
import { SpinnerPage } from '../../components/ui/Spinner'
import { useTranslation } from 'react-i18next'

function ImpactStat({ num, label, sub, tone = 'forest' }) {
  const tones = {
    forest: 'bg-earth-forest text-earth-paper',
    clay:   'bg-earth-clay text-earth-paper',
    moss:   'bg-earth-moss text-earth-paper',
    terra:  'bg-earth-terracotta text-earth-paper',
  }
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className={`absolute top-0 right-0 px-2 py-1 ${tones[tone]} font-mono text-[10px] uppercase tracking-widest`}>
        /stat
      </div>
      <p className="impact-num">{num}</p>
      <p className="ui-title text-sm mt-2">{label}</p>
      {sub && <p className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60 mt-1">{sub}</p>}
    </div>
  )
}

export default function MyDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getDashboard().then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <SpinnerPage />

  const partStats = data?.participation_stats || []
  const approved = partStats.find((s) => s.status === 'Approved')?.count || 0
  const pending  = partStats.find((s) => s.status === 'Pending')?.count  || 0
  const rejected = partStats.find((s) => s.status === 'Rejected')?.count || 0
  const points = data?.total_points || 0
  const rank = data?.rank

  // Personal impact numbers (derived from user data)
  const co2Estimate = (approved * 2.4).toFixed(1)
  const treesEquivalent = Math.floor(approved * 0.04)

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="card p-6 md:p-8 relative">
        <div className="stamp top-4 right-4 bg-earth-terracotta text-earth-paper">Live</div>
        <p className="font-mono text-sm uppercase tracking-widest text-earth-ink/60">Dashboard</p>
        <h1 className="page-title mt-2">{t('dashboard.welcome')}, {user?.full_name?.split(' ')[0]}.</h1>
        <p className="page-subtitle">{t('dashboard.yourImpact')}</p>
      </div>

      {/* Personal Impact Numbers */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-widest text-earth-ink/60">{t('dashboard.yourImpact')}</p>
            <h2 className="font-display text-3xl uppercase mt-1">{t('dashboard.personalNumbers')}</h2>
          </div>
          <Link to="/leaderboard" className="hidden sm:inline-flex ui-title text-sm border-b-[3px] border-earth-ink pb-0.5 hover:text-earth-forest">
            {t('dashboard.seeLeaderboard')} <ArrowUpRight className="inline w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ImpactStat num={points} label={t('dashboard.pointsEarned')} sub={t('dashboard.lifetime')} tone="forest" />
          <ImpactStat num={data?.surveys_completed || 0} label={t('dashboard.surveysTaken')} sub={t('dashboard.completed')} tone="moss" />
          <ImpactStat num={approved} label={t('dashboard.reportsApproved')} sub={`${pending} ${t('dashboard.pendingStatus', { defaultValue: t('dashboard.pending') })}`} tone="clay" />
          <ImpactStat num={rank ? `#${rank}` : '—'} label={t('dashboard.leaderboardRank')} sub={t('dashboard.campusWide')} tone="terra" />
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="bg-earth-forest text-earth-paper border-[3px] border-earth-ink shadow-brutal p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(250,246,233,0.3) 12px 14px)'
        }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-earth-cream" />
            <p className="font-mono text-sm uppercase tracking-widest opacity-90">{t('dashboard.estimatedFootprint')}</p>
          </div>
          <h2 className="font-display text-3xl md:text-4xl uppercase">{t('dashboard.environmentalImpact')}</h2>
          <p className="font-mono text-sm opacity-80 mt-2 max-w-2xl">
            {t('dashboard.envDesc')}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="border-l-[3px] border-earth-cream pl-4">
              <p className="font-display text-5xl md:text-6xl">{co2Estimate}</p>
              <p className="font-mono text-xs uppercase tracking-widest mt-2 opacity-90">{t('dashboard.kgCO2')}</p>
            </div>
            <div className="border-l-[3px] border-earth-cream pl-4">
              <p className="font-display text-5xl md:text-6xl">{treesEquivalent}</p>
              <p className="font-mono text-xs uppercase tracking-widest mt-2 opacity-90">{t('dashboard.treesEq')}</p>
            </div>
            <div className="border-l-[3px] border-earth-cream pl-4">
              <p className="font-display text-5xl md:text-6xl">{approved}</p>
              <p className="font-mono text-xs uppercase tracking-widest mt-2 opacity-90">{t('dashboard.activitiesLabel')}</p>
            </div>
            <div className="border-l-[3px] border-earth-cream pl-4">
              <p className="font-display text-5xl md:text-6xl">{Math.floor(points / 10)}</p>
              <p className="font-mono text-xs uppercase tracking-widest mt-2 opacity-90">{t('dashboard.impactCredits')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl uppercase flex items-center gap-2">
              <Activity className="w-5 h-5" /> {t('dashboard.recentActivities')}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60">{t('dashboard.last5')}</span>
          </div>
          {data?.recent_activity?.length === 0 ? (
            <div className="text-center py-10 text-earth-ink/60">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="ui-title">{t('dashboard.noActivityYet')}</p>
              <p className="font-mono text-xs uppercase tracking-widest mt-1">{t('dashboard.completeSurvey')}</p>
              <Link to="/surveys" className="btn-primary mt-4 text-sm">{t('dashboard.viewSurveysBtn')}</Link>
            </div>
          ) : (
            <div className="space-y-0">
              {(data?.recent_activity || []).map((a, i) => (
                <div key={a.id} className={`flex items-center gap-4 p-3 ${i !== 0 ? 'border-t-[2px] border-earth-ink/20' : ''}`}>
                  <div className={`w-10 h-10 border-[3px] border-earth-ink flex items-center justify-center flex-shrink-0 ${
                    a.points > 0 ? 'bg-earth-moss text-earth-paper' : 'bg-earth-terracotta text-earth-paper'}`}>
                    {a.points > 0 ? <TrendingUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="ui-title text-sm truncate">{a.note || a.action_type?.replace('_', ' ')}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 border-2 border-earth-ink font-display text-sm ${a.points >= 0 ? 'bg-earth-moss text-earth-paper' : 'bg-earth-terracotta text-earth-paper'}`}>
                    {a.points >= 0 ? '+' : ''}{a.points} {t('dashboard.pts')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-xl uppercase mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" /> {t('dashboard.quickActions')}
            </h2>
            <div className="space-y-0">
              {[
                { to: '/surveys',                label: t('survey.takeSurvey'),        sub: `${data?.surveys_available || 0} ${t('dashboard.available')}` },
                { to: '/participations/submit',  label: t('nav.participations'),      sub: t('dashboard.earn50Pts') },
                { to: '/leaderboard',            label: t('dashboard.seeLeaderboard'),     sub: `${t('dashboard.youAreRank')}${rank || '?'}` },
                { to: '/participations',         label: t('nav.participations'),           sub: `${pending} ${t('dashboard.pending')}` },
              ].map(({ to, label, sub }, i) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 p-3 hover:bg-earth-cream transition-colors group ${i !== 0 ? 'border-t-[2px] border-earth-ink/20' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="ui-title text-sm">{label}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60">{sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" /> {t('dashboard.pointsBreakdown')}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between border-b-[2px] border-earth-ink/20 pb-2">
                <span className="font-mono text-xs uppercase tracking-widest">{t('dashboard.fromSurveys')}</span>
                <span className="font-display">{(data?.surveys_completed || 0) * 10} {t('dashboard.pts')}</span>
              </div>
              <div className="flex justify-between border-b-[2px] border-earth-ink/20 pb-2">
                <span className="font-mono text-xs uppercase tracking-widest">{t('dashboard.fromReports')}</span>
                <span className="font-display">{approved * 50} {t('dashboard.pts')}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="ui-title">{t('dashboard.total')}</span>
                <span className="font-display text-xl text-earth-forest">{points} {t('dashboard.pts')}</span>
              </div>
            </div>
          </div>

          {rejected > 0 && (
            <div className="card p-5 bg-earth-sand">
              <p className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60">{t('dashboard.headsUp')}</p>
              <p className="font-display uppercase mt-1">{rejected} {t('dashboard.rejectedStatus')}</p>
              <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/70 mt-1">{t('dashboard.reviewResubmit')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

