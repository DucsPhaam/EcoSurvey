import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, Download, Eye, ClipboardList, Search, Globe, Star } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { exportService, downloadBlob } from '../../services/exportService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const downloadFile = async (fn, filename) => {
  try {
    const res = await fn()
    downloadBlob(res.data, filename)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Export failed.')
  }
}

const STATUS_BADGE = { Draft: 'badge-draft', Published: 'badge-published', Closed: 'badge-closed' }

export default function SurveyManagement() {
  const [surveys, setSurveys]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusF, setStatusF]   = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)
  const [createModal, setCreateModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', target_role: 'All', start_date: '', end_date: '', status: 'Draft' })

  const fetch = async (p = 1) => {
    setLoading(true)
    try {
      const res = await adminService.getSurveys({ page: p, limit: 10, search: search || undefined, status: statusF || undefined })
      setSurveys(res.data.surveys); setTotal(res.data.total); setTotalPages(res.data.totalPages)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetch(1) }, [statusF])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetch(1) }

  const createSurvey = async () => {
    if (!form.title || !form.start_date || !form.end_date) { toast.error('Title, start and end date required.'); return }
    setActionLoading(true)
    try {
      await adminService.createSurvey(form)
      toast.success('Survey created.')
      setCreateModal(false)
      setForm({ title: '', description: '', target_role: 'All', start_date: '', end_date: '', status: 'Draft' })
      fetch(1)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create survey.') }
    finally { setActionLoading(false) }
  }

  const deleteSurvey = async (id) => {
    setActionLoading(true)
    try {
      await adminService.deleteSurvey(id)
      toast.success('Survey deleted.')
      setDeleteModal(null)
      fetch(page)
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete survey.') }
    finally { setActionLoading(false) }
  }

  const quickStatus = async (id, status) => {
    try {
      await adminService.updateSurvey(id, { status })
      toast.success(`Survey ${status.toLowerCase()}.`)
      fetch(page)
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed.') }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3"><ClipboardList className="w-7 h-7 text-brand-600" /> Survey Management</h1>
          <p className="page-subtitle">{total} surveys total.</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Survey
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search surveys…" className="input pl-9 py-2" />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
        </form>
        <select value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(1) }} className="input py-2 w-auto">
          <option value="">All Statuses</option>
          <option>Draft</option><option>Published</option><option>Closed</option>
        </select>
      </div>

      {loading ? <SpinnerPage /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>{['Survey', 'Target', 'Status', 'Questions', 'Responses', 'Period', 'Actions'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {surveys.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">No surveys found.</td></tr>
                ) : surveys.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell max-w-56">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{s.title}</p>
                      <p className="text-xs text-gray-400">{s.creator?.full_name}</p>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Globe className="w-3 h-3" /> {s.target_role}
                      </span>
                    </td>
                    <td className="table-cell"><span className={STATUS_BADGE[s.status]}>{s.status}</span></td>
                    <td className="table-cell text-center text-sm font-medium">{s.question_count || 0}</td>
                    <td className="table-cell text-center text-sm font-medium">{s.response_count || 0}</td>
                    <td className="table-cell text-xs text-gray-400">
                      <div>{new Date(s.start_date).toLocaleDateString()}</div>
                      <div>→ {new Date(s.end_date).toLocaleDateString()}</div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/surveys/${s.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        {/* Chấm điểm — chỉ hiện khi survey có bài làm */}
                        {(s.response_count > 0) && (
                          <Link to={`/admin/surveys/${s.id}/grade`}
                            className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition-colors" title="Chấm điểm ý kiến">
                            <Star className="w-4 h-4" />
                          </Link>
                        )}
                        {s.status === 'Draft' && (
                          <button onClick={() => quickStatus(s.id, 'Published')}
                            className="px-2 py-1 rounded-lg text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors">
                            Publish
                          </button>
                        )}
                        {s.status === 'Published' && (
                          <button onClick={() => quickStatus(s.id, 'Closed')}
                            className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 transition-colors">
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => downloadFile(() => exportService.exportSurveyExcel(s.id), `survey_${s.id}_results.xlsx`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors" title="Export Excel">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteModal(s)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); fetch(p) }} />

      {/* Create modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Survey" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Title <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Survey title…" className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the survey purpose…" className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Target Audience</label>
              <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} className="input">
                <option>All</option><option>Student</option><option>Staff</option>
              </select>
            </div>
            <div>
              <label className="label">Initial Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option>Draft</option><option>Published</option>
              </select>
            </div>
            <div>
              <label className="label">Start Date <span className="text-red-400">*</span></label>
              <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">End Date <span className="text-red-400">*</span></label>
              <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={createSurvey} disabled={actionLoading} className="btn-primary flex-1">
              {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Survey'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Survey" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Delete "<strong>{deleteModal?.title}</strong>"?</p>
        {deleteModal?.response_count > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl mb-4">⚠️ This survey has {deleteModal.response_count} responses. Close it instead of deleting to preserve data.</p>
        )}
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => deleteSurvey(deleteModal.id)} disabled={actionLoading} className="btn-danger flex-1">
            {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
