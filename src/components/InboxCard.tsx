import { useState } from 'react'
import { Inbox, Plus, Trash2, Trash, Sparkles } from 'lucide-react'
import { useInbox } from '../hooks/useInbox'

export function InboxCard() {
  const { items, count, add, remove, clear } = useInbox()
  const [draft, setDraft] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    add(draft)
    setDraft('')
  }

  return (
    <section className="border-cc-border bg-cc-surface/80 relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border p-6 backdrop-blur md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 h-40 w-40 rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle, rgba(91,141,239,0.16) 0%, rgba(91,141,239,0) 70%)',
        }}
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <Inbox size={12} className="text-cc-accent" />
            Inbox
          </span>
          <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Ideas sueltas
          </h2>
        </div>
        {count > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`¿Vaciar el inbox? Tienes ${count} item${count === 1 ? '' : 's'}.`)) {
                clear()
              }
            }}
            className="text-cc-muted hover:text-cc-danger border-cc-border hover:border-cc-danger/40 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition"
          >
            <Trash size={12} /> Vaciar
          </button>
        )}
      </header>

      <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <li className="text-cc-muted border-cc-border bg-cc-surface-2/30 flex flex-col items-center gap-1 rounded-xl border border-dashed py-6 text-center text-sm">
            <Sparkles size={14} className="text-cc-accent" />
            <span>Tu inbox está vacío.</span>
            <span className="text-cc-muted-soft text-xs">
              Apunta ideas con <kbd className="border-cc-border-strong bg-cc-bg rounded border px-1 font-mono text-[10px]">Ctrl+Shift+Space</kbd> o
              abajo.
            </span>
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="group border-cc-border bg-cc-surface-2/60 hover:border-cc-border-strong flex items-center gap-2 rounded-lg border px-3 py-2 transition"
            >
              <span className="bg-cc-muted-soft h-1.5 w-1.5 shrink-0 rounded-full" />
              <span className="text-cc-text-soft flex-1 text-sm leading-snug">
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Eliminar item"
                className="text-cc-muted-soft hover:text-cc-danger inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={11} />
              </button>
            </li>
          ))
        )}
      </ul>

      <form
        onSubmit={handleAdd}
        className="border-cc-border-strong bg-cc-bg/40 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2"
      >
        <Plus size={14} className="text-cc-muted shrink-0" />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Apunta algo sin decidir todavía…"
          className="text-cc-text-soft placeholder:text-cc-muted-soft flex-1 bg-transparent text-sm outline-none"
        />
      </form>
    </section>
  )
}
