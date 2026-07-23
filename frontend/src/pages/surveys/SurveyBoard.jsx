import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ClipboardList, CheckCircle2, ChevronRight, Users, Calendar, ArrowRight } from 'lucide-react'
import { surveyService } from '../../services/surveyService'
import { SpinnerPage } from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import { useTranslation } from 'react-i18next'

function SurveyCard({ survey, index }) {
  const { t } = useTranslation('survey')
  const isExpired = new Date(survey.end_date) < new Date()
  const daysLeft  = Math.ceil((new Date(survey.end_date) - new Date()) / 86400000)
  const num = String(index + 1).padStart(2, '0')

  return (
    <Link to={`/surveys/${survey.id}`}
      className={`card-hover p-5 block relative overflow-hidden ${survey.is_completed ? 'opacity-70' : ''}`}>
      <div className="absolute top-0 right-0 px-2 py-1 bg-earth-paper border-l-[3px] border-b-[3px] border-earth-ink font-mono text-[10px] uppercase tracking-widest">
        /{num}
      </div>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-earth-cream" />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {survey.is_completed && (
            <span className="badge-approved flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {t('done')}
            </span>
          )}
          <span className={survey.target_role === 'All' ? 'badge-published' : 'badge-pending'}>
            {survey.target_role}
          </span>
        </div>
      </div>

      <h3 className="font-display text-lg uppercase leading-snug line-clamp-2">
        {survey.title}
      </h3>
      {survey.description && (
        <p className="text-sm text-earth-ink/70 line-clamp-2 mt-2">{survey.description}</p>
      )}

      <div className="mt-5 pt-4 border-t-[2px] border-earth-ink/20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
        <span className="flex items-center gap-1">
          <ClipboardList className="w-3 h-3" /> {survey.question_count} {t('questions')}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {isExpired ? t('expired') : daysLeft === 1 ? t('lastDay') : `${daysLeft} ${t('daysLeft')}`}
        </span>
        {survey.creator && (
          <span className="flex items-center gap-1 ml-auto truncate">
            <Users className="w-3 h-3" /> {survey.creator.full_name?.split(' ').slice(-1)[0]}
          </span>
        )}
      </div>

      {!survey.is_completed && (
        <div className="mt-4 flex items-center gap-1 ui-title text-sm border-t-[2px] border-earth-ink pt-3">
          {new Date(survey.start_date) > new Date() ? (
            <span className="text-earth-ink/50">{t('notOpen')}</span>
          ) : (
            <>{t('takeSurvey')} <ArrowRight className="w-4 h-4" /></>
          )}
        </div>
      )}
    </Link>
  )
}

function ImpactStat({ label, value, sub }) {
  return (
    <div className="card p-5 relative">
      <div className="absolute top-0 right-0 px-2 py-1 bg-earth-forest text-earth-paper font-mono text-[10px] uppercase tracking-widest">
        /counter
      </div>
      <p className="impact-num">{value}</p>
      <p className="ui-title text-sm mt-2">{label}</p>
      {sub && <p className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60 mt-1">{sub}</p>}
    </div>
  )
}

export default function SurveyBoard() {
  const { t } = useTranslation(['survey', 'common'])
  const [surveys, setSurveys]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)

  const fetchSurveys = async (p = 1, q = '') => {
    setLoading(true)
    try {
      const res = await surveyService.getSurveys({ page: p, limit: 9, search: q || undefined })
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
  const totalQuestions = surveys.reduce((sum, s) => sum + (s.question_count || 0), 0)
  // Estimated impact: 10 pts per survey + 0.5 kg CO₂ saved per survey on average
  const estPoints = available * 10
  const estCo2 = (available * 0.5).toFixed(1)

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="card p-6 md:p-8 relative">
        <div className="stamp top-4 right-4 bg-earth-forest text-earth-paper">{t('survey:open')}</div>
        <p className="font-mono text-sm uppercase tracking-widest text-earth-ink/60">{t('survey:boardHeader')}</p>
        <h1 className="page-title mt-2">{t('survey:title')}</h1>
        <p className="page-subtitle">{t('survey:subtitle')}</p>
      </div>

      {/* Impact numbers */}
      <section>
        <p className="font-mono text-sm uppercase tracking-widest text-earth-ink/60 mb-3">{t('survey:impactHeader')}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ImpactStat label={t('survey:totalSurveys')}  value={total} />
          <ImpactStat label={t('survey:availableNow')}  value={available} sub={t('survey:availableSub')} />
          <ImpactStat label={t('survey:potentialPts')}  value={estPoints} sub={`+${estCo2}kg CO₂ est.`} />
          <ImpactStat label={t('survey:totalQuestions')} value={totalQuestions} sub={`${completed} ${t('survey:completedSub')}`} />
        </div>
      </section>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-ink/60" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common:search')}
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary px-8">{t('common:search')}</button>
      </form>

      {/* Grid */}
      {loading ? <SpinnerPage /> : surveys.length === 0 ? (
        <div className="card p-16 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-earth-ink/40" />
          <p className="ui-title">{t('survey:noSurveys')}</p>
          <p className="font-mono text-xs uppercase tracking-widest text-earth-ink/60 mt-1">{t('survey:noSurveysSub')}</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {surveys.map((s, i) => <SurveyCard key={s.id} survey={s} index={i} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); fetchSurveys(p, search) }} />
        </>
      )}
    </div>
  )
}

