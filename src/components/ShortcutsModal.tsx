import { Keyboard } from 'lucide-react'
import { Modal } from './Modal'
import type { Shortcut } from '../hooks/useKeyboardShortcuts'

type Props = { open: boolean; onClose: () => void; shortcuts: Shortcut[] }

const CATEGORY_ORDER: Shortcut['category'][] = ['navegación', 'tareas', 'export', 'general']
const CATEGORY_LABEL: Record<Shortcut['category'], string> = {
  navegación: 'Navegación',
  tareas: 'Tareas',
  export: 'Export',
  general: 'General',
}

export function ShortcutsModal({ open, onClose, shortcuts }: Props) {
  const grouped = groupBy(shortcuts, (s) => s.category)
  const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|od|ad)/.test(navigator.platform)

  return (
    <Modal open={open} onClose={onClose} kicker="Teclado" title="Atajos">
      <p className="text-cc-muted -mt-2 text-xs leading-relaxed">
        Usa estos atajos para moverte sin tocar el mouse. {isMac ? '⌘ en lugar de Ctrl.' : ''}
      </p>

      <div className="flex flex-col gap-5">
        {CATEGORY_ORDER.filter((c) => grouped.has(c)).map((cat) => (
          <section key={cat} className="flex flex-col gap-2">
            <h3 className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
              {CATEGORY_LABEL[cat]}
            </h3>
            <ul className="border-cc-border bg-cc-surface-2/60 flex flex-col divide-y divide-cc-border/60 rounded-xl border">
              {grouped.get(cat)!.map((sc) => (
                <li
                  key={sc.combo + sc.description}
                  className="flex items-center justify-between gap-4 px-4 py-2.5"
                >
                  <span className="text-cc-text-soft text-sm">{sc.description}</span>
                  <KbdCombo combo={sc.combo} isMac={isMac} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="text-cc-muted inline-flex items-center gap-2 text-xs">
        <Keyboard size={12} />
        Presiona <Kbd>Esc</Kbd> para cerrar este panel.
      </div>
    </Modal>
  )
}

function KbdCombo({ combo, isMac }: { combo: string; isMac: boolean }) {
  const keys = combo.split('+').map((p) => p.trim())
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((k, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <Kbd>{prettyKey(k, isMac)}</Kbd>
          {i < keys.length - 1 && (
            <span className="text-cc-muted-soft text-xs">+</span>
          )}
        </span>
      ))}
    </span>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="border-cc-border-strong bg-cc-bg text-cc-text-soft inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border px-1.5 font-mono text-[11px]">
      {children}
    </kbd>
  )
}

function prettyKey(key: string, isMac: boolean): string {
  const k = key.toLowerCase()
  if (k === 'control' || k === 'ctrl') return isMac ? '⌘' : 'Ctrl'
  if (k === 'shift') return '⇧'
  if (k === 'alt') return isMac ? '⌥' : 'Alt'
  if (k === 'escape' || k === 'esc') return 'Esc'
  if (k === ' ') return 'Space'
  if (k.length === 1) return key.toUpperCase()
  return key
}

function groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of arr) {
    const k = key(item)
    const list = map.get(k)
    if (list) list.push(item)
    else map.set(k, [item])
  }
  return map
}
