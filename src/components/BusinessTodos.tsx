import { useState } from 'react'
import { ListChecks, Plus, Trash2, Check, X } from 'lucide-react'
import { useBusinessTodos } from '../hooks/useBusinessTodos'
import {
  BUSINESSES,
  BUSINESS_STYLES,
  PRIORITIES,
  PRIORITY_STYLES,
  type Business,
  type Priority,
} from '../utils/constants'

export function BusinessTodos() {
  const { todos, pendingCount, highPriorityCount, add, toggle, remove } =
    useBusinessTodos()
  const [adding, setAdding] = useState(false)

  return (
    <section className="border-cc-border bg-cc-surface/80 flex h-full flex-col gap-5 rounded-2xl border p-6 backdrop-blur md:p-7">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <ListChecks size={12} className="text-cc-accent" />
            Pendientes negocio
          </span>
          <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            To-do operativo
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {highPriorityCount > 0 && (
            <span className="bg-cc-danger/15 text-cc-danger border-cc-danger/30 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-widest uppercase">
              {highPriorityCount} alta
            </span>
          )}
          <span className="border-cc-border text-cc-muted bg-cc-surface-2/60 rounded-full border px-2 py-0.5 font-mono text-[10px] tabular-nums">
            {pendingCount} pendiente{pendingCount === 1 ? '' : 's'}
          </span>
        </div>
      </header>

      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {todos.length === 0 && (
          <li className="text-cc-muted border-cc-border bg-cc-surface-2/30 flex flex-col items-center gap-1 rounded-xl border border-dashed py-6 text-center text-sm">
            <span>Sin pendientes registrados.</span>
            <span className="text-cc-muted-soft text-xs">
              Anota tareas operativas (pausar campaña, contactar proveedor…).
            </span>
          </li>
        )}
        {todos.map((todo) => {
          const bizStyle = BUSINESS_STYLES[todo.business]
          const prStyle = PRIORITY_STYLES[todo.priority]
          return (
            <li
              key={todo.id}
              className={`group border-cc-border bg-cc-surface-2/60 hover:border-cc-border-strong flex items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
                todo.done ? 'opacity-55' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(todo.id)}
                aria-label={todo.done ? 'Reabrir tarea' : 'Marcar como hecha'}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  todo.done
                    ? 'bg-cc-success border-cc-success text-cc-bg'
                    : 'border-cc-border-strong text-transparent hover:border-cc-text-soft'
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </button>

              <div className="flex flex-1 flex-col gap-1.5">
                <span
                  className={`text-cc-text text-sm leading-snug ${
                    todo.done ? 'line-through decoration-2' : ''
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium tracking-widest uppercase ${bizStyle.chip}`}
                  >
                    {bizStyle.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium tracking-widest uppercase ${prStyle.chip}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${prStyle.dot}`} />
                    {prStyle.label}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(todo.id)}
                aria-label="Eliminar"
                title="Eliminar"
                className="text-cc-muted-soft hover:text-cc-danger mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <AddTodoForm
          onSubmit={(text, business, priority) => {
            add(text, business, priority)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 text-sm transition"
        >
          <Plus size={14} />
          Nueva tarea operativa
        </button>
      )}
    </section>
  )
}

function AddTodoForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string, business: Business, priority: Priority) => void
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [business, setBusiness] = useState<Business>('Dropshipping')
  const [priority, setPriority] = useState<Priority>('media')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) {
      onCancel()
      return
    }
    onSubmit(text, business, priority)
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-cc-border bg-cc-surface-2/60 flex flex-col gap-2.5 rounded-xl border p-3"
    >
      <input
        type="text"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ej: Pausar campaña Earloops 14"
        className="text-cc-text placeholder:text-cc-muted/70 bg-transparent text-sm outline-none"
      />

      <div className="flex flex-wrap gap-1.5">
        {BUSINESSES.map((b) => {
          const active = business === b
          const style = BUSINESS_STYLES[b]
          return (
            <button
              key={b}
              type="button"
              onClick={() => setBusiness(b)}
              className={`rounded-md border px-2 py-1 text-[10px] font-medium tracking-widest uppercase transition ${
                active
                  ? style.chip
                  : 'border-cc-border text-cc-muted hover:text-cc-text-soft hover:border-cc-border-strong'
              }`}
            >
              {style.label}
            </button>
          )
        })}
        <span className="bg-cc-border my-1 mx-1 w-px" />
        {PRIORITIES.map((p) => {
          const active = priority === p
          const style = PRIORITY_STYLES[p]
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium tracking-widest uppercase transition ${
                active
                  ? style.chip
                  : 'border-cc-border text-cc-muted hover:text-cc-text-soft hover:border-cc-border-strong'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${active ? style.dot : 'bg-cc-muted-soft'}`}
              />
              {style.label}
            </button>
          )
        })}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-cc-muted hover:text-cc-text-soft inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition"
        >
          <X size={12} /> Cancelar
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-cc-accent/15 text-cc-accent border-cc-accent/40 hover:bg-cc-accent/25 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition"
        >
          <Plus size={12} /> Agregar
        </button>
      </div>
    </form>
  )
}
