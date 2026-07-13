import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf, ArrowRight, ArrowUpRight, CheckCircle2, BarChart3, Trophy,
  MessageCircle, Shield, Zap, Sparkles, ChevronDown, Mail, Loader2, CheckCheck,
  Users, Clock, GraduationCap, Briefcase,
} from 'lucide-react'
import LandingChatWidget from '../components/features/LandingChatWidget'
import { homepageService } from '../services/homepageService'
import { faqService } from '../services/faqService'
import { newsletterService } from '../services/newsletterService'

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
    <div className="border-b-[2px] border-earth-ink/20 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="font-display text-lg md:text-xl uppercase pr-2 group-hover:text-earth-forest transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-earth-ink/80 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function LandingPage() {
  const [stats, setStats]             = useState(null)
  const [topSurveys, setTopSurveys]   = useState([])
  const [faqs, setFaqs]               = useState([])
  const [statsErr, setStatsErr]       = useState(false)
  const [respondents, setRespondents] = useState([])
  const [respondentsErr, setRespondentsErr] = useState(false)

  // newsletter form state
  const [email, setEmail]             = useState('')
  const [subState, setSubState]       = useState({ status: 'idle', message: '' })

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
    { value: formatStat(stats.responses_collected), label: 'Responses collected' },
    { value: formatStat(stats.users_active),        label: 'Active volunteers' },
    { value: formatStat(stats.surveys_published),   label: 'Surveys live' },
    { value: formatStat(stats.institutions),        label: 'Departments joined' },
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
              <span>★ Survey for a Greener Future</span>
              <span>★ Sustainability Tracking</span>
              <span>★ Campus Impact Reporting</span>
              <span>★ Verified by Admin</span>
              <span>★ Earn Points for Impact</span>
              <span>★ Join the Movement</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="border-b-[3px] border-earth-ink bg-earth-paper sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center shadow-brutal-sm">
              <Leaf className="w-6 h-6 text-earth-cream" />
            </div>
            <div>
              <p className="font-display text-xl uppercase leading-none">EcoSurvey</p>
              <p className="font-mono text-[10px] uppercase tracking-widest mt-0.5">/ environmental portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-block ui-title text-sm px-4 py-2 hover:bg-earth-cream transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b-[3px] border-earth-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 relative">
            <div className="tape -top-2 left-0 z-10">Environmental Awareness Portal</div>
            <h1 className="font-display text-6xl sm:text-8xl leading-[0.9] uppercase tracking-tight">
              Survey<br />
              For A<br />
              <span className="inline-block bg-earth-forest text-earth-cream px-3 py-1 mt-2">Greener</span>{' '}
              Future.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed">
              Join your institution&apos;s environmental program. Take surveys, report green
              activities, earn points, and track your impact on the sustainability scoreboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary">
                Start Surveying <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary">
                I Have An Account <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 relative">
            <div className="bg-earth-cream border-[3px] border-earth-ink shadow-brutal-lg p-6 relative">
              <div className="stamp -top-3 -right-3 bg-earth-terracotta text-earth-paper">Live</div>
              <p className="font-mono text-xs uppercase tracking-widest mb-3">// Impact tracker</p>
              <div className="space-y-4">
                {liveStats ? (
                  liveStats.map(({ value, label }) => (
                    <div key={label} className="border-b-[2px] border-earth-ink/30 pb-3 last:border-0">
                      <p className="impact-num">{value}</p>
                      <p className="ui-title text-xs mt-1">{label}</p>
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
                <p className="mt-3 font-mono text-xs text-earth-terracotta">
                  // could not load live data — showing defaults
                </p>
              )}
            </div>
            <div className="mt-4 bg-earth-forest text-earth-paper border-[3px] border-earth-ink p-4 shadow-brutal-sm">
              <p className="ui-title text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Assistant
              </p>
              <p className="font-mono text-xs mt-1">Ask anything. Powered by your FAQ database.</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Impact strip — driven by /homepage/stats */}
      <section className="border-b-[3px] border-earth-ink bg-earth-forest text-earth-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {liveStats ? (
            liveStats.map(({ value, label }) => (
              <div key={label} className="border-l-[3px] border-earth-paper pl-4">
                <p className="font-display text-4xl md:text-5xl">{value}</p>
                <p className="font-mono text-xs uppercase tracking-widest mt-2 opacity-90">{label}</p>
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
      <section className="border-b-[3px] border-earth-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest mb-2">// Live participation</p>
              <h2 className="font-display text-5xl md:text-6xl uppercase">Who Just Spoke Up</h2>
            </div>
            <p className="max-w-md text-earth-ink/70">
              Real people, real responses. See who across campus is making their voice count right now.
            </p>
          </div>

          {respondents.length === 0 ? (
            <div className="card p-10 text-center">
              {respondentsErr ? (
                <p className="font-mono text-sm text-earth-terracotta">
                  // could not load live participation feed
                </p>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-earth-cream border-[3px] border-earth-ink mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="font-mono text-sm text-earth-ink/60">
                    // No responses yet. Be the first to take a survey.
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
                    className="card p-5 hover:bg-earth-cream transition-colors group flex gap-4"
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
                        completed <span className="font-semibold">{r.survey_title}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-earth-ink/50">
                        <span className="truncate">{r.department || 'Campus wide'}</span>
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
      <section className="border-b-[3px] border-earth-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest mb-2">// Featured Surveys</p>
              <h2 className="font-display text-5xl md:text-6xl uppercase">Trending Now</h2>
            </div>
            <p className="max-w-md text-earth-ink/70">
              The most popular surveys on campus right now. Jump in to make your voice count.
            </p>
          </div>

          {topSurveys.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="h-4 w-16 bg-earth-ink/10 animate-pulse mb-4" />
                  <div className="h-6 w-3/4 bg-earth-ink/10 animate-pulse mb-3" />
                  <div className="h-4 w-full bg-earth-ink/10 animate-pulse mb-2" />
                  <div className="h-4 w-5/6 bg-earth-ink/10 animate-pulse mb-6" />
                  <div className="h-10 w-32 bg-earth-ink/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topSurveys.map((s, idx) => (
                <article key={s.id} className="card p-6 hover:bg-earth-cream transition-colors group flex flex-col">
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
                    {s.description || 'No description provided yet.'}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t-[2px] border-earth-ink/20 pt-4">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60">
                      By {s.creator_name}
                      {s.end_date && <> · Closes {formatDate(s.end_date)}</>}
                    </div>
                    <Link to="/login" className="ui-title text-xs flex items-center gap-1 group-hover:text-earth-forest transition-colors">
                      Take it <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {stats && (
            <p className="mt-8 font-mono text-xs uppercase tracking-widest text-earth-ink/50 text-center">
              // Last updated {new Date(stats.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-b-[3px] border-earth-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest mb-2">// Features</p>
              <h2 className="font-display text-5xl md:text-6xl uppercase">Everything To<br/>Make An Impact</h2>
            </div>
            <p className="max-w-md text-earth-ink/70">
              A complete platform for students, staff, and administrators to engage with environmental initiatives on campus.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, num }) => (
              <div key={title} className="card p-6 hover:bg-earth-cream transition-colors group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center group-hover:bg-earth-terracotta transition-colors">
                    <Icon className="w-6 h-6 text-earth-cream" />
                  </div>
                  <span className="font-mono text-2xl text-earth-ink/40">/{num}</span>
                </div>
                <h3 className="font-display text-xl uppercase mb-2">{title}</h3>
                <p className="text-sm text-earth-ink/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b-[3px] border-earth-ink bg-earth-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <p className="font-mono text-xs uppercase tracking-widest mb-2">// How it works</p>
          <h2 className="font-display text-5xl md:text-6xl uppercase mb-12">Three Steps.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ n, t, d }, i) => (
              <div key={n} className="relative">
                <div className="card p-8 h-full">
                  <p className="font-display text-7xl text-earth-ink/20">{n}</p>
                  <h3 className="font-display text-2xl uppercase mt-2">{t}</h3>
                  <p className="mt-3 text-earth-ink/70">{d}</p>
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
      <section className="border-b-[3px] border-earth-ink">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20">
          <p className="font-mono text-xs uppercase tracking-widest mb-2">// Frequently asked</p>
          <h2 className="font-display text-5xl md:text-6xl uppercase mb-10">Questions?</h2>
          <div className="card p-6 md:p-10">
            {faqs.length === 0 ? (
              <p className="font-mono text-sm text-earth-ink/60">
                // No FAQs published yet. Ask the chat assistant below for quick answers.
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
      <section className="border-b-[3px] border-earth-ink bg-earth-sand">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-earth-forest border-[3px] border-earth-ink mb-6 shadow-brutal-sm">
            <Mail className="w-7 h-7 text-earth-cream" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest mb-2">// Stay in the loop</p>
          <h2 className="font-display text-5xl md:text-6xl uppercase leading-tight">
            Get Campus<br/>Sustainability Updates
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-earth-ink/70">
            Subscribe to receive a monthly digest of new surveys, top reports, and campus impact highlights.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            noValidate
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@school.edu"
              className="input flex-1"
              disabled={subState.status === 'loading'}
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
              disabled={subState.status === 'loading'}
            >
              {subState.status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Subscribing
                </>
              ) : (
                <>
                  Subscribe <ArrowRight className="w-5 h-5" />
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
      <section className="border-b-[3px] border-earth-ink">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-24 text-center">
          <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
            Ready To Make<br/>A <span className="bg-earth-terracotta text-earth-paper px-2">Difference?</span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-lg">
            Join your peers in building a more sustainable campus environment.
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="/register" className="btn-primary text-base px-10 py-4">
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-ink text-earth-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-earth-forest border-[3px] border-earth-paper flex items-center justify-center">
                <Leaf className="w-5 h-5 text-earth-cream" />
              </div>
              <p className="font-display text-lg uppercase">EcoSurvey</p>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest opacity-70">Built for greener campuses.</p>
          </div>
          <div>
            <p className="ui-title mb-3">Explore</p>
            <ul className="space-y-1 text-sm opacity-80">
              <li><Link to="/login" className="hover:underline">Sign In</Link></li>
              <li><Link to="/register" className="hover:underline">Register</Link></li>
            </ul>
          </div>
          <div>
            <p className="ui-title mb-3">Contact</p>
            <p className="text-sm opacity-80">support@ecosurvey.edu</p>
          </div>
        </div>
        <div className="border-t border-earth-paper/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center text-xs font-mono uppercase tracking-widest opacity-70">
            <span>© {new Date().getFullYear()} EcoSurvey</span>
            <span>Environmental Survey Portal</span>
          </div>
        </div>
      </footer>

      <LandingChatWidget />
    </div>
  )
}