import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, Eye, Download, Sparkles, MapPin, Users, Calendar, FileText, RefreshCw } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { exportService, downloadBlob } from '../../services/exportService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

const STATUS_BADGE = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected' }

// Fix: dùng axios (gửi Bearer token) thay vì <a href> — browser navigation không gửi auth header
const downloadFile = async (fn, filename) => {
  try {
    const res = await fn()
    downloadBlob(res.data, filename)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Export failed. Please try again.')
  }
}

export default function ParticipationReview() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('Pending')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)
  const [detail, setDetail]     = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [summarizing, setSummarizing] = useState(false)

  const fetch = async (p = 1, s = filter) => {
    setLoading(true)
    try {
      const res = await adminService.getParticipations({ page: p, limit: 10, status: s || undefined })
      setItems(res.data.participations); setTotal(res.data.total); setTotalPages(res.data.totalPages)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetch(1, filter) }, [filter])

  const review = async (id, status, reason = '') => {
    setActionLoading(true)
    try {
      await adminService.reviewParticipation(id, { status, reject_reason: reason || undefined })
      toast.success(`Report ${status === 'Approved' ? 'approved! +50 pts awarded.' : 'rejected.'}`)
      setRejectModal(null); setRejectReason('')
      setDetail(null)
      fetch(page, filter)
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed.') }
    finally { setActionLoading(false) }
  }

  const summarize = async (partId, force = false) => {
    setSummarizing(true)
    try {
      const res = await adminService.summarizeParticipation(partId, force)
      toast.success(res.data.cached ? 'Summary loaded from cache.' : 'AI summary generated!')
      setDetail((d) => d ? { ...d, ai_summary: res.data.ai_summary } : d)
      setItems((prev) => prev.map((i) => i.id === partId ? { ...i, ai_summary: res.data.ai_summary } : i))
    } catch { toast.error('Failed to generate summary.') }
    finally { setSummarizing(false) }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><FileText className="w-7 h-7 text-brand-600" /> Participation Reports</h1>
        <p className="page-subtitle">Review and approve student/staff activity reports. {total} reports matching filter.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['Pending', 'Approved', 'Rejected', ''].map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s ? 'bg-brand-600 text-white shadow-glow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-400'}`}>
            {s || 'All'}
          </button>
        ))}
        <button
          onClick={() => downloadFile(() => exportService.exportParticipationsPDF(), 'participations_report.pdf')}
          className="btn-secondary text-sm py-2 ml-auto flex items-center gap-2">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {loading ? <SpinnerPage /> : items.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No {filter.toLowerCase() || ''} reports found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="card p-5 hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30' :
                    item.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    {item.status === 'Approved' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                     item.status === 'Rejected' ? <XCircle className="w-5 h-5 text-red-500" /> :
                     <Clock className="w-5 h-5 text-amber-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.event_name}</h3>
                      <span className={STATUS_BADGE[item.status]}>{item.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                      <span className="font-medium text-gray-600 dark:text-gray-300">{item.user?.full_name}</span>
                      <span className="badge-draft">{item.user?.role}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.participant_count} people</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    {item.ai_summary && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-brand-50 dark:bg-brand-900/10 px-3 py-1.5 rounded-lg flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 text-brand-500 flex-shrink-0 mt-0.5" />
                        <span className="italic">{item.ai_summary}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setDetail(item)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-brand-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    {!item.ai_summary && (
                      <button onClick={() => summarize(item.id)}
                        className="p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-400 hover:text-brand-600 transition-colors" title="Generate AI Summary">
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                    {item.status === 'Pending' && (
                      <>
                        <button onClick={() => review(item.id, 'Approved')}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => setRejectModal(item)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); fetch(p, filter) }} />
        </>
      )}

      {/* Detail modal */}
      {detail && (
        <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail.event_name} size="xl">
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[['Submitted by', `${detail.user?.full_name} (${detail.user?.role})`],
                ['Location', detail.location],
                ['Participants', detail.participant_count],
                ['Date', new Date(detail.created_at).toLocaleDateString()],
              ].map(([l, v]) => (
                <div key={l}><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-medium mt-0.5 text-gray-800 dark:text-gray-200">{v}</p></div>
              ))}
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-40 overflow-y-auto">
                {detail.description}
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-900/20 dark:to-accent-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-brand-700 dark:text-brand-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Summary
                </p>
                <button onClick={() => summarize(detail.id, true)} disabled={summarizing}
                  className="text-xs text-brand-600 hover:underline flex items-center gap-1 disabled:opacity-50">
                  {summarizing ? <span className="w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {detail.ai_summary ? 'Re-generate' : 'Generate'}
                </button>
              </div>
              {detail.ai_summary ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">{detail.ai_summary}</p>
              ) : (
                <p className="text-sm text-gray-400">No AI summary yet. Click "Generate" to create one.</p>
              )}
            </div>

            {/* Files */}
            {detail.files?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Evidence Files ({detail.files.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {detail.files.map((f) => (
                    <a key={f.id} href={f.file_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-brand-600 dark:text-brand-400 hover:bg-gray-100 transition-colors">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{f.file_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {detail.status === 'Pending' && (
              <div className="flex gap-3 pt-2 border-t dark:border-gray-800">
                <button onClick={() => { setRejectModal(detail); setDetail(null) }}
                  className="btn-danger flex-1">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button onClick={() => review(detail.id, 'Approved')} disabled={actionLoading}
                  className="btn-primary flex-1">
                  {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Approve (+50 pts)</>}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject modal */}
      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title={`Reject: ${rejectModal?.event_name}`} size="sm">
        <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection (optional)…" className="input mb-4" />
        <div className="flex gap-3">
          <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => review(rejectModal.id, 'Rejected', rejectReason)} disabled={actionLoading}
            className="btn-danger flex-1 flex items-center justify-center gap-2">
            {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      </Modal>
    </div>
  )
}
