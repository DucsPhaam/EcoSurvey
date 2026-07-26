export default function FeatureCard({ icon: Icon, title, desc, num, inView, idx }) {
  return (
    <div
      className={`card card-hover p-6 group transition-all duration-500 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: inView ? `${idx * 100}ms` : '0ms' }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 bg-earth-forest border-[3px] border-earth-ink flex items-center justify-center transition-all duration-300 group-hover:bg-earth-terracotta">
          <Icon className="w-6 h-6 text-earth-cream" />
        </div>
        <span className="font-mono text-2xl text-earth-ink/40 group-hover:text-earth-forest transition-colors duration-300">
          /{num}
        </span>
      </div>
      <h3 className="font-display text-xl uppercase mb-2 transition-colors duration-300 group-hover:text-earth-forest">
        {title}
      </h3>
      <p className="text-sm text-earth-ink/70 leading-relaxed">{desc}</p>
    </div>
  )
}
