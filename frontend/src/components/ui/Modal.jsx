import { X } from 'lucide-react'
import { useEffect, useRef, useCallback } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Lock body scroll & manage focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Remember which element had focus before modal opened
      previousFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'

      // Focus the dialog itself after a tick so screen readers announce it
      requestAnimationFrame(() => {
        dialogRef.current?.focus()
      })
    } else {
      document.body.style.overflow = ''
      // Restore focus to the element that triggered the modal
      previousFocusRef.current?.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Keyboard handler: Escape to close + Tab trap
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    // Focus trap: keep Tab cycling within the modal
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
  }, [onClose])

  if (!isOpen) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  const titleId = `modal-title-${title?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
           onClick={onClose} aria-hidden="true" />
      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${sizes[size]} card animate-slide-up`}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h2 id={titleId} className="text-lg font-display font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
