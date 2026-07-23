import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Leaf, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import api from '../../services/axiosInstance'
import { useTranslation } from 'react-i18next'

export default function EmailVerificationPage() {
  const { t } = useTranslation('auth')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setMessage(t('emailVerificationPage.invalidLink'))
      return
    }
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
        setMessage(res.data.message)
        setStatus('success')
      } catch (err) {
        setMessage(err.response?.data?.message || t('emailVerificationPage.defaultError'))
        setStatus('error')
      }
    }
    verify()
  }, [token, email, t])

  return (
    <div className="min-h-screen bg-earth-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center">
            <Leaf className="w-5 h-5 text-earth-paper" />
          </div>
          <span className="font-display text-2xl uppercase text-earth-ink">EcoSurvey</span>
        </Link>

        <div className="bg-white border-[3px] border-earth-ink p-10 shadow-[6px_6px_0px_#1a1a1a] text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-12 h-12 text-earth-forest mx-auto mb-4 animate-spin" />
              <h2 className="font-display text-2xl uppercase mb-2">{t('emailVerificationPage.verifying')}</h2>
              <p className="text-sm text-earth-ink/60">{t('emailVerificationPage.pleaseWait')}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-earth-forest/10 border-[3px] border-earth-forest rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-earth-forest" />
              </div>
              <h2 className="font-display text-2xl uppercase mb-3">{t('emailVerificationPage.successTitle')}</h2>
              <p className="text-sm text-earth-ink/70 mb-6">{message}</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                {t('emailVerificationPage.loginNow')}
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-50 border-[3px] border-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-display text-2xl uppercase mb-3">{t('emailVerificationPage.errorTitle')}</h2>
              <p className="text-sm text-earth-ink/70 mb-6">{message}</p>
              <Link to="/login" className="btn-primary w-full text-center block">
                {t('emailVerificationPage.backToLogin')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
