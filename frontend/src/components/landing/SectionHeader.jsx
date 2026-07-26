export default function SectionHeader({ tag, title, desc, className = '' }) {
  return (
    <div className={`flex items-end justify-between mb-12 flex-wrap gap-4 ${className}`}>
      <div>
        {tag && <p className="font-mono text-sm uppercase tracking-widest mb-2">{tag}</p>}
        {title && <h2 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase whitespace-pre-line leading-tight">{title}</h2>}
      </div>
      {desc && <p className="max-w-md text-earth-ink/70 leading-relaxed">{desc}</p>}
    </div>
  )
}
