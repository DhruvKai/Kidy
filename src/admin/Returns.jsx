import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUUpLeft, Check, X, Truck } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { rupees, timeAgo } from '../lib/format'
import { STATUS_META } from '../lib/orders'
import { StatusPill, EmptyState } from '../components/ui'
import { PageHeader } from './AdminLayout'

const TABS = [
  ['review', 'To review', (o) => o.status === 'return_requested'],
  ['pickup', 'Pickup scheduled', (o) => o.status === 'return_approved'],
  ['done', 'Completed', (o) => ['refunded', 'exchanged', 'return_rejected'].includes(o.status)],
]

export default function Returns() {
  const orders = useStore((s) => s.orders)
  const resolveReturn = useStore((s) => s.resolveReturn)
  const completeReturn = useStore((s) => s.completeReturn)
  const [tab, setTab] = useState('review')
  const [mode, setMode] = useState({})
  useEffect(() => { document.title = 'Returns | KiDDY WiDDY admin' }, [])
  const withReturns = orders.filter((o) => o.returnRequest)
  const list = withReturns.filter(TABS.find((t) => t[0] === tab)[2])

  return (
    <div>
      <PageHeader title="Returns and exchanges" subtitle="Approve a request and a reverse pickup is booked with the courier automatically." />
      <div className="mb-4 flex gap-2">
        {TABS.map(([id, l, test]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`chip shrink-0 px-4 py-2 ${tab === id ? 'chip-active' : ''}`}>{l} <span className={tab === id ? 'text-white/70' : 'text-muted'}>{withReturns.filter(test).length}</span></button>
        ))}
      </div>
      {!list.length ? (
        <EmptyState icon={ArrowUUpLeft} title="Nothing here" body={tab === 'review' ? 'No return requests waiting. Customers request returns from their order page.' : 'Nothing in this list yet.'} />
      ) : (
        <ul className="flex flex-col gap-4">
          {list.map((o) => {
            const r = o.returnRequest
            const refund = mode[o.id] || r.refundMode || 'source'
            return (
              <li key={o.id} className="rounded-2xl bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-4">
                    <img src={o.items[0].image} alt="" className="h-24 w-20 rounded-xl object-cover" />
                    <div className="text-sm">
                      <p className="font-bold">{o.items[0].title}{o.items.length > 1 ? ` + ${o.items.length - 1} more` : ''}</p>
                      <p className="text-muted">Bought size {o.items[0].size}, {rupees(o.pricing.total)}, {o.payment.method === 'cod' ? 'COD' : 'prepaid'}</p>
                      <p className="mt-1"><Link to={`/admin/orders/${o.id}`} className="font-bold hover:text-coral-700">{o.id}</Link> <span className="text-muted">by {o.customer.name}, {o.address.city}</span></p>
                    </div>
                  </div>
                  <StatusPill tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</StatusPill>
                </div>
                <div className="mt-4 rounded-xl bg-cream p-4 text-sm">
                  <p><b>{r.type === 'exchange' ? `Exchange for size ${r.exchangeSize}` : 'Return for refund'}</b>, reason: {r.reason}</p>
                  {r.note && <p className="mt-1 text-muted">"{r.note}"</p>}
                  <p className="mt-1 text-xs text-muted">Requested {timeAgo(r.at)}</p>
                </div>
                {o.status === 'return_requested' && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {r.type === 'return' && (
                      <select value={refund} onChange={(e) => setMode({ ...mode, [o.id]: e.target.value })} className="input w-auto py-2" aria-label="Refund to">
                        <option value="source">Refund to original payment</option>
                        <option value="credit">Refund as store credit</option>
                      </select>
                    )}
                    <button type="button" onClick={() => { resolveReturn(o.id, true, r.type === 'return' ? refund : null); toast('Approved. Reverse pickup booked and customer notified.', 'success') }} className="btn-primary"><Check size={16} /> Approve</button>
                    <button type="button" onClick={() => { resolveReturn(o.id, false); toast('Return rejected. Customer notified.') }} className="btn-secondary"><X size={16} /> Reject</button>
                  </div>
                )}
                {o.status === 'return_approved' && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <p className="flex items-center gap-2 text-sm text-muted"><Truck size={18} /> Waiting for pickup and quality check.</p>
                    <button type="button" onClick={() => { completeReturn(o.id); toast(r.type === 'exchange' ? 'Exchange item shipped' : 'Refund processed', 'success') }} className="btn-dark">
                      {r.type === 'exchange' ? `Item received, ship size ${r.exchangeSize}` : 'Item received, issue refund'}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
