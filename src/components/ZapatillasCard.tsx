import { ShoppingBag, TrendingUp, Plus, Minus } from 'lucide-react'
import { useZapatillas } from '../hooks/useZapatillas'
import { formatCLP, formatNumber } from '../utils/format'

export function ZapatillasCard() {
  const { todayEntry, todayIncome, monthTotals, setTodayOrders, pricePerOrder } =
    useZapatillas()

  return (
    <section className="border-cc-border bg-cc-surface/80 relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border p-6 backdrop-blur md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(circle, rgba(91,141,239,0.18) 0%, rgba(91,141,239,0) 70%)',
        }}
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-cc-muted inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
            <ShoppingBag size={12} className="text-cc-accent" />
            Zapatillas
          </span>
          <h2 className="text-cc-text mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Pedidos de hoy
          </h2>
        </div>
      </header>

      <div className="relative flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setTodayOrders(todayEntry.orders - 1)}
          disabled={todayEntry.orders <= 0}
          aria-label="Restar pedido"
          className="border-cc-border-strong bg-cc-surface-2 text-cc-text-soft hover:border-cc-text-soft hover:text-cc-text disabled:opacity-40 disabled:cursor-not-allowed flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition"
        >
          <Minus size={18} />
        </button>

        <div className="flex flex-1 items-baseline justify-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={todayEntry.orders}
            onChange={(e) => setTodayOrders(Number(e.target.value))}
            onFocus={(e) => e.target.select()}
            className="text-cc-text w-24 bg-transparent text-center font-mono text-5xl font-light tabular-nums outline-none"
            aria-label="Pedidos procesados hoy"
          />
          <span className="text-cc-muted text-xs tracking-widest uppercase">
            pedidos
          </span>
        </div>

        <button
          type="button"
          onClick={() => setTodayOrders(todayEntry.orders + 1)}
          aria-label="Sumar pedido"
          className="bg-cc-accent/15 border-cc-accent/40 text-cc-accent hover:bg-cc-accent/25 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="border-cc-border bg-cc-surface-2/60 relative flex flex-col gap-3 rounded-xl border p-4">
        <Row
          label="Ingreso de hoy"
          value={formatCLP(todayIncome)}
          hint={`${todayEntry.orders} × ${formatCLP(pricePerOrder)}`}
          emphasize
        />
        <div className="bg-cc-border h-px" />
        <Row
          label="Pedidos del mes"
          value={formatNumber(monthTotals.orders)}
          hint={`${monthTotals.daysWithSales} día${
            monthTotals.daysWithSales === 1 ? '' : 's'
          } con ventas`}
        />
        <Row
          label="Ingreso del mes"
          value={formatCLP(monthTotals.income)}
          icon={<TrendingUp size={12} className="text-cc-success" />}
        />
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  hint,
  emphasize = false,
  icon,
}: {
  label: string
  value: string
  hint?: string
  emphasize?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-cc-muted text-xs tracking-wide uppercase inline-flex items-center gap-1">
          {icon}
          {label}
        </span>
        {hint && (
          <span className="text-cc-muted-soft mt-0.5 font-mono text-[10px]">
            {hint}
          </span>
        )}
      </div>
      <span
        className={`font-mono tabular-nums ${
          emphasize ? 'text-cc-text text-lg font-semibold' : 'text-cc-text-soft text-sm'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
