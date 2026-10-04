import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, WhatsappLogo, Receipt, Truck } from '@phosphor-icons/react'
import { useStore } from '../store/useStore'
import { checkPincode } from '../lib/delivery'
import { rupees, fmtDay } from '../lib/format'
import { PAYMENT_LABELS } from '../lib/orders'
import NotFound from './NotFound'

export default function OrderSuccess() {
  const { id } = useParams()
  const order = useStore((s) => s.orders.find((o) => o.id === id))
  const user = useStore((s) => s.user)
  useEffect(() => { document.title = 'Order placed | KiDDY WiDDY' }, [])
  if (!order) return <NotFound />
  const eta = checkPincode(order.address.pincode)
  const trackTo = user && user.phone === order.customer.phone ? `/account/orders/${order.id}` : `/track?id=${order.id}&phone=${order.customer.phone}`

  return (
    <div className="container-x max-w-3xl py-10">
      <div className="flex flex-col items-center text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-mint-100 text-mint-600 animate-[pop_.5s_ease-out]"><CheckCircle size={48} weight="fill" /></span>
        <h1 className="mt-5 text-3xl font-extrabold md:text-4xl">Thank you, your order is placed</h1>
        <p className="mt-2 text-muted">Order <b className="text-ink">{order.id}</b>{eta.ok ? <> arrives by <b className="text-ink">{fmtDay(eta.date)}</b></> : ''}.</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-mint-50 px-4 py-2 text-sm font-semibold text-mint-700">
          <WhatsappLogo size={18} weight="fill" /> Updates will come on WhatsApp to +91 {order.customer.phone}
        </p>
      </div>

      <div className="mt-8 rounded-2xl bg-surface p-5 shadow-soft md:p-6">
        <ul className="flex flex-col gap-3">
          {order.items.map((i) => (
            <li key={i.sku + i.size} className="flex items-center gap-3">
              <img src={i.image} alt="" className="h-16 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-bold">{i.title}</p>
                <p className="text-xs text-muted">Size {i.size}, {i.colour}, Qty {i.qty}</p>
              </div>
              <span className="text-sm font-bold">{rupees(i.unitPrice * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
          <div>
            <p className="font-extrabold">Delivering to</p>
            <p className="mt-1 text-muted">{order.address.name}, {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} {order.address.pincode}</p>
          </div>
          <div>
            <p className="font-extrabold">Payment</p>
            <p className="mt-1 text-muted">{PAYMENT_LABELS[order.payment.method]}: {order.payment.method === 'cod' ? `pay ${rupees(order.pricing.total)} at delivery` : `${rupees(order.pricing.total)} paid`}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to={trackTo} className="btn-primary px-6 py-3"><Truck size={18} /> Track order</Link>
        <Link to={`/invoice/${order.id}`} target="_blank" className="btn-secondary px-6 py-3"><Receipt size={18} /> GST invoice</Link>
        <Link to="/" className="btn-ghost px-6 py-3">Continue shopping</Link>
      </div>
    </div>
  )
}
