import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Receipt, XCircle, WhatsappLogo, ChatText, Gift, Truck, Star } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { rupees, fmtDateTime, maskPhone } from '../lib/format'
import { STATUS_META, PAYMENT_LABELS, COURIERS, NEXT_ACTION, canCancel } from '../lib/orders'
import TrackingTimeline from '../components/TrackingTimeline'
import { StatusPill, Modal } from '../components/ui'

const MESSAGES = {
  placed: (o) => `Hi ${o.customer.name.split(' ')[0]}, thanks for shopping with Kidy! Order ${o.id} is placed.`,
  confirmed: (o) => `Order ${o.id} is confirmed and will be packed soon.`,
  packed: (o) => `Order ${o.id} is packed and ready to ship.`,
  shipped: (o) => `Order ${o.id} has shipped with ${o.shipment?.courier}. Track: AWB ${o.shipment?.awb}.`,
  out_for_delivery: (o) => `Order ${o.id} is out for delivery today.${o.payment.method === 'cod' ? ` Please keep ${rupees(o.pricing.total)} ready.` : ''}`,
  delivered: (o) => `Order ${o.id} is delivered. Loved it? Leave a quick review to help other parents.`,
  cancelled: (o) => `Order ${o.id} is cancelled.${o.payment.method === 'cod' ? '' : ' Your refund is on its way.'}`,
  return_requested: (o) => `We got your return request for ${o.id}. We will confirm pickup within 24 hours.`,
  return_approved: (o) => `Return approved for ${o.id}. A courier will pick it up in 1 to 2 days.`,
  refunded: (o) => `Refund for ${o.id} is processed.`,
  exchanged: (o) => `Your exchange for ${o.id} has shipped.`,
  return_rejected: (o) => `Sorry, the return for ${o.id} did not pass our quality check.`,
}

export function ShipModal({ order, onClose }) {
  const shipOrder = useStore((s) => s.shipOrder)
  const best = [...COURIERS].filter((c) => c.rating >= 4.2).sort((a, b) => a.rate - b.rate)[0]
  const [pick, setPick] = useState(best.name)
  const weight = order.items.reduce((g, i) => g + i.qty * 260, 0)
  const ship = () => {
    shipOrder(order.id, COURIERS.find((c) => c.name === pick))
    toast(`Shipped with ${pick}. Label ready and customer notified.`, 'success')
    onClose()
  }
  return (
    <Modal open onClose={onClose} title={`Ship ${order.id}`} footer={<button type="button" onClick={ship} className="btn-primary w-full py-3"><Truck size={18} /> Ship with {pick}</button>}>
      <p className="text-sm text-muted">Via Shiprocket to {order.address.city} {order.address.pincode}, {(weight / 1000).toFixed(2)} kg, {order.payment.method === 'cod' ? `COD ${rupees(order.pricing.total)}` : 'prepaid'}.</p>
      <ul className="mt-4 flex flex-col gap-2">
        {COURIERS.map((c) => (
          <li key={c.name}>
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${pick === c.name ? 'border-ink bg-cream' : 'border-line'}`}>
              <input type="radio" checked={pick === c.name} onChange={() => setPick(c.name)} className="accent-coral-600" />
              <span className="flex-1 text-sm">
                <b>{c.name}</b> {c.name === best.name && <span className="ml-1 rounded-full bg-mint-50 px-2 py-0.5 text-[11px] font-bold text-mint-700">Recommended</span>}
                <span className="block text-xs text-muted">{c.eta}, <Star size={11} weight="fill" className="inline text-sunny-500" /> {c.rating}</span>
              </span>
              <span className="font-bold tabular-nums">₹{c.rate}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Rates are sample Shiprocket prices for a 0.5 kg parcel. The live store can auto-pick the cheapest well-rated courier.</p>
    </Modal>
  )
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const order = useStore((s) => s.orders.find((o) => o.id === id))
  const advanceOrder = useStore((s) => s.advanceOrder)
  const cancelOrder = useStore((s) => s.cancelOrder)
  const updateOrder = useStore((s) => s.updateOrder)
  const [shipOpen, setShipOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  useEffect(() => { document.title = `${id} | Kidy admin` }, [id])
  useEffect(() => { if (order?.isNew) updateOrder(order.id, (o) => ({ ...o, isNew: false })) }, [order?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) return <p className="py-10 text-center text-muted">Order not found. <Link to="/admin/orders" className="font-bold underline">Back to orders</Link></p>
  const next = NEXT_ACTION[order.status]
  const st = STATUS_META[order.status]
  const p = order.pricing

  const act = () => {
    if (next.to === 'ship') return setShipOpen(true)
    advanceOrder(order.id, next.to)
    toast(`${STATUS_META[next.to].label}. Customer notified on WhatsApp.`, 'success')
  }

  return (
    <div>
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} /> Orders</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold">{order.id}</h1>
            <StatusPill tone={st.tone}>{st.label}</StatusPill>
          </div>
          <p className="mt-1 text-sm text-muted">Placed {fmtDateTime(order.createdAt)}, {PAYMENT_LABELS[order.payment.method]}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/invoice/${order.id}`} target="_blank" className="btn-secondary"><Receipt size={16} /> Invoice</Link>
          <Link to={`/label/${order.id}`} target="_blank" className="btn-secondary"><Printer size={16} /> Label</Link>
          {canCancel(order) && <button type="button" onClick={() => setCancelOpen(true)} className="btn-secondary text-coral-700"><XCircle size={16} /> Cancel</button>}
          {next && <button type="button" onClick={act} className="btn-primary">{next.to === 'ship' ? 'Ship with Shiprocket' : next.label}</button>}
          {order.status === 'return_requested' && <Link to="/admin/returns" className="btn-primary">Review return</Link>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="rounded-2xl bg-white p-5 shadow-soft md:p-6">
            <h2 className="mb-4 text-lg font-bold">Items to pack</h2>
            <ul className="flex flex-col gap-4">
              {order.items.map((i) => (
                <li key={i.sku + i.size} className="flex items-center gap-4">
                  <img src={i.image} alt="" className="h-20 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-bold">{i.title}</p>
                    <p className="text-xs text-muted">Size {i.size}, {i.colour}</p>
                    <p className="font-mono text-xs text-muted">{i.sku}</p>
                  </div>
                  <span className="text-sm">x {i.qty}</span>
                  <span className="w-20 text-right text-sm font-bold tabular-nums">{rupees(i.unitPrice * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{rupees(p.selling)}</dd></div>
              {(p.bundleDiscount > 0 || p.couponDiscount > 0) && <div className="flex justify-between"><dt className="text-muted">Discounts{p.coupon ? ` (${p.coupon})` : ''}</dt><dd className="text-mint-700">- {rupees((p.bundleDiscount || 0) + (p.couponDiscount || 0))}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{p.shipping ? rupees(p.shipping) : 'Free'}</dd></div>
              {p.codFee > 0 && <div className="flex justify-between"><dt className="text-muted">COD fee</dt><dd>{rupees(p.codFee)}</dd></div>}
              <div className="flex justify-between text-base font-extrabold"><dt>Total</dt><dd>{rupees(p.total)}</dd></div>
            </dl>
            {order.gift && (
              <div className="mt-4 flex gap-3 rounded-xl bg-coral-50 p-4 text-sm">
                <Gift size={20} className="shrink-0 text-coral-600" />
                <div><p className="font-bold">Gift order{order.gift.hidePrice ? ', hide prices on packing slip' : ''}</p>{order.gift.message && <p className="mt-1 text-muted">"{order.gift.message}"</p>}</div>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-soft md:p-6">
            <h2 className="mb-4 text-lg font-bold">Customer messages sent</h2>
            <ul className="flex flex-col gap-3">
              {order.timeline.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e7f7ee] text-[#126b38]"><WhatsappLogo size={18} weight="fill" /></span>
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-cream px-4 py-2.5 text-sm">
                    <p>{MESSAGES[t.status]?.(order)}</p>
                    <p className="mt-1 text-[11px] text-muted">WhatsApp and SMS to {maskPhone(order.customer.phone)}, {fmtDateTime(t.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><ChatText size={14} /> Sent automatically in the live store through the WhatsApp Business API.</p>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="mb-3 text-lg font-bold">Tracking</h2>
            <TrackingTimeline order={order} />
          </section>
          <section className="rounded-2xl bg-white p-5 text-sm shadow-soft">
            <h2 className="mb-2 text-lg font-bold">Customer</h2>
            <p className="font-bold">{order.customer.name}</p>
            <p className="text-muted">{maskPhone(order.customer.phone)}</p>
            {order.customer.email && <p className="text-muted">{order.customer.email}</p>}
            <a href={`https://wa.me/91${order.customer.phone}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#126b38]"><WhatsappLogo size={16} weight="fill" /> Message on WhatsApp</a>
            <h3 className="mt-4 font-extrabold">Ship to</h3>
            <p className="text-muted">{order.address.name}, {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} {order.address.pincode}</p>
            <h3 className="mt-4 font-extrabold">Payment</h3>
            <p className="text-muted">{PAYMENT_LABELS[order.payment.method]}, {order.payment.method === 'cod' && order.payment.status === 'pending' ? `collect ${rupees(p.total)} at delivery` : order.payment.status.replace('_', ' ')}</p>
          </section>
        </aside>
      </div>

      {shipOpen && <ShipModal order={order} onClose={() => setShipOpen(false)} />}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this order?"
        footer={<div className="flex gap-3"><button type="button" onClick={() => setCancelOpen(false)} className="btn-secondary flex-1">Keep</button><button type="button" onClick={() => { cancelOrder(order.id, 'seller'); setCancelOpen(false); toast('Order cancelled and stock returned', 'success') }} className="btn-primary flex-1">Cancel order</button></div>}>
        <p className="text-sm text-muted">Stock goes back to inventory and the customer is notified{order.payment.method === 'cod' ? '' : '. Prepaid amount is refunded to the original payment method'}.</p>
      </Modal>
    </div>
  )
}
