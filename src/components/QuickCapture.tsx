import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Inbox, X } from 'lucide-react'
import { useInbox } from '../hooks/useInbox'

type Props = { open: boolean; onClose: () => void }

export function QuickCapture({ open, onClose }: Props) {
  const { add } = useInbox()
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setText('')
    setSaved(false)
    // Focus on next tick after portal mounts
    const id = window.setTimeout(() => inputRef.current?.focus(), 50)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    add(text)
    setSaved(true)
    setText('')
    // brief feedback then close
    window.setTimeout(() => {
      setSaved(false)
      onClose()
    }, 600)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Quick capture"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <form
        onSubmit={handleSubmit}
        className="border-cc-border bg-cc-surface relative z-10 flex w-full max-w-xl flex-col gap-3 rounded-2xl border p-5 shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <Inbox size={12} className="text-cc-accent" />
            Quick capture
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-cc-muted hover:text-cc-text inline-flex h-6 w-6 items-center justify-center rounded-md transition"
          >
            <X size={14} />
          </button>
        </header>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="¿Qué se te ocurrió?  Enter para guardar en el inbox · Esc para cancelar"
          className="text-cc-text placeholder:text-cc-muted-soft bg-cc-surface-2 border-cc-border focus:border-cc-accent/60 w-full rounded-lg border px-4 py-3 text-base outline-none transition focus:ring-2 focus:ring-cc-accent/20"
        />

        <div className="text-cc-muted-soft flex items-center justify-between text-[11px]">
          <span>Se guarda en tu Inbox para procesarlo después.</span>
          {saved && (
            <span className="text-cc-success font-mono tracking-widest uppercase">
              Guardado ✓
            </span>
          )}
        </div>
      </form>
    </div>,
    document.body
  )
}
