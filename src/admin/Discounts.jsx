import { useEffect, useState } from 'react'
import { Plus, Trash, Tag, Lightning, Truck, Package } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { BUNDLE } from '../data/coupons'
import { DEAL_PRICES } from '../data/products'
import { COMMERCE } from '../config'
import { rupees } from '../lib/format'
import { Modal, Field } from '../components/ui'
import { PageHeader } from './AdminLayout'

const EMPTY = { code: '', type: 'percent', value: '', maxDiscount: '', minOrder: '', onlyTag: '', expiresAt: '' }

export default function Discounts() {
  const coupons = useStore((s) => s.coupons)
  const products = useStore((s) => s.products)
  const addCoupon = useStore((s) => s.addCoupon)
  const toggleCoupon = useStore((s) => s.toggleCoupon)
  const deleteCoupon = useStore((s) => s.deleteCoupon)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  useEffect(() => { document.title = 'Discounts | KiDDY WiDDY admin' }, [])
  const deals = products.filter((p) => DEAL_PRICES[p.id])

  const save = (e) => {
    e.preventDefault()
    const er = {}
    if (!/^[A-Z0-9]{3,15}$/.test(form.code)) er.code = 'Use 3 to 15 letters or numbers, no spaces.'
    if (!Number(form.value)) er.value = 'Enter a value.'
    if (form.type === 'percent' && Number(form.value) > 90) er.value = 'Keep it at 90% or less.'
    setErrors(er)
    if (Object.keys(er).length) return
    const v = Number(form.value)
    const desc = form.type === 'percent'
      ? `${v}% off${form.onlyTag ? ' Festive Edit styles' : ''}${form.minOrder ? ` above ₹${form.minOrder}` : ''}${form.maxDiscount ? ` (up to ₹${form.maxDiscount})` : ''}`
      : `₹${v} off${form.onlyTag ? ' Festive Edit styles' : ''}${form.minOrder ? ` on orders above ₹${form.minOrder}` : ''}`
    addCoupon({
      code: form.code, type: form.type, value: v, maxDiscount: Number(form.maxDiscount) || null, minOrder: Number(form.minOrder) || 0,
      onlyTag: form.onlyTag || null, expiresAt: form.expiresAt || null, description: desc,
    })
    toast(`${form.code} is live. Customers can use it now.`, 'success')
    setOpen(false)
    setForm(EMPTY)
  }

  return (
    <div>
      <PageHeader title="Discounts" subtitle="Coupons, automatic offers and daily deals." actions={<button type="button" onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Create coupon</button>} />

      <section className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream text-xs text-muted"><tr><th className="px-4 py-3 font-bold">Code</th><th className="px-4 py-3 font-bold">Offer</th><th className="px-4 py-3 text-right font-bold">Times used</th><th className="px-4 py-3 font-bold">Active</th><th className="px-4 py-3" /></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-t border-line">
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-coral-400 px-2 py-1 font-mono text-xs font-bold text-coral-700"><Tag size={12} /> {c.code}</span></td>
                  <td className="px-4 py-3 text-muted">{c.description}{c.expiresAt ? `. Ends ${new Date(c.expiresAt).toLocaleDateString('en-IN')}` : ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.uses}</td>
                  <td className="px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" checked={c.active} onChange={() => toggleCoupon(c.code)} aria-label={`${c.code} active`} />
                      <span className="relative h-5 w-9 rounded-full bg-line transition peer-checked:bg-mint-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
                    </label>
                  </td>
                  <td className="px-4 py-3 text-right"><button type="button" onClick={() => { deleteCoupon(c.code); toast(`${c.code} deleted`) }} className="grid h-9 w-9 place-items-center rounded-full text-coral-700 hover:bg-coral-50" aria-label={`Delete ${c.code}`}><Trash size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <h2 className="mb-3 mt-8 text-xl font-bold">Automatic offers</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <Package size={24} className="text-coral-600" />
          <p className="mt-2 font-bold">{BUNDLE.name}</p>
          <p className="text-sm text-muted">Applies on its own in the bag for any {BUNDLE.subs.join(' or ').toLowerCase()}.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <Truck size={24} className="text-coral-600" />
          <p className="mt-2 font-bold">Free shipping above ₹{COMMERCE.freeShippingThreshold}</p>
          <p className="text-sm text-muted">Below that, ₹{COMMERCE.shippingFee} is added. A progress bar in the bag nudges customers to add more.</p>
        </div>
        <div className="rounded-2xl bg-sunny-50 p-5 shadow-soft">
          <Lightning size={24} weight="fill" className="text-sunny-500" />
          <p className="mt-2 font-bold">Deals of the day ({deals.length})</p>
          <p className="text-sm text-muted">Real timer, ends at midnight every day.</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-xs">
            {deals.map((p) => <li key={p.id} className="flex justify-between gap-2"><span className="truncate">{p.title}</span><b className="shrink-0">{rupees(DEAL_PRICES[p.id])}</b></li>)}
          </ul>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create a coupon" footer={<button type="submit" form="coupon-form" className="btn-primary w-full py-3">Create coupon</button>}>
        <form id="coupon-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" htmlFor="c-code" error={errors.code} className="sm:col-span-2">
            <input id="c-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '') })} placeholder="e.g. DIWALI20" className="input font-mono uppercase" />
          </Field>
          <Field label="Type" htmlFor="c-type">
            <select id="c-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input"><option value="percent">Percentage off</option><option value="flat">Flat amount off</option></select>
          </Field>
          <Field label={form.type === 'percent' ? 'Percent off' : 'Amount off (₹)'} htmlFor="c-val" error={errors.value}>
            <input id="c-val" inputMode="numeric" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.replace(/\D/g, '') })} className="input" />
          </Field>
          {form.type === 'percent' && (
            <Field label="Maximum discount (₹)" htmlFor="c-max" hint="Optional">
              <input id="c-max" inputMode="numeric" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value.replace(/\D/g, '') })} className="input" />
            </Field>
          )}
          <Field label="Minimum order (₹)" htmlFor="c-min" hint="Optional">
            <input id="c-min" inputMode="numeric" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value.replace(/\D/g, '') })} className="input" />
          </Field>
          <Field label="Applies to" htmlFor="c-tag">
            <select id="c-tag" value={form.onlyTag} onChange={(e) => setForm({ ...form, onlyTag: e.target.value })} className="input"><option value="">Everything</option><option value="festive">Festive Edit only</option></select>
          </Field>
          <Field label="Ends on" htmlFor="c-exp" hint="Optional">
            <input id="c-exp" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="input" />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
