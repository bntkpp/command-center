import { useEffect, useState } from 'react'
import {
  Plus,
  Trash2,
  Check,
  X,
  Calendar as CalendarIcon,
  Clock,
  Pencil,
} from 'lucide-react'
import { Modal } from './Modal'
import {
  EVENT_TYPES,
  EVENT_TYPE_STYLES,
  type ChecklistItem,
  type EventType,
  type FutureEvent,
} from '../utils/constants'
import { useEvents } from '../hooks/useEvents'
import { todayKey } from '../utils/dateHelpers'

type Mode =
  | { kind: 'closed' }
  | { kind: 'new'; presetDate?: string }
  | { kind: 'edit'; eventId: string }

type Props = {
  mode: Mode
  onClose: () => void
}

export function EventModal({ mode, onClose }: Props) {
  const {
    all,
    create,
    update,
    remove,
    toggleDone,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    updateChecklistItemText,
  } = useEvents()

  const editingEvent =
    mode.kind === 'edit' ? all.find((e) => e.id === mode.eventId) : null

  const [draft, setDraft] = useState<{
    title: string
    date: string
    time: string
    type: EventType
    notes: string
  }>(() => initialDraft(mode, editingEvent))

  const [newChecklistText, setNewChecklistText] = useState('')

  // Reset when switching between events / modes.
  useEffect(() => {
    setDraft(initialDraft(mode, editingEvent))
    setNewChecklistText('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode.kind, mode.kind === 'edit' ? mode.eventId : null, mode.kind === 'new' ? mode.presetDate : null])

  const open = mode.kind !== 'closed'

  function handleSave() {
    const trimmedTitle = draft.title.trim()
    if (!trimmedTitle) return
    if (mode.kind === 'new') {
      create({
        title: trimmedTitle,
        date: draft.date,
        time: draft.time || undefined,
        type: draft.type,
        notes: draft.notes.trim() || undefined,
      })
    } else if (mode.kind === 'edit' && editingEvent) {
      update(editingEvent.id, {
        title: trimmedTitle,
        date: draft.date,
        time: draft.time || undefined,
        type: draft.type,
        notes: draft.notes.trim() || undefined,
      })
    }
    onClose()
  }

  function handleDelete() {
    if (!editingEvent) return
    if (
      confirm(`¿Eliminar "${editingEvent.title}"? Esto no se puede deshacer.`)
    ) {
      remove(editingEvent.id)
      onClose()
    }
  }

  function handleAddChecklist() {
    if (!editingEvent || !newChecklistText.trim()) return
    addChecklistItem(editingEvent.id, newChecklistText)
    setNewChecklistText('')
  }

  const isEdit = mode.kind === 'edit' && !!editingEvent
  const checklist: ChecklistItem[] = editingEvent?.checklist ?? []
  const doneCount = checklist.filter((c) => c.done).length

  return (
    <Modal
      open={open}
      onClose={onClose}
      kicker={isEdit ? 'Editar evento' : 'Nuevo evento'}
      title={draft.title.trim() || 'Sin título'}
      size="lg"
    >
      <Section title="Tipo">
        <div className="flex flex-wrap gap-1.5">
          {EVENT_TYPES.map((t) => {
            const style = EVENT_TYPE_STYLES[t]
            const active = draft.type === t
            const Icon = style.Icon
            return (
              <button
                key={t}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, type: t }))}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? style.chip
                    : 'border-cc-border text-cc-muted hover:border-cc-border-strong hover:text-cc-text-soft'
                }`}
              >
                <Icon size={12} strokeWidth={2.25} />
                {style.label}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Título">
        <input
          autoFocus
          type="text"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="Ej: Entrega informe metodología"
          className="text-cc-text bg-cc-surface-2 border-cc-border focus:border-cc-accent/60 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-cc-accent/20"
        />
      </Section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Section title="Fecha">
          <div className="border-cc-border bg-cc-surface-2 focus-within:border-cc-accent/60 focus-within:ring-cc-accent/20 flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2">
            <CalendarIcon size={14} className="text-cc-muted shrink-0" />
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              className="text-cc-text w-full bg-transparent font-mono text-sm outline-none"
            />
          </div>
        </Section>
        <Section title="Hora (opcional)">
          <div className="border-cc-border bg-cc-surface-2 focus-within:border-cc-accent/60 focus-within:ring-cc-accent/20 flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2">
            <Clock size={14} className="text-cc-muted shrink-0" />
            <input
              type="time"
              value={draft.time}
              onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              className="text-cc-text w-full bg-transparent font-mono text-sm outline-none"
            />
            {draft.time && (
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, time: '' }))}
                aria-label="Quitar hora"
                className="text-cc-muted-soft hover:text-cc-danger"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </Section>
      </div>

      <Section
        title={
          isEdit
            ? `Tiene que tener${
                checklist.length > 0 ? ` · ${doneCount}/${checklist.length}` : ''
              }`
            : 'Tiene que tener (se edita después de crear)'
        }
      >
        {isEdit ? (
          <div className="border-cc-border bg-cc-surface-2/60 flex flex-col gap-2 rounded-xl border p-3">
            {checklist.length === 0 && (
              <p className="text-cc-muted text-center text-xs py-2">
                Sin items. Agrega lo que esto debe contener.
              </p>
            )}
            {checklist.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                onToggle={() => toggleChecklistItem(editingEvent!.id, item.id)}
                onTextChange={(text) =>
                  updateChecklistItemText(editingEvent!.id, item.id, text)
                }
                onRemove={() => removeChecklistItem(editingEvent!.id, item.id)}
              />
            ))}
            <div className="border-cc-border-strong mt-1 flex items-center gap-2 rounded-lg border border-dashed px-3 py-1.5">
              <Plus size={12} className="text-cc-muted shrink-0" />
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddChecklist()
                  }
                }}
                placeholder="Agregar item y presionar Enter"
                className="text-cc-text-soft placeholder:text-cc-muted-soft w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>
        ) : (
          <p className="text-cc-muted text-xs italic leading-relaxed">
            Guarda el evento primero y luego abrelo para editar la lista de "lo
            que tiene que tener".
          </p>
        )}
      </Section>

      <Section title="Notas (opcional)">
        <textarea
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          rows={3}
          placeholder="Contexto, links, recordatorios…"
          className="text-cc-text bg-cc-surface-2 border-cc-border focus:border-cc-accent/60 w-full resize-none rounded-lg border px-3 py-2 text-sm leading-relaxed outline-none transition focus:ring-2 focus:ring-cc-accent/20"
        />
      </Section>

      {isEdit && (
        <div className="border-cc-border flex items-center justify-between gap-2 border-t pt-4">
          <button
            type="button"
            onClick={() => toggleDone(editingEvent!.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              editingEvent!.done
                ? 'text-cc-muted border-cc-border hover:border-cc-border-strong'
                : 'bg-cc-success/15 text-cc-success border-cc-success/30 hover:bg-cc-success/25'
            }`}
          >
            {editingEvent!.done ? (
              <>
                <Pencil size={12} /> Reabrir
              </>
            ) : (
              <>
                <Check size={12} /> Marcar como hecho
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-cc-muted hover:text-cc-danger inline-flex items-center gap-1.5 text-xs transition"
          >
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-cc-muted hover:text-cc-text-soft inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!draft.title.trim()}
          className="bg-cc-accent/15 text-cc-accent border-cc-accent/40 hover:bg-cc-accent/25 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-sm font-medium transition"
        >
          {isEdit ? <Check size={14} /> : <Plus size={14} />}
          {isEdit ? 'Guardar cambios' : 'Crear evento'}
        </button>
      </div>
    </Modal>
  )
}

function initialDraft(mode: Mode, editing: FutureEvent | null | undefined) {
  if (mode.kind === 'edit' && editing) {
    return {
      title: editing.title,
      date: editing.date,
      time: editing.time ?? '',
      type: editing.type,
      notes: editing.notes ?? '',
    }
  }
  return {
    title: '',
    date: mode.kind === 'new' && mode.presetDate ? mode.presetDate : todayKey(),
    time: '',
    type: 'Entrega' as EventType,
    notes: '',
  }
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

function ChecklistRow({
  item,
  onToggle,
  onTextChange,
  onRemove,
}: {
  item: ChecklistItem
  onToggle: () => void
  onTextChange: (text: string) => void
  onRemove: () => void
}) {
  return (
    <div className="group hover:border-cc-border-strong border-cc-border bg-cc-bg/60 flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
      <button
        type="button"
        onClick={onToggle}
        aria-label={item.done ? 'Reabrir item' : 'Marcar como hecho'}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition ${
          item.done
            ? 'bg-cc-success border-cc-success text-cc-bg'
            : 'border-cc-border-strong text-transparent hover:border-cc-text-soft'
        }`}
      >
        <Check size={10} strokeWidth={3} />
      </button>
      <input
        type="text"
        value={item.text}
        onChange={(e) => onTextChange(e.target.value)}
        className={`text-cc-text flex-1 bg-transparent text-xs outline-none ${
          item.done ? 'text-cc-muted line-through' : ''
        }`}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Eliminar item"
        className="text-cc-muted-soft hover:text-cc-danger inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition opacity-0 group-hover:opacity-100"
      >
        <X size={12} />
      </button>
    </div>
  )
}
