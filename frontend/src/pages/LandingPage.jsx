import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf, ArrowRight, ArrowUpRight, CheckCircle2, BarChart3, Trophy,
  MessageCircle, Shield, Zap, Sparkles, Mail, Loader2, CheckCheck,
  Users, Clock, GraduationCap, Briefcase, Menu, X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LandingChatWidget from '../components/features/LandingChatWidget'
import SectionHeader from '../components/landing/SectionHeader'
import FeatureCard from '../components/landing/FeatureCard'
import TrendingSurveyCard from '../components/landing/TrendingSurveyCard'
import StepCard from '../components/landing/StepCard'
import FaqItem from '../components/landing/FaqItem'
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

export default function LandingPage() {
  const { t, i18n } = useTranslation('landing')
  const [stats, setStats]             = useState(null)
  const [topSurveys, setTopSurveys]   = useState([])
  const [faqs, setFaqs]               = useState([])
  const [statsErr, setStatsErr]       = useState(false)
  const [respondents, setRespondents] = useState([])
  const [respondentsErr, setRespondentsErr] = useState(false)
  const [mobileNavOpen, setMobileNavOpen]   = useState(false)

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
        <div className="flex whitespace-nowrap py-2 animate-marquee ui-title text-xs sm:text-sm">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 sm:gap-8 px-4">
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
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center shadow-brutal-sm transition-shadow duration-300 group-hover:shadow-brutal">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-earth-cream transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div>
              <p className="font-display text-lg sm:text-xl uppercase leading-none">EcoSurvey</p>
              <p className="font-mono text-xs sm:text-sm uppercase tracking-widest mt-0.5">{t('header.subtitle')}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
              className="p-2 border-2 border-transparent text-earth-ink hover:border-earth-ink hover:bg-earth-cream transition-colors font-bold text-xs sm:text-sm uppercase"
              title="Change Language"
            >
              {i18n.language === 'vi' ? 'VI' : 'EN'}
            </button>

            <Link to="/login" className="hidden sm:inline-block ui-title text-xs sm:text-sm px-4 py-2 hover:bg-earth-cream hover:border-earth-ink transition-all duration-300 border-2 border-transparent">
              {t('header.signIn')}
            </Link>
            <Link to="/register" className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-5 transition-all duration-300 hover:-translate-y-0.5">
              {t('header.getStarted')} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            <button
              onClick={() => setMobileNavOpen((o) => !o)}
              className="sm:hidden p-2 border-2 border-earth-ink bg-earth-paper text-earth-ink hover:bg-earth-cream"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileNavOpen && (
          <nav className="sm:hidden px-4 py-3 border-t-[2px] border-earth-ink/20 flex flex-col gap-2 animate-slide-up bg-earth-paper">
            <Link
              to="/login"
              onClick={() => setMobileNavOpen(false)}
              className="btn-secondary text-xs py-2 px-4 text-center justify-center"
            >
              {t('header.signIn')}
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileNavOpen(false)}
              className="btn-primary text-xs py-2 px-4 text-center justify-center"
            >
              {t('header.getStarted')}
            </Link>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="border-b-[3px] border-earth-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #2d6a4f 0%, transparent 50%), radial-gradient(circle at 80% 50%, #bc6c25 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 grid lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-8 relative pt-4 sm:pt-0">
            <div className="tape -top-2 left-0 z-10 opacity-0 animate-fade-in">{t('hero.tag')}</div>
            <h1 className="font-display text-4xl sm:text-7xl lg:text-8xl leading-[0.95] sm:leading-[0.9] uppercase tracking-tight opacity-0 animate-fade-in-up mt-2">
              {t('hero.title1')}<br />
              {t('hero.title2')}<br />
              <span className="inline-block bg-earth-forest text-earth-cream px-3 py-1 mt-2 opacity-0 animate-soft-bounce" style={{ animationDelay: '0.3s' }}>{t('hero.title3')}</span>{' '}
              {t('hero.title4')}
            </h1>
            <p className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              {t('hero.desc')}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/register" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 transition-all duration-300 hover:-translate-y-0.5">
                {t('hero.startSurveying')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 transition-all duration-300 hover:-translate-y-0.5">
                {t('hero.haveAccount')} <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 relative mt-4 lg:mt-0">
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
        <div className={`max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 transition-all duration-700 ${impactInView ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
          {liveStats ? (
            liveStats.map(({ value, label }, index) => (
              <div key={label} className={`border-l-[3px] border-earth-paper pl-4 transition-all duration-700 ${impactInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: impactInView ? `${index * 100}ms` : '0ms' }}>
                <p className="font-display text-3xl sm:text-4xl md:text-5xl">{value}</p>
                <p className="font-mono text-xs sm:text-sm uppercase tracking-widest mt-2 opacity-90">{label}</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
          <SectionHeader
            tag={t('liveFeed.tag')}
            title={t('liveFeed.title')}
            desc={t('liveFeed.desc')}
            className={`transition-all duration-700 ${liveFeedInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          />

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
                    className={`card card-hover p-5 transition-all duration-300 flex gap-4 ${liveFeedInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
          <SectionHeader
            tag={t('trending.tag')}
            title={t('trending.title')}
            desc={t('trending.desc')}
            className={`transition-all duration-700 ${trendingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          />

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
                <TrendingSurveyCard
                  key={s.id}
                  survey={s}
                  idx={idx}
                  inView={trendingInView}
                  formatDate={formatDate}
                  t={t}
                />
              ))}
            </div>
          )}

          {stats && (
            <p className="mt-8 font-mono text-xs sm:text-sm uppercase tracking-widest text-earth-ink/50 text-center">
              {t('trending.lastUpdated')} {new Date(stats.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="border-b-[3px] border-earth-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
          <SectionHeader
            tag={t('features.tag')}
            title={t('features.title')}
            desc={t('features.desc')}
            className={`transition-all duration-700 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, num }, idx) => (
              <FeatureCard
                key={title}
                icon={Icon}
                title={t(`features.f${num.replace(/^0+/, '')}`)}
                desc={t(`features.f${num.replace(/^0+/, '')}d`)}
                num={num}
                inView={featuresInView}
                idx={idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section ref={howItWorksRef} className="border-b-[3px] border-earth-ink bg-earth-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
          <div className={`transition-all duration-700 ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="font-mono text-sm uppercase tracking-widest mb-2">{t('howItWorks.tag')}</p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase mb-10 sm:mb-12">{t('howItWorks.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ n }, i) => (
              <StepCard
                key={n}
                n={n}
                title={t(`howItWorks.s${n.replace(/^0+/, '')}`)}
                desc={t(`howItWorks.s${n.replace(/^0+/, '')}d`)}
                idx={i}
                isLast={i === steps.length - 1}
                inView={howInView}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="border-b-[3px] border-earth-ink">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
          <div className={`transition-all duration-700 ${faqInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="font-mono text-sm uppercase tracking-widest mb-2">{t('faq.tag')}</p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase mb-8 sm:mb-10">{t('faq.title')}</h2>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 sm:py-20 text-center relative z-10">
          <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-earth-forest border-[3px] border-earth-ink mb-6 shadow-brutal-sm transition-all duration-700 ${newsletterInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-earth-cream" />
          </div>
          <p className={`font-mono text-sm uppercase tracking-widest mb-2 transition-all duration-700 ${newsletterInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>{t('newsletter.tag')}</p>
          <h2 className={`font-display text-4xl sm:text-5xl md:text-6xl uppercase leading-tight transition-all duration-700 ${newsletterInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: newsletterInView ? '100ms' : '0ms' }}>
            {t('newsletter.title1')}<br/>{t('newsletter.title2')}
          </h2>
          <p className={`mt-4 max-w-xl mx-auto text-sm sm:text-base text-earth-ink/70 transition-all duration-700 ${newsletterInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: newsletterInView ? '200ms' : '0ms' }}>
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
              className="input flex-1 transition-all duration-300 focus:border-earth-forest focus:shadow-soft text-sm sm:text-base"
              disabled={subState.status === 'loading'}
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap transition-all duration-300 text-sm sm:text-base"
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
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center relative z-10">
          <h2 className={`font-display text-3xl sm:text-6xl md:text-7xl uppercase leading-snug transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t('cta.title1')}
            <br />
            <span className="inline-block mt-2 sm:mt-3 px-3 py-1 bg-earth-terracotta text-earth-paper border-[3px] border-earth-ink shadow-brutal-sm">
              {t('cta.title2')} {t('cta.title3')}
            </span>
          </h2>
          <p className={`mt-6 max-w-xl mx-auto text-base sm:text-lg transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: ctaInView ? '150ms' : '0ms' }}>
            {t('cta.desc')}
          </p>
          <div className={`mt-8 sm:mt-10 flex justify-center transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: ctaInView ? '300ms' : '0ms' }}>
            <Link to="/register" className="btn-primary text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 transition-all duration-300 hover:-translate-y-0.5">
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
            <p className="font-mono text-xs sm:text-sm uppercase tracking-widest opacity-70">{t('footer.builtFor')}</p>
          </div>
          <div>
            <p className="ui-title mb-3 text-sm">{t('footer.explore')}</p>
            <ul className="space-y-1 text-sm opacity-80">
              <li><Link to="/login" className="hover:text-earth-moss transition-colors duration-300 inline-block">{t('header.signIn')}</Link></li>
              <li><Link to="/register" className="hover:text-earth-moss transition-colors duration-300 inline-block">{t('howItWorks.s1')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="ui-title mb-3 text-sm">{t('footer.contact')}</p>
            <p className="text-sm opacity-80 transition-colors duration-300 hover:text-earth-moss">support@ecosurvey.edu</p>
          </div>
        </div>
        <div className="border-t border-earth-paper/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-widest opacity-70">
            <span>© {new Date().getFullYear()} EcoSurvey</span>
            <span>Environmental Survey Portal</span>
          </div>
        </div>
      </footer>

      <LandingChatWidget />
    </div>
  )
}