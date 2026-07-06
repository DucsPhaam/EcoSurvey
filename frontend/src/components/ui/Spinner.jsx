import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return <Loader2 className={`animate-spin text-brand-600 ${sizes[size]} ${className}`} />
}

export function SpinnerPage() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="lg" />
    </div>
  )
}
