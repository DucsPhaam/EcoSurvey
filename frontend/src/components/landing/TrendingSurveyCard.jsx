import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function TrendingSurveyCard({ survey, idx, inView, formatDate, t }) {
  return (
    <article
      className={`card card-hover p-6 group transition-all duration-500 flex flex-col justify-between ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: inView ? `${idx * 100}ms` : '0ms' }}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <span className="badge badge-published">
            {String(idx + 1).padStart(2, '0')} Trending
          </span>
          <span className="font-mono text-2xl text-earth-ink/40">
            {survey.response_count}
          </span>
        </div>
        <h3 className="font-display text-xl uppercase mb-2 leading-tight">
          {survey.title}
        </h3>
        <p className="text-sm text-earth-ink/70 leading-relaxed line-clamp-3 mb-4">
          {survey.description || t('trending.noDesc')}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t-[2px] border-earth-ink/20 pt-4 gap-2">
        <div className="font-mono text-[10px] uppercase tracking-widest text-earth-ink/60 truncate min-w-0">
          {t('trending.by')} {survey.creator_name}
          {survey.end_date && <> · {t('trending.closes')} {formatDate(survey.end_date)}</>}
        </div>
        <Link
          to="/login"
          className="ui-title text-sm flex items-center gap-1 shrink-0 whitespace-nowrap group-hover:text-earth-forest transition-colors duration-300"
        >
          {t('trending.takeIt')} <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </article>
  )
}
