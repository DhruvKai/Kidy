import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, Minus, Plus, Warehouse } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { COMMERCE } from '../config'
import { number } from '../lib/format'
import { Swatch, EmptyState } from '../components/ui'
import { PageHeader } from './AdminLayout'

export default function Inventory() {
  const products = useStore((s) => s.products)
  const settings = useStore((s) => s.settings)
  const setSetting = useStore((s) => s.setSetting)
  const setVariantStock = useStore((s) => s.setVariantStock)
  const [view, setView] = useState('low')
  const [q, setQ] = useState('')
  useEffect(() => { document.title = 'Inventory | KiDDY WiDDY admin' }, [])

  const rows = useMemo(() => products.flatMap((p) => p.variants.map((v) => ({ ...v, product: p }))), [products])
  const low = rows.filter((r) => r.stock > 0 && r.stock <= COMMERCE.lowStockThreshold)
  const out = rows.filter((r) => r.stock === 0)
  const units = rows.reduce((n, r) => n + r.stock, 0)
  const list = (view === 'low' ? [...out, ...low] : view === 'out' ? out : rows)
    .filter((r) => !q || `${r.product.title} ${r.sku}`.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 200)

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock for every size and colour. Out-of-stock items can hide from the store on their own." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[['Variants (SKUs)', number(rows.length)], ['Units in stock', number(units)], ['Running low', low.length], ['Out of stock', out.length]].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-white p-4 shadow-soft"><p className="text-sm font-semibold text-muted">{l}</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{v}</p></div>
        ))}
      </div>

      <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-soft">
        <span className="text-sm"><b>Hide sold-out products from the store</b><span className="block text-xs text-muted">They come back automatically when you add stock.</span></span>
        <input type="checkbox" className="peer sr-only" checked={settings.autoHideOutOfStock} onChange={(e) => { setSetting('autoHideOutOfStock', e.target.checked); toast(e.target.checked ? 'Sold-out products are hidden' : 'Sold-out products are visible', 'success') }} />
        <span className="relative h-6 w-11 shrink-0 rounded-full bg-line transition peer-checked:bg-mint-600 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {[['low', `Needs attention (${low.length + out.length})`], ['out', `Out of stock (${out.length})`], ['all', 'All']].map(([id, l]) => (
            <button key={id} type="button" onClick={() => setView(id)} className={`chip shrink-0 px-4 py-2 ${view === id ? 'chip-active' : ''}`}>{l}</button>
          ))}
        </div>
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product or SKU" aria-label="Search inventory" className="input pl-10" />
        </div>
      </div>

      {!list.length ? (
        <EmptyState icon={Warehouse} title="All stocked up" body="Nothing is running low right now." />
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-cream text-xs text-muted"><tr><th className="px-4 py-3 font-bold">Product</th><th className="px-4 py-3 font-bold">Variant</th><th className="px-4 py-3 font-bold">SKU</th><th className="px-4 py-3 text-right font-bold">Stock</th></tr></thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.sku} className="border-t border-line">
                    <td className="px-4 py-2.5"><Link to={`/admin/products/${r.product.id}`} className="flex items-center gap-3"><img src={r.product.images[0]} alt="" className="h-10 w-8 rounded-md object-cover" /><span className="max-w-[220px] truncate font-semibold">{r.product.title}</span></Link></td>
                    <td className="px-4 py-2.5"><span className="inline-flex items-center gap-2"><Swatch colour={r.colour} size="sm" /> {r.size}, {r.colour}</span></td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted">{r.sku}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        {r.stock === 0 ? <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[11px] font-bold text-coral-700">Out</span> : r.stock <= COMMERCE.lowStockThreshold ? <span className="rounded-full bg-sunny-100 px-2 py-0.5 text-[11px] font-bold text-sunny-700">Low</span> : null}
                        <div className="inline-flex items-center rounded-full border border-line">
                          <button type="button" onClick={() => setVariantStock(r.product.id, r.sku, r.stock - 1)} disabled={r.stock === 0} className="grid h-8 w-8 place-items-center rounded-l-full hover:bg-ink/5 disabled:opacity-30" aria-label={`Decrease ${r.sku}`}><Minus size={12} /></button>
                          <input value={r.stock} inputMode="numeric" onChange={(e) => setVariantStock(r.product.id, r.sku, Number(e.target.value.replace(/\D/g, '')) || 0)} className="w-12 bg-transparent text-center text-sm font-bold outline-none" aria-label={`Stock for ${r.sku}`} />
                          <button type="button" onClick={() => setVariantStock(r.product.id, r.sku, r.stock + 1)} className="grid h-8 w-8 place-items-center rounded-r-full hover:bg-ink/5" aria-label={`Increase ${r.sku}`}><Plus size={12} /></button>
                        </div>
                        <button type="button" onClick={() => { setVariantStock(r.product.id, r.sku, r.stock + 20); toast(`Added 20 units to ${r.sku}`, 'success') }} className="text-xs font-bold text-coral-700">+20</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
