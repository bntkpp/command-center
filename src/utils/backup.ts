import { STORAGE_KEYS } from './constants'

const BACKUP_VERSION = 1
const APP_NAME = 'command-center'

export type BackupPayload = {
  app: typeof APP_NAME
  version: number
  exportedAt: string
  data: Record<string, unknown>
}

/**
 * Collect all known cc_* storage keys into a single JSON payload.
 * Unknown keys are ignored on purpose (safer for forward-compat).
 */
export function buildBackup(): BackupPayload {
  const data: Record<string, unknown> = {}
  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = window.localStorage.getItem(key)
    if (raw === null) continue
    try {
      data[key] = JSON.parse(raw)
    } catch {
      // store as-is if it isn't JSON (unlikely for our keys)
      data[key] = raw
    }
  }
  return {
    app: APP_NAME,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export function downloadBackup() {
  const payload = buildBackup()
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `command-center-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export type RestoreResult =
  | { ok: true; restoredKeys: string[] }
  | { ok: false; error: string }

/**
 * Validate a backup payload (loose) and replace localStorage entries for known keys.
 * Returns details so the UI can confirm to the user what changed.
 */
export function applyBackup(payload: unknown): RestoreResult {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'El archivo no tiene formato JSON válido.' }
  }
  const p = payload as Partial<BackupPayload>
  if (p.app !== APP_NAME) {
    return {
      ok: false,
      error: 'Este archivo no es un backup de Command Center.',
    }
  }
  if (typeof p.version !== 'number') {
    return { ok: false, error: 'Versión del backup no reconocida.' }
  }
  if (!p.data || typeof p.data !== 'object') {
    return { ok: false, error: 'El backup no contiene datos.' }
  }

  const knownKeys = new Set<string>(Object.values(STORAGE_KEYS))
  const restored: string[] = []

  // Note: we write the new state THEN clear keys not present so the user can also
  // use this as a way to wipe legacy/orphan keys.
  for (const key of knownKeys) {
    const value = (p.data as Record<string, unknown>)[key]
    if (value === undefined) {
      window.localStorage.removeItem(key)
      continue
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      restored.push(key)
    } catch {
      // localStorage quota exceeded — try best effort, keep going
    }
  }

  return { ok: true, restoredKeys: restored }
}

/**
 * Read a File (from <input type="file">) as JSON and call applyBackup.
 */
export function restoreFromFile(file: File): Promise<RestoreResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onerror = () =>
      resolve({ ok: false, error: 'No se pudo leer el archivo.' })
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? ''))
        resolve(applyBackup(parsed))
      } catch {
        resolve({
          ok: false,
          error: 'El archivo no es un JSON válido.',
        })
      }
    }
    reader.readAsText(file)
  })
}

/**
 * Wipe ALL command-center storage. Asks for confirmation in the calling component;
 * this function just executes.
 */
export function wipeAllData() {
  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key)
  }
}
