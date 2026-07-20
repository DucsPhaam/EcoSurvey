import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Clock, CheckCircle2, XCircle, Eye, Calendar, MapPin } from 'lucide-react'
import { participationService } from '../../services/participationService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import { useTranslation } from 'react-i18next'

export default function MyParticipations() {
  const { t } = useTranslation('participation')
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)
  const [selected, setSelected] = useState(null)

  const fetch = async (p = 1, s = '') => {
    setLoading(true)
    try {
      const res = await participationService.getMyParticipations({ page: p, limit: 8, status: s || undefined })
      setItems(res.data.participations)
      setTotal(res.data.total ?? 0)
      setTotalPages(res.data.totalPages)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const STATUS_COLORS = {
    Pending:  { badge: 'badge-pending',  icon: Clock,        iconColor: 'text-amber-500', label: t('myList.filterPending') },
    Approved: { badge: 'badge-approved', icon: CheckCircle2, iconColor: 'text-green-500', label: t('myList.filterApproved') },
    Rejected: { badge: 'badge-rejected', icon: XCircle,      iconColor: 'text-red-500',   label: t('myList.filterRejected') },
  }

  useEffect(() => { fetch(1, '') }, [])

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('myList.title')}</h1>
          <p className="page-subtitle">{t('myList.subtitle')}</p>
        </div>
        <Link to="/participations/submit" className="btn-primary hidden sm:inline-flex">
          <Plus className="w-4 h-4" /> {t('myList.submitBtn')}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: '', label: t('myList.filterAll') },
          { key: 'Pending', label: t('myList.filterPending') },
          { key: 'Approved', label: t('myList.filterApproved') },
          { key: 'Rejected', label: t('myList.filterRejected') }
        ].map((s) => (
          <button key={s.key} onClick={() => { setFilter(s.key); setPage(1); fetch(1, s.key) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s.key
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-400'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <SpinnerPage /> : items.length === 0 ? (
        <div className="card py-20 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">{t('myList.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('myList.emptyDesc')}</p>
          <Link to="/participations/submit" className="btn-primary mt-4 inline-flex">
            <Plus className="w-4 h-4" /> {t('myList.submitBtn')}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => {
              const { badge, icon: StatusIcon, iconColor, label } = STATUS_COLORS[item.status] || STATUS_COLORS.Pending
              return (
                <div key={item.id} className="card p-5 hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30' :
                      item.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                      <StatusIcon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.event_name}</h3>
                        <span className={badge}>{label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.created_at).toLocaleDateString()}</span>
                        <span>{item.files?.length || 0} {t('myList.filesCount')}</span>
                      </div>
                      {item.status === 'Rejected' && item.reject_reason && (
                        <p className="text-xs text-red-400 mt-1.5 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded-lg">
                          {t('myList.reason')}: {item.reject_reason}
                        </p>
                      )}
                      {item.status === 'Approved' && (
                        <p className="text-xs text-green-500 mt-1.5 font-medium">{t('myList.pointsAwarded')}</p>
                      )}
                    </div>
                    <button onClick={() => setSelected(item)}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-brand-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); fetch(p, filter) }} />
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-800 flex justify-between items-start">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">{selected.event_name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-400 text-xs">{t('myList.fields.location')}</p><p className="font-medium mt-0.5">{selected.location}</p></div>
                <div><p className="text-gray-400 text-xs">{t('myList.fields.participants')}</p><p className="font-medium mt-0.5">{selected.participant_count}</p></div>
                <div><p className="text-gray-400 text-xs">{t('myList.fields.status')}</p><span className={`${STATUS_COLORS[selected.status]?.badge} mt-0.5 inline-block`}>{STATUS_COLORS[selected.status]?.label}</span></div>
                <div><p className="text-gray-400 text-xs">{t('myList.fields.submitted')}</p><p className="font-medium mt-0.5">{new Date(selected.created_at).toLocaleDateString()}</p></div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">{t('myList.fields.description')}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed">{selected.description}</p>
              </div>
              {selected.ai_summary && (
                <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-3">
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-1">{t('myList.aiSummary')}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.ai_summary}</p>
                </div>
              )}
              {selected.files?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">{t('myList.evidenceFiles')} ({selected.files.length})</p>
                  <div className="space-y-1.5">
                    {selected.files.map((f) => (
                      <a key={f.id} href={f.file_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline">
                        <FileText className="w-3.5 h-3.5" /> {f.file_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
