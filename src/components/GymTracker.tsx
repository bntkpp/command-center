import { Dumbbell, Flame, Check, X, Moon } from 'lucide-react'
import { useGym, type GymDayCell } from '../hooks/useGym'
import { WEEKDAYS } from '../utils/constants'

export function GymTracker() {
  const { week, todayWorkout, streak, markDate, cycleToday } = useGym()

  const todayLabel = WEEKDAYS.find((w) => w.idx === todayWorkout?.weekday)?.long
  const isRestToday = todayWorkout?.status === 'rest'

  return (
    <section className="border-cc-border bg-cc-surface/80 relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border p-6 backdrop-blur md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle, rgba(34,197,94,0.16) 0%, rgba(34,197,94,0) 70%)',
        }}
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <Dumbbell size={12} className="text-cc-salud" />
            Gym tracker
          </span>
          <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Esta semana
          </h2>
        </div>

        <div className="border-cc-border bg-cc-surface-2/60 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5">
          <Flame
            size={14}
            className={streak > 0 ? 'text-cc-warning' : 'text-cc-muted'}
          />
          <span className="text-cc-text font-mono text-sm font-medium tabular-nums">
            {streak}
          </span>
          <span className="text-cc-muted text-[11px] tracking-wide uppercase">
            streak
          </span>
        </div>
      </header>

      {/* Week dots */}
      <div className="relative grid grid-cols-7 gap-1.5">
        {week.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            onCycle={() => {
              if (day.status === 'rest') return
              const current = day.status
              if (current === 'completed') markDate(day.date, 'skipped')
              else if (current === 'skipped') markDate(day.date, null)
              else markDate(day.date, 'completed')
            }}
          />
        ))}
      </div>

      {/* Today's workout */}
      <div className="border-cc-border bg-cc-surface-2/60 relative flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <span className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
            Hoy · {todayLabel}
          </span>
          {todayWorkout && !isRestToday && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase ${
                todayWorkout.status === 'completed'
                  ? 'bg-cc-success/15 text-cc-success'
                  : todayWorkout.status === 'skipped'
                    ? 'bg-cc-danger/15 text-cc-danger'
                    : 'bg-cc-muted/15 text-cc-text-soft'
              }`}
            >
              {todayWorkout.status === 'completed'
                ? 'Completado'
                : todayWorkout.status === 'skipped'
                  ? 'Saltado'
                  : 'Pendiente'}
            </span>
          )}
        </div>

        {isRestToday ? (
          <div className="text-cc-muted flex items-center gap-2 text-sm">
            <Moon size={14} className="text-cc-muted" />
            Día de descanso. Recupera bien.
          </div>
        ) : todayWorkout?.workout ? (
          <>
            <p className="text-cc-text text-base leading-snug">
              {todayWorkout.workout}
            </p>
            <button
              type="button"
              onClick={cycleToday}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                todayWorkout.status === 'completed'
                  ? 'bg-cc-success/15 text-cc-success border-cc-success/30 hover:bg-cc-success/20'
                  : todayWorkout.status === 'skipped'
                    ? 'bg-cc-danger/10 text-cc-danger border-cc-danger/30 hover:bg-cc-danger/15'
                    : 'border-cc-border-strong bg-cc-surface text-cc-text-soft hover:border-cc-text-soft hover:text-cc-text'
              }`}
            >
              {todayWorkout.status === 'completed' ? (
                <>
                  <Check size={14} /> Completado · toca para cambiar
                </>
              ) : todayWorkout.status === 'skipped' ? (
                <>
                  <X size={14} /> Saltado · toca para limpiar
                </>
              ) : (
                <>
                  <Check size={14} /> Marcar como completado
                </>
              )}
            </button>
          </>
        ) : (
          <span className="text-cc-muted text-sm">
            Sin rutina configurada para hoy.
          </span>
        )}
      </div>
    </section>
  )
}

function DayCell({
  day,
  onCycle,
}: {
  day: GymDayCell
  onCycle: () => void
}) {
  const wd = WEEKDAYS.find((w) => w.idx === day.weekday)!

  const styleByStatus: Record<string, string> = {
    rest: 'border-cc-border bg-transparent text-cc-muted-soft',
    completed: 'bg-cc-success/20 border-cc-success/50 text-cc-success',
    skipped: 'bg-cc-danger/15 border-cc-danger/40 text-cc-danger',
    missed: 'bg-cc-danger/5 border-cc-danger/20 text-cc-danger/70',
    pending: 'border-cc-border-strong bg-cc-surface-2 text-cc-text-soft',
  }

  const isClickable = day.status !== 'rest'

  return (
    <button
      type="button"
      onClick={onCycle}
      disabled={!isClickable}
      title={`${wd.long}${day.workout ? ` · ${day.workout}` : ''}`}
      className={`group flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-xs transition ${
        styleByStatus[day.status]
      } ${day.isToday ? 'ring-cc-accent/60 ring-2' : ''} ${
        isClickable ? 'hover:scale-[1.04] cursor-pointer' : 'cursor-default'
      }`}
    >
      <span className="text-[10px] tracking-widest uppercase opacity-80">
        {wd.short}
      </span>
      {day.status === 'completed' && <Check size={12} strokeWidth={3} />}
      {day.status === 'skipped' && <X size={12} strokeWidth={3} />}
      {day.status === 'missed' && <X size={12} strokeWidth={2.5} className="opacity-60" />}
      {day.status === 'rest' && (
        <Moon size={11} strokeWidth={2} className="opacity-50" />
      )}
      {day.status === 'pending' && (
        <span className="bg-cc-muted-soft h-1 w-1 rounded-full" />
      )}
    </button>
  )
}
