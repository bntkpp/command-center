import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import {
  STORAGE_KEYS,
  type Business,
  type BusinessTodo,
  type Priority,
} from '../utils/constants'

function makeId() {
  return `biz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, media: 1, baja: 2 }

export function useBusinessTodos() {
  const [todos, setTodos] = useLocalStorage<BusinessTodo[]>(
    STORAGE_KEYS.businessTodos,
    []
  )

  const sorted = [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.priority !== b.priority)
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    return a.createdAt < b.createdAt ? -1 : 1
  })

  const add = useCallback(
    (text: string, business: Business, priority: Priority) => {
      if (!text.trim()) return
      setTodos((prev) => [
        ...prev,
        {
          id: makeId(),
          text: text.trim(),
          business,
          priority,
          done: false,
          createdAt: new Date().toISOString(),
        },
      ])
    },
    [setTodos]
  )

  const toggle = useCallback(
    (id: string) => {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      )
    },
    [setTodos]
  )

  const remove = useCallback(
    (id: string) => {
      setTodos((prev) => prev.filter((t) => t.id !== id))
    },
    [setTodos]
  )

  const setPriority = useCallback(
    (id: string, priority: Priority) => {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, priority } : t))
      )
    },
    [setTodos]
  )

  const pendingCount = todos.filter((t) => !t.done).length
  const highPriorityCount = todos.filter(
    (t) => !t.done && t.priority === 'alta'
  ).length

  return {
    todos: sorted,
    pendingCount,
    highPriorityCount,
    add,
    toggle,
    remove,
    setPriority,
  }
}
