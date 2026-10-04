import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, UploadSimple, MagnifyingGlass, PencilSimple, Copy, Eye, Trash, DownloadSimple } from '@phosphor-icons/react'
import Papa from 'papaparse'
import { useStore, toast } from '../store/useStore'
import { CATEGORIES, asset } from '../data/catalog'
import { totalStock } from '../lib/pricing'
import { rupees } from '../lib/format'
import { COMMERCE } from '../config'
import { Modal, EmptyState } from '../components/ui'
import { PageHeader } from './AdminLayout'

const STATUS = {
  published: 'bg-mint-100 text-mint-700',
  draft: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-ocean-100 text-ocean-700',
}

export function downloadCsv(name, rows) {
  const blob = new Blob([Papa.unparse(rows)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default function ProductList() {
  const navigate = useNavigate()
  const products = useStore((s) => s.products)
  const setProductStatus = useStore((s) => s.setProductStatus)
  const duplicateProduct = useStore((s) => s.duplicateProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [status, setStatus] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  useEffect(() => { document.title = 'Products | KiDDY WiDDY admin' }, [])

  const list = useMemo(() => products.filter((p) =>
    (!cat || p.category === cat) && (!status || p.status === status) &&
    (!q || `${p.title} ${p.code} ${p.sub}`.toLowerCase().includes(q.toLowerCase()))), [products, q, cat, status])

  const exportCsv = () => downloadCsv('kiddy-widdy-catalogue.csv', products.map((p) => ({
    code: p.code, title: p.title, category: p.category, subcategory: p.sub, mrp: p.mrp, price: p.price,
    sizes: p.sizes.join('|'), colours: p.colours.join('|'), total_stock: totalStock(p), status: p.status,
  })))

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products, ${products.filter((p) => p.status === 'published').length} live on the store`}
        actions={<>
          <button type="button" onClick={exportCsv} className="btn-secondary"><DownloadSimple size={16} /> Export</button>
          <Link to="/admin/products/bulk" className="btn-secondary"><UploadSimple size={16} /> Bulk upload</Link>
          <Link to="/admin/products/new" className="btn-primary"><Plus size={16} /> Add product</Link>
        </>}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or code" aria-label="Search products" className="input pl-10" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="input sm:w-44">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="input sm:w-40">
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {!list.length ? (
        <EmptyState icon={MagnifyingGlass} title="No products found" body="Try another search, or add a new product." action={<Link to="/admin/products/new" className="btn-primary">Add product</Link>} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-cream text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-bold">Product</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 text-right font-bold">Price</th>
                  <th className="px-4 py-3 text-right font-bold">Stock</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const stock = totalStock(p)
                  return (
                    <tr key={p.id} className="border-t border-line hover:bg-cream/60">
                      <td className="px-4 py-3">
                        <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="h-12 w-10 shrink-0 rounded-lg object-cover" />
                          <span className="min-w-0"><span className="block max-w-[260px] truncate font-bold">{p.title}</span><span className="text-xs text-muted">{p.code}, {p.variants.length} variants</span></span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">{CATEGORIES.find((c) => c.slug === p.category)?.name}, {p.sub}</td>
                      <td className="px-4 py-3 text-right tabular-nums"><b>{rupees(p.price)}</b><span className="block text-xs text-muted line-through">{rupees(p.mrp)}</span></td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={stock === 0 ? 'font-bold text-coral-700' : stock <= COMMERCE.lowStockThreshold * 2 ? 'font-bold text-sunny-700' : ''}>{stock === 0 ? 'Out of stock' : stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input type="checkbox" className="peer sr-only" checked={p.status === 'published'} onChange={(e) => { setProductStatus(p.id, e.target.checked ? 'published' : 'draft'); toast(e.target.checked ? 'Product is live' : 'Product hidden from store', 'success') }} />
                          <span className="relative h-5 w-9 rounded-full bg-line transition peer-checked:bg-mint-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${STATUS[p.status]}`}>{p.status}</span>
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/admin/products/${p.id}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" title="Edit" aria-label={`Edit ${p.title}`}><PencilSimple size={17} /></Link>
                          <button type="button" onClick={() => { const id = duplicateProduct(p.id); toast('Copy created as draft', 'success'); navigate(`/admin/products/${id}`) }} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" title="Duplicate" aria-label={`Duplicate ${p.title}`}><Copy size={17} /></button>
                          <a href={asset(`p/${p.slug}`)} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" title="View on store" aria-label={`View ${p.title} on store`}><Eye size={17} /></a>
                          <button type="button" onClick={() => setConfirmDelete(p)} className="grid h-9 w-9 place-items-center rounded-full text-coral-700 hover:bg-coral-50" title="Delete" aria-label={`Delete ${p.title}`}><Trash size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete product?"
        footer={<div className="flex gap-3"><button type="button" onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button><button type="button" onClick={() => { deleteProduct(confirmDelete.id); setConfirmDelete(null); toast('Product deleted', 'success') }} className="btn-primary flex-1">Delete</button></div>}>
        <p className="text-sm text-muted">{confirmDelete?.title} will be removed from the store. Past orders keep their details. Tip: switch it to draft instead if you might sell it again.</p>
      </Modal>
    </div>
  )
}
