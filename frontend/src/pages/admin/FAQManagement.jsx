import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, HelpCircle, Check, X } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const EMPTY = { question: '', answer: '', category: '', is_active: true }

export default function FAQManagement() {
  const { t } = useTranslation('admin')
  const [faqs, setFaqs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState({ ...EMPTY })
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving]     = useState(false)

  const fetch = async () => {
    setLoading(true)
    try { const r = await adminService.getFAQs(); setFaqs(r.data.faqs) }
    catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const openAdd  = () => { setEditing(null); setForm({ ...EMPTY }); setModal(true) }
  const openEdit = (f) => { setEditing(f); setForm({ question: f.question, answer: f.answer, category: f.category || '', is_active: f.is_active }); setModal(true) }

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) { toast.error('Question and answer are required.'); return }
    setSaving(true)
    try {
      if (editing) { await adminService.updateFAQ(editing.id, form); toast.success('FAQ updated.') }
      else          { await adminService.createFAQ(form);               toast.success('FAQ created.') }
      setModal(false)
      fetch()
    } catch { toast.error('Failed to save FAQ.') }
    finally { setSaving(false) }
  }

  const deleteFAQ = async (id) => {
    try { await adminService.deleteFAQ(id); toast.success('FAQ deleted.'); setDeleting(null); fetch() }
    catch { toast.error('Failed to delete FAQ.') }
  }

  const toggleActive = async (faq) => {
    try {
      await adminService.updateFAQ(faq.id, { is_active: !faq.is_active })
      setFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, is_active: !f.is_active } : f))
    } catch { toast.error('Failed to update FAQ.') }
  }

  // Group by category
  const grouped = faqs.reduce((acc, f) => {
    const cat = f.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3"><HelpCircle className="w-7 h-7 text-brand-600" /> {t('faq.title')}</h1>
          <p className="page-subtitle">{t('faq.subtitle')} {faqs.length} {t('faq.faqsTotal')}</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> {t('faq.addFaq')}</button>
      </div>

      {/* Info banner */}
      <div className="p-4 mb-6 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-2xl text-sm text-brand-700 dark:text-brand-300 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        {t('faq.infoBanner')}
      </div>

      {loading ? <SpinnerPage /> : faqs.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('faq.noFaqs')}</p>
          <button onClick={openAdd} className="btn-primary mt-4"><Plus className="w-4 h-4" /> {t('faq.addFaq')}</button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-px bg-gray-300 dark:bg-gray-700" />{cat}<span className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
              </h2>
              <div className="space-y-3">
                {items.map((faq) => (
                  <div key={faq.id} className={`card p-5 transition-all duration-200 ${!faq.is_active ? 'opacity-50' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{faq.question}</p>
                          {!faq.is_active && <span className="badge-rejected text-xs">{t('faq.inactive')}</span>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => toggleActive(faq)}
                          className={`p-1.5 rounded-lg transition-colors ${faq.is_active ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                          title={faq.is_active ? 'Deactivate' : 'Activate'}>
                          {faq.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(faq)}
                          className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-400 hover:text-brand-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleting(faq)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? t('faq.editFaq') : t('faq.addFaq')} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">{t('faq.question')} <span className="text-red-400">*</span></label>
            <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder={t('faq.questionPlaceholder')} className="input" />
          </div>
          <div>
            <label className="label">{t('faq.answer')} <span className="text-red-400">*</span></label>
            <textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder={t('faq.answerPlaceholder')} className="input resize-none" />
          </div>
          <div>
            <label className="label">{t('faq.category')}</label>
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder={t('faq.categoryPlaceholder')} className="input" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="faq-active" checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-brand-600" />
            <label htmlFor="faq-active" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{t('faq.activeLabel')}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">{t('faq.cancel')}</button>
            <button onClick={save} disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editing ? t('faq.updateFaq') : t('faq.createFaq')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title={t('faq.deleteTitle')} size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('faq.deleteDesc')}</p>
        <p className="font-medium text-gray-800 dark:text-gray-200 mb-4 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">{deleting?.question}</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleting(null)} className="btn-secondary flex-1">{t('faq.cancel')}</button>
          <button onClick={() => deleteFAQ(deleting.id)} className="btn-danger flex-1">{t('faq.deleteBtn')}</button>
        </div>
      </Modal>
    </div>
  )
}
