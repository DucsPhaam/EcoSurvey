import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../../services/axiosInstance'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error(t('forgotPasswordPage.errors.emailRequired')); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || t('forgotPasswordPage.errors.submitFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-earth-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center">
            <Leaf className="w-5 h-5 text-earth-paper" />
          </div>
          <span className="font-display text-2xl uppercase text-earth-ink">EcoSurvey</span>
        </Link>

        <div className="bg-white border-[3px] border-earth-ink p-8 shadow-[6px_6px_0px_#1a1a1a]">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-earth-forest/10 border-[3px] border-earth-forest rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-earth-forest" />
              </div>
              <h2 className="font-display text-2xl uppercase text-earth-ink mb-3">{t('forgotPasswordPage.sentTitle')}</h2>
              <p className="text-sm text-earth-ink/70 leading-relaxed mb-2">
                {t('forgotPasswordPage.sentDesc1')} <strong>{email}</strong> {t('forgotPasswordPage.sentDesc2')}
              </p>
              <p className="text-xs text-earth-ink/50 mb-6">
                {t('forgotPasswordPage.sentNote1')} <strong>{t('forgotPasswordPage.sentNote2')}</strong>{t('forgotPasswordPage.sentNote3')}
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-earth-forest font-semibold text-sm hover:underline"
              >
                {t('forgotPasswordPage.resend')}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-earth-ink/50">/ auth</span>
                <h2 className="font-display text-3xl uppercase mt-1">{t('forgotPasswordPage.title')}</h2>
                <p className="text-sm text-earth-ink/60 mt-2">
                  {t('forgotPasswordPage.desc')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="fp-email" className="label">{t('forgotPasswordPage.emailLabel')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" aria-hidden="true" />
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <span className="w-5 h-5 border-[3px] border-earth-paper/30 border-t-earth-paper rounded-full animate-spin" />
                  ) : (
                    t('forgotPasswordPage.submit')
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-earth-ink/60 hover:text-earth-ink transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('forgotPasswordPage.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}
