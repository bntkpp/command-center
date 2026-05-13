import type { Task } from '../hooks/useDailyTasks'
import type { FutureEvent, ScheduleBlock, TaskArea } from './constants'
import { hhmmToMinutes } from './timeHelpers'

/* ─── Types ────────────────────────────────────────────────────────────── */

export type IcsEvent = {
  uid: string
  startDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string   // HH:mm
  summary: string
  description?: string
  category?: string
  /** Minutes relative to event start. 0 = at start, -15 = 15 min before,
   *  30 = 30 min after start. Each entry becomes one VALARM. */
  alarmsMinutes: number[]
}

export type DayBundle = {
  date: string
  tasks: Task[]
  schedule: ScheduleBlock[]
  gymWorkout: { workout: string; timeStart: string; timeEnd: string } | null
  /** Future agenda events (entregas, presentaciones, exámenes…). All non-done events. */
  events?: FutureEvent[]
}

/* ─── Low-level ICS helpers ────────────────────────────────────────────── */

/** Escape per RFC 5545 §3.3.11 TEXT type. */
function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Fold lines longer than 75 octets per RFC 5545 §3.1.
 *  Treats each char as 1 octet (no multi-byte UTF-8 handling). */
function foldLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let i = 0
  while (i < line.length) {
    const size = i === 0 ? 75 : 74 // continuation lines start with a leading space
    parts.push((i === 0 ? '' : ' ') + line.slice(i, i + size))
    i += size
  }
  return parts.join('\r\n')
}

function dtFloating(date: string, time: string): string {
  // "YYYY-MM-DD" + "HH:mm" -> "YYYYMMDDTHHmm00" (floating local time)
  return date.replace(/-/g, '') + 'T' + time.replace(/:/g, '') + '00'
}

function dtUTC(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}

function triggerLine(min: number): string {
  if (min === 0) return 'TRIGGER:PT0M'
  if (min > 0) return `TRIGGER:PT${min}M`
  return `TRIGGER:-PT${-min}M`
}

function buildEvent(ev: IcsEvent, dtstamp: string): string[] {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${ev.uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtFloating(ev.startDate, ev.startTime)}`,
    `DTEND:${dtFloating(ev.startDate, ev.endTime)}`,
    foldLine(`SUMMARY:${escapeIcsText(ev.summary)}`),
  ]
  if (ev.description) {
    lines.push(foldLine(`DESCRIPTION:${escapeIcsText(ev.description)}`))
  }
  if (ev.category) {
    lines.push(foldLine(`CATEGORIES:${escapeIcsText(ev.category)}`))
  }
  lines.push('STATUS:CONFIRMED', 'TRANSP:OPAQUE')

  for (const alarmMin of ev.alarmsMinutes) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      foldLine(`DESCRIPTION:${escapeIcsText(ev.summary)}`),
      triggerLine(alarmMin),
      'END:VALARM'
    )
  }
  lines.push('END:VEVENT')
  return lines
}

export function buildIcsCalendar(events: IcsEvent[]): string {
  const stamp = dtUTC(new Date())
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Command Center//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Command Center',
  ]
  for (const ev of events) lines.push(...buildEvent(ev, stamp))
  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}

/* ─── Domain mapping (Task + Schedule + Gym → IcsEvent[]) ──────────────── */

function findBlockForArea(
  schedule: ScheduleBlock[],
  area: TaskArea
): ScheduleBlock | null {
  // Use the first block of the day matching the area (sorted by start time).
  const sorted = schedule
    .slice()
    .sort((a, b) => hhmmToMinutes(a.timeStart) - hhmmToMinutes(b.timeStart))
  return sorted.find((b) => b.area === area) ?? null
}

/** Decide how many in-block alarms to place based on block length. */
function alarmsForBlock(timeStart: string, timeEnd: string): number[] {
  const len = hhmmToMinutes(timeEnd) - hhmmToMinutes(timeStart)
  // Always alarm at start.
  const alarms = [0]
  // For blocks ≥ 1h: alarm at midpoint.
  if (len >= 60) alarms.push(Math.floor(len / 2))
  // For blocks ≥ 2h: alarm 30 min before end.
  if (len >= 120) alarms.push(len - 30)
  return alarms
}

export function buildDayEvents(bundle: DayBundle): IcsEvent[] {
  const events: IcsEvent[] = []

  // 1. Pending tasks anchored to their area's block.
  const pendingTasks = bundle.tasks.filter(
    (t) => !t.completed && t.text.trim()
  )
  for (const task of pendingTasks) {
    const block = findBlockForArea(bundle.schedule, task.area)
    if (!block) continue
    events.push({
      uid: `task-${task.id}-${bundle.date}@command-center`,
      startDate: bundle.date,
      startTime: block.timeStart,
      endTime: block.timeEnd,
      summary: `${task.area}: ${task.text}`,
      description: `Tarea del Command Center.\nÁrea: ${task.area}\nBloque: ${block.label} (${block.timeStart}–${block.timeEnd})`,
      category: 'Command Center',
      alarmsMinutes: alarmsForBlock(block.timeStart, block.timeEnd),
    })
  }

  // 2. Today's gym workout (if it's a gym day).
  if (bundle.gymWorkout) {
    events.push({
      uid: `gym-${bundle.date}@command-center`,
      startDate: bundle.date,
      startTime: bundle.gymWorkout.timeStart,
      endTime: bundle.gymWorkout.timeEnd,
      summary: `Gym: ${bundle.gymWorkout.workout}`,
      description: 'Rutina del día del Command Center.',
      category: 'Command Center · Gym',
      alarmsMinutes: [-15, 0],
    })
  }

  // 3. Future agenda events (entregas, presentaciones, exámenes, reuniones).
  if (bundle.events) {
    for (const ev of bundle.events) {
      if (ev.done) continue
      // Skip events that already passed.
      if (ev.date < bundle.date) continue

      const startTime = ev.time ?? '09:00'
      const endTime = ev.time ? bumpTime(ev.time, 60) : '10:00'

      const checklistText = ev.checklist.length
        ? '\nLo que tiene que tener:\n' +
          ev.checklist
            .map((c) => `${c.done ? '[x]' : '[ ]'} ${c.text}`)
            .join('\n')
        : ''
      const notesText = ev.notes ? `\n\n${ev.notes}` : ''

      events.push({
        uid: `event-${ev.id}@command-center`,
        startDate: ev.date,
        startTime,
        endTime,
        summary: `${ev.type}: ${ev.title}`,
        description: `Agenda del Command Center · ${ev.type}.${checklistText}${notesText}`,
        category: `Command Center · ${ev.type}`,
        // Three alarms: 1 day before, 1 hour before, at start.
        alarmsMinutes: [-24 * 60, -60, 0],
      })
    }
  }

  return events
}

function bumpTime(hhmm: string, minutes: number): string {
  const total = hhmmToMinutes(hhmm) + minutes
  const capped = Math.min(total, 23 * 60 + 59)
  const h = Math.floor(capped / 60).toString().padStart(2, '0')
  const m = (capped % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

/* ─── Download helper ──────────────────────────────────────────────────── */

export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Allow Safari/iOS some time before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
