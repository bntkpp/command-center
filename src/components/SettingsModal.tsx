import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  BellOff,
  RotateCcw,
  Sunrise,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  PartyPopper,
} from 'lucide-react'
import { Modal } from './Modal'
import { useSettings, type ModuleKey } from '../hooks/useSettings'
import { useGym } from '../hooks/useGym'
import { TASK_AREAS, WEEKDAYS, type TaskArea, type Weekday } from '../utils/constants'
import { downloadBackup, restoreFromFile, wipeAllData } from '../utils/backup'

type Props = { open: boolean; onClose: () => void }

const MODULE_LABELS: Record<ModuleKey, { label: string; hint: string }> = {
  todayStats: {
    label: 'Anillo de progreso "Hoy"',
    hint: 'Anillo grande con tu progreso del día.',
  },
  gymTracker: {
    label: 'Gym tracker',
    hint: 'Semana de gym + workout del día + streak.',
  },
  schedule: {
    label: 'Bloques horarios',
    hint: 'Timeline de tu día con bloque actual resaltado.',
  },
  exportCalendar: {
    label: 'Export .ics al calendario',
    hint: 'Generador de archivo para tu calendario del teléfono.',
  },
  events: {
    label: 'Agenda de eventos futuros',
    hint: 'Entregas, presentaciones, exámenes con checklist.',
  },
  business: {
    label: 'Módulo negocio',
    hint: 'Zapatillas + Dropshipping + to-do operativo + gráfico 7 días.',
  },
  inbox: {
    label: 'Inbox',
    hint: 'Card para apuntes sueltos vía Ctrl+Shift+Space.',
  },
  footerQuote: {
    label: 'Cita del footer',
    hint: 'Frase motivacional al final del dashboard.',
  },
}

export function SettingsModal({ open, onClose }: Props) {
  const { settings, update, setModule, setAreaLabel, reset } = useSettings()
  const { routine, setWorkoutForDay } = useGym()
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const [restoreStatus, setRestoreStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'success'; count: number }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (typeof Notification !== 'undefined') setNotifPerm(Notification.permission)
    setRestoreStatus({ kind: 'idle' })
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

  async function handleRestoreFile(file: File) {
    if (!confirm(
      `¿Reemplazar TODOS los datos actuales con los del backup "${file.name}"?\nEsta acción no se puede deshacer.`
    )) {
      return
    }
    const result = await restoreFromFile(file)
    if (result.ok) {
      setRestoreStatus({ kind: 'success', count: result.restoredKeys.length })
    } else {
      setRestoreStatus({ kind: 'error', message: result.error })
    }
  }

  function handleWipe() {
    if (!confirm(
      '¿Borrar TODOS tus datos del Command Center (tareas, eventos, gym, negocio, settings)?\n\nEsto NO se puede deshacer. Hazte un backup primero.'
    )) {
      return
    }
    if (!confirm('¿Estás seguro? Última oportunidad.')) return
    wipeAllData()
    // Reload to mount default state cleanly.
    window.location.reload()
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

      {/* Areas */}
      <Section
        title="Áreas del día"
        hint="Cambia el nombre visible de cada área. Los iconos y colores se mantienen."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TASK_AREAS.map((area) => (
            <Field key={area} label={`Área ${area}`}>
              <input
                type="text"
                value={settings.areaLabels[area as TaskArea] ?? area}
                onChange={(e) => setAreaLabel(area as TaskArea, e.target.value)}
                placeholder={area}
                className="text-cc-text bg-cc-surface-2 border-cc-border focus:border-cc-accent/60 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-cc-accent/20"
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* Modules visibility */}
      <Section
        title="Visibilidad de módulos"
        hint="Apaga las cards que no uses. Las puedes reactivar cuando quieras."
      >
        <div className="border-cc-border bg-cc-surface-2/30 grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-2">
          {(Object.keys(MODULE_LABELS) as ModuleKey[]).map((key) => (
            <ModuleToggle
              key={key}
              label={MODULE_LABELS[key].label}
              hint={MODULE_LABELS[key].hint}
              checked={settings.modules[key]}
              onChange={(v) => setModule(key, v)}
            />
          ))}
        </div>
      </Section>

      {/* Planning */}
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
        <ToggleRow
          label="Celebración al completar 3/3 tareas"
          hint="Confetti rápido en el dashboard cuando marcas la tercera del día."
          checked={settings.confettiEnabled}
          onChange={(v) => update({ confettiEnabled: v })}
          icon={<PartyPopper size={12} className="text-cc-warning" />}
        />
      </Section>

      {/* Datos / backup */}
      <Section
        title="Datos"
        hint="Tu dashboard guarda todo en este navegador. Haz backup antes de cambiar de PC o limpiar caché."
      >
        <div className="border-cc-border bg-cc-surface-2/60 flex flex-col gap-3 rounded-xl border p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => downloadBackup()}
              className="bg-cc-accent/15 text-cc-accent border-cc-accent/40 hover:bg-cc-accent/25 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition"
            >
              <Download size={14} /> Descargar backup (.json)
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-cc-border text-cc-text-soft bg-cc-bg/60 hover:border-cc-border-strong inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition"
            >
              <Upload size={14} /> Restaurar desde archivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) await handleRestoreFile(f)
                e.target.value = ''
              }}
            />
          </div>

          {restoreStatus.kind === 'success' && (
            <Inline icon="success">
              Backup restaurado — {restoreStatus.count} módulo
              {restoreStatus.count === 1 ? '' : 's'} actualizado
              {restoreStatus.count === 1 ? '' : 's'}. Recarga la página para verlo
              todo al día.
            </Inline>
          )}
          {restoreStatus.kind === 'error' && (
            <Inline icon="warning">{restoreStatus.message}</Inline>
          )}

          <button
            type="button"
            onClick={handleWipe}
            className="text-cc-danger hover:bg-cc-danger/10 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs transition"
          >
            <Trash2 size={12} /> Borrar TODOS mis datos
          </button>
        </div>
      </Section>

      {/* Footer actions */}
      <div className="border-cc-border flex items-center justify-between border-t pt-4">
        <button
          type="button"
          onClick={() => {
            if (confirm('¿Restaurar settings (nombre, frase, módulos, áreas, hora) a los valores por defecto? Los datos de tareas/eventos/etc. no se tocan.')) {
              reset()
            }
          }}
          className="text-cc-muted hover:text-cc-danger inline-flex items-center gap-1.5 text-xs transition"
        >
          <RotateCcw size={12} /> Restaurar settings a defaults
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

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
          {title}
        </h3>
        {hint && (
          <p className="text-cc-muted-soft text-[11px] leading-relaxed">{hint}</p>
        )}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
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
  icon,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
  icon?: React.ReactNode
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
        <span className="text-cc-text inline-flex items-center gap-1.5 text-sm font-medium">
          {icon}
          {label}
        </span>
        {hint && (
          <span className="text-cc-muted mt-0.5 text-xs leading-relaxed">{hint}</span>
        )}
      </div>
    </button>
  )
}

function ModuleToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`border-cc-border bg-cc-bg/40 hover:border-cc-border-strong flex items-start gap-2.5 rounded-lg border p-3 text-left transition ${
        checked ? '' : 'opacity-60'
      }`}
    >
      <span
        className={`mt-0.5 inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition ${
          checked
            ? 'bg-cc-accent/30 border-cc-accent/50'
            : 'bg-cc-bg/60 border-cc-border-strong'
        }`}
      >
        <span
          className={`block h-3 w-3 rounded-full transition-all ${
            checked ? 'bg-cc-accent ml-[14px]' : 'bg-cc-muted ml-[3px]'
          }`}
        />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-cc-text-soft text-xs font-medium leading-tight">
          {label}
        </span>
        <span className="text-cc-muted-soft text-[10px] leading-snug">{hint}</span>
      </div>
    </button>
  )
}

function Inline({
  icon,
  children,
}: {
  icon: 'warning' | 'success'
  children: React.ReactNode
}) {
  const styles =
    icon === 'warning'
      ? 'bg-cc-warning/10 border-cc-warning/30'
      : 'bg-cc-success/10 border-cc-success/30'
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${styles}`}
    >
      {icon === 'warning' ? (
        <AlertCircle size={12} className="text-cc-warning mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={12} className="text-cc-success mt-0.5 shrink-0" />
      )}
      <span className="text-cc-text-soft">{children}</span>
    </div>
  )
}
