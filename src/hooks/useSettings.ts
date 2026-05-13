import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS, type TaskArea } from '../utils/constants'

export type ModuleKey =
  | 'todayStats'
  | 'gymTracker'
  | 'schedule'
  | 'exportCalendar'
  | 'events'
  | 'business' // zapatillas + dropshipping + businessTodos + chart bundle
  | 'inbox'
  | 'footerQuote'

export type ModulesVisibility = Record<ModuleKey, boolean>

export type AreaLabels = Record<TaskArea, string>

export type Settings = {
  userName: string
  footerPhrase: string
  /** Hour (0-23) after which the night planning UI unlocks. */
  nightPlanningHour: number
  notificationsEnabled: boolean
  morningBriefingEnabled: boolean
  /** Toggle individual modules on/off from Settings. */
  modules: ModulesVisibility
  /** Override displayed name of each task area; keys remain stable internally. */
  areaLabels: AreaLabels
  /** Show micro-celebration when reaching 3/3 daily tasks. */
  confettiEnabled: boolean
}

export const DEFAULT_MODULES: ModulesVisibility = {
  todayStats: true,
  gymTracker: true,
  schedule: true,
  exportCalendar: true,
  events: true,
  business: true,
  inbox: true,
  footerQuote: true,
}

export const DEFAULT_AREA_LABELS: AreaLabels = {
  Universidad: 'Universidad',
  Negocio: 'Negocio',
  Salud: 'Salud',
}

export const DEFAULT_SETTINGS: Settings = {
  userName: 'matikepp',
  footerPhrase:
    'Universidad es prioridad #1. El dropshipping es la escuela, la carrera es el camino.',
  nightPlanningHour: 21,
  notificationsEnabled: false,
  morningBriefingEnabled: true,
  modules: DEFAULT_MODULES,
  areaLabels: DEFAULT_AREA_LABELS,
  confettiEnabled: true,
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS
  )

  // Backfill any missing keys for legacy stored settings.
  const merged: Settings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    modules: { ...DEFAULT_MODULES, ...(settings.modules ?? {}) },
    areaLabels: { ...DEFAULT_AREA_LABELS, ...(settings.areaLabels ?? {}) },
  }

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => ({
        ...DEFAULT_SETTINGS,
        ...prev,
        ...patch,
        modules: { ...DEFAULT_MODULES, ...prev.modules, ...patch.modules },
        areaLabels: { ...DEFAULT_AREA_LABELS, ...prev.areaLabels, ...patch.areaLabels },
      }))
    },
    [setSettings]
  )

  const setModule = useCallback(
    (key: ModuleKey, visible: boolean) => {
      setSettings((prev) => ({
        ...DEFAULT_SETTINGS,
        ...prev,
        modules: { ...DEFAULT_MODULES, ...prev.modules, [key]: visible },
      }))
    },
    [setSettings]
  )

  const setAreaLabel = useCallback(
    (area: TaskArea, label: string) => {
      setSettings((prev) => ({
        ...DEFAULT_SETTINGS,
        ...prev,
        areaLabels: {
          ...DEFAULT_AREA_LABELS,
          ...prev.areaLabels,
          [area]: label || DEFAULT_AREA_LABELS[area],
        },
      }))
    },
    [setSettings]
  )

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [setSettings])

  return { settings: merged, update, setModule, setAreaLabel, reset }
}
