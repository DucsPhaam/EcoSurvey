import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-6">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        aria-label="Previous page"
        className="p-2 border-[2px] border-earth-ink bg-earth-paper hover:bg-earth-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1]
        const showDots = prev && p - prev > 1
        return (
          <span key={p} className="flex items-center gap-1">
            {showDots && <span className="px-1 text-gray-400" aria-hidden="true">…</span>}
            <button onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={`w-9 h-9 border-[2px] border-earth-ink text-sm font-medium transition-all ${
                p === page
                  ? 'bg-earth-forest text-earth-paper shadow-brutal-sm'
                  : 'bg-earth-paper text-earth-ink hover:bg-earth-cream'
              }`}>
              {p}
            </button>
          </span>
        )
      })}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        aria-label="Next page"
        className="p-2 border-[2px] border-earth-ink bg-earth-paper hover:bg-earth-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
