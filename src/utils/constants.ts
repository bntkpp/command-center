import {
  GraduationCap,
  Briefcase,
  Dumbbell,
  Coffee,
  Presentation,
  FileText,
  ClipboardCheck,
  Users,
  Pin,
  type LucideIcon,
} from 'lucide-react'

export const USER_NAME = 'matikepp'

export const FOOTER_PHRASE =
  'Universidad es prioridad #1. El dropshipping es la escuela, la carrera es el camino.'

export const NIGHT_PLANNING_HOUR = 21

/* ─── Daily tasks areas ────────────────────────────────────────────────── */

export const TASK_AREAS = ['Universidad', 'Negocio', 'Salud'] as const
export type TaskArea = (typeof TASK_AREAS)[number]

/* ─── Schedule areas (superset incl. 'Personal') ───────────────────────── */

export const SCHEDULE_AREAS = [
  'Universidad',
  'Negocio',
  'Salud',
  'Personal',
] as const
export type ScheduleArea = (typeof SCHEDULE_AREAS)[number]

export type AreaStyle = {
  label: string
  Icon: LucideIcon
  hex: string
  chip: string
  ring: string
  stripe: string
  iconWrap: string
}

export const AREA_STYLES: Record<ScheduleArea, AreaStyle> = {
  Universidad: {
    label: 'Universidad',
    Icon: GraduationCap,
    hex: '#5B8DEF',
    chip: 'bg-cc-uni/10 text-cc-uni border-cc-uni/25',
    ring: 'focus-within:ring-cc-uni/30',
    stripe: 'bg-cc-uni',
    iconWrap: 'bg-cc-uni/10 text-cc-uni border-cc-uni/25',
  },
  Negocio: {
    label: 'Negocio',
    Icon: Briefcase,
    hex: '#F59E0B',
    chip: 'bg-cc-negocio/10 text-cc-negocio border-cc-negocio/25',
    ring: 'focus-within:ring-cc-negocio/30',
    stripe: 'bg-cc-negocio',
    iconWrap: 'bg-cc-negocio/10 text-cc-negocio border-cc-negocio/25',
  },
  Salud: {
    label: 'Salud',
    Icon: Dumbbell,
    hex: '#22C55E',
    chip: 'bg-cc-salud/10 text-cc-salud border-cc-salud/25',
    ring: 'focus-within:ring-cc-salud/30',
    stripe: 'bg-cc-salud',
    iconWrap: 'bg-cc-salud/10 text-cc-salud border-cc-salud/25',
  },
  Personal: {
    label: 'Personal',
    Icon: Coffee,
    hex: '#8B8FA3',
    chip: 'bg-cc-muted/10 text-cc-text-soft border-cc-border-strong',
    ring: 'focus-within:ring-cc-muted/30',
    stripe: 'bg-cc-muted-soft',
    iconWrap: 'bg-cc-muted/10 text-cc-text-soft border-cc-border-strong',
  },
}

/* ─── Storage keys ─────────────────────────────────────────────────────── */

export const STORAGE_KEYS = {
  dailyTasks: 'cc_daily_tasks',
  scheduleTemplate: 'cc_schedule_template',
  gymRoutine: 'cc_gym_routine',
  gymLog: 'cc_gym_log',
  zapatillasLog: 'cc_zapatillas_log',
  dropshippingLog: 'cc_dropshipping_log',
  dropshippingConfig: 'cc_dropshipping_config',
  businessTodos: 'cc_business_todos',
  settings: 'cc_settings',
  lastVisitDate: 'cc_last_visit_date',
  lastBriefingDate: 'cc_last_briefing_date',
  events: 'cc_events',
} as const

/* ─── Schedule defaults ────────────────────────────────────────────────── */

export type ScheduleBlock = {
  id: string
  timeStart: string // "HH:mm"
  timeEnd: string // "HH:mm"
  label: string
  area: ScheduleArea
  isFixed?: boolean
}

export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  {
    id: 'wake',
    timeStart: '08:00',
    timeEnd: '08:30',
    label: 'Despertar + desayuno',
    area: 'Personal',
  },
  {
    id: 'prep',
    timeStart: '08:30',
    timeEnd: '09:00',
    label: 'Preparación',
    area: 'Personal',
  },
  {
    id: 'uni',
    timeStart: '09:00',
    timeEnd: '17:00',
    label: 'Universidad',
    area: 'Universidad',
    isFixed: true,
  },
  {
    id: 'gym',
    timeStart: '17:00',
    timeEnd: '18:15',
    label: 'Gym',
    area: 'Salud',
    isFixed: true,
  },
  {
    id: 'dinner',
    timeStart: '18:15',
    timeEnd: '19:00',
    label: 'Cena',
    area: 'Personal',
  },
  {
    id: 'biz',
    timeStart: '19:00',
    timeEnd: '21:00',
    label: 'Negocio',
    area: 'Negocio',
  },
  {
    id: 'wind',
    timeStart: '21:00',
    timeEnd: '22:00',
    label: 'Planificación nocturna',
    area: 'Personal',
  },
  {
    id: 'rest',
    timeStart: '22:00',
    timeEnd: '23:30',
    label: 'Descanso',
    area: 'Personal',
  },
]

/* ─── Gym defaults ─────────────────────────────────────────────────────── */

/** Weekday index uses date-fns convention: 0=Sunday … 6=Saturday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const WEEKDAYS: { idx: Weekday; short: string; long: string }[] = [
  { idx: 1, short: 'L', long: 'Lunes' },
  { idx: 2, short: 'M', long: 'Martes' },
  { idx: 3, short: 'X', long: 'Miércoles' },
  { idx: 4, short: 'J', long: 'Jueves' },
  { idx: 5, short: 'V', long: 'Viernes' },
  { idx: 6, short: 'S', long: 'Sábado' },
  { idx: 0, short: 'D', long: 'Domingo' },
]

export type GymRoutine = Record<Weekday, string | null>

export const DEFAULT_GYM_ROUTINE: GymRoutine = {
  0: null, // Dom — descanso
  1: 'Tren superior A — pecho + espalda + bíceps',
  2: 'Tren inferior A — cuádriceps + glúteo + gemelos',
  3: null, // Mié — descanso
  4: 'Tren superior B — hombros + tríceps + trapecio',
  5: 'Tren inferior B — femoral + glúteo + abs',
  6: null, // Sáb — descanso
}

/* ─── Business: Zapatillas ─────────────────────────────────────────────── */

export const ZAPATILLAS_PRICE_PER_ORDER = 1000

export type ZapatillasEntry = {
  date: string // yyyy-MM-dd
  orders: number
}

/* ─── Business: Dropshipping ───────────────────────────────────────────── */

export type DropshippingEntry = {
  date: string // yyyy-MM-dd
  adSpend: number
  revenue: number
  unitsSold: number
}

export type DropshippingConfig = {
  productCostPerUnit: number
  shippingCost: number
  shopifyFeePct: number
  paymentFeePct: number
  targetRoas: number
  maxCpa: number
}

export const DEFAULT_DROPSHIPPING_CONFIG: DropshippingConfig = {
  productCostPerUnit: 5000,
  shippingCost: 3000,
  shopifyFeePct: 3.9,
  paymentFeePct: 2.5,
  targetRoas: 2.5,
  maxCpa: 10000,
}

/* ─── Business: Todos ──────────────────────────────────────────────────── */

export const BUSINESSES = ['Zapatillas', 'Dropshipping'] as const
export type Business = (typeof BUSINESSES)[number]

export const PRIORITIES = ['alta', 'media', 'baja'] as const
export type Priority = (typeof PRIORITIES)[number]

export type BusinessTodo = {
  id: string
  text: string
  business: Business
  priority: Priority
  done: boolean
  createdAt: string // ISO
}

export const PRIORITY_STYLES: Record<
  Priority,
  { label: string; chip: string; dot: string }
> = {
  alta: {
    label: 'Alta',
    chip: 'bg-cc-danger/15 text-cc-danger border-cc-danger/30',
    dot: 'bg-cc-danger',
  },
  media: {
    label: 'Media',
    chip: 'bg-cc-warning/15 text-cc-warning border-cc-warning/30',
    dot: 'bg-cc-warning',
  },
  baja: {
    label: 'Baja',
    chip: 'bg-cc-muted/15 text-cc-text-soft border-cc-border-strong',
    dot: 'bg-cc-muted',
  },
}

export const BUSINESS_STYLES: Record<
  Business,
  { label: string; chip: string; accent: string }
> = {
  Zapatillas: {
    label: 'Zapatillas',
    chip: 'bg-cc-accent/10 text-cc-accent border-cc-accent/25',
    accent: 'text-cc-accent',
  },
  Dropshipping: {
    label: 'Dropshipping',
    chip: 'bg-cc-warning/10 text-cc-warning border-cc-warning/25',
    accent: 'text-cc-warning',
  },
}

/* ─── Future events (agenda) ───────────────────────────────────────────── */

export const EVENT_TYPES = [
  'Entrega',
  'Presentación',
  'Examen',
  'Reunión',
  'Otro',
] as const
export type EventType = (typeof EVENT_TYPES)[number]

export type ChecklistItem = {
  id: string
  text: string
  done: boolean
}

export type FutureEvent = {
  id: string
  title: string
  /** yyyy-MM-dd */
  date: string
  /** HH:mm — optional. Used for ICS DTSTART and prominent display. */
  time?: string
  type: EventType
  checklist: ChecklistItem[]
  notes?: string
  done: boolean
  createdAt: string
}

export const EVENT_TYPE_STYLES: Record<
  EventType,
  {
    label: string
    Icon: LucideIcon
    /** Solid hex used for dot/stripe accents */
    hex: string
    chip: string
    stripe: string
    iconWrap: string
    dot: string
  }
> = {
  Entrega: {
    label: 'Entrega',
    Icon: FileText,
    hex: '#5B8DEF',
    chip: 'bg-cc-accent/10 text-cc-accent border-cc-accent/25',
    stripe: 'bg-cc-accent',
    iconWrap: 'bg-cc-accent/10 text-cc-accent border-cc-accent/25',
    dot: 'bg-cc-accent',
  },
  Presentación: {
    label: 'Presentación',
    Icon: Presentation,
    hex: '#A78BFA',
    chip: 'bg-violet-400/10 text-violet-300 border-violet-400/25',
    stripe: 'bg-violet-400',
    iconWrap: 'bg-violet-400/10 text-violet-300 border-violet-400/25',
    dot: 'bg-violet-400',
  },
  Examen: {
    label: 'Examen',
    Icon: ClipboardCheck,
    hex: '#F87171',
    chip: 'bg-cc-danger/10 text-cc-danger border-cc-danger/25',
    stripe: 'bg-cc-danger',
    iconWrap: 'bg-cc-danger/10 text-cc-danger border-cc-danger/25',
    dot: 'bg-cc-danger',
  },
  Reunión: {
    label: 'Reunión',
    Icon: Users,
    hex: '#F59E0B',
    chip: 'bg-cc-warning/10 text-cc-warning border-cc-warning/25',
    stripe: 'bg-cc-warning',
    iconWrap: 'bg-cc-warning/10 text-cc-warning border-cc-warning/25',
    dot: 'bg-cc-warning',
  },
  Otro: {
    label: 'Otro',
    Icon: Pin,
    hex: '#8B8FA3',
    chip: 'bg-cc-muted/10 text-cc-text-soft border-cc-border-strong',
    stripe: 'bg-cc-muted-soft',
    iconWrap: 'bg-cc-muted/10 text-cc-text-soft border-cc-border-strong',
    dot: 'bg-cc-muted-soft',
  },
}
