import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  kicker?: string
  children: React.ReactNode
  /** Optional max-width override; defaults to max-w-lg. */
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES: Record<NonNullable<Props['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, kicker, children, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div
        className={`border-cc-border bg-cc-surface relative z-10 my-auto w-full ${SIZE_CLASSES[size]} flex flex-col gap-5 rounded-2xl border p-6 shadow-2xl backdrop-blur md:p-7`}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            {kicker && (
              <span className="text-cc-muted font-mono text-[11px] tracking-widest uppercase">
                {kicker}
              </span>
            )}
            <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-cc-muted hover:text-cc-text border-cc-border hover:border-cc-border-strong inline-flex h-8 w-8 items-center justify-center rounded-lg border transition"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex flex-col gap-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
