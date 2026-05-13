import { AlertTriangle, Flame } from 'lucide-react'
import { useDropshipping } from '../hooks/useDropshipping'

export function RoasAlert() {
  const { showAlert, lowRoasStreakDays } = useDropshipping()

  if (!showAlert) return null

  return (
    <section
      role="alert"
      className="border-cc-danger/40 bg-cc-danger/10 relative flex items-center gap-4 overflow-hidden rounded-2xl border p-5 backdrop-blur"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 80% 100% at 20% 50%, rgba(248,113,113,0.18) 0%, rgba(248,113,113,0) 70%)',
        }}
      />

      <div className="bg-cc-danger/20 text-cc-danger border-cc-danger/40 relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
        <AlertTriangle size={20} strokeWidth={2.25} />
      </div>

      <div className="relative flex flex-1 flex-col">
        <span className="text-cc-danger inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase">
          <Flame size={11} />
          Alerta dropshipping · {lowRoasStreakDays} día
          {lowRoasStreakDays === 1 ? '' : 's'} seguidos con ROAS &lt; 1.5
        </span>
        <p className="text-cc-text mt-1 text-sm font-medium leading-snug md:text-base">
          Revisa tu campaña. Estás quemando plata.
        </p>
      </div>
    </section>
  )
}
