import { useEffect, useState } from 'react'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Sunrise, Target, Dumbbell, X, CalendarDays } from 'lucide-react'
import { Modal } from './Modal'
import { useSettings } from '../hooks/useSettings'
import { useDailyTasks } from '../hooks/useDailyTasks'
import { useGym } from '../hooks/useGym'
import { useEvents } from '../hooks/useEvents'
import { EVENT_TYPE_STYLES, STORAGE_KEYS } from '../utils/constants'
import { todayKey } from '../utils/dateHelpers'

export function MorningBriefing() {
  const { settings } = useSettings()
  const { todaySlots, todayExtras, tomorrowSlots } = useDailyTasks()
  const { todayWorkout, streak } = useGym()
  const { thisWeek: eventsThisWeek } = useEvents()
  const [open, setOpen] = useState(false)

  // Decide whether to open on mount.
  useEffect(() => {
    if (!settings.morningBriefingEnabled) return
    const today = todayKey()
    const last = window.localStorage.getItem(STORAGE_KEYS.lastBriefingDate)
    if (last === today) return
    // Open only if it's morning (5–14h) to avoid showing it at 23:00.
    const hour = new Date().getHours()
    if (hour < 5 || hour >= 14) {
      window.localStorage.setItem(STORAGE_KEYS.lastBriefingDate, today)
      return
    }
    setOpen(true)
  }, [settings.morningBriefingEnabled])

  function dismiss() {
    setOpen(false)
    window.localStorage.setItem(STORAGE_KEYS.lastBriefingDate, todayKey())
  }

  // Yesterday recap from the daily tasks log (read straight from localStorage so the briefing
  // works even if no other component has surfaced "yesterday" data).
  const yesterdayKey = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const allTasks = readTasks()
  const yesterdayTasks = allTasks.filter(
    (t) => t.date === yesterdayKey && (t.kind ?? 'fixed') === 'fixed'
  )
  const yesterdayDone = yesterdayTasks.filter((t) => t.completed && t.text.trim()).length
  const yesterdayTotal = 3

  const todayPlannedCount = todaySlots.filter((t) => t.text.trim()).length
  const tomorrowPlannedCount = tomorrowSlots.filter((t) => t.text.trim()).length
  const todayExtrasCount = todayExtras.filter((t) => t.text.trim()).length

  const niceDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es })
  const capDate = niceDate.charAt(0).toUpperCase() + niceDate.slice(1)

  return (
    <Modal open={open} onClose={dismiss} kicker="Morning briefing" title={capDate} size="lg">
      <p className="text-cc-text-soft -mt-2 text-sm leading-relaxed">
        Buenos días, {settings.userName || 'tú'}. Antes de meterte al PC, un repaso rápido.
      </p>

      {/* Yesterday */}
      <section className="border-cc-border bg-cc-surface-2/60 flex flex-col gap-3 rounded-xl border p-4">
        <h3 className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
          Ayer
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Stat
            label="Tareas completadas"
            value={`${yesterdayDone}/${yesterdayTotal}`}
            tone={yesterdayDone === yesterdayTotal ? 'success' : yesterdayDone >= 2 ? 'neutral' : 'warning'}
          />
          <Stat
            label="Streak gym"
            value={`${streak}`}
            suffix={streak === 1 ? 'día' : 'días'}
            tone={streak > 0 ? 'success' : 'neutral'}
          />
        </div>
      </section>

      {/* Today */}
      <section className="border-cc-border bg-cc-surface-2/60 flex flex-col gap-3 rounded-xl border p-4">
        <h3 className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
          Hoy
        </h3>
        <div className="flex flex-col gap-2.5 text-sm">
          {todayPlannedCount > 0 ? (
            <Row
              icon={<Target size={14} className="text-cc-accent" />}
              label={`${todayPlannedCount}/3 tareas planificadas${
                todayExtrasCount > 0 ? ` (+${todayExtrasCount} extra${todayExtrasCount === 1 ? '' : 's'})` : ''
              }`}
            />
          ) : (
            <Row
              icon={<Target size={14} className="text-cc-warning" />}
              label="Aún no has planificado tus 3 tareas — apúntalas en cuanto cierres este briefing."
            />
          )}

          {todayWorkout && todayWorkout.workout ? (
            <Row
              icon={<Dumbbell size={14} className="text-cc-salud" />}
              label={`Hoy toca: ${todayWorkout.workout}`}
            />
          ) : (
            <Row
              icon={<Dumbbell size={14} className="text-cc-muted" />}
              label="Día de descanso (sin gym programado)."
            />
          )}
        </div>
      </section>

      {/* Events this week */}
      {eventsThisWeek.length > 0 && (
        <section className="border-cc-border bg-cc-surface-2/60 flex flex-col gap-2.5 rounded-xl border p-4">
          <h3 className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
            Esta semana · {eventsThisWeek.length} evento
            {eventsThisWeek.length === 1 ? '' : 's'}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {eventsThisWeek.slice(0, 5).map((ev) => {
              const style = EVENT_TYPE_STYLES[ev.type]
              const Icon = style.Icon
              return (
                <li key={ev.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${style.iconWrap}`}
                  >
                    <Icon size={11} strokeWidth={2.25} />
                  </span>
                  <span className="text-cc-text-soft flex-1 leading-snug">
                    {ev.title}
                  </span>
                  <UrgencyTag daysUntil={ev.daysUntil} />
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Tomorrow planning nudge */}
      {tomorrowPlannedCount > 0 ? (
        <p className="text-cc-muted text-xs leading-relaxed">
          <CalendarDays size={11} className="inline" /> Tienes {tomorrowPlannedCount}/3 tareas planificadas para mañana 👏
        </p>
      ) : null}

      <div className="border-cc-border flex items-center justify-between border-t pt-4">
        <span className="text-cc-muted-soft inline-flex items-center gap-1.5 text-[11px]">
          <Sunrise size={11} /> Buenas vibras hoy
        </span>
        <button
          type="button"
          onClick={dismiss}
          className="bg-cc-accent/15 text-cc-accent border-cc-accent/40 hover:bg-cc-accent/25 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition"
        >
          <X size={14} /> A trabajar
        </button>
      </div>
    </Modal>
  )
}

type TaskShape = {
  date: string
  completed: boolean
  text: string
  kind?: 'fixed' | 'extra'
}

function readTasks(): TaskShape[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.dailyTasks)
    return raw ? (JSON.parse(raw) as TaskShape[]) : []
  } catch {
    return []
  }
}

function Stat({
  label,
  value,
  suffix,
  tone = 'neutral',
}: {
  label: string
  value: string
  suffix?: string
  tone?: 'success' | 'warning' | 'neutral'
}) {
  const toneClass =
    tone === 'success'
      ? 'text-cc-success'
      : tone === 'warning'
        ? 'text-cc-warning'
        : 'text-cc-text'
  return (
    <div className="flex flex-col">
      <span className="text-cc-muted text-[10px] tracking-widest uppercase">{label}</span>
      <span className="mt-1 flex items-baseline gap-1.5">
        <span className={`font-mono text-2xl font-semibold tabular-nums ${toneClass}`}>
          {value}
        </span>
        {suffix && <span className="text-cc-muted text-xs">{suffix}</span>}
      </span>
    </div>
  )
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-cc-text-soft leading-relaxed">{label}</span>
    </div>
  )
}

function UrgencyTag({ daysUntil }: { daysUntil: number }) {
  let cls = 'bg-cc-accent/15 text-cc-accent border-cc-accent/30'
  let label = `En ${daysUntil}d`
  if (daysUntil === 0) {
    cls = 'bg-cc-danger/15 text-cc-danger border-cc-danger/30'
    label = 'Hoy'
  } else if (daysUntil === 1) {
    cls = 'bg-cc-warning/15 text-cc-warning border-cc-warning/30'
    label = 'Mañana'
  } else if (daysUntil <= 3) {
    cls = 'bg-cc-warning/15 text-cc-warning border-cc-warning/30'
  }
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-widest uppercase ${cls}`}
    >
      {label}
    </span>
  )
}
