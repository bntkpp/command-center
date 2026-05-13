import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type TooltipPayloadItem = {
  dataKey?: string | number
  value?: number | string
  name?: string
  color?: string
}

type ChartTooltipProps = {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}
import { LineChart as LineChartIcon } from 'lucide-react'
import { useDropshipping } from '../hooks/useDropshipping'
import { formatCLP } from '../utils/format'

export function BusinessChart() {
  const { last7Days, weekTotals } = useDropshipping()

  const data = useMemo(
    () =>
      last7Days.map((d) => ({
        date: d.date,
        label: format(parseISO(d.date), 'EEE dd').replace('.', ''),
        gasto: d.adSpend,
        ventas: d.revenue,
        utilidad: d.netProfit,
      })),
    [last7Days]
  )

  const hasData = last7Days.some(
    (d) => d.adSpend > 0 || d.revenue > 0
  )

  return (
    <section className="border-cc-border bg-cc-surface/80 flex flex-col gap-5 rounded-2xl border p-6 backdrop-blur md:p-7">
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <LineChartIcon size={12} className="text-cc-accent" />
            Tendencia · últimos 7 días
          </span>
          <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Gasto vs ventas (dropshipping)
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 text-right">
          <Stat label="Gasto" value={formatCLP(weekTotals.adSpend)} />
          <Stat label="Ventas" value={formatCLP(weekTotals.revenue)} />
          <Stat
            label="Utilidad"
            value={formatCLP(weekTotals.netProfit)}
            positive={weekTotals.netProfit >= 0}
          />
        </div>
      </header>

      <div className="h-64 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--color-cc-border)"
                strokeDasharray="2 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="var(--color-cc-muted)"
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-cc-border)' }}
              />
              <YAxis
                stroke="var(--color-cc-muted)"
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                width={48}
              />
              <Tooltip content={<TooltipPanel />} />
              <Line
                type="monotone"
                dataKey="gasto"
                stroke="var(--color-cc-warning)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-cc-warning)' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name="Gasto"
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="var(--color-cc-accent)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-cc-accent)' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name="Ventas"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-cc-muted border-cc-border bg-cc-surface-2/40 flex h-full items-center justify-center rounded-xl border border-dashed text-sm">
            Sin datos aún. Llena las métricas del día para ver la tendencia.
          </div>
        )}
      </div>

      <Legend />
    </section>
  )
}

function Stat({
  label,
  value,
  positive,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span className="text-cc-muted text-[10px] tracking-widest uppercase">
        {label}
      </span>
      <span
        className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${
          positive === undefined
            ? 'text-cc-text-soft'
            : positive
              ? 'text-cc-success'
              : 'text-cc-danger'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-5 text-xs">
      <span className="text-cc-muted inline-flex items-center gap-2">
        <span className="bg-cc-warning h-2 w-2 rounded-full" /> Gasto en ads
      </span>
      <span className="text-cc-muted inline-flex items-center gap-2">
        <span className="bg-cc-accent h-2 w-2 rounded-full" /> Ventas
      </span>
    </div>
  )
}

function TooltipPanel({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null
  const gasto = payload.find((p) => p.dataKey === 'gasto')?.value ?? 0
  const ventas = payload.find((p) => p.dataKey === 'ventas')?.value ?? 0
  return (
    <div className="border-cc-border bg-cc-bg/95 rounded-lg border p-3 shadow-lg backdrop-blur">
      <div className="text-cc-text-soft font-mono text-[10px] tracking-widest uppercase">
        {label}
      </div>
      <div className="mt-1.5 flex flex-col gap-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-cc-warning inline-flex items-center gap-1.5">
            <span className="bg-cc-warning h-1.5 w-1.5 rounded-full" />
            Gasto
          </span>
          <span className="text-cc-text font-mono tabular-nums">
            {formatCLP(Number(gasto))}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-cc-accent inline-flex items-center gap-1.5">
            <span className="bg-cc-accent h-1.5 w-1.5 rounded-full" />
            Ventas
          </span>
          <span className="text-cc-text font-mono tabular-nums">
            {formatCLP(Number(ventas))}
          </span>
        </div>
      </div>
    </div>
  )
}
