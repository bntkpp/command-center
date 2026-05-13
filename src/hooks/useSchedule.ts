import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useCurrentTime } from './useCurrentTime'
import {
  DEFAULT_SCHEDULE,
  STORAGE_KEYS,
  type ScheduleBlock,
} from '../utils/constants'
import { hhmmToMinutes, minutesOfDay } from '../utils/timeHelpers'

export function useSchedule() {
  const now = useCurrentTime(30_000)
  const [blocks, setBlocks] = useLocalStorage<ScheduleBlock[]>(
    STORAGE_KEYS.scheduleTemplate,
    DEFAULT_SCHEDULE
  )

  const sorted = useMemo(
    () =>
      blocks.slice().sort((a, b) => hhmmToMinutes(a.timeStart) - hhmmToMinutes(b.timeStart)),
    [blocks]
  )

  const nowMins = minutesOfDay(now)

  const { currentBlock, nextBlock, minutesToNext } = useMemo(() => {
    let current: ScheduleBlock | null = null
    let next: ScheduleBlock | null = null

    for (const b of sorted) {
      const s = hhmmToMinutes(b.timeStart)
      const e = hhmmToMinutes(b.timeEnd)
      if (nowMins >= s && nowMins < e) {
        current = b
      } else if (nowMins < s && next === null) {
        next = b
      }
    }

    const minsToNext = next ? hhmmToMinutes(next.timeStart) - nowMins : null

    return { currentBlock: current, nextBlock: next, minutesToNext: minsToNext }
  }, [sorted, nowMins])

  const updateBlock = useCallback(
    (id: string, patch: Partial<ScheduleBlock>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
      )
    },
    [setBlocks]
  )

  const addBlock = useCallback(() => {
    setBlocks((prev) => {
      const lastEnd = prev.length
        ? prev
            .slice()
            .sort((a, b) => hhmmToMinutes(b.timeEnd) - hhmmToMinutes(a.timeEnd))[0].timeEnd
        : '08:00'
      const start = lastEnd
      // bump end by 30 min
      const startMins = hhmmToMinutes(start)
      const endMins = Math.min(startMins + 30, 23 * 60 + 59)
      const h = Math.floor(endMins / 60).toString().padStart(2, '0')
      const m = (endMins % 60).toString().padStart(2, '0')
      return [
        ...prev,
        {
          id: `b-${Date.now()}`,
          timeStart: start,
          timeEnd: `${h}:${m}`,
          label: 'Nuevo bloque',
          area: 'Personal',
        },
      ]
    })
  }, [setBlocks])

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== id))
    },
    [setBlocks]
  )

  const resetTemplate = useCallback(() => {
    setBlocks(DEFAULT_SCHEDULE)
  }, [setBlocks])

  return {
    blocks: sorted,
    currentBlock,
    nextBlock,
    minutesToNext,
    nowMins,
    updateBlock,
    addBlock,
    removeBlock,
    resetTemplate,
  }
}
