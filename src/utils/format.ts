/**
 * Format number as CLP currency (e.g., 12500 → "$12.500").
 * No decimals, dot as thousand separator.
 */
export function formatCLP(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.round(Math.abs(amount))
  const withDots = abs
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}$${withDots}`
}

/**
 * Format number with thousand separators (no currency).
 */
export function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Format ROAS as "Xx" (e.g., 2.5 → "2.5×").
 */
export function formatRoas(roas: number): string {
  if (!isFinite(roas) || isNaN(roas)) return '–'
  return `${roas.toFixed(2)}×`
}
