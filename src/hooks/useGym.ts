import { useCallback, useMemo } from 'react'
import { addDays, startOfWeek, format } from 'date-fns'
import { useLocalStorage } from './useLocalStorage'
import {
  DEFAULT_GYM_ROUTINE,
  STORAGE_KEYS,
  WEEKDAYS,
  type GymRoutine,
  type Weekday,
} from '../utils/constants'
import { todayKey } from '../utils/dateHelpers'

export type GymLogEntry = {
  date: string // yyyy-MM-dd
  status: 'completed' | 'skipped'
  notes?: string
}

export type GymDayStatus =
  | 'rest' // not a gym day per routine
  | 'completed'
  | 'skipped'
  | 'pending' // gym day, not yet marked, today or future
  | 'missed' // past gym day with no log → broke the streak

export type GymDayCell = {
  date: string // yyyy-MM-dd
  weekday: Weekday
  isToday: boolean
  isPast: boolean
  workout: string | null
  status: GymDayStatus
}

export function useGym() {
  const [routine, setRoutine] = useLocalStorage<GymRoutine>(
    STORAGE_KEYS.gymRoutine,
    DEFAULT_GYM_ROUTINE
  )
  const [log, setLog] = useLocalStorage<GymLogEntry[]>(STORAGE_KEYS.gymLog, [])

  const today = new Date()
  const todayK = todayKey()
  // weekStartsOn: 1 = Monday
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })

  /** This week, Lun → Dom (idx 1,2,3,4,5,6,0) */
  const week: GymDayCell[] = useMemo(() => {
    return WEEKDAYS.map((wd, i) => {
      const date = addDays(weekStart, i)
      const dateK = format(date, 'yyyy-MM-dd')
      const workout = routine[wd.idx] ?? null
      const entry = log.find((l) => l.date === dateK)
      const isToday = dateK === todayK
      const isPast = date.getTime() < new Date(todayK).getTime()

      let status: GymDayStatus
      if (!workout) status = 'rest'
      else if (entry?.status === 'completed') status = 'completed'
      else if (entry?.status === 'skipped') status = 'skipped'
      else if (isPast) status = 'missed'
      else status = 'pending'

      return {
        date: dateK,
        weekday: wd.idx,
        isToday,
        isPast,
        workout,
        status,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine, log, todayK])

  const todayWorkout = useMemo<GymDayCell | null>(
    () => week.find((d) => d.isToday) ?? null,
    [week]
  )

  /** Streak: consecutive scheduled gym days in the past with status=completed.
   * Today counts only if completed. Rest days are skipped (don't break streak).
   * Missed/skipped break the streak. */
  const streak = useMemo(() => {
    let count = 0
    for (let i = 0; i < 365; i++) {
      const d = addDays(today, -i)
      const wd = d.getDay() as Weekday
      const workout = routine[wd] ?? null
      if (!workout) continue // rest day — skip
      const dateK = format(d, 'yyyy-MM-dd')
      const entry = log.find((l) => l.date === dateK)
      const isToday = dateK === todayK

      if (entry?.status === 'completed') {
        count++
        continue
      }
      // If today is a gym day and not yet completed, don't break — just skip.
      if (isToday) continue
      // Past gym day not completed → break.
      break
    }
    return count
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine, log, todayK])

  /** Mark a date with a status; passing null clears it. */
  const markDate = useCallback(
    (date: string, status: 'completed' | 'skipped' | null) => {
      setLog((prev) => {
        const filtered = prev.filter((l) => l.date !== date)
        if (status === null) return filtered
        return [...filtered, { date, status }]
      })
    },
    [setLog]
  )

  const cycleToday = useCallback(() => {
    if (!todayWorkout || todayWorkout.status === 'rest') return
    const current = todayWorkout.status
    if (current === 'completed') markDate(todayWorkout.date, 'skipped')
    else if (current === 'skipped') markDate(todayWorkout.date, null)
    else markDate(todayWorkout.date, 'completed')
  }, [todayWorkout, markDate])

  const setWorkoutForDay = useCallback(
    (wd: Weekday, workout: string | null) => {
      setRoutine((prev) => ({ ...prev, [wd]: workout && workout.trim() ? workout : null }))
    },
    [setRoutine]
  )

  return {
    routine,
    week,
    todayWorkout,
    streak,
    markDate,
    cycleToday,
    setWorkoutForDay,
  }
}
