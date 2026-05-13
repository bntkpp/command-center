import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS } from '../utils/constants'

export type InboxItem = {
  id: string
  text: string
  createdAt: string
}

function makeId() {
  return `inbox-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useInbox() {
  const [items, setItems] = useLocalStorage<InboxItem[]>(
    STORAGE_KEYS.inbox,
    []
  )

  // Newest first.
  const sorted = [...items].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  )

  const add = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return null
      const item: InboxItem = {
        id: makeId(),
        text: trimmed,
        createdAt: new Date().toISOString(),
      }
      setItems((prev) => [...prev, item])
      return item.id
    },
    [setItems]
  )

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [setItems]
  )

  const clear = useCallback(() => {
    setItems([])
  }, [setItems])

  const updateText = useCallback(
    (id: string, text: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, text } : i))
      )
    },
    [setItems]
  )

  return { items: sorted, count: items.length, add, remove, clear, updateText }
}
