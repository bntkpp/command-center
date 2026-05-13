import { useEffect } from 'react'

export type Shortcut = {
  /** Keys to combine, e.g. ['Control', '/']. Use 'Control' for both Ctrl on Win/Linux and ⌘ on macOS. */
  combo: string
  description: string
  category: 'navegación' | 'tareas' | 'export' | 'general'
  handler: (e: KeyboardEvent) => void
}

function matches(combo: string, e: KeyboardEvent): boolean {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim())
  const needsCtrlOrMeta = parts.includes('control') || parts.includes('ctrl') || parts.includes('cmd')
  const needsShift = parts.includes('shift')
  const needsAlt = parts.includes('alt')

  if (needsCtrlOrMeta && !(e.ctrlKey || e.metaKey)) return false
  if (!needsCtrlOrMeta && (e.ctrlKey || e.metaKey)) return false
  if (needsShift !== e.shiftKey) return false
  if (needsAlt !== e.altKey) return false

  const lastKey = parts[parts.length - 1]
  return e.key.toLowerCase() === lastKey
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

/**
 * Register a list of keyboard shortcuts globally.
 * Shortcuts that combine with Ctrl/Cmd fire even inside inputs;
 * single-key shortcuts are ignored when typing in inputs.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      for (const sc of shortcuts) {
        if (!matches(sc.combo, e)) continue
        const hasModifier =
          sc.combo.toLowerCase().includes('control') ||
          sc.combo.toLowerCase().includes('ctrl') ||
          sc.combo.toLowerCase().includes('cmd')
        if (!hasModifier && isEditableTarget(e.target)) continue
        e.preventDefault()
        sc.handler(e)
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcuts])
}
