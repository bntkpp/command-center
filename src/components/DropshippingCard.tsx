import { useState } from 'react'
import { Zap, Settings as SettingsIcon, Check } from 'lucide-react'
import { useDropshipping, type RoasHealth } from '../hooks/useDropshipping'
import { formatCLP, formatRoas } from '../utils/format'

const HEALTH_STYLES: Record<
  RoasHealth,
  { label: string; chip: string; dot: string; ring: string }
> = {
  green: {
    label: 'ROAS saludable',
    chip: 'bg-cc-success/15 text-cc-success border-cc-success/30',
    dot: 'bg-cc-success',
    ring: 'shadow-[0_0_24px_-6px_rgba(34,197,94,0.6)]',
  },
  yellow: {
    label: 'Precaución',
    chip: 'bg-cc-warning/15 text-cc-warning border-cc-warning/30',
    dot: 'bg-cc-warning',
    ring: 'shadow-[0_0_24px_-6px_rgba(245,158,11,0.55)]',
  },
  red: {
    label: 'Quemando plata',
    chip: 'bg-cc-danger/15 text-cc-danger border-cc-danger/30',
    dot: 'bg-cc-danger',
    ring: 'shadow-[0_0_28px_-6px_rgba(248,113,113,0.6)]',
  },
  idle: {
    label: 'Sin datos',
    chip: 'bg-cc-muted/15 text-cc-muted border-cc-border-strong',
    dot: 'bg-cc-muted-soft',
    ring: '',
  },
}

export function DropshippingCard() {
  const {
    todayEntry,
    todayMetrics,
    todayHealth,
    config,
    setAdSpend,
    setRevenue,
    setUnitsSold,
    updateConfig,
  } = useDropshipping()
  const [configOpen, setConfigOpen] = useState(false)
  const health = HEALTH_STYLES[todayHealth]

  return (
    <section className="border-cc-border bg-cc-surface/80 relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border p-6 backdrop-blur md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0) 70%)',
        }}
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <Zap size={12} className="text-cc-warning" />
            Dropshipping
          </span>
          <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Métricas de hoy
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setConfigOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
            configOpen
              ? 'bg-cc-accent/15 text-cc-accent border-cc-accent/40'
              : 'text-cc-muted hover:text-cc-text-soft border-cc-border hover:border-cc-border-strong'
          }`}
        >
          {configOpen ? <Check size={12} /> : <SettingsIcon size={12} />}
          {configOpen ? 'Listo' : 'Costos'}
        </button>
      </header>

      <div className="relative grid grid-cols-3 gap-2.5">
        <NumberInput
          label="Gasto ads"
          prefix="$"
          value={todayEntry.adSpend}
          onChange={setAdSpend}
        />
        <NumberInput
          label="Ventas"
          prefix="$"
          value={todayEntry.revenue}
          onChange={setRevenue}
        />
        <NumberInput
          label="Unidades"
          value={todayEntry.unitsSold}
          onChange={setUnitsSold}
        />
      </div>

      {/* Semáforo + ROAS */}
      <div
        className={`border-cc-border bg-cc-surface-2/60 relative flex flex-col gap-3 rounded-xl border p-4 transition ${health.ring}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${health.dot}`} />
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase ${health.chip}`}
            >
              {health.label}
            </span>
          </div>
          <span className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
            Objetivo {config.targetRoas.toFixed(1)}×
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-cc-muted text-xs tracking-wide uppercase">
            ROAS hoy
          </span>
          <span className="text-cc-text font-mono text-3xl font-semibold tabular-nums">
            {formatRoas(todayMetrics.roas)}
          </span>
        </div>
      </div>

      {/* P&L breakdown */}
      <div className="border-cc-border bg-cc-surface-2/40 flex flex-col gap-2 rounded-xl border p-4 text-sm">
        <PnlRow label="Ventas" value={todayEntry.revenue} />
        <PnlRow label="Gasto ads" value={-todayEntry.adSpend} />
        <PnlRow label="Costo producto" value={-todayMetrics.productCost} />
        <PnlRow label="Envío" value={-todayMetrics.shippingCost} />
        <PnlRow label="Fees plataforma" value={-todayMetrics.fees} />
        <div className="bg-cc-border my-0.5 h-px" />
        <PnlRow
          label="Utilidad neta"
          value={todayMetrics.netProfit}
          emphasize
        />
      </div>

      {configOpen && (
        <div className="border-cc-border bg-cc-surface-2/40 flex flex-col gap-3 rounded-xl border p-4">
          <span className="text-cc-muted font-mono text-[10px] tracking-widest uppercase">
            Configuración de costos
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <ConfigInput
              label="Costo producto / unidad"
              prefix="$"
              value={config.productCostPerUnit}
              onChange={(v) => updateConfig({ productCostPerUnit: v })}
            />
            <ConfigInput
              label="Costo envío / unidad"
              prefix="$"
              value={config.shippingCost}
              onChange={(v) => updateConfig({ shippingCost: v })}
            />
            <ConfigInput
              label="Fee Shopify"
              suffix="%"
              step="0.1"
              value={config.shopifyFeePct}
              onChange={(v) => updateConfig({ shopifyFeePct: v })}
            />
            <ConfigInput
              label="Fee pagos"
              suffix="%"
              step="0.1"
              value={config.paymentFeePct}
              onChange={(v) => updateConfig({ paymentFeePct: v })}
            />
            <ConfigInput
              label="ROAS objetivo"
              suffix="×"
              step="0.1"
              value={config.targetRoas}
              onChange={(v) => updateConfig({ targetRoas: v })}
            />
            <ConfigInput
              label="CPA máximo"
              prefix="$"
              value={config.maxCpa}
              onChange={(v) => updateConfig({ maxCpa: v })}
            />
          </div>
        </div>
      )}
    </section>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  prefix?: string
}) {
  return (
    <label className="border-cc-border bg-cc-surface-2/60 hover:border-cc-border-strong focus-within:border-cc-accent/50 focus-within:ring-cc-accent/20 flex flex-col gap-1 rounded-lg border px-3 py-2 transition focus-within:ring-2">
      <span className="text-cc-muted text-[10px] tracking-widest uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className="text-cc-muted-soft font-mono text-sm">{prefix}</span>
        )}
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={(e) => e.target.select()}
          placeholder="0"
          className="text-cc-text placeholder:text-cc-muted-soft w-full bg-transparent font-mono text-lg tabular-nums outline-none"
        />
      </div>
    </label>
  )
}

function ConfigInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = '1',
}: {
  label: string
  value: number
  onChange: (n: number) => void
  prefix?: string
  suffix?: string
  step?: string
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-cc-muted text-[10px] tracking-wide">{label}</span>
      <div className="border-cc-border bg-cc-bg flex items-center gap-1 rounded-md border px-2 py-1">
        {prefix && (
          <span className="text-cc-muted-soft font-mono text-xs">{prefix}</span>
        )}
        <input
          type="number"
          step={step}
          min={0}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="text-cc-text-soft w-full bg-transparent font-mono text-sm tabular-nums outline-none"
        />
        {suffix && (
          <span className="text-cc-muted-soft font-mono text-xs">{suffix}</span>
        )}
      </div>
    </label>
  )
}

function PnlRow({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: number
  emphasize?: boolean
}) {
  const positive = value >= 0
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className={emphasize ? 'text-cc-text font-medium' : 'text-cc-muted'}
      >
        {label}
      </span>
      <span
        className={`font-mono tabular-nums ${
          emphasize
            ? positive
              ? 'text-cc-success text-lg font-semibold'
              : 'text-cc-danger text-lg font-semibold'
            : positive
              ? 'text-cc-text-soft text-sm'
              : 'text-cc-text-soft text-sm'
        }`}
      >
        {formatCLP(value)}
      </span>
    </div>
  )
}
