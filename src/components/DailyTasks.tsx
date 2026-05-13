import { useState } from 'react'
import { Check, Moon, Sunrise, Plus, Trash2, X } from 'lucide-react'
import { useCurrentTime } from '../hooks/useCurrentTime'
import {
  AREA_STYLES,
  TASK_AREAS,
  type TaskArea,
} from '../utils/constants'
import type { Task } from '../hooks/useDailyTasks'
import { useSettings } from '../hooks/useSettings'

type Props = {
  todaySlots: Task[]
  tomorrowSlots: Task[]
  todayExtras: Task[]
  tomorrowExtras: Task[]
  todayDate: string
  tomorrowDate: string
  onTextChange: (slot: Task, text: string) => void
  onToggle: (slot: Task) => void
  onAddExtra: (date: string, area: TaskArea) => void
  onRemoveTask: (id: string) => void
}

export function DailyTasks({
  todaySlots,
  tomorrowSlots,
  todayExtras,
  tomorrowExtras,
  todayDate,
  tomorrowDate,
  onTextChange,
  onToggle,
  onAddExtra,
  onRemoveTask,
}: Props) {
  const now = useCurrentTime(60_000)
  const { settings } = useSettings()
  const planningOpen = now.getHours() >= settings.nightPlanningHour

  return (
    <div className="flex flex-col gap-6">
      <section
        data-cc="daily-tasks"
        className="border-cc-border bg-cc-surface/80 flex flex-col gap-5 rounded-2xl border p-6 backdrop-blur md:p-7"
      >
        <header className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-cc-muted font-mono text-[11px] tracking-widest uppercase">
              Foco del día
            </span>
            <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
              Mis 3 tareas del día
            </h2>
          </div>
          {todayExtras.length > 0 && (
            <span className="border-cc-border text-cc-muted bg-cc-surface-2/60 rounded-full border px-2.5 py-1 font-mono text-[11px] tabular-nums">
              +{todayExtras.length} extra{todayExtras.length === 1 ? '' : 's'}
            </span>
          )}
        </header>

        <ul className="flex flex-col gap-3">
          {todaySlots.map((slot, idx) => (
            <TaskCard
              key={slot.id}
              slot={slot}
              index={idx + 1}
              onTextChange={(text) => onTextChange(slot, text)}
              onToggle={() => onToggle(slot)}
            />
          ))}

          {todayExtras.length > 0 && <ExtrasDivider />}

          {todayExtras.map((slot, idx) => (
            <TaskCard
              key={slot.id}
              slot={slot}
              index={todaySlots.length + idx + 1}
              extra
              onTextChange={(text) => onTextChange(slot, text)}
              onToggle={() => onToggle(slot)}
              onRemove={() => onRemoveTask(slot.id)}
            />
          ))}
        </ul>

        <AddExtraButton onAdd={(area) => onAddExtra(todayDate, area)} />
      </section>

      <TomorrowPlanner
        open={planningOpen}
        slots={tomorrowSlots}
        extras={tomorrowExtras}
        tomorrowDate={tomorrowDate}
        onTextChange={onTextChange}
        onAddExtra={onAddExtra}
        onRemoveTask={onRemoveTask}
      />
    </div>
  )
}

function ExtrasDivider() {
  return (
    <li className="flex items-center gap-3 pt-1" role="separator">
      <span className="bg-cc-border h-px flex-1" />
      <span className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
        Extras
      </span>
      <span className="bg-cc-border h-px flex-1" />
    </li>
  )
}

function TaskCard({
  slot,
  index,
  extra = false,
  onTextChange,
  onToggle,
  onRemove,
}: {
  slot: Task
  index: number
  extra?: boolean
  onTextChange: (text: string) => void
  onToggle: () => void
  onRemove?: () => void
}) {
  const styles = AREA_STYLES[slot.area]
  const Icon = styles.Icon
  const hasText = slot.text.trim().length > 0

  return (
    <li
      className={`group border-cc-border bg-cc-surface-2/60 hover:border-cc-border-strong relative flex items-stretch gap-0 overflow-hidden rounded-xl border transition focus-within:ring-2 ${styles.ring} ${
        slot.completed ? 'opacity-80' : ''
      }`}
    >
      <div
        aria-hidden
        className={`w-1 shrink-0 ${styles.stripe} ${
          slot.completed ? 'opacity-50' : ''
        }`}
      />

      <div className="flex flex-1 items-center gap-4 px-4 py-3.5 md:px-5 md:py-4">
        <span
          className={`hidden font-mono text-xs tabular-nums sm:inline-block ${
            extra ? 'text-cc-muted-soft' : 'text-cc-muted'
          }`}
        >
          {String(index).padStart(2, '0')}
        </span>

        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${styles.iconWrap}`}
          aria-hidden
        >
          <Icon size={16} strokeWidth={2.25} />
        </span>

        <span
          className={`hidden shrink-0 rounded-md border px-2 py-1 text-[10px] font-medium tracking-widest uppercase md:inline-flex ${styles.chip}`}
        >
          {styles.label}
        </span>

        <input
          type="text"
          value={slot.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={extra ? 'Tarea extra…' : `Tarea de ${slot.area.toLowerCase()}…`}
          className={`text-cc-text placeholder:text-cc-muted/70 flex-1 bg-transparent text-base outline-none md:text-lg ${
            slot.completed ? 'text-cc-muted line-through decoration-2' : ''
          }`}
          aria-label={`Tarea de ${slot.area}`}
        />

        {extra && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Eliminar tarea extra"
            title="Eliminar"
            className="text-cc-muted-soft hover:text-cc-danger flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition group-hover:opacity-100 sm:opacity-0"
          >
            <Trash2 size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={onToggle}
          disabled={!hasText}
          aria-pressed={slot.completed}
          aria-label={
            slot.completed
              ? `Marcar como pendiente: ${slot.area}`
              : `Completar tarea de ${slot.area}`
          }
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
            slot.completed
              ? 'bg-cc-success border-cc-success text-cc-bg'
              : 'border-cc-border-strong text-transparent hover:border-cc-text-soft'
          } ${hasText ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
        >
          <Check size={16} strokeWidth={3} />
        </button>
      </div>
    </li>
  )
}

function AddExtraButton({
  onAdd,
  compact = false,
}: {
  onAdd: (area: TaskArea) => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex items-center justify-center gap-2 rounded-lg border border-dashed transition ${
          compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
        }`}
      >
        <Plus size={14} />
        Agregar tarea extra
      </button>
    )
  }

  return (
    <div className="border-cc-border bg-cc-surface-2/60 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2.5">
      <span className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
        Agregar de:
      </span>
      {TASK_AREAS.map((area) => {
        const styles = AREA_STYLES[area]
        const Icon = styles.Icon
        return (
          <button
            key={area}
            type="button"
            onClick={() => {
              onAdd(area)
              setOpen(false)
            }}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition hover:brightness-125 ${styles.chip}`}
          >
            <Icon size={12} strokeWidth={2.5} />
            {styles.label}
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Cancelar"
        className="text-cc-muted hover:text-cc-text-soft ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md transition"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function TomorrowPlanner({
  open,
  slots,
  extras,
  tomorrowDate,
  onTextChange,
  onAddExtra,
  onRemoveTask,
}: {
  open: boolean
  slots: Task[]
  extras: Task[]
  tomorrowDate: string
  onTextChange: (slot: Task, text: string) => void
  onAddExtra: (date: string, area: TaskArea) => void
  onRemoveTask: (id: string) => void
}) {
  const { settings } = useSettings()
  if (!open) {
    return (
      <section className="border-cc-border bg-cc-surface/40 text-cc-muted flex items-center gap-3 rounded-2xl border border-dashed px-5 py-4 text-sm">
        <Moon size={16} className="text-cc-accent shrink-0" />
        <div className="flex flex-col">
          <span className="text-cc-text-soft font-medium">
            Planificación nocturna
          </span>
          <span className="text-cc-muted text-xs">
            Disponible a partir de las {settings.nightPlanningHour}:00 — escribe tus 3
            tareas para mañana.
          </span>
        </div>
      </section>
    )
  }

  return (
    <section className="border-cc-border bg-cc-surface/80 flex flex-col gap-4 rounded-2xl border p-6 backdrop-blur md:p-7">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <Sunrise size={12} className="text-cc-accent" />
            Ritual nocturno
          </span>
          <h3 className="text-cc-text mt-1 text-lg font-semibold tracking-tight">
            Planifica tus 3 tareas de mañana
          </h3>
        </div>
      </header>

      <ul className="flex flex-col gap-2.5">
        {slots.map((slot) => (
          <PlannerRow
            key={slot.id}
            slot={slot}
            onTextChange={(text) => onTextChange(slot, text)}
          />
        ))}

        {extras.length > 0 && <ExtrasDivider />}

        {extras.map((slot) => (
          <PlannerRow
            key={slot.id}
            slot={slot}
            extra
            onTextChange={(text) => onTextChange(slot, text)}
            onRemove={() => onRemoveTask(slot.id)}
          />
        ))}
      </ul>

      <AddExtraButton compact onAdd={(area) => onAddExtra(tomorrowDate, area)} />
    </section>
  )
}

function PlannerRow({
  slot,
  extra = false,
  onTextChange,
  onRemove,
}: {
  slot: Task
  extra?: boolean
  onTextChange: (text: string) => void
  onRemove?: () => void
}) {
  const styles = AREA_STYLES[slot.area]
  const Icon = styles.Icon

  return (
    <li
      className={`group border-cc-border bg-cc-surface-2/60 hover:border-cc-border-strong flex items-center gap-3 overflow-hidden rounded-lg border transition focus-within:ring-2 ${styles.ring}`}
    >
      <div
        aria-hidden
        className={`h-9 w-1 shrink-0 ${styles.stripe} opacity-80`}
      />
      <span
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${styles.iconWrap}`}
        aria-hidden
      >
        <Icon size={13} strokeWidth={2.25} />
      </span>
      <span
        className={`hidden shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase md:inline-flex ${styles.chip}`}
      >
        {styles.label}
      </span>
      <input
        type="text"
        value={slot.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={extra ? 'Extra para mañana…' : 'Para mañana…'}
        className="text-cc-text placeholder:text-cc-muted/70 flex-1 bg-transparent py-2.5 pr-2 text-base outline-none"
      />
      {extra && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Eliminar tarea extra"
          title="Eliminar"
          className="text-cc-muted-soft hover:text-cc-danger mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition group-hover:opacity-100 sm:opacity-0"
        >
          <Trash2 size={13} />
        </button>
      )}
    </li>
  )
}
