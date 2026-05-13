import { useMemo, useState } from 'react'
import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useEvents, type EventWithMeta } from '../hooks/useEvents'
import { EVENT_TYPE_STYLES } from '../utils/constants'
import { todayKey } from '../utils/dateHelpers'
import { EventModal } from './EventModal'

type ModalMode =
  | { kind: 'closed' }
  | { kind: 'new'; presetDate?: string }
  | { kind: 'edit'; eventId: string }

export function EventsCard() {
  const { all, upcoming, byDate, toggleDone } = useEvents()
  const [cursor, setCursor] = useState(() => new Date())
  const [showDone, setShowDone] = useState(false)
  const [modal, setModal] = useState<ModalMode>({ kind: 'closed' })

  const today = todayKey()

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const listToShow: EventWithMeta[] = showDone
    ? all
    : upcoming.slice(0, 8) // limit upcoming preview length

  const monthLabel = format(cursor, "MMMM yyyy", { locale: es })
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <>
      <section className="border-cc-border bg-cc-surface/80 flex flex-col gap-5 rounded-2xl border p-6 backdrop-blur md:p-7">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col">
            <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
              <CalendarDays size={12} className="text-cc-accent" />
              Agenda · {upcoming.length} próximo{upcoming.length === 1 ? '' : 's'}
            </span>
            <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
              Eventos futuros
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowDone((v) => !v)}
              className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition"
              title={showDone ? 'Ocultar hechos' : 'Mostrar hechos'}
            >
              {showDone ? <EyeOff size={12} /> : <Eye size={12} />}
              {showDone ? 'Solo próximos' : 'Mostrar hechos'}
            </button>
            <button
              type="button"
              onClick={() => setModal({ kind: 'new' })}
              className="bg-cc-accent/15 text-cc-accent border-cc-accent/40 hover:bg-cc-accent/25 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition"
            >
              <Plus size={12} /> Nuevo evento
            </button>
          </div>
        </header>

        {/* ── Grid layout: month calendar (left) + list (right) ───────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Month grid */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-cc-text-soft text-sm font-medium">
                {monthLabelCap}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCursor((d) => addMonths(d, -1))}
                  aria-label="Mes anterior"
                  className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex h-6 w-6 items-center justify-center rounded-md border transition"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setCursor(new Date())}
                  className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase transition"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setCursor((d) => addMonths(d, 1))}
                  aria-label="Mes siguiente"
                  className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex h-6 w-6 items-center justify-center rounded-md border transition"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 px-0.5">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                <span
                  key={d}
                  className="text-cc-muted-soft text-center font-mono text-[10px] tracking-widest uppercase"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day) => {
                const dateK = format(day, 'yyyy-MM-dd')
                const dayEvents = byDate.get(dateK) ?? []
                const isToday = dateK === today
                const isInMonth = isSameMonth(day, cursor)
                return (
                  <button
                    type="button"
                    key={dateK}
                    onClick={() =>
                      dayEvents.length > 0
                        ? setModal({ kind: 'edit', eventId: dayEvents[0].id })
                        : setModal({ kind: 'new', presetDate: dateK })
                    }
                    className={`relative flex aspect-square flex-col items-center justify-start gap-1 rounded-md border p-1 text-[11px] transition ${
                      isInMonth
                        ? 'border-cc-border bg-cc-surface-2/40 text-cc-text-soft hover:border-cc-border-strong'
                        : 'border-transparent bg-transparent text-cc-muted-soft hover:bg-cc-surface-2/20'
                    } ${isToday ? 'ring-cc-accent/60 ring-1' : ''}`}
                  >
                    <span
                      className={`font-mono tabular-nums leading-none ${
                        isToday ? 'text-cc-accent font-semibold' : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="mt-auto inline-flex gap-0.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className={`block h-1 w-1 rounded-full ${EVENT_TYPE_STYLES[ev.type].dot}`}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-cc-muted-soft text-[8px] leading-none">
                            +
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* List */}
          <ul className="lg:col-span-3 flex flex-col gap-2.5">
            {listToShow.length === 0 ? (
              <li className="border-cc-border bg-cc-surface-2/30 text-cc-muted flex flex-col items-center gap-1 rounded-xl border border-dashed py-8 text-center text-sm">
                <span>Sin eventos próximos.</span>
                <span className="text-cc-muted-soft text-xs">
                  Apunta entregas, presentaciones, exámenes y reuniones aquí.
                </span>
              </li>
            ) : (
              listToShow.map((ev) => (
                <EventRow
                  key={ev.id}
                  ev={ev}
                  onOpen={() => setModal({ kind: 'edit', eventId: ev.id })}
                  onToggleDone={() => toggleDone(ev.id)}
                />
              ))
            )}
          </ul>
        </div>
      </section>

      <EventModal mode={modal} onClose={() => setModal({ kind: 'closed' })} />
    </>
  )
}

function EventRow({
  ev,
  onOpen,
  onToggleDone,
}: {
  ev: EventWithMeta
  onOpen: () => void
  onToggleDone: () => void
}) {
  const style = EVENT_TYPE_STYLES[ev.type]
  const Icon = style.Icon

  return (
    <li
      className={`group border-cc-border bg-cc-surface-2/60 hover:border-cc-border-strong relative flex items-stretch gap-0 overflow-hidden rounded-xl border transition ${
        ev.done ? 'opacity-55' : ''
      }`}
    >
      <div aria-hidden className={`w-1 shrink-0 ${style.stripe}`} />
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col gap-1.5 px-4 py-3 text-left"
      >
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <UrgencyChip daysUntil={ev.daysUntil} done={ev.done} />
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-medium tracking-widest uppercase ${style.chip}`}
          >
            <Icon size={10} strokeWidth={2.25} />
            {style.label}
          </span>
          <span className="text-cc-muted font-mono">
            {formatEventDate(ev.date, ev.time)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-cc-text text-sm font-medium leading-snug ${
              ev.done ? 'line-through decoration-2' : ''
            }`}
          >
            {ev.title}
          </span>
          {ev.checklistTotal > 0 && (
            <ChecklistProgress
              done={ev.checklistDone}
              total={ev.checklistTotal}
            />
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onToggleDone}
        aria-label={ev.done ? 'Reabrir evento' : 'Marcar como hecho'}
        title={ev.done ? 'Reabrir' : 'Marcar como hecho'}
        className={`mr-3 my-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
          ev.done
            ? 'bg-cc-success border-cc-success text-cc-bg'
            : 'border-cc-border-strong text-transparent hover:border-cc-text-soft'
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </button>
    </li>
  )
}

function UrgencyChip({
  daysUntil,
  done,
}: {
  daysUntil: number
  done: boolean
}) {
  if (done) {
    return (
      <span className="bg-cc-success/15 text-cc-success border-cc-success/30 inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono font-medium tracking-widest uppercase">
        Hecho
      </span>
    )
  }
  if (daysUntil < 0) {
    return (
      <span className="bg-cc-danger/15 text-cc-danger border-cc-danger/30 inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono font-medium tracking-widest uppercase">
        Atrasado · {Math.abs(daysUntil)}d
      </span>
    )
  }
  if (daysUntil === 0) {
    return (
      <span className="bg-cc-danger/15 text-cc-danger border-cc-danger/30 inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono font-medium tracking-widest uppercase">
        Hoy
      </span>
    )
  }
  if (daysUntil === 1) {
    return (
      <span className="bg-cc-warning/15 text-cc-warning border-cc-warning/30 inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono font-medium tracking-widest uppercase">
        Mañana
      </span>
    )
  }
  if (daysUntil <= 3) {
    return (
      <span className="bg-cc-warning/15 text-cc-warning border-cc-warning/30 inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono font-medium tracking-widest uppercase">
        En {daysUntil} días
      </span>
    )
  }
  if (daysUntil <= 7) {
    return (
      <span className="bg-cc-accent/15 text-cc-accent border-cc-accent/30 inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono font-medium tracking-widest uppercase">
        En {daysUntil} días
      </span>
    )
  }
  return (
    <span className="border-cc-border text-cc-muted bg-cc-surface-2/60 inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono tracking-widest uppercase">
      En {daysUntil} días
    </span>
  )
}

function ChecklistProgress({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : (done / total) * 100
  const complete = done === total
  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <span
        className={`font-mono text-[10px] tabular-nums ${
          complete ? 'text-cc-success' : 'text-cc-muted'
        }`}
      >
        {done}/{total}
      </span>
      <div className="bg-cc-bg/60 h-1 w-16 overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full transition-[width] ${
            complete ? 'bg-cc-success' : 'bg-cc-accent'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function formatEventDate(date: string, time?: string): string {
  const d = parseISO(date)
  const today = new Date()
  const sameYear = d.getFullYear() === today.getFullYear()
  const formatStr = sameYear ? "EEE d 'de' MMM" : "EEE d 'de' MMM yyyy"
  const out = format(d, formatStr, { locale: es }).replace(/\./g, '')
  return time ? `${out} · ${time}` : out
}

// Re-export helper for callers that want to compare dates with this.
export { isSameDay }
