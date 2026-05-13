import { useCallback, useSyncExternalStore } from 'react'

/**
 * Cross-component reactive localStorage.
 *
 * Multiple components reading the same key share state — when any consumer
 * updates the value, all others re-render with the new value. Persistence is
 * synchronous on every update.
 */

const cache = new Map<string, unknown>()
const subscribers = new Map<string, Set<() => void>>()

function subscribe(key: string, listener: () => void): () => void {
  let set = subscribers.get(key)
  if (!set) {
    set = new Set()
    subscribers.set(key, set)
  }
  set.add(listener)
  return () => {
    set!.delete(listener)
  }
}

function notify(key: string) {
  subscribers.get(key)?.forEach((fn) => fn())
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T
  try {
    const raw = window.localStorage.getItem(key)
    const value = raw !== null ? (JSON.parse(raw) as T) : fallback
    cache.set(key, value)
    return value
  } catch {
    cache.set(key, fallback)
    return fallback
  }
}

// Pick up edits made in other tabs / windows.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key) return
    if (!subscribers.has(e.key)) return
    try {
      cache.set(e.key, e.newValue !== null ? JSON.parse(e.newValue) : undefined)
    } catch {
      // ignore parse error
    }
    notify(e.key)
  })
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const getSnapshot = useCallback(
    () => readFromStorage(key, initialValue),
    [key, initialValue]
  )

  const sub = useCallback((listener: () => void) => subscribe(key, listener), [key])

  const value = useSyncExternalStore(sub, getSnapshot, getSnapshot)

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readFromStorage(key, initialValue)
      const computed =
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      cache.set(key, computed)
      try {
        window.localStorage.setItem(key, JSON.stringify(computed))
      } catch {
        // storage full / disabled — keep in-memory value
      }
      notify(key)
    },
    [key, initialValue]
  )

  return [value, update] as const
}
