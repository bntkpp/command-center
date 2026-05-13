/**
 * Convert "HH:mm" → minutes since 00:00.
 */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Minutes since 00:00 for a given Date.
 */
export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
}

/**
 * Format a duration in minutes into a compact "Xh Ym" / "Ym" / "Xh" string.
 */
export function formatDuration(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? '-' : ''
  const abs = Math.max(0, Math.floor(Math.abs(totalMinutes)))
  const h = Math.floor(abs / 60)
  const m = abs % 60
  if (h === 0) return `${sign}${m}m`
  if (m === 0) return `${sign}${h}h`
  return `${sign}${h}h ${m}m`
}
