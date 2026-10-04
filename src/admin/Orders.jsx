import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MagnifyingGlass, Package } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { rupees, timeAgo } from '../lib/format'
import { STATUS_META, PAYMENT_LABELS, NEXT_ACTION } from '../lib/orders'
import { StatusPill, EmptyState } from '../components/ui'
import { PageHeader } from './AdminLayout'
import { ShipModal } from './AdminOrderDetail'
import { asset } from '../data/catalog'

const TABS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'placed', label: 'To confirm', test: (o) => o.status === 'placed' },
  { id: 'confirmed', label: 'To pack', test: (o) => o.status === 'confirmed' },
  { id: 'packed', label: 'To ship', test: (o) => o.status === 'packed' },
  { id: 'transit', label: 'In transit', test: (o) => ['shipped', 'out_for_delivery'].includes(o.status) },
  { id: 'delivered', label: 'Delivered', test: (o) => o.status === 'delivered' },
  { id: 'returns', label: 'Returns', test: (o) => !!o.returnRequest },
  { id: 'cancelled', label: 'Cancelled', test: (o) => o.status === 'cancelled' },
]

export default function Orders() {
  const orders = useStore((s) => s.orders)
  const advanceOrder = useStore((s) => s.advanceOrder)
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'all'
  const [q, setQ] = useState('')
  const [shipping, setShipping] = useState(null)
  useEffect(() => { document.title = 'Orders | KiDDY WiDDY admin' }, [])

  const t = TABS.find((x) => x.id === tab) || TABS[0]
  const list = useMemo(() => orders.filter((o) => t.test(o) && (!q || `${o.id} ${o.customer.name} ${o.customer.phone} ${o.address.city}`.toLowerCase().includes(q.toLowerCase()))), [orders, t, q])

  const act = (o) => {
    const next = NEXT_ACTION[o.status]
    if (next.to === 'ship') return setShipping(o)
    advanceOrder(o.id, next.to)
    toast(`${o.id}: ${STATUS_META[next.to].label}. Customer notified on WhatsApp.`, 'success')
  }

  return (
    <div>
      <PageHeader title="Orders" subtitle="Confirm, pack and ship. Customers get WhatsApp and SMS updates at every step." />
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {TABS.map((x) => {
          const n = orders.filter(x.test).length
          return (
            <button key={x.id} type="button" onClick={() => setParams(x.id === 'all' ? {} : { tab: x.id })} className={`chip shrink-0 px-4 py-2 ${tab === x.id ? 'chip-active' : ''}`}>
              {x.label} <span className={tab === x.id ? 'text-white/70' : 'text-muted'}>{n}</span>
            </button>
          )
        })}
      </div>
      <div className="relative mb-4">
        <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID, customer, phone or city" aria-label="Search orders" className="input pl-10" />
      </div>

      {!list.length ? (
        <EmptyState icon={Package} title="No orders here" body="Orders placed on the store appear here instantly. Try placing one from the storefront." action={<a href={asset('')} target="_blank" className="btn-primary">Open the store</a>} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-cream text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-bold">Order</th>
                  <th className="px-4 py-3 font-bold">Customer</th>
                  <th className="px-4 py-3 font-bold">Items</th>
                  <th className="px-4 py-3 text-right font-bold">Total</th>
                  <th className="px-4 py-3 font-bold">Payment</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 text-right font-bold">Next step</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className="border-t border-line hover:bg-cream/60">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${o.id}`} className="font-bold hover:text-coral-700">{o.id}</Link>
                      {o.isNew && <span className="ml-2 rounded-full bg-coral-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">NEW</span>}
                      <span className="block text-xs text-muted">{timeAgo(o.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3"><span className="font-semibold">{o.customer.name}</span><span className="block text-xs text-muted">{o.address.city}, {o.address.pincode}</span></td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <img src={o.items[0].image} alt="" className="h-10 w-8 rounded-md object-cover" />
                        <span className="text-xs text-muted">{o.items.reduce((n, i) => n + i.qty, 0)} pcs</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">{rupees(o.pricing.total)}</td>
                    <td className="px-4 py-3"><span className={`rounded-md px-2 py-0.5 text-xs font-bold ${o.payment.method === 'cod' ? 'bg-sunny-100 text-sunny-700' : 'bg-mint-50 text-mint-700'}`}>{o.payment.method === 'cod' ? 'COD' : 'Prepaid'}</span><span className="block text-xs text-muted">{PAYMENT_LABELS[o.payment.method]}</span></td>
                    <td className="px-4 py-3"><StatusPill tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</StatusPill></td>
                    <td className="px-4 py-3 text-right">
                      {NEXT_ACTION[o.status] ? (
                        <button type="button" onClick={() => act(o)} className="btn-dark btn-sm">{NEXT_ACTION[o.status].label}</button>
                      ) : (
                        <Link to={o.returnRequest && o.status === 'return_requested' ? '/admin/returns' : `/admin/orders/${o.id}`} className="text-xs font-bold text-coral-700">{o.status === 'return_requested' ? 'Review return' : 'View'}</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {shipping && <ShipModal order={shipping} onClose={() => setShipping(null)} />}
    </div>
  )
}
