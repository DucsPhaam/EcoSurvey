import { ArrowRight } from 'lucide-react'

export default function StepCard({ n, title, desc, idx, isLast, inView }) {
  return (
    <div
      className={`relative transition-all duration-500 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: inView ? `${idx * 150}ms` : '0ms' }}
    >
      <div className="card card-hover p-8 h-full">
        <p className="font-display text-7xl text-earth-ink/20">{n}</p>
        <h3 className="font-display text-2xl uppercase mt-2">{title}</h3>
        <p className="mt-3 text-earth-ink/70">{desc}</p>
      </div>
      {!isLast && (
        <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-earth-ink">
          <ArrowRight className="w-6 h-6" />
        </div>
      )}
    </div>
  )
}
