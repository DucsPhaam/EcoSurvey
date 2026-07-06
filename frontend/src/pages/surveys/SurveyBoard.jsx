import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ClipboardList, CheckCircle2, Clock, ChevronRight, Users, Calendar } from 'lucide-react'
import api from '../../services/axiosInstance'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

function SurveyCard({ survey }) {
  const isExpired = new Date(survey.end_date) < new Date()
  const daysLeft  = Math.ceil((new Date(survey.end_date) - new Date()) / 86400000)

  return (
    <Link to={`/surveys/${survey.id}`}
      className={`card-hover p-6 block ${survey.is_completed ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {survey.is_completed && (
            <span className="badge-approved flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          )}
          <span className={`${survey.target_role === 'All' ? 'badge-published' : 'badge-pending'}`}>
            {survey.target_role}
          </span>
        </div>
      </div>

      <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-2 leading-snug line-clamp-2">
        {survey.title}
      </h3>
      {survey.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{survey.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-400 border-t dark:border-gray-800 pt-3">
        <span className="flex items-center gap-1">
          <ClipboardList className="w-3.5 h-3.5" /> {survey.question_count} question{survey.question_count !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {isExpired ? 'Expired' : daysLeft === 1 ? 'Last day!' : `${daysLeft} days left`}
        </span>
        {survey.creator && (
          <span className="flex items-center gap-1 ml-auto truncate">
            <Users className="w-3.5 h-3.5" /> {survey.creator.full_name}
          </span>
        )}
      </div>

      {!survey.is_completed && (
        <div className="mt-3 flex items-center text-brand-600 dark:text-brand-400 text-sm font-semibold gap-1">
          Take Survey <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </Link>
  )
}

export default function SurveyBoard() {
  const [surveys, setSurveys]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)

  const fetchSurveys = async (p = 1, q = '') => {
    setLoading(true)
    try {
      const res = await api.get('/surveys', { params: { page: p, limit: 9, search: q || undefined } })
      setSurveys(res.data.surveys)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchSurveys(1, '') }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchSurveys(1, search)
  }

  const completed = surveys.filter((s) => s.is_completed).length
  const available = surveys.filter((s) => !s.is_completed).length

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Survey Board</h1>
        <p className="page-subtitle">Complete surveys to earn points and contribute to environmental awareness.</p>
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Surveys',  value: total,     color: 'text-gray-700 dark:text-gray-300' },
          { label: 'Available',      value: available, color: 'text-brand-600 dark:text-brand-400' },
          { label: 'Completed',      value: completed, color: 'text-green-600 dark:text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surveys by title…"
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary px-6">Search</button>
      </form>

      {/* Grid */}
      {loading ? <SpinnerPage /> : surveys.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No surveys available right now.</p>
          <p className="text-sm mt-1">Check back later or ask your admin to publish surveys.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {surveys.map((s) => <SurveyCard key={s.id} survey={s} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); fetchSurveys(p, search) }} />
        </>
      )}
    </div>
  )
}
