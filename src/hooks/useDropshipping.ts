import { useCallback, useMemo } from 'react'
import { addDays, format } from 'date-fns'
import { useLocalStorage } from './useLocalStorage'
import {
  DEFAULT_DROPSHIPPING_CONFIG,
  STORAGE_KEYS,
  type DropshippingConfig,
  type DropshippingEntry,
} from '../utils/constants'
import { todayKey } from '../utils/dateHelpers'

export type DropshippingComputed = {
  roas: number
  productCost: number
  shippingCost: number
  fees: number
  netProfit: number
}

export type RoasHealth = 'green' | 'yellow' | 'red' | 'idle'

const EMPTY_ENTRY = (date: string): DropshippingEntry => ({
  date,
  adSpend: 0,
  revenue: 0,
  unitsSold: 0,
})

export function computeMetrics(
  entry: DropshippingEntry,
  config: DropshippingConfig
): DropshippingComputed {
  const roas = entry.adSpend > 0 ? entry.revenue / entry.adSpend : 0
  const productCost = entry.unitsSold * config.productCostPerUnit
  const shippingCost = entry.unitsSold * config.shippingCost
  const fees =
    (entry.revenue * (config.shopifyFeePct + config.paymentFeePct)) / 100
  const netProfit = entry.revenue - entry.adSpend - productCost - shippingCost - fees
  return { roas, productCost, shippingCost, fees, netProfit }
}

export function roasHealth(roas: number, hasSpend: boolean): RoasHealth {
  if (!hasSpend) return 'idle'
  if (roas > 2.5) return 'green'
  if (roas >= 1.5) return 'yellow'
  return 'red'
}

export function useDropshipping() {
  const [log, setLog] = useLocalStorage<DropshippingEntry[]>(
    STORAGE_KEYS.dropshippingLog,
    []
  )
  const [config, setConfig] = useLocalStorage<DropshippingConfig>(
    STORAGE_KEYS.dropshippingConfig,
    DEFAULT_DROPSHIPPING_CONFIG
  )
  const today = todayKey()

  const todayEntry = useMemo<DropshippingEntry>(
    () => log.find((e) => e.date === today) ?? EMPTY_ENTRY(today),
    [log, today]
  )

  const todayMetrics = useMemo(
    () => computeMetrics(todayEntry, config),
    [todayEntry, config]
  )

  const todayHealth = useMemo<RoasHealth>(
    () => roasHealth(todayMetrics.roas, todayEntry.adSpend > 0),
    [todayMetrics.roas, todayEntry.adSpend]
  )

  /** Last 7 days as a contiguous series (today at the right). Missing days = zeros. */
  const last7Days = useMemo(() => {
    const now = new Date()
    const series: Array<
      DropshippingEntry & DropshippingComputed & { isToday: boolean }
    > = []
    for (let i = 6; i >= 0; i--) {
      const d = addDays(now, -i)
      const dateK = format(d, 'yyyy-MM-dd')
      const entry = log.find((e) => e.date === dateK) ?? EMPTY_ENTRY(dateK)
      const metrics = computeMetrics(entry, config)
      series.push({ ...entry, ...metrics, isToday: dateK === today })
    }
    return series
  }, [log, config, today])

  /** Weekly totals over the last 7 days. */
  const weekTotals = useMemo(() => {
    const adSpend = last7Days.reduce((s, e) => s + e.adSpend, 0)
    const revenue = last7Days.reduce((s, e) => s + e.revenue, 0)
    const netProfit = last7Days.reduce((s, e) => s + e.netProfit, 0)
    const unitsSold = last7Days.reduce((s, e) => s + e.unitsSold, 0)
    const roas = adSpend > 0 ? revenue / adSpend : 0
    return { adSpend, revenue, netProfit, unitsSold, roas }
  }, [last7Days])

  /** True if the most recent 3+ consecutive days with ad spend all have ROAS < 1.5. */
  const lowRoasStreakDays = useMemo(() => {
    let count = 0
    // walk backwards through the last 7+ days, looking at days with adSpend > 0.
    const sorted = log
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1)) // newest first
    for (const entry of sorted) {
      if (entry.adSpend <= 0) continue
      const { roas } = computeMetrics(entry, config)
      if (roas < 1.5) {
        count++
      } else {
        break
      }
    }
    return count
  }, [log, config])

  const showAlert = lowRoasStreakDays >= 3

  const updateTodayEntry = useCallback(
    (patch: Partial<Omit<DropshippingEntry, 'date'>>) => {
      setLog((prev) => {
        const idx = prev.findIndex((e) => e.date === today)
        if (idx === -1) {
          return [...prev, { ...EMPTY_ENTRY(today), ...patch }]
        }
        const next = prev.slice()
        next[idx] = { ...next[idx], ...patch }
        return next
      })
    },
    [setLog, today]
  )

  const setAdSpend = useCallback(
    (v: number) => updateTodayEntry({ adSpend: Math.max(0, v || 0) }),
    [updateTodayEntry]
  )
  const setRevenue = useCallback(
    (v: number) => updateTodayEntry({ revenue: Math.max(0, v || 0) }),
    [updateTodayEntry]
  )
  const setUnitsSold = useCallback(
    (v: number) =>
      updateTodayEntry({ unitsSold: Math.max(0, Math.floor(v) || 0) }),
    [updateTodayEntry]
  )

  const updateConfig = useCallback(
    (patch: Partial<DropshippingConfig>) => {
      setConfig((prev) => ({ ...prev, ...patch }))
    },
    [setConfig]
  )

  return {
    todayEntry,
    todayMetrics,
    todayHealth,
    config,
    last7Days,
    weekTotals,
    lowRoasStreakDays,
    showAlert,
    setAdSpend,
    setRevenue,
    setUnitsSold,
    updateConfig,
  }
}
