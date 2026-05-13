import { useCallback, useMemo } from 'react'
import { format, startOfMonth } from 'date-fns'
import { useLocalStorage } from './useLocalStorage'
import {
  STORAGE_KEYS,
  ZAPATILLAS_PRICE_PER_ORDER,
  type ZapatillasEntry,
} from '../utils/constants'
import { todayKey } from '../utils/dateHelpers'

export function useZapatillas() {
  const [log, setLog] = useLocalStorage<ZapatillasEntry[]>(
    STORAGE_KEYS.zapatillasLog,
    []
  )
  const today = todayKey()

  const todayEntry = useMemo<ZapatillasEntry>(
    () => log.find((e) => e.date === today) ?? { date: today, orders: 0 },
    [log, today]
  )

  const todayIncome = todayEntry.orders * ZAPATILLAS_PRICE_PER_ORDER

  const monthTotals = useMemo(() => {
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const monthLog = log.filter((e) => e.date >= monthStart)
    const orders = monthLog.reduce((sum, e) => sum + e.orders, 0)
    const income = orders * ZAPATILLAS_PRICE_PER_ORDER
    const daysWithSales = monthLog.filter((e) => e.orders > 0).length
    return { orders, income, daysWithSales }
  }, [log])

  const setTodayOrders = useCallback(
    (orders: number) => {
      const safe = Math.max(0, Math.floor(orders) || 0)
      setLog((prev) => {
        const idx = prev.findIndex((e) => e.date === today)
        const entry: ZapatillasEntry = { date: today, orders: safe }
        if (idx === -1) return [...prev, entry]
        const next = prev.slice()
        next[idx] = entry
        return next
      })
    },
    [setLog, today]
  )

  return {
    todayEntry,
    todayIncome,
    monthTotals,
    setTodayOrders,
    pricePerOrder: ZAPATILLAS_PRICE_PER_ORDER,
  }
}
