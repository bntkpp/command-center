import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { TASK_AREAS, STORAGE_KEYS, type TaskArea } from '../utils/constants'
import { todayKey, tomorrowKey } from '../utils/dateHelpers'

export type TaskKind = 'fixed' | 'extra'

export type Task = {
  id: string
  date: string
  area: TaskArea
  text: string
  completed: boolean
  /** Defaults to 'fixed' for legacy entries written before this field existed. */
  kind?: TaskKind
}

function getKind(t: Task): TaskKind {
  return t.kind ?? 'fixed'
}

function ensureFixedSlots(tasks: Task[], date: string): Task[] {
  const byArea = new Map(
    tasks
      .filter((t) => t.date === date && getKind(t) === 'fixed')
      .map((t) => [t.area, t])
  )
  return TASK_AREAS.map(
    (area) =>
      byArea.get(area) ?? {
        id: `${date}::${area}`,
        date,
        area,
        text: '',
        completed: false,
        kind: 'fixed' as const,
      }
  )
}

function getExtras(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => t.date === date && getKind(t) === 'extra')
}

function makeExtraId() {
  return `extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useDailyTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.dailyTasks, [])
  const today = todayKey()
  const tomorrow = tomorrowKey()

  const todaySlots = useMemo(() => ensureFixedSlots(tasks, today), [tasks, today])
  const tomorrowSlots = useMemo(
    () => ensureFixedSlots(tasks, tomorrow),
    [tasks, tomorrow]
  )
  const todayExtras = useMemo(() => getExtras(tasks, today), [tasks, today])
  const tomorrowExtras = useMemo(
    () => getExtras(tasks, tomorrow),
    [tasks, tomorrow]
  )

  const completed = todaySlots.filter((t) => t.completed && t.text.trim()).length
  const filled = todaySlots.filter((t) => t.text.trim()).length

  const upsert = useCallback(
    (task: Task) => {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === task.id)
        if (idx === -1) return [...prev, task]
        const next = prev.slice()
        next[idx] = task
        return next
      })
    },
    [setTasks]
  )

  const setText = useCallback(
    (task: Task, text: string) => upsert({ ...task, text }),
    [upsert]
  )

  const toggle = useCallback(
    (task: Task) => {
      if (!task.text.trim()) return
      upsert({ ...task, completed: !task.completed })
    },
    [upsert]
  )

  const addExtra = useCallback(
    (date: string, area: TaskArea) => {
      setTasks((prev) => [
        ...prev,
        {
          id: makeExtraId(),
          date,
          area,
          text: '',
          completed: false,
          kind: 'extra',
        },
      ])
    },
    [setTasks]
  )

  const removeTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    },
    [setTasks]
  )

  return {
    todaySlots,
    tomorrowSlots,
    todayExtras,
    tomorrowExtras,
    completed,
    filled,
    todayDate: today,
    tomorrowDate: tomorrow,
    setText,
    toggle,
    addExtra,
    removeTask,
  }
}
