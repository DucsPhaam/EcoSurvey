import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, GripVertical, Save, Eye, Globe, CheckSquare, Type, List } from 'lucide-react'
import api from '../../services/axiosInstance'
import { SpinnerPage } from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

const Q_TYPES = [
  { value: 'Text',            label: 'Text (Open-ended)',    icon: Type },
  { value: 'Single_Choice',   label: 'Single Choice',        icon: List },
  { value: 'Multiple_Choice', label: 'Multiple Choice',      icon: CheckSquare },
]

function QuestionCard({ q, index, onEdit, onDelete, onDragStart, onDragOver, onDrop }) {
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
            <span className="text-xs badge-published">{q.question_type.replace('_', ' ')}</span>
            {q.is_required && <span className="text-xs text-red-400 font-medium">Required</span>}
          </div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{q.question_text}</p>
          {q.options && (
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

export default function SurveyEditor() {
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

  // Survey form
  const [sForm, setSForm] = useState({ title: '', description: '', target_role: 'All', start_date: '', end_date: '', status: 'Draft' })

  useEffect(() => {
    if (!isNew && id) {
      Promise.all([
        api.get(`/admin/surveys`).then((r) => r.data.surveys.find((s) => s.id === parseInt(id))),
        api.get(`/admin/surveys/${id}/questions`).then((r) => r.data.questions),
      ]).then(([s, qs]) => {
        if (s) {
          setSurvey(s)
          setSForm({ title: s.title, description: s.description || '', target_role: s.target_role, start_date: s.start_date?.slice(0, 16) || '', end_date: s.end_date?.slice(0, 16) || '', status: s.status })
        }
        setQuestions(qs || [])
      }).catch(() => navigate('/admin/surveys')).finally(() => setLoading(false))
    }
  }, [id])

  const saveSurvey = async () => {
    if (!sForm.title) { toast.error('Title is required.'); return }
    setSaving(true)
    try {
      if (isNew) {
        const res = await api.post('/admin/surveys', sForm)
        toast.success('Survey created! Now add questions.')
        navigate(`/admin/surveys/${res.data.survey.id}/edit`)
      } else {
        await api.patch(`/admin/surveys/${id}`, sForm)
        toast.success('Survey saved.')
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const openAddQ = () => { setEditingQ(null); setQForm({ ...EMPTY_Q }); setOptionInput(''); setQModal(true) }
  const openEditQ = (q) => { setEditingQ(q); setQForm({ question_text: q.question_text, question_type: q.question_type, options: q.options || [], is_required: q.is_required }); setOptionInput(''); setQModal(true) }

  const addOption = () => {
    const t = optionInput.trim()
    if (!t) return
    if (qForm.options.length >= 10) { toast.error('Maximum 10 options.'); return }
    setQForm((f) => ({ ...f, options: [...f.options, t] }))
    setOptionInput('')
  }

  const saveQuestion = async () => {
    if (!qForm.question_text.trim()) { toast.error('Question text is required.'); return }
    if (['Single_Choice', 'Multiple_Choice'].includes(qForm.question_type) && qForm.options.length < 2) {
      toast.error('Choice questions need at least 2 options.'); return
    }
    try {
      if (editingQ) {
        await api.patch(`/admin/questions/${editingQ.id}`, { ...qForm, options: qForm.question_type === 'Text' ? null : qForm.options })
        toast.success('Question updated.')
      } else {
        const payload = { ...qForm, order_num: questions.length, options: qForm.question_type === 'Text' ? null : qForm.options }
        await api.post(`/admin/surveys/${id}/questions`, payload)
        toast.success('Question added.')
      }
      const qs = await api.get(`/admin/surveys/${id}/questions`)
      setQuestions(qs.data.questions)
      setQModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save question.') }
  }

  const deleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return
    try {
      await api.delete(`/admin/questions/${qId}`)
      setQuestions((qs) => qs.filter((q) => q.id !== qId))
      toast.success('Question deleted.')
    } catch { toast.error('Failed to delete question.') }
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
      await api.patch(`/admin/surveys/${id}/questions/reorder`, {
        order: reordered.map((q, i) => ({ id: q.id, order_num: i }))
      })
    } catch { toast.error('Failed to save order.') }
  }

  if (loading) return <SpinnerPage />

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/surveys')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1">
          <h1 className="page-title">{isNew ? 'Create Survey' : 'Edit Survey'}</h1>
          {survey && <span className={`badge-${survey.status === 'Draft' ? 'draft' : survey.status === 'Published' ? 'published' : 'closed'} mt-1 inline-block`}>{survey.status}</span>}
        </div>
        <button onClick={saveSurvey} disabled={saving} className="btn-primary">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Survey details */}
        <div className="lg:col-span-1">
          <div className="card p-6 space-y-4 sticky top-24">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">Survey Details</h2>
            <div>
              <label className="label">Title <span className="text-red-400">*</span></label>
              <input value={sForm.title} onChange={(e) => setSForm({ ...sForm, title: e.target.value })} placeholder="Survey title…" className="input" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={3} value={sForm.description} onChange={(e) => setSForm({ ...sForm, description: e.target.value })} placeholder="Optional description…" className="input resize-none" />
            </div>
            <div>
              <label className="label">Target Audience</label>
              <select value={sForm.target_role} onChange={(e) => setSForm({ ...sForm, target_role: e.target.value })} className="input">
                <option>All</option><option>Student</option><option>Staff</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={sForm.status} onChange={(e) => setSForm({ ...sForm, status: e.target.value })} className="input">
                <option>Draft</option><option>Published</option><option>Closed</option>
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="datetime-local" value={sForm.start_date} onChange={(e) => setSForm({ ...sForm, start_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="datetime-local" value={sForm.end_date} onChange={(e) => setSForm({ ...sForm, end_date: e.target.value })} className="input" />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">
              Questions <span className="text-gray-400 font-normal text-sm ml-2">({questions.length})</span>
            </h2>
            {!isNew && (
              <button onClick={openAddQ} className="btn-primary text-sm py-2">
                <Plus className="w-4 h-4" /> Add Question
              </button>
            )}
          </div>

          {isNew ? (
            <div className="card p-10 text-center text-gray-400">
              <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Save the survey first, then add questions.</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">
              <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No questions yet. Add your first question!</p>
              <button onClick={openAddQ} className="btn-primary mt-4 text-sm"><Plus className="w-4 h-4" /> Add Question</button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i}
                  onEdit={openEditQ} onDelete={deleteQuestion}
                  onDragStart={setDragFrom} onDragOver={() => {}} onDrop={handleDrop} />
              ))}
              <div className="text-xs text-gray-400 text-center py-2">
                <GripVertical className="w-3 h-3 inline mr-1" /> Drag to reorder questions
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question modal */}
      <Modal isOpen={qModal} onClose={() => setQModal(false)} title={editingQ ? 'Edit Question' : 'Add Question'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Question Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Q_TYPES.map(({ value, label, icon: Icon }) => (
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
            <label className="label">Question Text <span className="text-red-400">*</span></label>
            <textarea rows={3} value={qForm.question_text} onChange={(e) => setQForm((f) => ({ ...f, question_text: e.target.value }))}
              placeholder="Enter your question…" className="input resize-none" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="q-required" checked={qForm.is_required}
              onChange={(e) => setQForm((f) => ({ ...f, is_required: e.target.checked }))}
              className="w-4 h-4 accent-brand-600 rounded" />
            <label htmlFor="q-required" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Required question</label>
          </div>

          {['Single_Choice', 'Multiple_Choice'].includes(qForm.question_type) && (
            <div>
              <label className="label">Options ({qForm.options.length}/10)</label>
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
                  placeholder="Type option and press Enter…" className="input flex-1 py-2 text-sm" />
                <button type="button" onClick={addOption} className="btn-secondary py-2 px-3 text-sm">Add</button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setQModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={saveQuestion} className="btn-primary flex-1">
              {editingQ ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
