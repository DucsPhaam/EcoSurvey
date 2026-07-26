import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b-[2px] border-earth-ink/20 last:border-0 group">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-4 text-left transition-colors duration-300 hover:text-earth-forest"
      >
        <span className="font-display text-lg md:text-xl uppercase pr-2">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180 text-earth-forest' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="pb-4 text-earth-ink/80 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}
