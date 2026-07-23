import { useEffect, useState } from 'react'
import { Search, Check, X, Trash2, Filter, Users, ChevronDown, Upload } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const ROLE_COLORS   = { Student: 'badge-published', Staff: 'badge-pending', Admin: 'badge-approved' }
const STATUS_COLORS = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected' }

export default function UserManagement() {
  const { t } = useTranslation('admin')
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('')
  const [statusFilter, setStatus] = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)

  const [rejectModal, setRejectModal] = useState(null) // { user }
  const [rejectReason, setRejectReason] = useState('')
  const [deleteModal, setDeleteModal]   = useState(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importErrors, setImportErrors] = useState([])
  const [actionLoading, setActionLoading] = useState(false)

  const fetch = async (p = 1) => {
    setLoading(true)
    try {
      const res = await adminService.getUsers({
        page: p, limit: 12, search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined
      })
      setUsers(res.data.users); setTotal(res.data.total); setTotalPages(res.data.totalPages)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetch(1) }, [roleFilter, statusFilter])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetch(1) }

  const updateStatus = async (userId, status, reason = '') => {
    setActionLoading(true)
    try {
      await adminService.updateUserStatus(userId, { status, reject_reason: reason || undefined })
      toast.success(status === 'Approved' ? t('userManagement.approved') : t('userManagement.rejected'))
      setRejectModal(null); setRejectReason('')
      fetch(page)
    } catch (err) { toast.error(err.response?.data?.message || t('userManagement.actionFailed')) }
    finally { setActionLoading(false) }
  }

  const deleteUser = async (userId) => {
    setActionLoading(true)
    try {
      await adminService.deleteUser(userId)
      toast.success(t('userManagement.deleted'))
      setDeleteModal(null)
      fetch(page)
    } catch (err) { toast.error(err.response?.data?.message || t('userManagement.deleteFailed')) }
    finally { setActionLoading(false) }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!importFile) return toast.error(t('userManagement.importReq'))
    
    setActionLoading(true)
    setImportErrors([])
    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const res = await adminService.importUsers(formData)
      toast.success(res.data.message)
      if (res.data.errors && res.data.errors.length > 0) {
        setImportErrors(res.data.errors)
      } else {
        setImportModalOpen(false)
        setImportFile(null)
      }
      fetch(page)
    } catch (err) {
      toast.error(err.response?.data?.message || t('userManagement.importFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><Users className="w-7 h-7 text-brand-600" /> {t('userManagement.title')}</h1>
        <p className="page-subtitle">{t('userManagement.subtitle')} <span className="font-semibold text-gray-700 dark:text-gray-300">{t('userManagement.totalUsers', { total })}</span></p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('userManagement.searchPlaceholder')} className="input pl-9 py-2" />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">{t('userManagement.searchBtn')}</button>
        </form>
        <select value={roleFilter} onChange={(e) => { setRole(e.target.value); setPage(1) }}
          className="input py-2 w-auto">
          <option value="">{t('userManagement.allRoles')}</option>
          <option value="Student">Student</option><option value="Staff">Staff</option><option value="Admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input py-2 w-auto">
          <option value="">{t('userManagement.allStatuses')}</option>
          <option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option>
        </select>
        <button onClick={() => setImportModalOpen(true)} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
          <Upload className="w-4 h-4" /> {t('userManagement.importExcel')}
        </button>
      </div>

      {/* Table */}
      {loading ? <SpinnerPage /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {[t('userManagement.tableUser'), t('userManagement.tableRole'), t('userManagement.tableStatus'), t('userManagement.tableIdClass'), t('userManagement.tableDept'), t('userManagement.tableJoined'), t('userManagement.tableActions')].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">{t('userManagement.noUsers')}</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.full_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{u.full_name}</p>
                          <p className="text-xs text-gray-400">@{u.username} · {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><span className={ROLE_COLORS[u.role]}>{u.role}</span></td>
                    <td className="table-cell"><span className={STATUS_COLORS[u.status]}>{u.status}</span></td>
                    <td className="table-cell text-xs">
                      <span>{u.student_staff_id || '—'}</span>
                      {u.class_name && <span className="text-gray-400 block">{u.class_name}</span>}
                    </td>
                    <td className="table-cell text-xs text-gray-500 max-w-32 truncate">{u.department || '—'}</td>
                    <td className="table-cell text-xs text-gray-400">{u.joined_date ? new Date(u.joined_date).toLocaleDateString() : '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {u.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(u.id, 'Approved')}
                              className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors" title={t('userManagement.approve')}>
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setRejectModal(u)}
                              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors" title={t('userManagement.reject')}>
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {u.status === 'Approved' && u.role !== 'Admin' && (
                          <button onClick={() => setRejectModal(u)}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition-colors text-xs font-medium px-2" title={t('userManagement.lock')}>
                            {t('userManagement.lock')}
                          </button>
                        )}
                        {u.role !== 'Admin' && (
                          <button onClick={() => setDeleteModal(u)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors" title={t('userManagement.delete')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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

      {/* Reject modal */}
      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title={t('userManagement.rejectTitle', { name: rejectModal?.full_name })}>
        <p className="text-sm text-gray-500 mb-4">{t('userManagement.rejectDesc')}</p>
        <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
          placeholder={t('userManagement.rejectPlaceholder')} className="input mb-4" />
        <div className="flex gap-3">
          <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="btn-secondary flex-1">{t('userManagement.cancel')}</button>
          <button onClick={() => updateStatus(rejectModal.id, 'Rejected', rejectReason)} disabled={actionLoading}
            className="btn-danger flex-1 flex items-center justify-center gap-2">
            {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <X className="w-4 h-4" />}
            {t('userManagement.rejectBtn')}
          </button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('userManagement.delTitle')} size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {t('userManagement.delDesc1')} <strong className="text-red-500">{t('userManagement.delDesc2')}</strong> {t('userManagement.delDesc3')}
        </p>
        <p className="font-bold text-gray-900 dark:text-white mb-4">{deleteModal?.full_name} (@{deleteModal?.username})</p>
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl mb-4">{t('userManagement.delWarning')}</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">{t('userManagement.cancel')}</button>
          <button onClick={() => deleteUser(deleteModal.id)} disabled={actionLoading}
            className="btn-danger flex-1 flex items-center justify-center gap-2">
            {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {t('userManagement.delBtn')}
          </button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={importModalOpen} onClose={() => { setImportModalOpen(false); setImportFile(null); setImportErrors([]) }} title={t('userManagement.importTitle')}>
        <div className="space-y-4">
          <p className="text-sm text-earth-ink/70">
            {t('userManagement.importDesc1')}<br/>
            <strong>{t('userManagement.importDesc2')}</strong>
          </p>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setImportFile(e.target.files[0])}
            className="w-full text-sm text-earth-ink file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-earth-sand file:text-earth-ink hover:file:bg-earth-sand/80"
          />
          {importErrors.length > 0 && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-xs max-h-32 overflow-y-auto">
              <p className="font-bold mb-1">{t('userManagement.importErrors')}</p>
              <ul className="list-disc pl-4 space-y-1">
                {importErrors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setImportModalOpen(false); setImportFile(null); setImportErrors([]) }} className="btn-secondary flex-1">{t('userManagement.cancel')}</button>
            <button onClick={handleImport} disabled={actionLoading || !importFile}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
              {t('userManagement.importBtn')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
