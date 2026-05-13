import { useEffect } from 'react'

export type Shortcut = {
  /** Keys to combine, e.g. ['Control', '/']. Use 'Control' for both Ctrl on Win/Linux and ⌘ on macOS. */
  combo: string
  description: string
  category: 'navegación' | 'tareas' | 'export' | 'general'
  handler: (e: KeyboardEvent) => void
}

const MODIFIER_NAMES = new Set(['control', 'ctrl', 'cmd', 'shift', 'alt'])

const KEY_ALIASES: Record<string, string> = {
  space: ' ',
  enter: 'enter',
  esc: 'escape',
}

function matches(combo: string, e: KeyboardEvent): boolean {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim()).filter(Boolean)
  const needsCtrlOrMeta = parts.includes('control') || parts.includes('ctrl') || parts.includes('cmd')
  const needsShift = parts.includes('shift')
  const needsAlt = parts.includes('alt')

  if (needsCtrlOrMeta && !(e.ctrlKey || e.metaKey)) return false
  if (!needsCtrlOrMeta && (e.ctrlKey || e.metaKey)) return false
  if (needsShift !== e.shiftKey) return false
  if (needsAlt !== e.altKey) return false

  const keyPart = parts.filter((p) => !MODIFIER_NAMES.has(p)).pop()
  if (!keyPart) return false
  const expected = KEY_ALIASES[keyPart] ?? keyPart
  return e.key.toLowerCase() === expected
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
