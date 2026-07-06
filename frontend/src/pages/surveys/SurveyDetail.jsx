import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ClipboardList, CheckCircle2, Send, AlertCircle, Calendar } from 'lucide-react'
import api from '../../services/axiosInstance'
import { SpinnerPage } from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

function QuestionItem({ question, answer, onChange }) {
  const { question_type: type, options, question_text, is_required, order_num } = question

  return (
    <div className="card p-6 animate-fade-in">
      <p className="font-medium text-gray-900 dark:text-white mb-1 leading-relaxed">
        <span className="text-brand-500 font-bold mr-2">{order_num}.</span>
        {question_text}
        {is_required && <span className="text-red-400 ml-1">*</span>}
      </p>
      <p className="text-xs text-gray-400 mb-4 capitalize">{type.replace('_', ' ')}</p>

      {type === 'Text' && (
        <textarea
          value={answer || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder="Type your answer here…"
          rows={3}
          className="input resize-none"
        />
      )}

      {type === 'Single_Choice' && (
        <div className="space-y-2">
          {(options || []).map((opt, i) => (
            <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              answer === opt
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700'
            }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                answer === opt ? 'border-brand-500 bg-brand-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {answer === opt && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <input type="radio" className="sr-only" name={`q-${question.id}`}
                checked={answer === opt} onChange={() => onChange(question.id, opt)} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'Multiple_Choice' && (
        <div className="space-y-2">
          {(options || []).map((opt, i) => {
            const selected = Array.isArray(answer) ? answer.includes(opt) : false
            const toggle = () => {
              const cur = Array.isArray(answer) ? answer : []
              onChange(question.id, selected ? cur.filter((x) => x !== opt) : [...cur, opt])
            }
            return (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selected ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'}`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" className="sr-only" checked={selected} onChange={toggle} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SurveyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey]       = useState(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [answers, setAnswers]     = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/surveys/${id}`)
      .then((r) => { setSurvey(r.data.survey); setCompleted(r.data.is_completed) })
      .catch(() => navigate('/surveys'))
      .finally(() => setLoading(false))
  }, [id])

  const setAnswer = (qId, val) => setAnswers((a) => ({ ...a, [qId]: val }))

  const handleSubmit = async () => {
    // Validate required questions
    const required = survey.questions.filter((q) => q.is_required)
    for (const q of required) {
      const a = answers[q.id]
      if (!a || (Array.isArray(a) && a.length === 0) || (typeof a === 'string' && !a.trim())) {
        toast.error(`Please answer: "${q.question_text.substring(0, 60)}…"`)
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = survey.questions.map((q) => ({
        question_id: q.id,
        answer_text: answers[q.id] ?? '',
      }))
      await api.post(`/surveys/${id}/submit`, { answers: payload })
      toast.success('Survey submitted! You earned 10 points. 🎉')
      setCompleted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.')
    } finally { setSubmitting(false) }
  }

  if (loading) return <SpinnerPage />
  if (!survey) return null

  const daysLeft  = Math.ceil((new Date(survey.end_date) - new Date()) / 86400000)
  const questions = [...(survey.questions || [])].sort((a, b) => a.order_num - b.order_num)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/surveys')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Survey Board
      </button>

      {/* Survey header card */}
      <div className="card p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-500/10 to-accent-400/10 rounded-bl-full" />
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center shadow-glow-sm">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="badge-published">{survey.target_role}</span>
              {completed && <span className="badge-approved flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>}
              {!completed && daysLeft <= 3 && daysLeft > 0 && <span className="badge-pending">⚠️ {daysLeft}d left</span>}
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{survey.title}</h1>
          </div>
        </div>
        {survey.description && <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{survey.description}</p>}
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> {questions.length} questions</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Ends {new Date(survey.end_date).toLocaleDateString()}</span>
          <span className="text-brand-500 font-semibold">+10 points</span>
        </div>
      </div>

      {/* Already completed */}
      {completed ? (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">Survey Completed!</h2>
          <p className="text-gray-500 mb-6">You've already submitted your responses for this survey.</p>
          <button onClick={() => navigate('/surveys')} className="btn-primary">Back to Surveys</button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {questions.map((q) => (
              <QuestionItem key={q.id} question={q} answer={answers[q.id]} onChange={setAnswer} />
            ))}
          </div>

          <div className="card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Answer all required questions (<span className="text-red-400">*</span>) before submitting.
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary flex-shrink-0">
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send className="w-4 h-4" /> Submit Survey</>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
