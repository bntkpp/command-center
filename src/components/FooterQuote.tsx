import { Quote } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

export function FooterQuote() {
  const { settings } = useSettings()
  if (!settings.footerPhrase.trim()) return null

  return (
    <section className="border-cc-border bg-cc-surface/60 flex items-start gap-4 rounded-2xl border p-6 backdrop-blur">
      <Quote
        size={20}
        className="text-cc-accent mt-0.5 shrink-0 -scale-x-100"
        aria-hidden
      />
      <p className="text-cc-text-soft text-sm leading-relaxed italic md:text-base">
        {settings.footerPhrase}
      </p>
    </section>
  )
}
