import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { DailyTasks } from './components/DailyTasks'
import { TodayStats } from './components/TodayStats'
import { FooterQuote } from './components/FooterQuote'
import { Schedule } from './components/Schedule'
import { GymTracker } from './components/GymTracker'
import { ExportCalendar } from './components/ExportCalendar'
import { EventsCard } from './components/EventsCard'
import { ZapatillasCard } from './components/ZapatillasCard'
import { DropshippingCard } from './components/DropshippingCard'
import { BusinessTodos } from './components/BusinessTodos'
import { BusinessChart } from './components/BusinessChart'
import { RoasAlert } from './components/RoasAlert'
import { SettingsModal } from './components/SettingsModal'
import { ShortcutsModal } from './components/ShortcutsModal'
import { MorningBriefing } from './components/MorningBriefing'
import { useDailyTasks } from './hooks/useDailyTasks'
import { useNotifications } from './hooks/useNotifications'
import {
  useKeyboardShortcuts,
  type Shortcut,
} from './hooks/useKeyboardShortcuts'
import {
  buildDayEvents,
  buildIcsCalendar,
  downloadIcs,
} from './utils/icsExport'
import { useSchedule } from './hooks/useSchedule'
import { useGym } from './hooks/useGym'
import { hhmmToMinutes } from './utils/timeHelpers'

function App() {
  const {
    todaySlots,
    tomorrowSlots,
    todayExtras,
    tomorrowExtras,
    todayDate,
    tomorrowDate,
    completed,
    filled,
    setText,
    toggle,
    addExtra,
    removeTask,
  } = useDailyTasks()

  const { blocks } = useSchedule()
  const { todayWorkout } = useGym()

  // Side-effect: browser notifications (no-op unless enabled in settings).
  useNotifications()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  function focusSlot(idx: number) {
    const inputs = document.querySelectorAll<HTMLInputElement>(
      '[data-cc="daily-tasks"] input[type="text"]'
    )
    const target = inputs[idx]
    target?.focus()
    target?.select?.()
  }

  function openExtraPicker() {
    const btn = Array.from(
      document.querySelectorAll<HTMLButtonElement>('button')
    ).find((b) => (b.textContent || '').includes('Agregar tarea extra'))
    btn?.click()
  }

  function downloadToday() {
    const gymBlock = blocks
      .slice()
      .sort((a, b) => hhmmToMinutes(a.timeStart) - hhmmToMinutes(b.timeStart))
      .find((b) => b.area === 'Salud')
    const gymBundle =
      todayWorkout && todayWorkout.workout && todayWorkout.status !== 'rest' && gymBlock
        ? {
            workout: todayWorkout.workout,
            timeStart: gymBlock.timeStart,
            timeEnd: gymBlock.timeEnd,
          }
        : null
    const events = buildDayEvents({
      date: todayDate,
      tasks: [...todaySlots, ...todayExtras],
      schedule: blocks,
      gymWorkout: gymBundle,
    })
    if (events.length === 0) return
    const ics = buildIcsCalendar(events)
    downloadIcs(`command-center-${todayDate}.ics`, ics)
  }

  const shortcuts = useMemo<Shortcut[]>(
    () => [
      {
        combo: 'Control+/',
        description: 'Mostrar/ocultar este panel de atajos',
        category: 'general',
        handler: () => setShortcutsOpen((v) => !v),
      },
      {
        combo: 'Control+,',
        description: 'Abrir configuración',
        category: 'general',
        handler: () => setSettingsOpen(true),
      },
      {
        combo: 'Control+1',
        description: 'Enfocar tarea 01 · Universidad',
        category: 'tareas',
        handler: () => focusSlot(0),
      },
      {
        combo: 'Control+2',
        description: 'Enfocar tarea 02 · Negocio',
        category: 'tareas',
        handler: () => focusSlot(1),
      },
      {
        combo: 'Control+3',
        description: 'Enfocar tarea 03 · Salud',
        category: 'tareas',
        handler: () => focusSlot(2),
      },
      {
        combo: 'Control+n',
        description: 'Agregar tarea extra',
        category: 'tareas',
        handler: () => openExtraPicker(),
      },
      {
        combo: 'Control+e',
        description: 'Descargar .ics del día',
        category: 'export',
        handler: () => downloadToday(),
      },
      {
        combo: 'Escape',
        description: 'Cerrar overlay activo',
        category: 'general',
        handler: () => {
          setSettingsOpen(false)
          setShortcutsOpen(false)
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todaySlots, todayExtras, todayDate, blocks, todayWorkout]
  )

  useKeyboardShortcuts(shortcuts)

  return (
    <main className="min-h-screen w-full px-4 py-6 md:px-10 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Row 1 — Hero + Today stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Header
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenShortcuts={() => setShortcutsOpen(true)}
            />
          </div>
          <div className="lg:col-span-1">
            <TodayStats completed={completed} filled={filled} total={3} />
          </div>
        </div>

        {/* Row 2 — Tasks + Gym tracker */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DailyTasks
              todaySlots={todaySlots}
              tomorrowSlots={tomorrowSlots}
              todayExtras={todayExtras}
              tomorrowExtras={tomorrowExtras}
              todayDate={todayDate}
              tomorrowDate={tomorrowDate}
              onTextChange={setText}
              onToggle={toggle}
              onAddExtra={addExtra}
              onRemoveTask={removeTask}
            />
          </div>
          <div className="lg:col-span-1">
            <GymTracker />
          </div>
        </div>

        {/* Row 3 — Schedule + Export */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Schedule />
          </div>
          <div className="lg:col-span-1">
            <ExportCalendar />
          </div>
        </div>

        {/* Row 4 — Agenda (full width) */}
        <EventsCard />

        {/* Conditional ROAS alert */}
        <RoasAlert />

        {/* Row 4 — Business cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ZapatillasCard />
          <DropshippingCard />
          <BusinessTodos />
        </div>

        {/* Row 5 — 7-day chart */}
        <BusinessChart />

        {/* Row 6 — Quote */}
        <FooterQuote />
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        shortcuts={shortcuts}
      />
      <MorningBriefing />
    </main>
  )
}

export default App
