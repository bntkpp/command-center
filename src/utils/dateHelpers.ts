import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function dateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayKey(): string {
  return dateKey(new Date())
}

export function tomorrowKey(): string {
  return dateKey(addDays(new Date(), 1))
}

export function formatLongDate(date: Date): string {
  const raw = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function formatClock(date: Date): string {
  return format(date, 'HH:mm:ss')
}

export function greetingFor(date: Date): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Buenos días'
  if (h >= 12 && h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
