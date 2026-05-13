import { useEffect, useRef } from 'react'
import { useSettings } from './useSettings'
import { useSchedule } from './useSchedule'
import { useDailyTasks } from './useDailyTasks'

const PULSE_INTERVAL_MS = 60 * 60 * 1000 // every hour
const PERSIST_BLOCK_KEY = 'cc_notif_last_block_id'
const PERSIST_PULSE_KEY = 'cc_notif_last_pulse_at'

function canNotify(): boolean {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted'
}

function notify(title: string, body: string, tag: string) {
  if (!canNotify()) return
  try {
    new Notification(title, { body, tag, silent: false })
  } catch {
    // ignore — some browsers throttle or block silently
  }
}

/**
 * Side-effecting hook: fires browser notifications when the active schedule
 * block changes (so you know "Negocio empezó") and pulses hourly if you have
 * pending tasks. Disabled unless settings.notificationsEnabled and permission
 * is granted.
 */
export function useNotifications() {
  const { settings } = useSettings()
  const { currentBlock } = useSchedule()
  const { todaySlots, todayExtras, completed } = useDailyTasks()
  const lastSeenBlock = useRef<string | null>(null)

  // 1. Notify on block transition
  useEffect(() => {
    if (!settings.notificationsEnabled || !canNotify()) return
    const blockId = currentBlock?.id ?? null
    if (blockId === lastSeenBlock.current) return

    // Skip the first run after mount unless we have persisted "last block" and it differs.
    const persisted = window.localStorage.getItem(PERSIST_BLOCK_KEY)
    if (lastSeenBlock.current === null && persisted === blockId) {
      lastSeenBlock.current = blockId
      return
    }

    if (currentBlock) {
      notify(
        `Empezó · ${currentBlock.label}`,
        `${currentBlock.timeStart}–${currentBlock.timeEnd}`,
        `cc-block-${blockId}`
      )
    }

    lastSeenBlock.current = blockId
    if (blockId) window.localStorage.setItem(PERSIST_BLOCK_KEY, blockId)
    else window.localStorage.removeItem(PERSIST_BLOCK_KEY)
  }, [currentBlock, settings.notificationsEnabled])

  // 2. Hourly pulse for unmarked tasks
  useEffect(() => {
    if (!settings.notificationsEnabled || !canNotify()) return
    const id = window.setInterval(() => {
      const pending = [...todaySlots, ...todayExtras].filter(
        (t) => !t.completed && t.text.trim()
      )
      if (pending.length === 0) return

      const last = window.localStorage.getItem(PERSIST_PULSE_KEY)
      const now = Date.now()
      if (last && now - Number(last) < PULSE_INTERVAL_MS - 5000) return

      notify(
        `${pending.length} tarea${pending.length === 1 ? '' : 's'} sin marcar`,
        `Llevas ${completed}/3 completadas. ¿Avanzamos algo?`,
        'cc-pulse'
      )
      window.localStorage.setItem(PERSIST_PULSE_KEY, String(now))
    }, 60_000)
    return () => window.clearInterval(id)
  }, [settings.notificationsEnabled, todaySlots, todayExtras, completed])
}
