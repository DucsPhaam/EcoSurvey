import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ClipboardList, Eye, Star, CheckCircle2, Clock, Users } from 'lucide-react'
import api from '../../services/axiosInstance'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

// ── Hiển thị một câu trả lời — Read-only ───────────────────────
function AnswerCard({ answer }) {
  const q = answer.question
  if (!q) return null
  const isOpinion = q.options?.isOpinion === true
  const text = answer.answer_text || ''
  const displayText = text.includes('|||') ? text.split('|||').join(', ') : text

  return (
    <div className={`rounded-xl border p-4 ${isOpinion
      ? 'border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-900/10'
      : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30'
    }`}>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
        {isOpinion
          ? <span className="text-brand-500">💬 Ý kiến cá nhân về bài khảo sát</span>
          : q.question_text
        }
      </p>
      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
        {displayText || <span className="italic text-gray-400">Không có câu trả lời</span>}
      </p>
    </div>
  )
}

// ── Modal xem chi tiết 1 bài làm ───────────────────────────────
function ResponseDetailModal({ response, isOpen, onClose, onGraded }) {
  const [score, setScore]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [localScore, setLocalScore] = useState(null)

  useEffect(() => {
    if (response) {
      const s = response.opinion_score
      setLocalScore(s ?? null)
      setScore(s !== null && s !== undefined ? String(s) : '')
    }
  }, [response])

  if (!response) return null

  const opinionAnswer = response.answers?.find((a) => a.question?.options?.isOpinion === true)
  const otherAnswers  = response.answers?.filter((a) => !a.question?.options?.isOpinion)

  const handleSave = async () => {
    const s = parseInt(score, 10)
    if (isNaN(s) || s < 0 || s > 10) {
      toast.error('Điểm phải là số nguyên từ 0 đến 10.')
      return
    }
    setSaving(true)
    try {
      await api.put(`/admin/surveys/responses/${response.id}/score`, { opinion_score: s })
      setLocalScore(s)
      toast.success(`Đã chấm ${s}/10 điểm! Điểm đã được cộng cho người dùng.`)
      onGraded(response.id, s)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chấm điểm thất bại.')
    } finally {
      setSaving(false)
    }
  }

  const scoreColor = localScore === null ? 'text-gray-400'
    : localScore >= 8 ? 'text-green-500'
    : localScore >= 5 ? 'text-amber-500'
    : 'text-red-500'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-5">
        {/* Header ẩn danh */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{response.user?.displayName}</p>
              <p className="text-xs text-gray-400">{response.user?.role} · Nộp lúc {new Date(response.submitted_at).toLocaleString('vi-VN')}</p>
            </div>
          </div>
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {localScore !== null ? `${localScore}/10` : '—/10'}
          </div>
        </div>

        {/* Câu trả lời — Read-only */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Câu trả lời (chỉ đọc)</p>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {otherAnswers?.map((a) => <AnswerCard key={a.id} answer={a} />)}
          </div>
        </div>

        {/* Ý kiến cá nhân + Chấm điểm */}
        {opinionAnswer && (
          <div className="rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-brand-50/40 dark:bg-brand-900/10 p-4 space-y-3">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-2">
              <Star className="w-4 h-4" /> Ý kiến cá nhân về bài khảo sát
            </p>
            <div className="rounded-xl bg-white dark:bg-gray-900 border border-brand-100 dark:border-brand-900 p-3">
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {opinionAnswer.answer_text || <span className="italic text-gray-400">Không có nội dung</span>}
              </p>
            </div>

            {/* Admin chấm điểm */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Chấm điểm (0–10):
              </label>
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0–10"
                  className="input w-20 text-center font-bold text-lg"
                />
                {/* Quick-pick buttons */}
                <div className="flex gap-1 flex-wrap">
                  {[0, 3, 5, 7, 8, 9, 10].map((v) => (
                    <button key={v}
                      onClick={() => setScore(String(v))}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        parseInt(score) === v
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'border-gray-200 dark:border-gray-700 hover:border-brand-400 text-gray-600 dark:text-gray-400'
                      }`}
                    >{v}</button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || score === ''}
                className="btn-primary px-4 py-2 text-sm flex-shrink-0"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><CheckCircle2 className="w-4 h-4 mr-1 inline" />Lưu điểm</>
                }
              </button>
            </div>
            {localScore !== null && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã chấm {localScore}/10 · Điểm đã cộng cho người tham gia
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Trang chính ─────────────────────────────────────────────────
export default function SurveyResponses() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [responses, setResponses] = useState([])
  const [survey, setSurvey]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)
  const [selected, setSelected]   = useState(null)

  const loadSurvey = async () => {
    try {
      const r = await api.get('/admin/surveys', { params: { page: 1, limit: 100 } })
      const found = r.data.surveys?.find((s) => s.id === parseInt(id))
      if (found) setSurvey(found)
    } catch { /* ignore */ }
  }

  const loadResponses = async (p = 1) => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/surveys/${id}/responses`, { params: { page: p, limit: 15 } })
      setResponses(r.data.responses)
      setTotal(r.data.total)
      setTotalPages(r.data.totalPages)
    } catch { toast.error('Không thể tải dữ liệu.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    loadSurvey()
    loadResponses(1)
  }, [id])

  const handleGraded = (responseId, newScore) => {
    setResponses((prev) => prev.map((r) =>
      r.id === responseId ? { ...r, opinion_score: newScore } : r
    ))
    if (selected?.id === responseId) {
      setSelected((prev) => ({ ...prev, opinion_score: newScore }))
    }
  }

  const gradedCount = responses.filter((r) => r.opinion_score !== null && r.opinion_score !== undefined).length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/surveys')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="page-title flex items-center gap-3">
              <Eye className="w-6 h-6 text-brand-600" /> Kết quả khảo sát (Ẩn danh)
            </h1>
            {survey && <p className="page-subtitle">{survey.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {total} lượt nộp</span>
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Star className="w-4 h-4" /> {gradedCount}/{responses.length} đã chấm
          </span>
        </div>
      </div>

      {/* Notice */}
      <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Chế độ xem ẩn danh</p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
            Danh tính người nộp bài được bảo vệ. Tên và email không được hiển thị. Bạn chỉ có thể xem nội dung bài làm và chấm điểm ý kiến cá nhân.
          </p>
        </div>
      </div>

      {loading ? <SpinnerPage /> : (
        <>
          {responses.length === 0 ? (
            <div className="card p-16 text-center text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có bài nộp nào.</p>
            </div>
          ) : (
            <div className="card overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>{['Người tham gia', 'Vai trò', 'Thời gian nộp', 'Điểm ý kiến', 'Trạng thái', ''].map((h) => (
                      <th key={h} className="table-header">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {responses.map((r) => {
                      const scored = r.opinion_score !== null && r.opinion_score !== undefined
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </div>
                              <span className="font-medium text-sm">{r.user?.displayName}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              {r.user?.role}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(r.submitted_at).toLocaleString('vi-VN')}
                            </span>
                          </td>
                          <td className="table-cell text-center">
                            <span className={`font-bold text-sm ${
                              !scored ? 'text-gray-300 dark:text-gray-600'
                              : r.opinion_score >= 8 ? 'text-green-500'
                              : r.opinion_score >= 5 ? 'text-amber-500'
                              : 'text-red-500'
                            }`}>
                              {scored ? `${r.opinion_score}/10` : '—'}
                            </span>
                          </td>
                          <td className="table-cell">
                            {scored
                              ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /> Đã chấm</span>
                              : <span className="flex items-center gap-1 text-xs text-amber-500"><Star className="w-3 h-3" /> Chưa chấm</span>
                            }
                          </td>
                          <td className="table-cell">
                            <button
                              onClick={() => setSelected(r)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Xem &amp; Chấm
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); loadResponses(p) }} />
        </>
      )}

      <ResponseDetailModal
        isOpen={!!selected}
        response={selected}
        onClose={() => setSelected(null)}
        onGraded={handleGraded}
      />
    </div>
  )
}
