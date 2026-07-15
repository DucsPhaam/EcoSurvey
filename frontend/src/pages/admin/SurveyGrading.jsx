import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Users, Award, CheckCircle, Clock } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import toast from 'react-hot-toast'

// ── Helpers ────────────────────────────────────────────────────
const scoreColor = (score) => {
  if (score === null || score === undefined) return 'text-gray-400'
  if (score <= 3) return 'text-red-500 dark:text-red-400'
  if (score <= 5) return 'text-amber-500 dark:text-amber-400'
  if (score <= 7) return 'text-emerald-500 dark:text-emerald-400'
  return 'text-blue-500 dark:text-blue-400'
}

const scoreBadge = (score) => {
  if (score === null || score === undefined)
    return 'bg-gray-100 dark:bg-gray-800 text-gray-400'
  if (score <= 3)
    return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
  if (score <= 5)
    return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
  if (score <= 7)
    return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
  return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
}

const ROLE_BADGE = {
  Student: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  Staff:   'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  Unknown: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
}

const SCORE_LABELS = ['Rất tệ', 'Tệ', 'Kém', 'Dưới TB', 'Trung bình', 'Khá', 'Tốt', 'Khá tốt', 'Rất tốt', 'Xuất sắc', 'Hoàn hảo']

// ── Component ──────────────────────────────────────────────────
export default function SurveyGrading() {
  const { id } = useParams()

  const [survey,     setSurvey]     = useState(null)
  const [responses,  setResponses]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [drafts,     setDrafts]     = useState({})
  const [saving,     setSaving]     = useState({})

  const fetchSurvey = useCallback(async () => {
    try {
      const r = await adminService.getSurveyById(id)
      setSurvey(r.data.survey)
    } catch { /* silently ignore */ }
  }, [id])

  const fetchResponses = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const r = await adminService.getSurveyResponses(id, { page: p, limit: 20 })
      const rows = r.data.responses
      setResponses(rows)
      setTotal(r.data.total)
      setTotalPages(r.data.totalPages)
      setDrafts((prev) => {
        const init = {}
        rows.forEach((row) => {
          init[row.id] = prev[row.id] !== undefined
            ? prev[row.id]
            : (row.opinion_score ?? 5)
        })
        return init
      })
    } catch {
      toast.error('Không thể tải danh sách bài làm.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSurvey()
    fetchResponses(1)
  }, [fetchSurvey, fetchResponses])

  const handleSave = async (responseId) => {
    const score = drafts[responseId] ?? 5
    setSaving((s) => ({ ...s, [responseId]: true }))
    try {
      await adminService.gradeOpinion(responseId, score)
      setResponses((prev) =>
        prev.map((r) => r.id === responseId ? { ...r, opinion_score: score } : r)
      )
      toast.success(`✅ Đã lưu ${score}/10 điểm.`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu điểm thất bại.')
    } finally {
      setSaving((s) => ({ ...s, [responseId]: false }))
    }
  }

  const gradedOnPage = responses.filter((r) => r.opinion_score !== null && r.opinion_score !== undefined).length
  const sumOnPage    = responses.filter((r) => r.opinion_score !== null).reduce((s, r) => s + r.opinion_score, 0)
  const avgOnPage    = gradedOnPage === 0 ? null : (sumOnPage / gradedOnPage).toFixed(1)

  const getOpinionText = (response) => {
    const ans = response.answers?.find((a) => a.question?.options?.isOpinion)
    return ans?.answer_text || null
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link to="/admin/surveys"
            className="mt-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Quay lại">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title flex items-center gap-3">
              <Star className="w-7 h-7 text-amber-500" />
              Chấm điểm ý kiến cá nhân
            </h1>
            {survey && (
              <p className="page-subtitle max-w-xl line-clamp-1" title={survey.title}>
                {survey.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Tổng bài làm</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{total}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Đã chấm (trang này)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {gradedOnPage}
              <span className="text-sm font-normal text-gray-400"> / {responses.length}</span>
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Điểm TB (trang này)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {avgOnPage ?? '—'}
              {avgOnPage && <span className="text-sm font-normal text-gray-400"> /10</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? <SpinnerPage /> : responses.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Chưa có bài làm nào để chấm.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {responses.map((r) => {
              const draft      = drafts[r.id] ?? 5
              const savedScore = r.opinion_score
              const isSaving   = !!saving[r.id]
              const opinionTxt = getOpinionText(r)

              return (
                <div key={r.id} className="card p-6 transition-shadow hover:shadow-md">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {r.user?.displayName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[r.user?.role] || ROLE_BADGE.Unknown}`}>
                        {r.user?.role}
                      </span>
                      {savedScore !== null && savedScore !== undefined ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${scoreBadge(savedScore)}`}>
                          ✓ {savedScore}/10 · {SCORE_LABELS[savedScore]}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-400">
                          Chưa chấm
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {new Date(r.submitted_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {/* Opinion text */}
                  {opinionTxt ? (
                    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 mb-5 border-l-4 border-brand-300 dark:border-brand-600">
                      <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                        Ý kiến cá nhân
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {opinionTxt}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 mb-5 text-center">
                      <p className="text-sm text-gray-400 italic">Người dùng không để lại ý kiến.</p>
                    </div>
                  )}

                  {/* Scoring row */}
                  <div className="flex items-center gap-5">
                    {/* Score display */}
                    <div className="shrink-0 text-center min-w-[52px]">
                      <div className={`text-4xl font-black tabular-nums leading-none ${scoreColor(draft)}`}>
                        {draft}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">/10</div>
                    </div>

                    {/* Slider + labels */}
                    <div className="flex-1">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={draft}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [r.id]: parseInt(e.target.value) }))
                        }
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-600 bg-gray-200 dark:bg-gray-700"
                        aria-label={`Điểm cho ${r.user?.displayName}`}
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 select-none px-px">
                        {Array.from({ length: 11 }, (_, i) => (
                          <span key={i}>{i}</span>
                        ))}
                      </div>
                      <p className={`text-xs text-center mt-1 font-semibold ${scoreColor(draft)}`}>
                        {SCORE_LABELS[draft]}
                      </p>
                    </div>

                    {/* Save button */}
                    <button
                      id={`save-grade-${r.id}`}
                      onClick={() => handleSave(r.id)}
                      disabled={isSaving}
                      className="btn-primary shrink-0 min-w-[100px] flex items-center justify-center gap-2 text-sm py-2.5">
                      {isSaving
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : '💾 Lưu điểm'
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => { setPage(p); fetchResponses(p) }}
          />
        </>
      )}
    </div>
  )
}
