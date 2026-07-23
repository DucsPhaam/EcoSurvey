import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, GripVertical, Save, Eye, Globe, CheckSquare, Type, List } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const Q_TYPES = (t) => [
  { value: 'Text',            label: t('surveyEditor.textOpenEnded'),    icon: Type },
  { value: 'Single_Choice',   label: t('surveyEditor.singleChoice'),        icon: List },
  { value: 'Multiple_Choice', label: t('surveyEditor.multipleChoice'),      icon: CheckSquare },
]

function QuestionCard({ q, index, onEdit, onDelete, onDragStart, onDragOver, onDrop, t }) {
  return (
    <div draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
      onDrop={() => onDrop(index)}
      className="card p-5 group border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-200 cursor-grab active:cursor-grabbing">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-1 text-gray-300 dark:text-gray-600 group-hover:text-brand-400 transition-colors">
          <GripVertical className="w-4 h-4" />
          <span className="text-xs font-bold">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs badge-published">{q.question_type === 'Text' ? t('surveyEditor.textOpenEnded') : q.question_type === 'Single_Choice' ? t('surveyEditor.singleChoice') : t('surveyEditor.multipleChoice')}</span>
            {q.is_required && <span className="text-xs text-red-400 font-medium">{t('surveyEditor.required')}</span>}
          </div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{q.question_text}</p>
          {Array.isArray(q.options) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {q.options.map((opt, i) => (
                <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{opt}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(q)} className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-400 hover:text-brand-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => onDelete(q.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const EMPTY_Q = { question_text: '', question_type: 'Text', options: [], is_required: true }

// Module-level helper — returns current local time as "YYYY-MM-DDTHH:mm".
// Must be outside the component so it can be called in the useState lazy initializer.
const localNow = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export default function SurveyEditor() {
  const { t } = useTranslation('admin')
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id

  const [survey, setSurvey]         = useState(null)
  const [questions, setQuestions]   = useState([])
  const [loading, setLoading]       = useState(!isNew)
  const [saving, setSaving]         = useState(false)
  const [qModal, setQModal]         = useState(false)
  const [editingQ, setEditingQ]     = useState(null)
  const [qForm, setQForm]           = useState({ ...EMPTY_Q })
  const [optionInput, setOptionInput] = useState('')
  const [dragFrom, setDragFrom]     = useState(null)

  // Survey form — initialise date fields with current local time so the
  // browser's native "Today" button works (it only changes the date part;
  // if the time part is empty the full value stays invalid and Today appears
  // to do nothing).
  const [sForm, setSForm] = useState(() => ({
    title: '', description: '', target_role: 'All',
    start_date: localNow(), end_date: localNow(), status: 'Draft'
  }))

  // Convert UTC ISO string from API → local datetime-local input value (YYYY-MM-DDTHH:mm)
  const toLocalDatetimeInput = (isoStr) => {
    if (!isoStr) return ''
    // new Date() parses ISO/UTC strings correctly across all browsers
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    // Use local getters so the displayed time matches the user's machine timezone
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  // Convert datetime-local input value → UTC ISO string for the API
  // datetime-local returns "YYYY-MM-DDTHH:mm" (local time, no tz info)
  // We interpret it as local time and convert to UTC.
  const toUTCIso = (localStr) => {
    if (!localStr) return ''
    const [datePart, timePart] = localStr.split('T')
    if (!datePart || !timePart) return ''
    const [y, m, d] = datePart.split('-').map(Number)
    const [h, min] = timePart.split(':').map(Number)
    const dateObj = new Date(y, m - 1, d, h, min)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toISOString()
  }


  useEffect(() => {
    if (!isNew && id) {
      adminService.getSurveyById(id)
        .then((r) => {
          const s = r.data.survey
          setSurvey(s)
          setQuestions(s.questions || [])
          setSForm({
            title: s.title,
            description: s.description || '',
            target_role: s.target_role,
            start_date: toLocalDatetimeInput(s.start_date),
            end_date: toLocalDatetimeInput(s.end_date),
            status: s.status,
          })
        })
        .catch(() => navigate('/admin/surveys'))
        .finally(() => setLoading(false))
    }
  }, [id])

  const saveSurvey = async () => {
    if (!sForm.title) { toast.error(t('surveyEditor.titleRequired')); return }
    setSaving(true)
    try {
      // Convert datetime-local values (local time) → UTC ISO strings for the API
      const payload = {
        ...sForm,
        start_date: toUTCIso(sForm.start_date),
        end_date:   toUTCIso(sForm.end_date),
      }
      if (isNew) {
        const res = await adminService.createSurvey(payload)
        toast.success(t('surveyEditor.surveyCreated'))
        navigate(`/admin/surveys/${res.data.survey.id}/edit`)
      } else {
        await adminService.updateSurvey(id, payload)
        toast.success(t('surveyEditor.surveySaved'))
      }
    } catch (err) { toast.error(err.response?.data?.message || t('surveyEditor.saveFailed')) }
    finally { setSaving(false) }
  }

  const openAddQ = () => { setEditingQ(null); setQForm({ ...EMPTY_Q }); setOptionInput(''); setQModal(true) }
  const openEditQ = (q) => { setEditingQ(q); setQForm({ question_text: q.question_text, question_type: q.question_type, options: Array.isArray(q.options) ? q.options : [], is_required: q.is_required }); setOptionInput(''); setQModal(true) }

  const addOption = () => {
    const txt = optionInput.trim()
    if (!txt) return
    if (qForm.options.length >= 10) { toast.error(t('surveyEditor.maxOptions')); return }
    setQForm((f) => ({ ...f, options: [...f.options, txt] }))
    setOptionInput('')
  }

  const saveQuestion = async () => {
    if (!qForm.question_text.trim()) { toast.error(t('surveyEditor.questionTextRequired')); return }
    if (['Single_Choice', 'Multiple_Choice'].includes(qForm.question_type) && qForm.options.length < 2) {
      toast.error(t('surveyEditor.choiceNeedOptions')); return
    }
    try {
      if (editingQ) {
        await adminService.updateQuestion(id, editingQ.id, { ...qForm, options: qForm.question_type === 'Text' ? null : qForm.options })
        toast.success(t('surveyEditor.questionUpdated'))
      } else {
        const payload = { ...qForm, order_num: questions.length, options: qForm.question_type === 'Text' ? null : qForm.options }
        await adminService.createQuestion(id, payload)
        toast.success(t('surveyEditor.questionAdded'))
      }
      const qs = await adminService.getQuestions(id)
      setQuestions(qs.data.questions)
      setQModal(false)
    } catch (err) { toast.error(err.response?.data?.message || t('surveyEditor.saveQuestionFailed')) }
  }

  const deleteQuestion = async (qId) => {
    if (!window.confirm(t('surveyEditor.deleteConfirm'))) return
    try {
      await adminService.deleteQuestion(id, qId)
      setQuestions((qs) => qs.filter((q) => q.id !== qId))
      toast.success(t('surveyEditor.questionDeleted'))
    } catch { toast.error(t('surveyEditor.deleteFailed')) }
  }

  // Drag & drop reorder
  const handleDrop = async (toIndex) => {
    if (dragFrom === null || dragFrom === toIndex) return
    const reordered = [...questions]
    const [moved] = reordered.splice(dragFrom, 1)
    reordered.splice(toIndex, 0, moved)
    setQuestions(reordered)
    setDragFrom(null)
    try {
      await adminService.reorderQuestions(id, reordered.map((q, i) => ({ id: q.id, order_num: i })))
    } catch { toast.error(t('surveyEditor.orderSavedFailed')) }
  }

  if (loading) return <SpinnerPage />

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/surveys')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <ChevronLeft className="w-4 h-4" /> {t('surveyEditor.back')}
        </button>
        <div className="flex-1">
          <h1 className="page-title">{isNew ? t('surveyEditor.createSurvey') : t('surveyEditor.editSurvey')}</h1>
          {survey && <span className={`badge-${survey.status === 'Draft' ? 'draft' : survey.status === 'Published' ? 'published' : 'closed'} mt-1 inline-block`}>{survey.status === 'Draft' ? t('surveyEditor.draft') : survey.status === 'Published' ? t('surveyEditor.published') : t('surveyEditor.closed')}</span>}
        </div>
        <button onClick={saveSurvey} disabled={saving} className="btn-primary">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {t('surveyEditor.save')}</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Survey details */}
        <div className="lg:col-span-1">
          <div className="card p-6 space-y-4 sticky top-24">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">{t('surveyEditor.surveyDetails')}</h2>
            <div>
              <label className="label">{t('surveyEditor.title')} <span className="text-red-400">*</span></label>
              <input value={sForm.title} onChange={(e) => setSForm({ ...sForm, title: e.target.value })} placeholder={t('surveyEditor.titlePlaceholder')} className="input" />
            </div>
            <div>
              <label className="label">{t('surveyEditor.description')}</label>
              <textarea rows={3} value={sForm.description} onChange={(e) => setSForm({ ...sForm, description: e.target.value })} placeholder={t('surveyEditor.descriptionPlaceholder')} className="input resize-none" />
            </div>
            <div>
              <label className="label">{t('surveyEditor.targetAudience')}</label>
              <select value={sForm.target_role} onChange={(e) => setSForm({ ...sForm, target_role: e.target.value })} className="input">
                <option value="All">{t('surveyEditor.all')}</option>
                <option value="Student">{t('surveyEditor.student')}</option>
                <option value="Staff">{t('surveyEditor.staff')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('surveyEditor.status')}</label>
              <select value={sForm.status} onChange={(e) => setSForm({ ...sForm, status: e.target.value })} className="input">
                <option value="Draft">{t('surveyEditor.draft')}</option>
                <option value="Published">{t('surveyEditor.published')}</option>
                <option value="Closed">{t('surveyEditor.closed')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('surveyEditor.startDate')}</label>
              <input type="datetime-local" value={sForm.start_date}
                onChange={(e) => setSForm({ ...sForm, start_date: e.target.value })}
                className="input" />
            </div>
            <div>
              <label className="label">{t('surveyEditor.endDate')}</label>
              <input type="datetime-local" value={sForm.end_date}
                onChange={(e) => setSForm({ ...sForm, end_date: e.target.value })}
                className="input" />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">
              {t('surveyEditor.questions')} <span className="text-gray-400 font-normal text-sm ml-2">({questions.length})</span>
            </h2>
            {!isNew && (
              <button onClick={openAddQ} className="btn-primary text-sm py-2">
                <Plus className="w-4 h-4" /> {t('surveyEditor.addQuestion')}
              </button>
            )}
          </div>

          {isNew ? (
            <div className="card p-10 text-center text-gray-400">
              <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{t('surveyEditor.saveSurveyFirst')}</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">
              <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{t('surveyEditor.noQuestionsYet')}</p>
              <button onClick={openAddQ} className="btn-primary mt-4 text-sm"><Plus className="w-4 h-4" /> {t('surveyEditor.addQuestion')}</button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i} t={t}
                  onEdit={openEditQ} onDelete={deleteQuestion}
                  onDragStart={setDragFrom} onDragOver={() => {}} onDrop={handleDrop} />
              ))}
              <div className="text-xs text-gray-400 text-center py-2">
                <GripVertical className="w-3 h-3 inline mr-1" /> {t('surveyEditor.dragToReorder')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question modal */}
      <Modal isOpen={qModal} onClose={() => setQModal(false)} title={editingQ ? t('surveyEditor.editQuestion') : t('surveyEditor.addQuestion')} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">{t('surveyEditor.questionType')}</label>
            <div className="grid grid-cols-3 gap-2">
              {Q_TYPES(t).map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" onClick={() => setQForm((f) => ({ ...f, question_type: value, options: [] }))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-1.5 ${
                    qForm.question_type === value
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">{t('surveyEditor.questionText')} <span className="text-red-400">*</span></label>
            <textarea rows={3} value={qForm.question_text} onChange={(e) => setQForm((f) => ({ ...f, question_text: e.target.value }))}
              placeholder={t('surveyEditor.questionTextPlaceholder')} className="input resize-none" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="q-required" checked={qForm.is_required}
              onChange={(e) => setQForm((f) => ({ ...f, is_required: e.target.checked }))}
              className="w-4 h-4 accent-brand-600 rounded" />
            <label htmlFor="q-required" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{t('surveyEditor.requiredQuestion')}</label>
          </div>

          {['Single_Choice', 'Multiple_Choice'].includes(qForm.question_type) && (
            <div>
              <label className="label">{t('surveyEditor.options')} ({qForm.options.length}/10)</label>
              <div className="space-y-2 mb-2">
                {qForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <span className="text-xs text-gray-400 w-5 text-center">{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                    <button type="button" onClick={() => setQForm((f) => ({ ...f, options: f.options.filter((_, j) => j !== i) }))}
                      className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={optionInput} onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  placeholder={t('surveyEditor.typeOptionPlaceholder')} className="input flex-1 py-2 text-sm" />
                <button type="button" onClick={addOption} className="btn-secondary py-2 px-3 text-sm">{t('surveyEditor.add')}</button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setQModal(false)} className="btn-secondary flex-1">{t('surveyEditor.cancel')}</button>
            <button onClick={saveQuestion} className="btn-primary flex-1">
              {editingQ ? t('surveyEditor.updateQuestion') : t('surveyEditor.addQuestion')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
