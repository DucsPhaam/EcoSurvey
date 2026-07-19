import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ClipboardList, CheckCircle2, Send, AlertCircle, Calendar, Leaf, Clock, Trophy } from 'lucide-react'
import { surveyService } from '../../services/surveyService'
import { SpinnerPage } from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTranslation } from 'react-i18next'

function QuestionItem({ question, answer, onChange }) {
  const { t } = useTranslation('survey')
  const { question_type: type, options, question_text, is_required, order_num } = question

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-start gap-3 mb-3">
        <span className="font-display text-2xl text-earth-forest flex-shrink-0">{String(order_num).padStart(2, '0')}</span>
        <div className="flex-1">
          <p className="ui-title leading-snug">
            {question_text}
            {is_required && <span className="text-earth-terracotta ml-1">*</span>}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60 mt-1">/ {type.replace('_', ' ')}</p>
        </div>
      </div>

      {type === 'Text' && (
        <textarea
          value={answer || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={t('typeAnswer')}
          rows={3}
          className="input resize-none mt-2"
        />
      )}

      {type === 'Single_Choice' && (
        <div className="space-y-0 mt-3">
          {(options || []).map((opt, i) => (
            <label key={i} className={`flex items-center gap-3 p-3 border-[3px] border-earth-ink cursor-pointer transition-all ${
              answer === opt ? 'bg-earth-forest text-earth-paper shadow-brutal-sm' : 'bg-earth-paper hover:bg-earth-cream'
            } ${i !== 0 ? '-mt-[3px]' : ''}`}>
              <div className={`w-5 h-5 border-[3px] border-current flex items-center justify-center flex-shrink-0 ${
                answer === opt ? 'bg-earth-paper' : ''}`}>
                {answer === opt && <div className="w-2 h-2 bg-earth-forest rounded-full" />}
              </div>
              <input type="radio" className="sr-only" name={`q-${question.id}`}
                checked={answer === opt} onChange={() => onChange(question.id, opt)} />
              <span className="ui-title text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'Multiple_Choice' && (
        <div className="space-y-0 mt-3">
          {(options || []).map((opt, i) => {
            const selected = Array.isArray(answer) ? answer.includes(opt) : false
            const toggle = () => {
              const cur = Array.isArray(answer) ? answer : []
              onChange(question.id, selected ? cur.filter((x) => x !== opt) : [...cur, opt])
            }
            return (
              <label key={i} className={`flex items-center gap-3 p-3 border-[3px] border-earth-ink cursor-pointer transition-all ${
                selected ? 'bg-earth-forest text-earth-paper shadow-brutal-sm' : 'bg-earth-paper hover:bg-earth-cream'
              } ${i !== 0 ? '-mt-[3px]' : ''}`}>
                <div className={`w-5 h-5 border-[3px] border-current flex items-center justify-center flex-shrink-0 ${
                  selected ? 'bg-earth-paper' : ''}`}>
                  {selected && <CheckCircle2 className="w-4 h-4 text-earth-forest" />}
                </div>
                <input type="checkbox" className="sr-only" checked={selected} onChange={toggle} />
                <span className="ui-title text-sm">{opt}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ImpactBlock({ num, label }) {
  return (
    <div className="bg-earth-paper border-[3px] border-earth-ink p-4">
      <p className="impact-num">{num}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

export default function SurveyDetail() {
  const { t } = useTranslation('survey')
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey]       = useState(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [answers, setAnswers]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  useEffect(() => {
    surveyService.getSurveyDetail(id)
      .then((r) => { setSurvey(r.data.survey); setCompleted(r.data.is_completed) })
      .catch(() => navigate('/surveys'))
      .finally(() => setLoading(false))
  }, [id])

  const setAnswer = (qId, val) => setAnswers((a) => ({ ...a, [qId]: val }))

  // Helper: format an answer value for storage (Multiple_Choice => joined string)
  const formatAnswer = (q, value) => {
    if (q.question_type === 'Multiple_Choice' && Array.isArray(value)) return value.join(', ')
    if (q.question_type === 'Single_Choice') return String(value ?? '')
    return value ?? ''
  }

  const handleSubmit = async () => {
    const required = survey.questions.filter((q) => q.is_required)
    for (const q of required) {
      const a = answers[q.id]
      if (!a || (Array.isArray(a) && a.length === 0) || (typeof a === 'string' && !a.trim())) {
        toast.error(`${t('pleaseAnswer')} "${q.question_text.substring(0, 60)}…"`)
        return
      }
    }

    if (!captchaToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      toast.error(t('completeCaptcha'))
      return
    }

    setSubmitting(true)
    try {
      const payload = survey.questions.map((q) => ({
        question_id: q.id,
        answer_text: formatAnswer(q, answers[q.id]),
      }))
      await surveyService.submitSurvey(id, payload, captchaToken)
      toast.success(t('submitSuccess'))
      setCompleted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || t('submitFailed'))
    } finally { setSubmitting(false) }
  }

  if (loading) return <SpinnerPage />
  if (!survey) return null

  const daysLeft  = Math.ceil((new Date(survey.end_date) - new Date()) / 86400000)
  const questions = [...(survey.questions || [])].sort((a, b) => a.order_num - b.order_num)
  const requiredCount = questions.filter((q) => q.is_required).length
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id]
    return a && !(Array.isArray(a) && a.length === 0) && !(typeof a === 'string' && !a.trim())
  }).length

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/surveys')}
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border-b-[3px] border-earth-ink pb-0.5 hover:text-earth-forest">
        <ChevronLeft className="w-4 h-4" /> {t('backToBoard')}
      </button>

      {/* Survey header */}
      <div className="card p-6 md:p-8 relative overflow-hidden">
        <div className="stamp top-4 right-4 bg-earth-terracotta text-earth-paper">{completed ? t('done') : t('active')}</div>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-earth-cream" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-published">{survey.target_role}</span>
              {completed && <span className="badge-approved flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('completed')}</span>}
              {!completed && daysLeft > 0 && daysLeft <= 3 && <span className="badge-pending">⚠ {daysLeft}{t('daysLeft')}</span>}
            </div>
            <h1 className="font-display text-3xl md:text-4xl uppercase leading-tight">{survey.title}</h1>
          </div>
        </div>
        {survey.description && <p className="text-earth-ink/80 leading-relaxed">{survey.description}</p>}

        <div className="mt-6 pt-6 border-t-[3px] border-earth-ink grid grid-cols-2 md:grid-cols-4 gap-3">
          <ImpactBlock num={questions.length} label={t('questionsLabel')} />
          <ImpactBlock num={requiredCount}    label={t('requiredLabel')} />
          <ImpactBlock num={`+10`}            label={t('points')} />
          <ImpactBlock num={daysLeft > 0 ? daysLeft : '0'} label={t('daysLeftLabel')} />
        </div>
      </div>

      {/* Already completed */}
      {completed ? (
        <div className="card p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-earth-moss border-[3px] border-earth-ink flex items-center justify-center shadow-brutal">
            <CheckCircle2 className="w-10 h-10 text-earth-paper" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60">{t('statusLabel')}</p>
          <h2 className="font-display text-3xl uppercase mt-2">{t('surveyCompleted')}</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60 mt-2">{t('alreadySubmitted')}</p>
          <button onClick={() => navigate('/surveys')} className="btn-primary mt-6">
            {t('backToBoard')} <ClipboardList className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="card p-4 flex items-center gap-4">
            <Leaf className="w-6 h-6 text-earth-forest" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-xs uppercase tracking-widest">{t('progress')}</p>
                <p className="font-display text-sm">{answeredCount}/{questions.length}</p>
              </div>
              <div className="h-[6px] bg-earth-cream border-[2px] border-earth-ink">
                <div
                  className="h-full bg-earth-forest transition-all duration-300"
                  style={{ width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionItem key={q.id} question={q} answer={answers[q.id]} onChange={setAnswer} />
            ))}
          </div>

          <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-earth-cream">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                {t('answerRequired')} (<span className="text-earth-terracotta">*</span>) {t('beforeSubmitting')}
              </div>
              {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                <div className="flex">
                  <Turnstile 
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
                    onSuccess={(token) => setCaptchaToken(token)} 
                  />
                </div>
              )}
            </div>
            <button onClick={handleSubmit} disabled={submitting || (!captchaToken && !!import.meta.env.VITE_TURNSTILE_SITE_KEY)} className="btn-primary flex-shrink-0">
              {submitting ? (
                <span className="w-4 h-4 border-[3px] border-earth-paper/30 border-t-earth-paper" />
              ) : (
                <><Send className="w-4 h-4" /> {t('submit')}</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

