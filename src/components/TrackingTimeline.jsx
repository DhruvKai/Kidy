import { Check, X } from '@phosphor-icons/react'
import { ORDER_FLOW, STATUS_META, STEP_COPY } from '../lib/orders'
import { fmtDateTime } from '../lib/format'

// Vertical tracking stepper. Normal flow first, then cancellation or return events.
export default function TrackingTimeline({ order }) {
  const reached = Object.fromEntries(order.timeline.map((t) => [t.status, t]))
  const cancelled = order.status === 'cancelled'
  const steps = cancelled ? ['placed', 'cancelled'] : [...ORDER_FLOW, ...order.timeline.map((t) => t.status).filter((s) => !ORDER_FLOW.includes(s))]
  const lastReached = steps.reduce((idx, s, i) => (reached[s] ? i : idx), 0)

  return (
    <ol className="relative flex flex-col">
      {steps.map((s, i) => {
        const done = !!reached[s]
        const current = i === lastReached
        const isBad = s === 'cancelled' || s === 'return_rejected'
        return (
          <li key={s + i} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 ${i < lastReached ? 'bg-mint-400' : 'bg-line'}`} aria-hidden="true" />}
            <span className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${
              done ? (isBad ? 'border-slate-400 bg-slate-400 text-white' : 'border-go bg-go text-white') : 'border-line bg-surface'
            } ${current && !isBad ? 'ring-4 ring-mint-100' : ''}`}>
              {done && (isBad ? <X size={14} weight="bold" /> : <Check size={14} weight="bold" />)}
            </span>
            <div className="-mt-0.5 min-w-0">
              <p className={`text-sm font-extrabold ${done ? 'text-ink' : 'text-muted'}`}>{STATUS_META[s]?.label || s}</p>
              {done ? (
                <>
                  <p className="text-xs text-muted">{fmtDateTime(reached[s].at)}</p>
                  {current && <p className="mt-1 text-sm text-ink/80">{reached[s].note || STEP_COPY[s]}</p>}
                  {s === 'shipped' && order.shipment && <p className="mt-1 text-xs font-semibold text-muted">{order.shipment.courier}, AWB {order.shipment.awb}</p>}
                </>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
