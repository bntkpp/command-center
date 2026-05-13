import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useSettings } from './useSettings'

/**
 * Fires a celebratory confetti burst the first time `triggerValue` becomes truthy
 * (and again every time it transitions from falsy → truthy). Respects the user's
 * `confettiEnabled` setting.
 */
export function useConfetti(triggerValue: boolean) {
  const { settings } = useSettings()
  const previous = useRef<boolean>(false)

  useEffect(() => {
    if (!settings.confettiEnabled) {
      previous.current = triggerValue
      return
    }
    if (triggerValue && !previous.current) {
      // Two bursts from bottom corners for a satisfying coverage.
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.2, y: 0.95 },
        angle: 60,
        colors: ['#5B8DEF', '#F59E0B', '#22C55E', '#F4F4F8'],
      })
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.8, y: 0.95 },
        angle: 120,
        colors: ['#5B8DEF', '#F59E0B', '#22C55E', '#F4F4F8'],
      })
    }
    previous.current = triggerValue
  }, [triggerValue, settings.confettiEnabled])
}
