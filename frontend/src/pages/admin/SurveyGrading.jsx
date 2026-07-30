import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Users, Award, CheckCircle, Clock, Edit2 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

// ── Helpers ────────────────────────────────────────────────────
const scoreColor = (score) => {
  if (score === null || score === undefined) return 'text-earth-ink/40'
  if (score <= 3) return 'text-earth-terracotta'
  if (score <= 5) return 'text-earth-clay'
  if (score <= 7) return 'text-earth-moss'
  return 'text-earth-forest'
}

const scoreBadge = (score) => {
  if (score === null || score === undefined)
    return 'badge-draft'
  if (score <= 3)
    return 'badge-rejected'
  if (score <= 5)
    return 'badge-pending'
  if (score <= 7)
    return 'badge-approved'
  return 'badge-published'
}

const ROLE_BADGE = {
  Student: 'badge-pending',
  Staff:   'badge-approved',
  Unknown: 'badge-draft',
}

// ── Component ──────────────────────────────────────────────────
export default function SurveyGrading() {
  const { t } = useTranslation('admin')
  const { id } = useParams()

  const [survey,     setSurvey]     = useState(null)
  const [responses,  setResponses]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [drafts,     setDrafts]     = useState({})
  const [saving,     setSaving]     = useState({})
  const [editing,    setEditing]    = useState({})

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
      toast.error(t('surveyGrading.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [id, t])

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
      setEditing((prev) => ({ ...prev, [responseId]: false }))
      toast.success(t('surveyGrading.saveSuccess', { score }))
    } catch (err) {
      toast.error(err.response?.data?.message || t('surveyGrading.saveFailed'))
    } finally {
      setSaving((s) => ({ ...s, [responseId]: false }))
    }
  }

  const getScoreLabel = (score) => {
    if (score === 0) return t('surveyGrading.veryBad')
    if (score === 1) return t('surveyGrading.bad')
    if (score === 2) return t('surveyGrading.poor')
    if (score === 3 || score === 4) return t('surveyGrading.belowAvg')
    if (score === 5) return t('surveyGrading.avg')
    if (score === 6) return t('surveyGrading.fair')
    if (score === 7) return t('surveyGrading.good')
    if (score === 8) return t('surveyGrading.veryGood')
    if (score === 9) return t('surveyGrading.excellent')
    return t('surveyGrading.perfect')
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
            className="mt-1 p-2 rounded-xl border-2 border-transparent hover:border-earth-ink hover:bg-earth-cream text-earth-ink transition-colors"
            title={t('surveyGrading.back')}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title flex items-center gap-3">
              <Star className="w-7 h-7 text-earth-terracotta" />
              {t('surveyGrading.gradingOpinion')}
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
          <div className="w-10 h-10 border-2 border-earth-ink bg-earth-cream flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-earth-ink" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-earth-ink/60">{t('surveyGrading.totalResponses')}</p>
            <p className="text-xl font-bold text-earth-ink">{total}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-earth-ink bg-earth-forest text-earth-paper flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-earth-ink/60">{t('surveyGrading.gradedOnPage')}</p>
            <p className="text-xl font-bold text-earth-ink">
              {gradedOnPage}
              <span className="text-sm font-normal text-earth-ink/60"> / {responses.length}</span>
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-earth-ink bg-earth-terracotta text-earth-paper flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-earth-ink/60">{t('surveyGrading.avgOnPage')}</p>
            <p className="text-xl font-bold text-earth-ink">
              {avgOnPage ?? '—'}
              {avgOnPage && <span className="text-sm font-normal text-earth-ink/60"> /10</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? <SpinnerPage /> : responses.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock className="w-14 h-14 text-earth-ink/30 mx-auto mb-4" />
          <p className="text-earth-ink/60 font-medium">{t('surveyGrading.noResponses')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {responses.map((r) => {
              const draft      = drafts[r.id] ?? 5
              const savedScore = r.opinion_score
              const isSaving   = !!saving[r.id]
              const isEditing  = !!editing[r.id]
              const opinionTxt = getOpinionText(r)
              const hasGraded  = savedScore !== null && savedScore !== undefined

              return (
                <div key={r.id} className="card p-6 transition-all hover:shadow-brutal-sm">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-earth-ink text-sm">
                        {r.user?.displayName}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-mono uppercase ${ROLE_BADGE[r.user?.role] || ROLE_BADGE.Unknown}`}>
                        {r.user?.role}
                      </span>
                      {hasGraded ? (
                        <span className={scoreBadge(savedScore)}>
                          ✓ {savedScore}/10 · {getScoreLabel(savedScore)}
                        </span>
                      ) : (
                        <span className="badge-draft text-xs">
                          {t('surveyGrading.notGraded')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-earth-ink/50 shrink-0 ml-2">
                      {new Date(r.submitted_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {/* Opinion text */}
                  {opinionTxt ? (
                    <div className="bg-earth-sand/30 border-l-[4px] border-earth-forest p-4 mb-5">
                      <p className="text-xs font-mono font-medium text-earth-ink/60 mb-1.5 uppercase tracking-wide">
                        {t('surveyGrading.opinionText')}
                      </p>
                      <p className="text-sm text-earth-ink leading-relaxed whitespace-pre-wrap">
                        {opinionTxt}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-earth-sand/20 p-4 mb-5 text-center">
                      <p className="text-sm text-earth-ink/50 italic">{t('surveyGrading.noOpinionText')}</p>
                    </div>
                  )}

                  {/* Scoring section */}
                  {hasGraded && !isEditing ? (
                    /* Static display when already graded and not in edit mode */
                    <div className="flex items-center justify-between p-4 bg-earth-cream/70 border-[2px] border-earth-ink/20 rounded-xl flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl font-display font-bold tabular-nums leading-none ${scoreColor(savedScore)}`}>
                          {savedScore}<span className="text-sm font-sans font-normal text-earth-ink/50">/10</span>
                        </div>
                        <div>
                          <span className={scoreBadge(savedScore)}>
                            ✓ {savedScore}/10 · {getScoreLabel(savedScore)}
                          </span>
                          <p className="text-xs font-mono uppercase tracking-widest text-earth-ink/60 mt-1">
                            {t('surveyGrading.saveSuccess', { score: savedScore })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDrafts((prev) => ({ ...prev, [r.id]: savedScore }))
                          setEditing((prev) => ({ ...prev, [r.id]: true }))
                        }}
                        className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {t('surveyGrading.editScore')}
                      </button>
                    </div>
                  ) : (
                    /* Interactive slider row when ungraded or in edit mode */
                    <div className="p-4 bg-earth-sand/20 border-[2px] border-earth-ink/20 rounded-xl space-y-3">
                      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                        {/* Score display */}
                        <div className="shrink-0 text-center min-w-[52px]">
                          <div className={`text-4xl font-display font-bold tabular-nums leading-none ${scoreColor(draft)}`}>
                            {draft}
                          </div>
                          <div className="text-xs font-mono text-earth-ink/50 mt-0.5">/10</div>
                        </div>

                        {/* Slider + labels */}
                        <div className="flex-1 min-w-[200px]">
                          <input
                            type="range"
                            min={0}
                            max={10}
                            step={1}
                            value={draft}
                            onChange={(e) =>
                              setDrafts((prev) => ({ ...prev, [r.id]: parseInt(e.target.value) }))
                            }
                            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-earth-forest bg-earth-ink/20"
                            aria-label={t('surveyGrading.scoreAria', { name: r.user?.displayName })}
                          />
                          <div className="flex justify-between text-[10px] font-mono text-earth-ink/50 mt-1 select-none px-px">
                            {Array.from({ length: 11 }, (_, i) => (
                              <span key={i}>{i}</span>
                            ))}
                          </div>
                          <p className={`text-xs text-center mt-1 font-semibold ${scoreColor(draft)}`}>
                            {getScoreLabel(draft)}
                          </p>
                        </div>

                        {/* Save & Cancel buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            id={`save-grade-${r.id}`}
                            onClick={() => handleSave(r.id)}
                            disabled={isSaving}
                            className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-2">
                            {isSaving
                              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : t('surveyGrading.saveScore')
                            }
                          </button>

                          {hasGraded && (
                            <button
                              onClick={() => setEditing((prev) => ({ ...prev, [r.id]: false }))}
                              className="btn-secondary text-xs py-2 px-3">
                              {t('surveyGrading.cancelScore')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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

