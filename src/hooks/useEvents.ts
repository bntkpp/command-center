import { useCallback, useMemo } from 'react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useLocalStorage } from './useLocalStorage'
import {
  STORAGE_KEYS,
  type ChecklistItem,
  type EventType,
  type FutureEvent,
} from '../utils/constants'
import { todayKey } from '../utils/dateHelpers'

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export type EventWithMeta = FutureEvent & {
  daysUntil: number
  isPast: boolean
  isToday: boolean
  checklistDone: number
  checklistTotal: number
}

function withMeta(ev: FutureEvent, today: string): EventWithMeta {
  const diff = differenceInCalendarDays(parseISO(ev.date), parseISO(today))
  return {
    ...ev,
    daysUntil: diff,
    isPast: diff < 0,
    isToday: diff === 0,
    checklistDone: ev.checklist.filter((c) => c.done).length,
    checklistTotal: ev.checklist.length,
  }
}

export function useEvents() {
  const [events, setEvents] = useLocalStorage<FutureEvent[]>(
    STORAGE_KEYS.events,
    []
  )
  const today = todayKey()

  /** All events with derived metadata, sorted by date asc. Excludes nothing. */
  const all = useMemo(
    () =>
      events
        .map((e) => withMeta(e, today))
        .sort((a, b) => {
          // Done items always at the bottom.
          if (a.done !== b.done) return a.done ? 1 : -1
          return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
        }),
    [events, today]
  )

  /** Upcoming = not done, today or future. */
  const upcoming = useMemo(
    () => all.filter((e) => !e.done && !e.isPast),
    [all]
  )

  /** Within the next 7 days, including today. */
  const thisWeek = useMemo(
    () => upcoming.filter((e) => e.daysUntil <= 7),
    [upcoming]
  )

  /** Map yyyy-MM-dd → events on that day. */
  const byDate = useMemo(() => {
    const map = new Map<string, EventWithMeta[]>()
    for (const e of all) {
      if (e.done) continue
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return map
  }, [all])

  const create = useCallback(
    (partial: Omit<FutureEvent, 'id' | 'done' | 'createdAt' | 'checklist'> & {
      checklist?: ChecklistItem[]
    }) => {
      const newEvent: FutureEvent = {
        id: makeId('evt'),
        done: false,
        createdAt: new Date().toISOString(),
        checklist: partial.checklist ?? [],
        ...partial,
      }
      setEvents((prev) => [...prev, newEvent])
      return newEvent.id
    },
    [setEvents]
  )

  const update = useCallback(
    (id: string, patch: Partial<FutureEvent>) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
      )
    },
    [setEvents]
  )

  const remove = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    },
    [setEvents]
  )

  const toggleDone = useCallback(
    (id: string) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, done: !e.done } : e))
      )
    },
    [setEvents]
  )

  /* ── Checklist operations ─────────────────────────────────────────────── */

  const addChecklistItem = useCallback(
    (eventId: string, text: string) => {
      if (!text.trim()) return
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                checklist: [
                  ...e.checklist,
                  { id: makeId('chk'), text: text.trim(), done: false },
                ],
              }
            : e
        )
      )
    },
    [setEvents]
  )

  const toggleChecklistItem = useCallback(
    (eventId: string, itemId: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                checklist: e.checklist.map((c) =>
                  c.id === itemId ? { ...c, done: !c.done } : c
                ),
              }
            : e
        )
      )
    },
    [setEvents]
  )

  const removeChecklistItem = useCallback(
    (eventId: string, itemId: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, checklist: e.checklist.filter((c) => c.id !== itemId) }
            : e
        )
      )
    },
    [setEvents]
  )

  const updateChecklistItemText = useCallback(
    (eventId: string, itemId: string, text: string) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                checklist: e.checklist.map((c) =>
                  c.id === itemId ? { ...c, text } : c
                ),
              }
            : e
        )
      )
    },
    [setEvents]
  )

  return {
    all,
    upcoming,
    thisWeek,
    byDate,
    create,
    update,
    remove,
    toggleDone,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    updateChecklistItemText,
  }
}

export const EVENT_TYPE_LIST: EventType[] = [
  'Entrega',
  'Presentación',
  'Examen',
  'Reunión',
  'Otro',
]
