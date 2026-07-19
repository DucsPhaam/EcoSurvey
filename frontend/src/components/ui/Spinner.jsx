import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <span role="status" aria-label="Loading">
      <Loader2 className={`animate-spin text-earth-forest ${sizes[size]} ${className}`} aria-hidden="true" />
    </span>
  )
}

export function SpinnerPage() {
  const { t } = useTranslation('common')
  return (
    <div className="flex items-center justify-center min-h-[300px]" role="status" aria-live="polite">
      <Spinner size="lg" />
      <span className="sr-only">{t('loading')}</span>
    </div>
  )
}
