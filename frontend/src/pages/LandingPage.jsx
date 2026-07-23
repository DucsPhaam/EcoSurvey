import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf, ArrowRight, ArrowUpRight, CheckCircle2, BarChart3, Trophy,
  MessageCircle, Shield, Zap, Sparkles, ChevronDown, Mail, Loader2, CheckCheck,
  Users, Clock, GraduationCap, Briefcase,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LandingChatWidget from '../components/features/LandingChatWidget'
import { homepageService } from '../services/homepageService'
import { faqService } from '../services/faqService'
import { newsletterService } from '../services/newsletterService'
import { useInView } from '../hooks/useInView'

const features = [
  { icon: CheckCircle2, title: 'Online Surveys',   desc: 'Take environmental awareness surveys anytime, anywhere.', num: '01' },
  { icon: BarChart3,    title: 'Live Dashboard',   desc: 'Track points, progress and participation in real time.',     num: '02' },
  { icon: Trophy,       title: 'Leaderboard',      desc: 'Compete with peers on the sustainability scoreboard.',       num: '03' },
  { icon: MessageCircle,title: 'AI Assistant',     desc: 'Instant answers from an AI powered FAQ chatbot.',           num: '04' },
  { icon: Shield,       title: 'Secure & Private', desc: 'JWT auth with role based access for your data.',            num: '05' },
  { icon: Zap,          title: 'Instant Points',   desc: 'Earn points for every survey and approved report.',         num: '06' },
]

const steps = [
  { n: '01', t: 'Register',     d: 'Create an account. Wait for admin approval.' },
  { n: '02', t: 'Participate',  d: 'Take surveys. Submit green activity reports.' },
  { n: '03', t: 'Earn & Lead',  d: 'Stack up points. Climb the leaderboard.' },
]

function formatStat(n) {
  if (n == null) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`
  return `${n}+`
}

function formatDate(d) {
  if (!d) return null
  const dt = new Date(d)
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function timeAgo(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

const AVATAR_PALETTE = ['bg-earth-forest', 'bg-earth-moss', 'bg-earth-terracotta', 'bg-earth-clay', 'bg-earth-ink']

function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b-[2px] border-earth-ink/20 last:border-0 group">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-4 text-left transition-colors duration-300 hover:text-earth-forest"
      >
        <span className="font-display text-lg md:text-xl uppercase pr-2">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-earth-forest' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="pb-4 text-earth-ink/80 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { t } = useTranslation('landing')
  const [stats, setStats]             = useState(null)
  const [topSurveys, setTopSurveys]   = useState([])
  const [faqs, setFaqs]               = useState([])
  const [statsErr, setStatsErr]       = useState(false)
  const [respondents, setRespondents] = useState([])
  const [respondentsErr, setRespondentsErr] = useState(false)

  // newsletter form state
  const [email, setEmail]             = useState('')
  const [subState, setSubState]       = useState({ status: 'idle', message: '' })

  // Scroll-triggered visibility refs
  const [impactRef, impactInView]     = useInView()
  const [liveFeedRef, liveFeedInView] = useInView()
  const [trendingRef, trendingInView] = useInView()
  const [featuresRef, featuresInView] = useInView()
  const [howItWorksRef, howInView]   = useInView()
  const [faqRef, faqInView]           = useInView()
  const [newsletterRef, newsletterInView] = useInView()
  const [ctaRef, ctaInView]           = useInView()

  useEffect(() => {
    let alive = true
    homepageService.getStats()
      .then((r) => { if (alive) setStats(r.data) })
      .catch(() => { if (alive) setStatsErr(true) })
    homepageService.getTopSurveys()
      .then((r) => { if (alive) setTopSurveys(r.data?.surveys || []) })
      .catch(() => { if (alive) setTopSurveys([]) })
    homepageService.getRecentRespondents()
      .then((r) => { if (alive) setRespondents(r.data?.respondents || []) })
      .catch(() => { if (alive) { setRespondents([]); setRespondentsErr(true) } })
    faqService.getPublicFAQs()
      .then((r) => { if (alive) setFaqs(r.data?.faqs || []) })
      .catch(() => { if (alive) setFaqs([]) })
    return () => { alive = false }
  }, [])

  // Live impact numbers — driven by stats, with fallback
  const liveStats = stats ? [
    { value: formatStat(stats.responses_collected), label: t('liveStats.responsesCollected') },
    { value: formatStat(stats.users_active),        label: t('liveStats.activeVolunteers') },
    { value: formatStat(stats.surveys_published),   label: t('liveStats.surveysLive') },
    { value: formatStat(stats.institutions),        label: t('liveStats.departmentsJoined') },
  ] : null

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (subState.status === 'loading') return
    setSubState({ status: 'loading', message: '' })
    try {
      const r = await newsletterService.subscribe(email)
      setSubState({ status: 'success', message: r.data.message })
      setEmail('')
    } catch (err) {
      setSubState({
        status: 'error',
        message: err.response?.data?.message || 'Something went wrong. Try again.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-earth-paper text-earth-ink">
      {/* Marquee bar */}
      <div className="bg-earth-ink text-earth-cream overflow-hidden border-b-[3px] border-earth-ink">
        <div className="flex whitespace-nowrap py-2 animate-marquee ui-title text-sm">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span>{t('marquee.item1')}</span>
              <span>{t('marquee.item2')}</span>
              <span>{t('marquee.item3')}</span>
              <span>{t('marquee.item4')}</span>
              <span>{t('marquee.item5')}</span>
              <span>{t('marquee.item6')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="border-b-[3px] border-earth-ink bg-earth-paper/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center shadow-brutal-sm transition-shadow duration-300 group-hover:shadow-brutal">
              <Leaf className="w-6 h-6 text-earth-cream transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div>
              <p className="font-display text-xl uppercase leading-none">EcoSurvey</p>
              <p className="font-mono text-sm uppercase tracking-widest mt-0.5">{t('header.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-block ui-title text-sm px-4 py-2 hover:bg-earth-cream hover:border-earth-ink transition-all duration-300 border-2 border-transparent">
              {t('header.signIn')}
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5 transition-all duration-300 hover:-translate-y-0.5">
              {t('header.getStarted')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b-[3px] border-earth-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #2d6a4f 0%, transparent 50%), radial-gradient(circle at 80% 50%, #bc6c25 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-8 relative">
            <div className="tape -top-2 left-0 z-10 opacity-0 animate-fade-in">{t('hero.tag')}</div>
            <h1 className="font-display text-6xl sm:text-8xl leading-[0.9] uppercase tracking-tight opacity-0 animate-fade-in-up">
              {t('hero.title1')}<br />
              {t('hero.title2')}<br />
              <span className="inline-block bg-earth-forest text-earth-cream px-3 py-1 mt-2 opacity-0 animate-soft-bounce" style={{ animationDelay: '0.3s' }}>{t('hero.title3')}</span>{' '}
              {t('hero.title4')}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              {t('hero.desc')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/register" className="btn-primary text-base px-8 py-3 transition-all duration-300 hover:-translate-y-0.5">
                {t('hero.startSurveying')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3 transition-all duration-300 hover:-translate-y-0.5">
                {t('hero.haveAccount')} <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 relative">
            <div className="bg-earth-cream border-[3px] border-earth-ink shadow-brutal-lg p-6 relative opacity-0 animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
              <div className="stamp -top-3 -right-3 bg-earth-terracotta text-earth-paper opacity-0 animate-soft-bounce" style={{ animationDelay: '0.5s' }}>{t('liveStats.live')}</div>
              <p className="font-mono text-sm uppercase tracking-widest mb-3">{t('liveStats.impactTracker')}</p>
              <div className="space-y-4">
                {liveStats ? (
                  liveStats.map(({ value, label }) => (
                    <div key={label} className="border-b-[2px] border-earth-ink/30 pb-3 last:border-0">
                      <p className="impact-num">{value}</p>
                      <p className="ui-title text-sm mt-1">{label}</p>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border-b-[2px] border-earth-ink/30 pb-3 last:border-0">
                      <div className="h-10 w-24 bg-earth-ink/10 animate-pulse" />
                      <div className="h-3 w-32 bg-earth-ink/10 animate-pulse mt-2" />
                    </div>
                  ))
                )}
              </div>
              {statsErr && !stats && (
                <p className="mt-3 font-mono text-sm text-earth-terracotta">
                  could not load live data — showing defaults
                </p>
              )}
            </div>
            <div className="mt-4 bg-earth-forest text-earth-paper border-[3px] border-earth-ink p-4 shadow-brutal-sm opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="ui-title text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-gentle-pulse" /> {t('liveStats.aiAssistant')}
              </p>
              <p className="font-mono text-sm mt-1">{t('liveStats.aiDesc')}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Impact strip — driven by /homepage/stats */}
      <section ref={impactRef} className="border-b-[3px] border-earth-ink bg-earth-forest text-earth-paper overflow-hidden">
        <div className={`max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 ${impactInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
          {liveStats ? (
            liveStats.map(({ value, label }, index) => (
              <div key={label} className={`border-l-[3px] border-earth-paper pl-4 transition-all duration-700 ${impactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: impactInView ? `${index * 100}ms` : '0ms' }}>
                <p className="font-display text-4xl md:text-5xl">{value}</p>
                <p className="font-mono text-sm uppercase tracking-widest mt-2 opacity-90">{label}</p>
              </div>
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border-l-[3px] border-earth-paper pl-4">
                <div className="h-10 w-20 bg-earth-paper/20 animate-pulse" />
                <div className="h-3 w-28 bg-earth-paper/20 animate-pulse mt-3" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Respondents — live feed of who just took a survey */}
      <section ref={liveFeedRef} className="border-b-[3px] border-earth-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className={`flex items-end justify-between mb-12 flex-wrap gap-4 transition-all duration-700 ${liveFeedInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <p className="font-mono text-sm uppercase tracking-widest mb-2">{t('liveFeed.tag')}</p>
              <h2 className="font-display text-5xl md:text-6xl uppercase">{t('liveFeed.title')}</h2>
            </div>
            <p className="max-w-md text-earth-ink/70">
              {t('liveFeed.desc')}
            </p>
          </div>

          {respondents.length === 0 ? (
            <div className={`card p-10 text-center transition-all duration-700 ${liveFeedInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '100ms' }}>
              {respondentsErr ? (
                <p className="font-mono text-sm text-earth-terracotta">
                  could not load live participation feed
                </p>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-earth-cream border-[3px] border-earth-ink mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="font-mono text-sm text-earth-ink/60">
                    {t('liveFeed.noResponses')}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {respondents.map((r, idx) => {
                const palette = AVATAR_PALETTE[idx % AVATAR_PALETTE.length]
                const RoleIcon = r.role === 'Staff' ? Briefcase : GraduationCap
                return (
                  <article
                    key={r.response_id}
                    className={`card p-5 hover:bg-earth-cream transition-all duration-300 flex gap-4 ${liveFeedInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: liveFeedInView ? `${idx * 80}ms` : '0ms' }}
                  >
                    <div
                      className={`shrink-0 w-12 h-12 ${palette} border-[3px] border-earth-ink flex items-center justify-center text-earth-paper font-display text-base`}
                      aria-hidden="true"
                    >
                      {getInitials(r.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-display text-base uppercase truncate group-hover:text-earth-forest transition-colors">
                          {r.full_name}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-earth-paper border border-earth-ink/40 font-mono text-[9px] uppercase tracking-widest text-earth-ink/70 shrink-0"
                          title={r.role}
                        >
                          <RoleIcon className="w-2.5 h-2.5" /> {r.role}
                        </span>
                      </div>
                      <p className="text-sm text-earth-ink/80 leading-snug line-clamp-2">
                        {t('liveFeed.completed')} <span className="font-semibold">{r.survey_title}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-earth-ink/50">
                        <span className="truncate">{r.department || t('liveFeed.campusWide')}</span>
                        <span className="inline-flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" /> {timeAgo(r.submitted_at)}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Top Surveys */}
      <section ref={trendingRef} className="border-b-[3px] border-earth-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className={`flex items-end justify-between mb-12 flex-wrap gap-4 transition-all duration-700 ${trendingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <p className="font-mono text-sm uppercase tracking-widest mb-2">{t('trending.tag')}</p>
              <h2 className="font-display text-5xl md:text-6xl uppercase">{t('trending.title')}</h2>
            </div>
            <p className="max-w-md text-earth-ink/70">
              {t('trending.desc')}
            </p>
          </div>

          {topSurveys.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 w-16 bg-earth-ink/10 mb-4" />
                  <div className="h-6 w-3/4 bg-earth-ink/10 mb-3" />
                  <div className="h-4 w-full bg-earth-ink/10 mb-2" />
                  <div className="h-4 w-5/6 bg-earth-ink/10 mb-6" />
                  <div className="h-10 w-32 bg-earth-ink/10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topSurveys.map((s, idx) => (
                <article key={s.id} 
                  className={`card p-6 group transition-all duration-500 ${trendingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: trendingInView ? `${idx * 100}ms` : '0ms' }}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="badge badge-published">
                      /{String(idx + 1).padStart(2, '0')} Trending
                    </span>
                    <span className="font-mono text-2xl text-earth-ink/40">
                      {s.response_count}
                    </span>
                  </div>
                  <h3 className="font-display text-xl uppercase mb-2 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-earth-ink/70 leading-relaxed line-clamp-3 flex-1">
                    {s.description || t('trending.noDesc')}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t-[2px] border-earth-ink/20 pt-4">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60">
                      {t('trending.by')} {s.creator_name}
                      {s.end_date && <> · {t('trending.closes')} {formatDate(s.end_date)}</>}
                    </div>
                    <Link to="/login" className="ui-title text-sm flex items-center gap-1 group-hover:text-earth-forest transition-colors duration-300">
                      {t('trending.takeIt')} <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {stats && (
            <p className="mt-8 font-mono text-sm uppercase tracking-widest text-earth-ink/50 text-center">
              {t('trending.lastUpdated')} {new Date(stats.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="border-b-[3px] border-earth-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className={`flex items-end justify-between mb-12 flex-wrap gap-4 transition-all duration-700 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <p className="font-mono text-sm uppercase tracking-widest mb-2">{t('features.tag')}</p>
              <h2 className="font-display text-5xl md:text-6xl uppercase whitespace-pre-line">{t('features.title')}</h2>
            </div>
            <p className="max-w-md text-earth-ink/70">
              {t('features.desc')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, num }, idx) => (
              <div key={title} 
                className={`card p-6 group transition-all duration-500 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: featuresInView ? `${idx * 100}ms` : '0ms' }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center transition-all duration-300 group-hover:bg-earth-terracotta">
                    <Icon className="w-6 h-6 text-earth-cream" />
                  </div>
                  <span className="font-mono text-2xl text-earth-ink/40 group-hover:text-earth-forest transition-colors duration-300">/{num}</span>
                </div>
                <h3 className="font-display text-xl uppercase mb-2 transition-colors duration-300 group-hover:text-earth-forest">{t(`features.f${num.replace(/^0+/, '')}`)}</h3>
                <p className="text-sm text-earth-ink/70 leading-relaxed">{t(`features.f${num.replace(/^0+/, '')}d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section ref={howItWorksRef} className="border-b-[3px] border-earth-ink bg-earth-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className={`transition-all duration-700 ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="font-mono text-sm uppercase tracking-widest mb-2">{t('howItWorks.tag')}</p>
            <h2 className="font-display text-5xl md:text-6xl uppercase mb-12">{t('howItWorks.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ n, t: defaultTitle, d }, i) => (
              <div key={n} className={`relative transition-all duration-500 ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: howInView ? `${i * 150}ms` : '0ms' }}>
                <div className="card p-8 h-full">
                  <p className="font-display text-7xl text-earth-ink/20">{n}</p>
                  <h3 className="font-display text-2xl uppercase mt-2">{t(`howItWorks.s${n.replace(/^0+/, '')}`)}</h3>
                  <p className="mt-3 text-earth-ink/70">{t(`howItWorks.s${n.replace(/^0+/, '')}d`)}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-earth-ink">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="border-b-[3px] border-earth-ink">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20">
          <div className={`transition-all duration-700 ${faqInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="font-mono text-sm uppercase tracking-widest mb-2">{t('faq.tag')}</p>
            <h2 className="font-display text-5xl md:text-6xl uppercase mb-10">{t('faq.title')}</h2>
          </div>
          <div className={`card p-6 md:p-10 transition-all duration-700 ${faqInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: faqInView ? '150ms' : '0ms' }}>
            {faqs.length === 0 ? (
              <p className="font-mono text-sm text-earth-ink/60">
                {t('faq.noFaq')}
              </p>
            ) : (
              <div>
                {faqs.map((f, i) => (
                  <FaqItem key={f.id} q={f.question} a={f.answer} defaultOpen={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section ref={newsletterRef} className="border-b-[3px] border-earth-ink bg-earth-sand relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(46,125,50,0.5) 35px, rgba(46,125,50,0.5) 70px)' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 text-center relative z-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-earth-forest border-[3px] border-earth-ink mb-6 shadow-brutal-sm transition-all duration-700 ${newsletterInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <Mail className="w-7 h-7 text-earth-cream" />
          </div>
          <p className={`font-mono text-sm uppercase tracking-widest mb-2 transition-all duration-700 ${newsletterInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>{t('newsletter.tag')}</p>
          <h2 className={`font-display text-5xl md:text-6xl uppercase leading-tight transition-all duration-700 ${newsletterInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: newsletterInView ? '100ms' : '0ms' }}>
            {t('newsletter.title1')}<br/>{t('newsletter.title2')}
          </h2>
          <p className={`mt-4 max-w-xl mx-auto text-earth-ink/70 transition-all duration-700 ${newsletterInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: newsletterInView ? '200ms' : '0ms' }}>
            {t('newsletter.desc')}
          </p>

          <form
            onSubmit={handleSubscribe}
            className={`mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto transition-all duration-700 ${newsletterInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: newsletterInView ? '300ms' : '0ms' }}
            noValidate
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              className="input flex-1 transition-all duration-300 focus:border-earth-forest focus:shadow-soft"
              disabled={subState.status === 'loading'}
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap transition-all duration-300"
              disabled={subState.status === 'loading'}
            >
              {subState.status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {t('newsletter.subscribing')}
                </>
              ) : (
                <>
                  {t('newsletter.subscribe')} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {subState.message && (
            <p
              role="status"
              className={`mt-4 ui-title text-sm inline-flex items-center gap-2 px-3 py-1 border-2 border-earth-ink ${
                subState.status === 'success' ? 'bg-earth-moss text-earth-paper' :
                subState.status === 'error'   ? 'bg-earth-terracotta text-earth-paper' :
                                                'bg-earth-paper text-earth-ink'
              }`}
            >
              {subState.status === 'success' && <CheckCheck className="w-4 h-4" />}
              {subState.message}
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="border-b-[3px] border-earth-ink bg-gradient-to-br from-earth-cream to-earth-sand relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #2d6a4f 0%, transparent 40%), radial-gradient(circle at 70% 30%, #bc6c25 0%, transparent 40%)' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-24 text-center relative z-10">
          <h2 className={`font-display text-5xl md:text-7xl uppercase leading-tight transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t('cta.title1')}<br/>{t('cta.title2')} <span className="bg-earth-terracotta text-earth-paper px-2">{t('cta.title3')}</span>
          </h2>
          <p className={`mt-6 max-w-xl mx-auto text-lg transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: ctaInView ? '150ms' : '0ms' }}>
            {t('cta.desc')}
          </p>
          <div className={`mt-10 flex justify-center transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: ctaInView ? '300ms' : '0ms' }}>
            <Link to="/register" className="btn-primary text-base px-10 py-4 transition-all duration-300 hover:-translate-y-0.5">
              {t('cta.btn')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-ink text-earth-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid md:grid-cols-3 gap-8">
          <div className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-earth-forest border-[3px] border-earth-paper flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Leaf className="w-5 h-5 text-earth-cream" />
              </div>
              <p className="font-display text-lg uppercase transition-colors duration-300 group-hover:text-earth-moss">EcoSurvey</p>
            </div>
            <p className="font-mono text-sm uppercase tracking-widest opacity-70">{t('footer.builtFor')}</p>
          </div>
          <div>
            <p className="ui-title mb-3">{t('footer.explore')}</p>
            <ul className="space-y-1 text-sm opacity-80">
              <li><Link to="/login" className="hover:text-earth-moss transition-colors duration-300 inline-block">{t('header.signIn')}</Link></li>
              <li><Link to="/register" className="hover:text-earth-moss transition-colors duration-300 inline-block">{t('howItWorks.s1')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="ui-title mb-3">{t('footer.contact')}</p>
            <p className="text-sm opacity-80 transition-colors duration-300 hover:text-earth-moss">support@ecosurvey.edu</p>
          </div>
        </div>
        <div className="border-t border-earth-paper/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center text-sm font-mono uppercase tracking-widest opacity-70">
            <span>© {new Date().getFullYear()} EcoSurvey</span>
            <span>Environmental Survey Portal</span>
          </div>
        </div>
      </footer>

      <LandingChatWidget />
    </div>
  )
}