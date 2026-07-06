import { Leaf } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center shadow-glow-green animate-pulse-slow">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-brand-400 animate-ping opacity-30" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading EcoSurvey…</p>
    </div>
  )
}
