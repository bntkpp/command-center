import { Sparkles, Settings as SettingsIcon, Keyboard } from 'lucide-react'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { formatClock, formatLongDate, greetingFor } from '../utils/dateHelpers'
import { useSettings } from '../hooks/useSettings'

type Props = {
  onOpenSettings: () => void
  onOpenShortcuts: () => void
}

export function Header({ onOpenSettings, onOpenShortcuts }: Props) {
  const now = useCurrentTime()
  const { settings } = useSettings()
  const [hh, mm, ss] = formatClock(now).split(':')

  return (
    <section className="border-cc-border bg-cc-surface/80 relative overflow-hidden rounded-2xl border p-7 backdrop-blur md:p-9">
      {/* Subtle accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(91,141,239,0.18) 0%, rgba(91,141,239,0) 70%)',
        }}
      />

      {/* Top-right toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenShortcuts}
          aria-label="Atajos de teclado"
          title="Atajos de teclado (Ctrl + /)"
          className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex h-8 w-8 items-center justify-center rounded-lg border transition"
        >
          <Keyboard size={14} />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Configuración"
          title="Configuración"
          className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex h-8 w-8 items-center justify-center rounded-lg border transition"
        >
          <SettingsIcon size={14} />
        </button>
      </div>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="flex flex-col gap-3">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
            <Sparkles size={12} className="text-cc-accent" />
            Command Center
          </span>
          <h1 className="text-cc-text text-3xl leading-tight font-semibold tracking-tight md:text-[2.5rem]">
            {greetingFor(now)},{' '}
            <span className="text-cc-accent">{settings.userName || 'tú'}</span>
          </h1>
          <p className="text-cc-text-soft text-base md:text-lg">
            {formatLongDate(now)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 md:items-end">
          <div className="font-mono text-6xl leading-none font-light tracking-tight tabular-nums md:text-7xl">
            <span className="text-cc-text">{hh}</span>
            <span className="text-cc-muted-soft mx-1">:</span>
            <span className="text-cc-text">{mm}</span>
            <span className="text-cc-muted-soft mx-1">:</span>
            <span className="text-cc-muted">{ss}</span>
          </div>
          <span className="text-cc-muted-soft font-mono text-xs tracking-widest uppercase">
            Hora local
          </span>
        </div>
      </div>
    </section>
  )
}
