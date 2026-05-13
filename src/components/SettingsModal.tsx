import { useEffect, useState } from 'react'
import { Bell, BellOff, RotateCcw, Sunrise, AlertCircle } from 'lucide-react'
import { Modal } from './Modal'
import { useSettings } from '../hooks/useSettings'
import { useGym } from '../hooks/useGym'
import { WEEKDAYS, type Weekday } from '../utils/constants'

type Props = { open: boolean; onClose: () => void }

export function SettingsModal({ open, onClose }: Props) {
  const { settings, update, reset } = useSettings()
  const { routine, setWorkoutForDay } = useGym()
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  useEffect(() => {
    if (!open) return
    if (typeof Notification !== 'undefined') setNotifPerm(Notification.permission)
  }, [open])

  async function handleEnableNotifications() {
    if (typeof Notification === 'undefined') return
    let perm = Notification.permission
    if (perm === 'default') {
      perm = await Notification.requestPermission()
      setNotifPerm(perm)
    }
    if (perm === 'granted') {
      update({ notificationsEnabled: true })
      new Notification('Command Center', {
        body: 'Notificaciones activadas — te avisaré al inicio de cada bloque.',
        silent: false,
      })
    }
  }

  return (
    <Modal open={open} onClose={onClose} kicker="Configuración" title="Tu Command Center" size="lg">
      {/* Identity */}
      <Section title="Identidad">
        <Field label="Tu nombre">
          <input
            type="text"
            value={settings.userName}
            onChange={(e) => update({ userName: e.target.value })}
            placeholder="matikepp"
            className="text-cc-text bg-cc-surface-2 border-cc-border focus:border-cc-accent/60 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-cc-accent/20"
          />
        </Field>
        <Field label="Frase del footer">
          <textarea
            value={settings.footerPhrase}
            onChange={(e) => update({ footerPhrase: e.target.value })}
            rows={2}
            className="text-cc-text bg-cc-surface-2 border-cc-border focus:border-cc-accent/60 w-full resize-none rounded-lg border px-3 py-2 text-sm leading-relaxed outline-none transition focus:ring-2 focus:ring-cc-accent/20"
          />
        </Field>
      </Section>

      {/* Schedule + planning hour */}
      <Section title="Planificación">
        <Field
          label="Hora de planificación nocturna"
          hint="Después de esta hora se abre el editor de tareas para mañana."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={23}
              value={settings.nightPlanningHour}
              onChange={(e) =>
                update({
                  nightPlanningHour: Math.min(23, Math.max(0, Number(e.target.value) || 0)),
                })
              }
              className="text-cc-text bg-cc-surface-2 border-cc-border focus:border-cc-accent/60 w-20 rounded-lg border px-3 py-2 font-mono text-sm tabular-nums outline-none"
            />
            <Sunrise size={14} className="text-cc-muted" />
            <span className="text-cc-muted text-xs">
              {settings.nightPlanningHour.toString().padStart(2, '0')}:00
            </span>
          </div>
        </Field>
      </Section>

      {/* Gym routine */}
      <Section title="Rutina de gym por día">
        <div className="flex flex-col gap-2">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd.idx}
              className="border-cc-border bg-cc-surface-2/60 flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <span className="text-cc-text-soft w-20 shrink-0 font-mono text-xs tracking-wide uppercase">
                {wd.long}
              </span>
              <input
                type="text"
                value={routine[wd.idx as Weekday] ?? ''}
                onChange={(e) =>
                  setWorkoutForDay(wd.idx as Weekday, e.target.value || null)
                }
                placeholder="Descanso"
                className="text-cc-text placeholder:text-cc-muted-soft flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notificaciones del navegador">
        <div className="border-cc-border bg-cc-surface-2/60 flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex items-start gap-3">
            {settings.notificationsEnabled && notifPerm === 'granted' ? (
              <Bell size={16} className="text-cc-success mt-0.5 shrink-0" />
            ) : (
              <BellOff size={16} className="text-cc-muted mt-0.5 shrink-0" />
            )}
            <div className="flex flex-1 flex-col">
              <span className="text-cc-text text-sm font-medium">
                {settings.notificationsEnabled && notifPerm === 'granted'
                  ? 'Activadas'
                  : 'Desactivadas'}
              </span>
              <span className="text-cc-muted text-xs leading-relaxed">
                Cuando el dashboard está abierto, te aviso al inicio de cada bloque
                y cada hora si hay tareas sin marcar.
              </span>
            </div>
          </div>

          {notifPerm === 'unsupported' && (
            <Inline icon="warning">
              Este navegador no soporta notificaciones.
            </Inline>
          )}

          {notifPerm === 'denied' && (
            <Inline icon="warning">
              Permisos bloqueados por el navegador. Habilítalos manualmente desde
              la barra de direcciones.
            </Inline>
          )}

          {notifPerm !== 'unsupported' && notifPerm !== 'denied' && (
            <div className="flex flex-wrap gap-2">
              {!settings.notificationsEnabled || notifPerm !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="bg-cc-accent/15 text-cc-accent border-cc-accent/40 hover:bg-cc-accent/25 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                >
                  <Bell size={12} /> Activar notificaciones
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => update({ notificationsEnabled: false })}
                  className="text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition"
                >
                  <BellOff size={12} /> Desactivar
                </button>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Morning briefing toggle */}
      <Section title="Morning briefing">
        <ToggleRow
          label="Mostrar resumen al abrir por primera vez en el día"
          hint="Repaso de ayer + plan de hoy + nudge para escribir tus 3 tareas si no las planificaste."
          checked={settings.morningBriefingEnabled}
          onChange={(v) => update({ morningBriefingEnabled: v })}
        />
      </Section>

      {/* Footer actions */}
      <div className="border-cc-border flex items-center justify-between border-t pt-4">
        <button
          type="button"
          onClick={() => {
            if (confirm('¿Restaurar la configuración a los valores por defecto?')) {
              reset()
            }
          }}
          className="text-cc-muted hover:text-cc-danger inline-flex items-center gap-1.5 text-xs transition"
        >
          <RotateCcw size={12} /> Restaurar valores por defecto
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-cc-accent/15 text-cc-accent border-cc-accent/40 hover:bg-cc-accent/25 inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition"
        >
          Listo
        </button>
      </div>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-cc-text-soft text-xs font-medium">{label}</span>
      {children}
      {hint && <span className="text-cc-muted text-[11px] leading-relaxed">{hint}</span>}
    </label>
  )
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="border-cc-border bg-cc-surface-2/60 hover:border-cc-border-strong flex items-start gap-3 rounded-xl border p-4 text-left transition"
    >
      <span
        className={`mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition ${
          checked
            ? 'bg-cc-accent/30 border-cc-accent/50'
            : 'bg-cc-bg/60 border-cc-border-strong'
        }`}
      >
        <span
          className={`block h-3.5 w-3.5 rounded-full transition-all ${
            checked ? 'bg-cc-accent ml-[18px]' : 'bg-cc-muted ml-[3px]'
          }`}
        />
      </span>
      <div className="flex flex-1 flex-col">
        <span className="text-cc-text text-sm font-medium">{label}</span>
        {hint && (
          <span className="text-cc-muted mt-0.5 text-xs leading-relaxed">{hint}</span>
        )}
      </div>
    </button>
  )
}

function Inline({
  icon,
  children,
}: {
  icon: 'warning'
  children: React.ReactNode
}) {
  return (
    <div className="bg-cc-warning/10 border-cc-warning/30 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed">
      {icon === 'warning' && (
        <AlertCircle size={12} className="text-cc-warning mt-0.5 shrink-0" />
      )}
      <span className="text-cc-text-soft">{children}</span>
    </div>
  )
}
