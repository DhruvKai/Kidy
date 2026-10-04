import { useEffect, useState } from 'react'
import { flashSaleEndsAt } from '../config'

const pad = (n) => String(n).padStart(2, '0')

// Counts down to the real end of today's deals (local midnight).
export default function CountdownTimer({ className = '' }) {
  const [left, setLeft] = useState(() => flashSaleEndsAt().getTime() - Date.now())
  useEffect(() => {
    const t = setInterval(() => setLeft(flashSaleEndsAt().getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor(left / 1000))
  const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
  return (
    <div className={`flex items-center gap-1.5 ${className}`} role="timer" aria-label={`Ends in ${parts[0]} hours ${parts[1]} minutes`}>
      {parts.map((n, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="grid h-10 w-11 place-items-center rounded-xl bg-ink font-display text-lg font-bold tabular-nums text-surface">{pad(n)}</span>
          {i < 2 && <span className="font-bold text-ink">:</span>}
        </span>
      ))}
    </div>
  )
}
