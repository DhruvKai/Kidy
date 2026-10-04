import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Truck, WarningCircle } from '@phosphor-icons/react'
import { useStore } from '../store/useStore'
import { OrderView } from './OrderDetail'
import { Field } from '../components/ui'

export default function Track() {
  const [params] = useSearchParams()
  const orders = useStore((s) => s.orders)
  const [id, setId] = useState(params.get('id') || '')
  const [phone, setPhone] = useState(params.get('phone') || '')
  const [found, setFound] = useState(null)
  const [error, setError] = useState('')
  const live = found ? orders.find((o) => o.id === found) : null

  useEffect(() => { document.title = 'Track your order | KiDDY WiDDY' }, [])
  useEffect(() => { if (params.get('id') && params.get('phone')) lookup() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function lookup(e) {
    e?.preventDefault()
    const o = orders.find((x) => x.id.toUpperCase() === id.trim().toUpperCase())
    if (!o || o.customer.phone !== phone.trim()) {
      setFound(null)
      return setError('We could not find an order with that ID and mobile number.')
    }
    setError('')
    setFound(o.id)
  }

  return (
    <div className="container-x pb-12 pt-6">
      <h1 className="text-3xl font-extrabold md:text-4xl">Track your order</h1>
      <p className="mt-1 text-sm text-muted">No login needed. Use the order ID from your WhatsApp or SMS.</p>
      <form onSubmit={lookup} className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-surface p-5 shadow-soft sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Order ID" htmlFor="t-id"><input id="t-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. KW260112" className="input uppercase" /></Field>
        <Field label="Mobile number" htmlFor="t-phone"><input id="t-phone" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="input" /></Field>
        <button className="btn-primary h-[42px] px-6"><Truck size={18} /> Track</button>
      </form>
      <p className="mt-3 text-xs text-muted">Demo tip: try KW260112 with 9849456789.</p>
      {error && <p className="mt-4 flex items-center gap-2 text-sm font-bold text-coral-700"><WarningCircle size={18} /> {error}</p>}
      {live && <div className="mt-8"><OrderView order={live} actions={false} /></div>}
    </div>
  )
}
