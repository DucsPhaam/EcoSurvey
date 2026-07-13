import { useEffect, useState } from 'react'
import { Search, Check, X, Trash2, Filter, Users, ChevronDown } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

const ROLE_COLORS   = { Student: 'badge-published', Staff: 'badge-pending', Admin: 'badge-approved' }
const STATUS_COLORS = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected' }

export default function UserManagement() {
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
      toast.success(`Account ${status === 'Approved' ? 'approved' : 'rejected'}.`)
      setRejectModal(null); setRejectReason('')
      fetch(page)
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed.') }
    finally { setActionLoading(false) }
  }

  const deleteUser = async (userId) => {
    setActionLoading(true)
    try {
      await adminService.deleteUser(userId)
      toast.success('User deleted.')
      setDeleteModal(null)
      fetch(page)
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed.') }
    finally { setActionLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><Users className="w-7 h-7 text-brand-600" /> User Management</h1>
        <p className="page-subtitle">Manage accounts, approve registrations, and control access. <span className="font-semibold text-gray-700 dark:text-gray-300">{total} total users.</span></p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, username, ID…" className="input pl-9 py-2" />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
        </form>
        <select value={roleFilter} onChange={(e) => { setRole(e.target.value); setPage(1) }}
          className="input py-2 w-auto">
          <option value="">All Roles</option>
          <option>Student</option><option>Staff</option><option>Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input py-2 w-auto">
          <option value="">All Statuses</option>
          <option>Pending</option><option>Approved</option><option>Rejected</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <SpinnerPage /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['User', 'Role', 'Status', 'ID / Class', 'Department', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">No users found.</td></tr>
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
                              className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setRejectModal(u)}
                              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {u.status === 'Approved' && u.role !== 'Admin' && (
                          <button onClick={() => setRejectModal(u)}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition-colors text-xs font-medium px-2" title="Reject/Lock">
                            Lock
                          </button>
                        )}
                        {u.role !== 'Admin' && (
                          <button onClick={() => setDeleteModal(u)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors" title="Delete">
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
      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title={`Reject Account: ${rejectModal?.full_name}`}>
        <p className="text-sm text-gray-500 mb-4">Provide an optional reason for rejection. The user will be notified.</p>
        <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection (optional)…" className="input mb-4" />
        <div className="flex gap-3">
          <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => updateStatus(rejectModal.id, 'Rejected', rejectReason)} disabled={actionLoading}
            className="btn-danger flex-1 flex items-center justify-center gap-2">
            {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <X className="w-4 h-4" />}
            Reject Account
          </button>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Are you sure you want to <strong className="text-red-500">permanently delete</strong> the account of:
        </p>
        <p className="font-bold text-gray-900 dark:text-white mb-4">{deleteModal?.full_name} (@{deleteModal?.username})</p>
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl mb-4">⚠️ This action cannot be undone. All associated data will be removed.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => deleteUser(deleteModal.id)} disabled={actionLoading}
            className="btn-danger flex-1 flex items-center justify-center gap-2">
            {actionLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Permanently
          </button>
        </div>
      </Modal>
    </div>
  )
}
