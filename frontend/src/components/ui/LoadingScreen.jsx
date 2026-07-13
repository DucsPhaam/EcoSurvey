import { Leaf } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-earth-paper flex flex-col items-center justify-center gap-4">
      <div className="border-[4px] border-earth-ink bg-earth-forest p-5 shadow-brutal-lg">
        <Leaf className="w-10 h-10 text-earth-cream" />
      </div>
      <p className="text-sm text-earth-ink/60 font-mono uppercase tracking-widest">Building EcoSurvey…</p>
    </div>
  )
}
