import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Receipt, WhatsappLogo, ArrowUUpLeft, XCircle, ArrowLeft } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { useUI } from '../store/ui'
import { rupees, fmtDate } from '../lib/format'
import { PAYMENT_LABELS, STATUS_META, RETURN_REASONS, canCancel, canReturn } from '../lib/orders'
import { STORE } from '../config'
import TrackingTimeline from '../components/TrackingTimeline'
import { Modal, Field, StatusPill } from '../components/ui'
import NotFound from './NotFound'

export function OrderView({ order, actions = true }) {
  const cancelOrder = useStore((s) => s.cancelOrder)
  const product = useStore((s) => s.products.find((p) => p.id === order.items[0]?.productId))
  const [cancelOpen, setCancelOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const st = STATUS_META[order.status]
  const p = order.pricing

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-5">
        <section className="rounded-2xl bg-surface p-5 shadow-soft md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-muted">Order {order.id}, placed {fmtDate(order.createdAt)}</p>
              <h2 className="mt-1 text-xl font-bold">{st.label}</h2>
            </div>
            <StatusPill tone={st.tone}>{st.label}</StatusPill>
          </div>
          <TrackingTimeline order={order} />
          {order.returnRequest && (
            <div className="mt-5 rounded-xl bg-coral-50 p-4 text-sm">
              <p className="font-extrabold">{order.returnRequest.type === 'exchange' ? `Exchange for size ${order.returnRequest.exchangeSize}` : 'Return and refund'}</p>
              <p className="mt-1 text-muted">Reason: {order.returnRequest.reason}{order.returnRequest.refundMode ? `. Refund to ${order.returnRequest.refundMode === 'credit' ? 'store credit' : 'original payment method'}.` : ''}</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-surface p-5 shadow-soft md:p-6">
          <h2 className="mb-4 text-lg font-bold">Items</h2>
          <ul className="flex flex-col gap-4">
            {order.items.map((i) => (
              <li key={i.sku + i.size} className="flex gap-4">
                <img src={i.image} alt="" className="h-24 w-[72px] rounded-xl object-cover" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-bold">{i.title}</p>
                  <p className="text-xs text-muted">Size {i.size}, {i.colour}, Qty {i.qty}</p>
                  <p className="mt-1 font-extrabold">{rupees(i.unitPrice * i.qty)} <span className="text-xs font-semibold text-muted line-through">{rupees(i.mrp * i.qty)}</span></p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        {actions && (
          <div className="flex flex-col gap-2 rounded-2xl bg-surface p-5 shadow-soft">
            {canCancel(order) && <button type="button" onClick={() => setCancelOpen(true)} className="btn-secondary w-full"><XCircle size={18} /> Cancel order</button>}
            {canReturn(order) && <button type="button" onClick={() => setReturnOpen(true)} className="btn-primary w-full"><ArrowUUpLeft size={18} /> Return or exchange</button>}
            <Link to={`/invoice/${order.id}`} target="_blank" className="btn-secondary w-full"><Receipt size={18} /> Download GST invoice</Link>
            <a href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Hi, I need help with order ${order.id}`)}`} target="_blank" rel="noreferrer" className="btn-ghost w-full"><WhatsappLogo size={18} /> Get help on WhatsApp</a>
          </div>
        )}
        <div className="rounded-2xl bg-surface p-5 text-sm shadow-soft">
          <p className="font-extrabold">Delivery address</p>
          <p className="mt-1 text-muted">{order.address.name}<br />{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />{order.address.city}, {order.address.state} {order.address.pincode}<br />Mobile: {order.address.phone}</p>
          <p className="mt-4 font-extrabold">Payment</p>
          <p className="mt-1 text-muted">{PAYMENT_LABELS[order.payment.method]} ({order.payment.status.replace('_', ' ')})</p>
          <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
            <div className="flex justify-between"><dt className="text-muted">Items (MRP)</dt><dd>{rupees(p.mrp)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="text-mint-700">- {rupees(p.mrp - p.selling + (p.bundleDiscount || 0) + (p.couponDiscount || 0))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{p.shipping ? rupees(p.shipping) : 'FREE'}</dd></div>
            {p.codFee > 0 && <div className="flex justify-between"><dt className="text-muted">COD fee</dt><dd>{rupees(p.codFee)}</dd></div>}
            <div className="mt-1 flex justify-between text-base font-extrabold"><dt>Total</dt><dd>{rupees(p.total)}</dd></div>
          </dl>
        </div>
      </aside>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this order?"
        footer={<div className="flex gap-3"><button type="button" onClick={() => setCancelOpen(false)} className="btn-secondary flex-1">Keep order</button><button type="button" onClick={() => { cancelOrder(order.id); setCancelOpen(false); toast('Order cancelled', 'success') }} className="btn-primary flex-1">Yes, cancel</button></div>}>
        <p className="text-sm text-muted">{order.payment.method === 'cod' ? 'Nothing was charged, so there is nothing to refund.' : `Your refund of ${rupees(p.total)} will reach your original payment method in 3 to 5 working days.`}</p>
      </Modal>
      {returnOpen && <ReturnModal order={order} product={product} onClose={() => setReturnOpen(false)} />}
    </div>
  )
}

function ReturnModal({ order, product, onClose }) {
  const requestReturn = useStore((s) => s.requestReturn)
  const [type, setType] = useState('exchange')
  const [reason, setReason] = useState(RETURN_REASONS[0])
  const [exchangeSize, setExchangeSize] = useState('')
  const [refundMode, setRefundMode] = useState('source')
  const [note, setNote] = useState('')
  const sizes = product?.sizes.filter((s) => s !== order.items[0].size) || []
  const submit = () => {
    if (type === 'exchange' && !exchangeSize) return toast('Pick the new size you need.', 'error')
    requestReturn(order.id, { type, reason, exchangeSize: type === 'exchange' ? exchangeSize : null, refundMode: type === 'return' ? refundMode : null, note, items: order.items.map((i) => i.sku) })
    toast('Request sent. We will confirm pickup within 24 hours.', 'success')
    onClose()
  }
  return (
    <Modal open onClose={onClose} title="Return or exchange" footer={<button type="button" onClick={submit} className="btn-primary w-full py-3">Submit request</button>}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-2">
          {[['exchange', 'Exchange size'], ['return', 'Return for refund']].map(([id, l]) => (
            <button key={id} type="button" onClick={() => setType(id)} className={`rounded-xl border-2 p-3 text-sm font-bold ${type === id ? 'border-ink bg-cream' : 'border-line'}`}>{l}</button>
          ))}
        </div>
        <Field label="Reason" htmlFor="r-reason">
          <select id="r-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="input">{RETURN_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
        </Field>
        {type === 'exchange' ? (
          <div>
            <p className="mb-2 text-sm font-bold">New size</p>
            <div className="flex flex-wrap gap-2">{sizes.map((s) => <button key={s} type="button" onClick={() => setExchangeSize(s)} className={`chip px-4 py-2 ${exchangeSize === s ? 'chip-active' : ''}`}>{s}</button>)}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">Refund to</p>
            {[['source', `Original payment method${order.payment.method === 'cod' ? ' (bank transfer for COD)' : ''}`], ['credit', 'Store credit (instant)']].map(([id, l]) => (
              <label key={id} className="flex items-center gap-2 text-sm"><input type="radio" checked={refundMode === id} onChange={() => setRefundMode(id)} className="accent-brand" /> {l}</label>
            ))}
          </div>
        )}
        <Field label="Anything else? (optional)" htmlFor="r-note">
          <textarea id="r-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="input resize-none" />
        </Field>
        <p className="text-xs text-muted">A courier will pick the item up from your address. Keep the tags on.</p>
      </div>
    </Modal>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const order = useStore((s) => s.orders.find((o) => o.id === id))
  const user = useStore((s) => s.user)
  const openLogin = useUI((s) => s.openLogin)
  useEffect(() => { document.title = `Order ${id} | KiDDY WiDDY` }, [id])
  if (!order) return <NotFound />
  if (!user || user.phone !== order.customer.phone) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-2xl font-bold">Log in to see this order</h1>
        <p className="mt-2 text-sm text-muted">Use the mobile number the order was placed with.</p>
        <button type="button" onClick={() => openLogin()} className="btn-primary mt-6">Login with OTP</button>
      </div>
    )
  }
  return (
    <div className="container-x pb-12 pt-6">
      <Link to="/account" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} /> My orders</Link>
      <h1 className="mb-6 mt-2 text-3xl font-extrabold">Order details</h1>
      <OrderView order={order} />
    </div>
  )
}
