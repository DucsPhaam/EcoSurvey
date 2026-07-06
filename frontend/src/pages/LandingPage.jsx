import { Link } from 'react-router-dom'
import { Leaf, CheckCircle2, BarChart3, Trophy, MessageCircle, ArrowRight, Shield, Zap, Users } from 'lucide-react'

const features = [
  { icon: CheckCircle2, title: 'Online Surveys',    desc: 'Participate in environmental awareness surveys anytime, anywhere.' },
  { icon: BarChart3,    title: 'Live Dashboard',    desc: 'Track your progress, points, and participation history in real-time.' },
  { icon: Trophy,       title: 'Leaderboard',       desc: 'Compete with peers and climb the sustainability leaderboard.' },
  { icon: MessageCircle,title: 'AI Assistant',      desc: 'Get instant answers from our AI-powered FAQ chatbot.' },
  { icon: Shield,       title: 'Secure & Private',  desc: 'JWT-authenticated, role-based access control protects your data.' },
  { icon: Zap,          title: 'Instant Points',    desc: 'Earn points for every survey and approved activity report.' },
]

const stats = [
  { value: '3', label: 'User Roles' },
  { value: '50pts', label: 'Per Activity Report' },
  { value: '10pts', label: 'Per Survey' },
  { value: 'AI', label: 'Powered Assistant' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center shadow-glow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">EcoSurvey</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 sm:px-8">
        {/* Background glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-accent-400/15 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-900/60 border border-brand-700/50 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <Leaf className="w-4 h-4" />
            Environmental Awareness Portal
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-bold leading-tight mb-6 animate-slide-up">
            Survey for a{' '}
            <span className="gradient-text">Greener</span>{' '}
            Future
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Join your institution's environmental awareness program. Complete surveys, report green activities, earn points, and track your impact on the sustainability leaderboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Register Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-3.5 rounded-xl border border-gray-700 text-gray-300 hover:border-brand-600 hover:text-white transition-all duration-300 font-semibold text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-display font-bold gradient-text">{value}</p>
              <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Everything you need to <span className="gradient-text">make an impact</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">A comprehensive platform for students, staff, and administrators to engage with environmental initiatives.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-brand-700/60 hover:bg-gray-900/80 transition-all duration-300 hover:-translate-y-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center mb-4 shadow-glow-sm group-hover:shadow-glow-green transition-all duration-300">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-white">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-8 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-4">How it <span className="gradient-text">works</span></h2>
          <div className="grid sm:grid-cols-3 gap-8 mt-12">
            {[
              { step: '01', title: 'Register & Get Approved', desc: 'Create your account, wait for admin verification, then log in.' },
              { step: '02', title: 'Participate & Report',    desc: 'Complete surveys and submit green activity reports with evidence.' },
              { step: '03', title: 'Earn Points & Rank Up',   desc: 'Gain points for every contribution and climb the leaderboard.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-display font-bold text-brand-900/40 mb-4">{step}</div>
                <h3 className="font-semibold text-lg text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/30 via-transparent to-accent-900/20" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl font-display font-bold mb-4">Ready to make a <span className="gradient-text">difference?</span></h2>
          <p className="text-gray-400 mb-8">Join your peers in building a more sustainable campus environment.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex">
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-brand-600" />
          <span className="font-semibold text-gray-400">EcoSurvey</span>
        </div>
        <p>© {new Date().getFullYear()} Environmental Survey Portal. All rights reserved.</p>
      </footer>
    </div>
  )
}
