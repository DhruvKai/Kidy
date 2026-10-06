import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlass, DownloadSimple, WhatsappLogo } from '@phosphor-icons/react'
import { useStore } from '../store/useStore'
import { rupees, fmtDate, maskPhone } from '../lib/format'
import { PageHeader } from './AdminLayout'
import { downloadCsv } from './ProductList'

export default function Customers() {
  const orders = useStore((s) => s.orders)
  const [q, setQ] = useState('')
  useEffect(() => { document.title = 'Customers | Kidy admin' }, [])

  const customers = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      const c = map.get(o.customer.phone) || { ...o.customer, city: o.address.city, state: o.address.state, orders: 0, spent: 0, cod: 0, last: o.createdAt }
      c.orders += 1
      if (o.status !== 'cancelled') c.spent += o.pricing.total
      if (o.payment.method === 'cod') c.cod += 1
      if (new Date(o.createdAt) > new Date(c.last)) c.last = o.createdAt
      map.set(o.customer.phone, c)
    }
    return [...map.values()].map((c) => ({
      ...c,
      tags: [c.orders > 1 && 'Repeat buyer', c.spent >= 3000 && 'High value', c.cod > 0 && c.cod === c.orders && 'COD only'].filter(Boolean),
    })).sort((a, b) => b.spent - a.spent)
  }, [orders])

  const list = customers.filter((c) => !q || `${c.name} ${c.phone} ${c.city}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customers. Tag them for WhatsApp campaigns and festive offers.`}
        actions={<button type="button" onClick={() => downloadCsv('kidy-customers.csv', customers.map((c) => ({ name: c.name, phone: c.phone, email: c.email, city: c.city, state: c.state, orders: c.orders, total_spent: c.spent, last_order: c.last.slice(0, 10), tags: c.tags.join('|') })))} className="btn-secondary"><DownloadSimple size={16} /> Export CSV</button>}
      />
      <div className="relative mb-4">
        <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or city" aria-label="Search customers" className="input pl-10" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cream text-xs text-muted"><tr><th className="px-4 py-3 font-bold">Customer</th><th className="px-4 py-3 font-bold">Location</th><th className="px-4 py-3 text-right font-bold">Orders</th><th className="px-4 py-3 text-right font-bold">Spent</th><th className="px-4 py-3 font-bold">Last order</th><th className="px-4 py-3 font-bold">Tags</th><th className="px-4 py-3" /></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.phone} className="border-t border-line">
                  <td className="px-4 py-3"><span className="font-bold">{c.name}</span><span className="block text-xs text-muted">{maskPhone(c.phone)}</span></td>
                  <td className="px-4 py-3 text-muted">{c.city}, {c.state}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.orders}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{rupees(c.spent)}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(c.last)}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{c.tags.map((t) => <span key={t} className="rounded-full bg-ocean-50 px-2 py-0.5 text-[11px] font-bold text-ocean-700">{t}</span>)}</div></td>
                  <td className="px-4 py-3 text-right"><a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${c.name}`} className="grid h-9 w-9 place-items-center rounded-full text-[#126b38] hover:bg-[#e7f7ee]"><WhatsappLogo size={18} weight="fill" /></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
