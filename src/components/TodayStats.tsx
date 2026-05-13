import { Target } from 'lucide-react'

type Props = {
  completed: number
  filled: number
  total: number
}

export function TodayStats({ completed, filled, total }: Props) {
  const pct = total === 0 ? 0 : completed / total
  const allDone = completed === total && total > 0

  // SVG ring math
  const size = 156
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)

  const ringColor = allDone ? 'var(--color-cc-success)' : 'var(--color-cc-accent)'

  return (
    <section className="border-cc-border bg-cc-surface/80 relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border p-6 backdrop-blur">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full opacity-60"
        style={{
          background:
            allDone
              ? 'radial-gradient(circle, rgba(34,197,94,0.20) 0%, rgba(34,197,94,0) 70%)'
              : 'radial-gradient(circle, rgba(91,141,239,0.15) 0%, rgba(91,141,239,0) 70%)',
        }}
      />

      <div className="relative flex items-center justify-between">
        <h3 className="text-cc-text text-base font-semibold tracking-tight">
          Hoy
        </h3>
        <span className="text-cc-muted inline-flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase">
          <Target size={12} />
          Progreso
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center py-2">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-cc-border-strong)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 250ms ease-out, stroke 250ms ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-cc-text font-mono text-4xl leading-none font-semibold tabular-nums">
            {completed}
            <span className="text-cc-muted">/{total}</span>
          </span>
          <span className="text-cc-muted mt-1.5 text-xs">completadas</span>
        </div>
      </div>

      <div className="relative flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cc-muted">Planificadas</span>
          <span className="text-cc-text font-mono tabular-nums">{filled}/{total}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-cc-muted">Pendientes</span>
          <span className="text-cc-text font-mono tabular-nums">
            {Math.max(filled - completed, 0)}
          </span>
        </div>
      </div>
    </section>
  )
}
