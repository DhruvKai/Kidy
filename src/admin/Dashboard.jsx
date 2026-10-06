import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Package, ArrowUUpLeft, Warehouse, Plus, ArrowRight, Table, ChartLine } from '@phosphor-icons/react'
import { useStore } from '../store/useStore'
import { rupees, number, fmtDate, timeAgo } from '../lib/format'
import { STATUS_META } from '../lib/orders'
import { priceOf } from '../lib/pricing'
import { COMMERCE } from '../config'
import { StatusPill } from '../components/ui'
import { PageHeader } from './AdminLayout'

const INK = '#23253a'
const MUTED = '#5b5e70'
const LINE = '#e6e6ec'
const ACCENT = '#c93442'

const compactInr = (n) => (n >= 1e5 ? `₹${+(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${+(n / 1e3).toFixed(1)}K` : `₹${n}`)
const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

function StatTile({ label, value, delta, deltaLabel, to }) {
  const up = delta > 0
  const Body = (
    <>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-bold tabular-nums">{value}</p>
      {delta != null && (
        <p className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${up ? 'text-mint-700' : 'text-coral-700'}`}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {up ? '+' : ''}{delta}% <span className="font-semibold text-muted">{deltaLabel}</span>
        </p>
      )}
    </>
  )
  return to ? <Link to={to} className="rounded-2xl bg-white p-5 shadow-soft transition hover:shadow-lift">{Body}</Link> : <div className="rounded-2xl bg-white p-5 shadow-soft">{Body}</div>
}

function ChartTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <p className="font-bold text-ink">{fmtDate(d.date)}</p>
      <p className="mt-1 flex items-center gap-1.5 text-muted">
        <span className="h-2 w-2 rounded-full" style={{ background: ACCENT }} />
        {metric === 'sales' ? rupees(d.sales) : `${d.orders} orders`}
      </p>
      <p className="text-muted">{metric === 'sales' ? `${d.orders} orders` : rupees(d.sales)}</p>
    </div>
  )
}

export default function Dashboard() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const history = useStore((s) => s.salesHistory)
  const [metric, setMetric] = useState('sales')
  const [range, setRange] = useState(30)
  const [asTable, setAsTable] = useState(false)
  useEffect(() => { document.title = 'Dashboard | Kidy admin' }, [])

  // Sample history plus anything placed during the demo, bucketed by day.
  const series = useMemo(() => {
    const extra = {}
    for (const o of orders) {
      if (!o.placedInDemo || o.status === 'cancelled') continue
      const k = dayKey(o.createdAt)
      extra[k] = extra[k] || { sales: 0, orders: 0 }
      extra[k].sales += o.pricing.total
      extra[k].orders += 1
    }
    return history.map((d) => ({
      ...d,
      sales: d.sales + (extra[d.date]?.sales || 0),
      orders: d.orders + (extra[d.date]?.orders || 0),
      label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    }))
  }, [history, orders])

  const shown = series.slice(-range)
  const sum = (arr, k) => arr.reduce((s, d) => s + d[k], 0)
  const today = series[series.length - 1]
  const yesterday = series[series.length - 2]
  const week = series.slice(-7)
  const prevWeek = series.slice(-14, -7)
  const pct = (a, b) => (b ? Math.round(((a - b) / b) * 100) : 0)
  const aov = sum(series, 'sales') / Math.max(1, sum(series, 'orders'))
  const toShip = orders.filter((o) => ['placed', 'confirmed', 'packed'].includes(o.status)).length
  const newOrders = orders.filter((o) => o.status === 'placed').length
  const returns = orders.filter((o) => o.status === 'return_requested').length
  const lowStock = products.reduce((n, p) => n + p.variants.filter((v) => v.stock <= COMMERCE.lowStockThreshold).length, 0)
  const top = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5)
  const hour = new Date().getHours()

  return (
    <div>
      <PageHeader
        title={hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}
        subtitle={`Here is how the store is doing today, ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.`}
        actions={<Link to="/admin/products/new" className="btn-primary"><Plus size={16} /> Add product</Link>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="Sales today" value={rupees(today.sales)} delta={pct(today.sales, yesterday.sales)} deltaLabel="vs yesterday" />
        <StatTile label="Orders this week" value={number(sum(week, 'orders'))} delta={pct(sum(week, 'orders'), sum(prevWeek, 'orders'))} deltaLabel="vs last week" />
        <StatTile label="Average order value" value={rupees(aov)} />
        <StatTile label="Waiting to ship" value={toShip} to="/admin/orders" />
      </div>

      {(newOrders > 0 || returns > 0 || lowStock > 0) && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {newOrders > 0 && <Attention to="/admin/orders?tab=placed" icon={Package} text={`${newOrders} new ${newOrders === 1 ? 'order' : 'orders'} to confirm`} tone="bg-coral-50 text-coral-700" />}
          {returns > 0 && <Attention to="/admin/returns" icon={ArrowUUpLeft} text={`${returns} return ${returns === 1 ? 'request' : 'requests'} to review`} tone="bg-lilac-100 text-lilac-600" />}
          {lowStock > 0 && <Attention to="/admin/inventory" icon={Warehouse} text={`${lowStock} sizes low or out of stock`} tone="bg-sunny-100 text-sunny-700" />}
        </div>
      )}

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-soft md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{metric === 'sales' ? 'Daily sales' : 'Daily orders'}, last {range} days</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full bg-cream p-1" role="group" aria-label="Metric">
              {[['sales', 'Sales'], ['orders', 'Orders']].map(([id, l]) => (
                <button key={id} type="button" onClick={() => setMetric(id)} aria-pressed={metric === id} className={`rounded-full px-3 py-1 text-xs font-bold ${metric === id ? 'bg-white shadow-soft' : 'text-muted'}`}>{l}</button>
              ))}
            </div>
            <div className="inline-flex rounded-full bg-cream p-1" role="group" aria-label="Date range">
              {[7, 30].map((r) => (
                <button key={r} type="button" onClick={() => setRange(r)} aria-pressed={range === r} className={`rounded-full px-3 py-1 text-xs font-bold ${range === r ? 'bg-white shadow-soft' : 'text-muted'}`}>{r} days</button>
              ))}
            </div>
            <button type="button" onClick={() => setAsTable((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold" aria-pressed={asTable}>
              {asTable ? <ChartLine size={14} /> : <Table size={14} />} {asTable ? 'Chart' : 'Table'}
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted">{rupees(sum(shown, 'sales'))} from {number(sum(shown, 'orders'))} orders. History is sample data; orders placed in this demo are added on top.</p>

        {asTable ? (
          <div className="mt-4 max-h-72 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-xs text-muted"><tr><th className="py-2 font-bold">Date</th><th className="py-2 text-right font-bold">Orders</th><th className="py-2 text-right font-bold">Sales</th></tr></thead>
              <tbody>{[...shown].reverse().map((d) => <tr key={d.date} className="border-t border-line"><td className="py-2">{fmtDate(d.date)}</td><td className="py-2 text-right tabular-nums">{d.orders}</td><td className="py-2 text-right tabular-nums">{rupees(d.sales)}</td></tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 h-64 md:h-72" role="img" aria-label={`${metric} over the last ${range} days`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shown} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={LINE} strokeWidth={1} />
                <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 12 }} axisLine={{ stroke: LINE }} tickLine={false} minTickGap={28} />
                <YAxis tickFormatter={metric === 'sales' ? compactInr : (n) => n} tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<ChartTooltip metric={metric} />} cursor={{ stroke: INK, strokeWidth: 1 }} />
                <Area type="monotone" dataKey={metric} stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill={ACCENT} fillOpacity={0.1} dot={false} activeDot={{ r: 5, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl bg-white p-5 shadow-soft md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent orders</h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-bold text-coral-700">All orders <ArrowRight size={14} /></Link>
          </div>
          <ul className="flex flex-col">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id}>
                <Link to={`/admin/orders/${o.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-cream">
                  <img src={o.items[0].image} alt="" className="h-11 w-9 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{o.customer.name} <span className="font-semibold text-muted">{o.address.city}</span></p>
                    <p className="text-xs text-muted">{o.id}, {timeAgo(o.createdAt)}</p>
                  </div>
                  <span className="hidden text-sm font-bold tabular-nums sm:block">{rupees(o.pricing.total)}</span>
                  <StatusPill tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</StatusPill>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-soft md:p-6">
          <h2 className="mb-3 text-lg font-bold">Top sellers</h2>
          <ol className="flex flex-col gap-3">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-4 text-sm font-extrabold text-muted">{i + 1}</span>
                <img src={p.images[0]} alt="" className="h-11 w-9 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.title}</p>
                  <p className="text-xs text-muted">{number(p.sold)} sold, {compactInr(p.sold * priceOf(p))} revenue</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

function Attention({ to, icon: Icon, text, tone }) {
  return (
    <Link to={to} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition hover:brightness-95 ${tone}`}>
      <Icon size={20} /> <span className="flex-1">{text}</span> <ArrowRight size={16} />
    </Link>
  )
}
