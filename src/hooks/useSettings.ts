import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS } from '../utils/constants'

export type Settings = {
  userName: string
  footerPhrase: string
  /** Hour (0-23) after which the night planning UI unlocks. */
  nightPlanningHour: number
  /** Browser notifications enabled by user (separate from permission state). */
  notificationsEnabled: boolean
  /** Morning briefing overlay shown on first visit of the day. */
  morningBriefingEnabled: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  userName: 'matikepp',
  footerPhrase:
    'Universidad es prioridad #1. El dropshipping es la escuela, la carrera es el camino.',
  nightPlanningHour: 21,
  notificationsEnabled: false,
  morningBriefingEnabled: true,
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS
  )

  // Backfill any missing keys for legacy stored settings.
  const merged: Settings = { ...DEFAULT_SETTINGS, ...settings }

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch }))
    },
    [setSettings]
  )

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [setSettings])

  return { settings: merged, update, reset }
}
