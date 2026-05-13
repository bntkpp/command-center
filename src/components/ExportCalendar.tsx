import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Download,
  Bell,
  ChevronDown,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { useDailyTasks } from '../hooks/useDailyTasks'
import { useSchedule } from '../hooks/useSchedule'
import { useGym } from '../hooks/useGym'
import { useEvents } from '../hooks/useEvents'
import {
  buildDayEvents,
  buildIcsCalendar,
  downloadIcs,
} from '../utils/icsExport'
import { hhmmToMinutes } from '../utils/timeHelpers'

export function ExportCalendar() {
  const { todaySlots, todayExtras, todayDate } = useDailyTasks()
  const { blocks } = useSchedule()
  const { todayWorkout } = useGym()
  const { upcoming: upcomingEvents } = useEvents()
  const [helpOpen, setHelpOpen] = useState(false)
  const [justDownloaded, setJustDownloaded] = useState(false)

  const pendingTasks = useMemo(
    () =>
      [...todaySlots, ...todayExtras].filter(
        (t) => !t.completed && t.text.trim()
      ),
    [todaySlots, todayExtras]
  )

  const gymBundle = useMemo(() => {
    if (!todayWorkout || todayWorkout.status === 'rest' || !todayWorkout.workout) {
      return null
    }
    // Find the Gym block (Salud area, earliest of the day).
    const gymBlock = blocks
      .slice()
      .sort((a, b) => hhmmToMinutes(a.timeStart) - hhmmToMinutes(b.timeStart))
      .find((b) => b.area === 'Salud')
    if (!gymBlock) return null
    return {
      workout: todayWorkout.workout,
      timeStart: gymBlock.timeStart,
      timeEnd: gymBlock.timeEnd,
    }
  }, [todayWorkout, blocks])

  const futureEvents = upcomingEvents.filter((e) => !e.done)

  const totalEvents =
    pendingTasks.length + (gymBundle ? 1 : 0) + futureEvents.length
  const totalAlarms = useMemo(() => {
    // Quick estimate: each task = 1–3 alarms (block length), gym = 2 alarms,
    // future event = 3 alarms (-1d, -1h, 0).
    const taskAlarms = pendingTasks.reduce((acc, t) => {
      const block = blocks.find((b) => b.area === t.area)
      if (!block) return acc
      const len = hhmmToMinutes(block.timeEnd) - hhmmToMinutes(block.timeStart)
      let n = 1
      if (len >= 60) n++
      if (len >= 120) n++
      return acc + n
    }, 0)
    return taskAlarms + (gymBundle ? 2 : 0) + futureEvents.length * 3
  }, [pendingTasks, blocks, gymBundle, futureEvents])

  function handleDownload() {
    const events = buildDayEvents({
      date: todayDate,
      tasks: [...todaySlots, ...todayExtras],
      schedule: blocks,
      gymWorkout: gymBundle,
      events: futureEvents,
    })
    const ics = buildIcsCalendar(events)
    downloadIcs(`command-center-${todayDate}.ics`, ics)
    setJustDownloaded(true)
    window.setTimeout(() => setJustDownloaded(false), 2500)
  }

  const disabled = totalEvents === 0

  return (
    <section className="border-cc-border bg-cc-surface/80 relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border p-6 backdrop-blur md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(circle, rgba(91,141,239,0.18) 0%, rgba(91,141,239,0) 70%)',
        }}
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <CalendarDays size={12} className="text-cc-accent" />
            Calendario
          </span>
          <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Sincroniza tu día
          </h2>
        </div>
      </header>

      <div className="border-cc-border bg-cc-surface-2/60 flex flex-col gap-2.5 rounded-xl border p-4">
        <Row
          label="Tareas pendientes"
          value={pendingTasks.length}
          unit="evento"
        />
        <Row
          label="Workout del día"
          value={gymBundle ? 1 : 0}
          unit="evento"
        />
        <Row
          label="Eventos futuros"
          value={futureEvents.length}
          unit="evento"
        />
        <div className="bg-cc-border my-1 h-px" />
        <Row label="Total" value={totalEvents} unit="evento" emphasize />
        <div className="text-cc-muted flex items-center gap-1.5 text-xs">
          <Bell size={12} />
          <span>
            ~{totalAlarms} recordatorio{totalAlarms === 1 ? '' : 's'} repartidos durante el día
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled}
        className={`relative flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold tracking-tight transition ${
          disabled
            ? 'border-cc-border bg-cc-surface-2/40 text-cc-muted cursor-not-allowed'
            : justDownloaded
              ? 'border-cc-success/40 bg-cc-success/15 text-cc-success'
              : 'border-cc-accent/40 bg-cc-accent/10 text-cc-accent hover:bg-cc-accent/15 hover:border-cc-accent/60'
        }`}
      >
        {justDownloaded ? (
          <>
            <CheckCircle2 size={16} />
            Descargado · revisa tu carpeta
          </>
        ) : (
          <>
            <Download size={16} />
            Descargar día (.ics)
          </>
        )}
      </button>

      {disabled && (
        <p className="text-cc-muted text-center text-xs">
          Escribe al menos una tarea o marca un día de gym para exportar.
        </p>
      )}

      <button
        type="button"
        onClick={() => setHelpOpen((v) => !v)}
        className="text-cc-muted hover:text-cc-text-soft inline-flex items-center justify-between gap-2 text-xs transition"
      >
        <span className="inline-flex items-center gap-1.5">
          <Info size={12} />
          Cómo importarlo en tu teléfono
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${helpOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {helpOpen && (
        <ol className="text-cc-text-soft border-cc-border bg-cc-surface-2/40 list-decimal space-y-1.5 rounded-xl border px-5 py-3 text-xs leading-relaxed marker:text-cc-muted">
          <li>Descarga el archivo aquí en tu PC.</li>
          <li>
            Envíatelo al teléfono por Telegram, WhatsApp, AirDrop o correo a ti
            mismo.
          </li>
          <li>
            Tócalo en el teléfono → tu app de Calendario te ofrece importarlo.
          </li>
          <li>
            Acepta. Los recordatorios sonarán durante el día hasta que los
            descartes. Si ya marcaste una tarea como hecha aquí, vuelve a
            descargar y reimportar para reemplazar.
          </li>
        </ol>
      )}
    </section>
  )
}

function Row({
  label,
  value,
  unit,
  emphasize = false,
}: {
  label: string
  value: number
  unit: string
  emphasize?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm">
      <span className={emphasize ? 'text-cc-text font-medium' : 'text-cc-muted'}>
        {label}
      </span>
      <span
        className={`font-mono tabular-nums ${
          emphasize ? 'text-cc-text text-base font-semibold' : 'text-cc-text-soft'
        }`}
      >
        {value} {unit}
        {value === 1 ? '' : 's'}
      </span>
    </div>
  )
}
