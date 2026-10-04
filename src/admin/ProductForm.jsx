import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, UploadSimple, Sparkle, Trash, Star, Timer, CheckCircle, Image as ImageIcon, CaretLeft, CaretRight, WarningCircle } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { CATEGORIES, COLOURS, SIZE_ORDER, FABRICS, OCCASIONS, BRANDS, HSN_BY_SUB, img, asset } from '../data/catalog'
import { compressImage } from '../lib/image'
import { gstRateFor } from '../lib/pricing'
import { bytes, rupees } from '../lib/format'
import { Field, Swatch, Modal } from '../components/ui'

const SIZES_BY_CAT = {
  newborn: ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M'],
  footwear: SIZE_ORDER.slice(0, 10),
  accessories: ['Free Size', ...SIZE_ORDER.slice(0, 13)],
  boys: SIZE_ORDER.slice(3, 13),
  girls: SIZE_ORDER.slice(3, 13),
}
const PRESETS = [
  { label: 'Babies 0-12M', sizes: ['0-3M', '3-6M', '6-12M'] },
  { label: 'Toddlers 1-4Y', sizes: ['12-18M', '18-24M', '2-3Y', '3-4Y'] },
  { label: 'Kids 4-8Y', sizes: ['4-5Y', '5-6Y', '6-8Y'] },
  { label: 'Big kids 8-14Y', sizes: ['8-10Y', '10-12Y', '12-14Y'] },
]
const LOCAL_SAMPLES = ['3771676', '38407556', '30683087', '32071161', '5560013', '37101826', '18820105', '8421969'].map(img)
const DEFAULT_CARE = {
  footwear: ['Wipe clean with a damp cloth', 'Air dry away from direct sunlight'],
  accessories: ['Wipe clean with a soft damp cloth'],
  default: ['Machine wash cold, gentle cycle', 'Do not bleach', 'Line dry in shade', 'Warm iron if needed'],
}
const MANUFACTURER = 'KiDDY WiDDY Retail, Tiruppur, Tamil Nadu (demo)'

const key = (size, colour) => `${size}|${colour}`
const sortSizes = (list) => [...list].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))

function blank() {
  return {
    title: '', description: '', keywords: '', mrp: '', price: '', category: '', sub: '', gender: 'unisex',
    brand: BRANDS[0], fabric: 'Cotton', occasion: 'Casual', tags: ['new'], sizes: [], colours: [], stock: {},
    images: [], weight: '', hsn: '', countryOfOrigin: 'India', manufacturer: MANUFACTURER, status: 'published', publishAt: '',
  }
}
function fromProduct(p) {
  return {
    ...blank(), ...p, mrp: String(p.mrp), price: String(p.price), weight: String(p.weight), keywords: '',
    stock: Object.fromEntries(p.variants.map((v) => [key(v.size, v.colour), String(v.stock)])),
    images: p.images.map((src) => ({ src, existing: true })),
    publishAt: p.publishAt || '',
  }
}

function Card({ title, children, aside }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-soft md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export default function ProductForm() {
  const { id } = useParams()
  const products = useStore((s) => s.products)
  const upsertProduct = useStore((s) => s.upsertProduct)
  const nextProductNumber = useStore((s) => s.nextProductNumber)
  const editing = id ? products.find((p) => p.id === id) : null
  const [number] = useState(() => (editing ? Number(editing.id.replace('kw', '')) : nextProductNumber()))
  const code = editing?.code || `KW-${number}`
  const [form, setForm] = useState(() => (editing ? fromProduct(editing) : blank()))
  const [errors, setErrors] = useState({})
  const [hsnTouched, setHsnTouched] = useState(!!editing)
  const [uploading, setUploading] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [bulkStock, setBulkStock] = useState('10')
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(null)
  const [startedAt] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const fileRef = useRef(null)
  const typer = useRef(null)

  useEffect(() => { document.title = `${editing ? 'Edit' : 'Add'} product | KiDDY WiDDY admin` }, [editing])
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => { clearInterval(t); clearInterval(typer.current) }
  }, [startedAt])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const cat = CATEGORIES.find((c) => c.slug === form.category)
  const sizeOptions = SIZES_BY_CAT[form.category] || SIZE_ORDER.slice(0, 13)
  const variants = useMemo(() => form.colours.flatMap((c) => sortSizes(form.sizes).map((s) => ({
    size: s, colour: c, sku: `${code}-${s.replace(/[^0-9A-Z]/gi, '')}-${c.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase()}`, stock: form.stock[key(s, c)] ?? '',
  }))), [form.colours, form.sizes, form.stock, code])
  const totalUnits = variants.reduce((n, v) => n + (Number(v.stock) || 0), 0)
  const mrp = Number(form.mrp) || 0
  const price = Number(form.price) || 0
  const discount = mrp && price && price < mrp ? Math.round((1 - price / mrp) * 100) : 0
  const gst = price ? gstRateFor(price, form.hsn) : null
  const mm = String(Math.floor(elapsed / 60)).padStart(1, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  const onCategory = (slug) => {
    const keepSizes = form.sizes.filter((s) => (SIZES_BY_CAT[slug] || []).includes(s))
    set({ category: slug, sub: '', sizes: keepSizes, gender: slug === 'boys' ? 'boys' : slug === 'girls' ? 'girls' : form.gender, weight: form.weight || String(slug === 'footwear' ? 350 : slug === 'newborn' ? 180 : 260) })
  }
  const onSub = (sub) => set({ sub, hsn: hsnTouched ? form.hsn : HSN_BY_SUB[sub] || '' })
  const toggle = (field, value) => set({ [field]: form[field].includes(value) ? form[field].filter((v) => v !== value) : [...form[field], value] })

  const onFiles = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, Math.max(0, 8 - form.images.length))
    if (!list.length) return toast(form.images.length >= 8 ? 'Up to 8 photos per product.' : 'Please choose image files.', 'error')
    setUploading(list.length)
    for (const f of list) {
      try {
        const r = await compressImage(f)
        setForm((prev) => ({ ...prev, images: [...prev.images, { src: r.dataUrl, name: f.name, originalBytes: r.originalBytes, compressedBytes: r.compressedBytes }] }))
      } catch {
        toast(`Could not read ${f.name}`, 'error')
      }
      setUploading((n) => n - 1)
    }
  }
  const addSample = (src) => {
    if (form.images.length >= 8) return
    set({ images: [...form.images, { src, sample: true }] })
  }
  const moveImage = (i, d) => {
    const imgs = [...form.images]
    const j = i + d
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    set({ images: imgs })
  }

  const writeDescription = () => {
    const kw = form.keywords.split(',').map((s) => s.trim()).filter(Boolean)
    const sizes = sortSizes(form.sizes)
    const kwText = kw.length ? ` with ${kw.length > 1 ? `${kw.slice(0, -1).join(', ')} and ${kw[kw.length - 1]}` : kw[0]}` : ''
    const text = `${form.title || 'This piece'} is made in soft, breathable ${form.fabric.toLowerCase()}${kwText}. `
      + `It is easy to put on and gentle on skin, so it works from morning play to evening plans. `
      + `A great pick for ${form.occasion.toLowerCase()} days${sizes.length ? `, available in sizes ${sizes[0]} to ${sizes[sizes.length - 1]}` : ''}.`
    clearInterval(typer.current)
    setTyping(true)
    let i = 0
    set({ description: '' })
    typer.current = setInterval(() => {
      i += 3
      setForm((f) => ({ ...f, description: text.slice(0, i) }))
      if (i >= text.length) { clearInterval(typer.current); setTyping(false) }
    }, 16)
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Give the product a name.'
    if (!mrp) e.mrp = 'Enter the MRP.'
    if (!price) e.price = 'Enter the selling price.'
    else if (price > mrp) e.price = 'Selling price cannot be more than MRP.'
    if (!form.category) e.category = 'Choose a category.'
    if (!form.sub) e.sub = 'Choose a type.'
    if (!form.sizes.length) e.sizes = 'Tick at least one size.'
    if (!form.colours.length) e.colours = 'Pick at least one colour.'
    if (!form.images.length) e.images = 'Add at least one photo.'
    if (form.status === 'scheduled' && !form.publishAt) e.publishAt = 'Pick a date and time.'
    setErrors(e)
    if (Object.keys(e).length) {
      toast('A few details are missing.', 'error')
      setTimeout(() => document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
      return false
    }
    return true
  }

  const save = () => {
    if (!validate()) return
    const slug = editing?.slug || `${form.title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${number}`
    const product = {
      ...(editing || { rating: 0, reviewCount: 0, sold: 0, createdDaysAgo: 0 }),
      id: `kw${number}`, code, slug,
      title: form.title.trim(), description: form.description.trim() || `${form.title.trim()} in soft ${form.fabric.toLowerCase()}.`,
      brand: form.brand, category: form.category, sub: form.sub, gender: form.gender,
      sizes: sortSizes(form.sizes), colours: form.colours, fabric: form.fabric, occasion: form.occasion, tags: form.tags,
      mrp, price, images: form.images.map((i) => i.src),
      variants: variants.map((v) => ({ sku: v.sku, size: v.size, colour: v.colour, stock: Number(v.stock) || 0 })),
      hsn: form.hsn || HSN_BY_SUB[form.sub] || '6209', weight: Number(form.weight) || 250,
      countryOfOrigin: form.countryOfOrigin, manufacturer: form.manufacturer,
      care: editing?.care || DEFAULT_CARE[form.category] || DEFAULT_CARE.default,
      status: form.status, publishAt: form.status === 'scheduled' ? form.publishAt : null,
    }
    upsertProduct(product)
    setDone({ product, seconds: elapsed })
  }

  return (
    <div className="pb-24 lg:pb-0">
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} /> Products</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{editing ? 'Edit product' : 'Add a product'}</h1>
          <p className="mt-1 text-sm text-muted">{editing ? `${code}, ${editing.variants.length} variants` : 'Fill it in like a form. The store page, sizes and SKUs are created for you.'}</p>
        </div>
        {!editing && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${elapsed < 300 ? 'bg-mint-50 text-mint-700' : 'bg-sunny-100 text-sunny-700'}`}>
            <Timer size={16} /> {mm}:{ss} <span className="font-semibold">of the 5 minute target</span>
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Basic details">
            <div className="flex flex-col gap-4">
              <Field label="Product name" htmlFor="pf-title" error={errors.title}>
                <input id="pf-title" data-error={!!errors.title} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Dino Print Cotton T-Shirt" className="input" />
              </Field>
              <Field label="Description" htmlFor="pf-desc" hint="Shown on the product page. Keep it short and practical.">
                <textarea id="pf-desc" rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} className="input resize-y" />
              </Field>
              <div className="flex flex-col gap-3 rounded-xl bg-lilac-100/60 p-4 sm:flex-row sm:items-end">
                <Field label="Write it for me" htmlFor="pf-kw" hint="Add 2 or 3 keywords, then let AI write a first draft." className="flex-1">
                  <input id="pf-kw" value={form.keywords} onChange={(e) => set({ keywords: e.target.value })} placeholder="e.g. dinosaur print, tag-free neck, glow in the dark" className="input" />
                </Field>
                <button type="button" onClick={writeDescription} disabled={typing} className="btn-dark shrink-0"><Sparkle size={16} weight="fill" /> {typing ? 'Writing...' : 'Write with AI'}</button>
              </div>
            </div>
          </Card>

          <Card title="Photos" aside={<span className="text-xs font-semibold text-muted">{form.images.length}/8, first photo is the cover</span>}>
            <div
              data-error={!!errors.images}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files) }}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
              role="button"
              tabIndex={0}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${dragOver ? 'border-coral-500 bg-coral-50' : errors.images ? 'border-coral-400' : 'border-line hover:border-ink/30'}`}
            >
              <UploadSimple size={30} className="text-coral-600" />
              <p className="mt-2 font-bold">Drag photos here, or tap to choose</p>
              <p className="text-xs text-muted">From your phone or laptop. We resize and compress them for you.</p>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} />
            </div>
            {errors.images && <p className="mt-2 text-xs font-semibold text-coral-700">{errors.images}</p>}
            {uploading > 0 && <p className="mt-3 text-sm font-semibold text-muted">Compressing {uploading} {uploading === 1 ? 'photo' : 'photos'}...</p>}

            {form.images.length > 0 && (
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {form.images.map((im, i) => (
                  <li key={im.src.slice(-40) + i} className="group relative">
                    <img src={im.src} alt="" className="aspect-[4/5] w-full rounded-xl object-cover" />
                    {i === 0 && <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white"><Star size={10} weight="fill" /> Cover</span>}
                    <div className="absolute right-1.5 top-1.5 flex gap-1">
                      <button type="button" onClick={() => set({ images: form.images.filter((_, j) => j !== i) })} aria-label="Remove photo" className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-coral-700 shadow-soft"><Trash size={14} /></button>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move left" className="grid h-7 w-7 place-items-center rounded-full bg-white/95 shadow-soft disabled:opacity-0"><CaretLeft size={14} /></button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label="Move right" className="grid h-7 w-7 place-items-center rounded-full bg-white/95 shadow-soft disabled:opacity-0"><CaretRight size={14} /></button>
                    </div>
                    {im.originalBytes && <p className="mt-1 text-center text-[11px] font-semibold text-mint-700">{bytes(im.originalBytes)} to {bytes(im.compressedBytes)}</p>}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-bold text-muted"><ImageIcon size={14} /> No photo handy? Tap a sample.</p>
              <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
                {LOCAL_SAMPLES.map((src) => (
                  <button key={src} type="button" onClick={() => addSample(src)} className="shrink-0 overflow-hidden rounded-lg ring-2 ring-transparent transition hover:ring-coral-300" aria-label="Add sample photo">
                    <img src={src} alt="" className="h-16 w-12 object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Sizes and colours" aside={variants.length > 0 && <span className="rounded-full bg-mint-50 px-2.5 py-1 text-xs font-bold text-mint-700">{variants.length} variants created</span>}>
            <div className="flex flex-col gap-5">
              <div data-error={!!errors.sizes}>
                <p className="text-sm font-bold">Sizes {!form.category && <span className="font-semibold text-muted">(choose a category first for the right sizes)</span>}</p>
                {form.category !== 'accessories' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRESETS.map((pr) => {
                      const valid = pr.sizes.filter((s) => sizeOptions.includes(s))
                      if (!valid.length) return null
                      return <button key={pr.label} type="button" onClick={() => set({ sizes: [...new Set([...form.sizes, ...valid])] })} className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-bold text-ocean-700 hover:bg-ocean-100">+ {pr.label}</button>
                    })}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeOptions.map((s) => (
                    <button key={s} type="button" onClick={() => toggle('sizes', s)} aria-pressed={form.sizes.includes(s)} className={`chip px-3.5 py-2 text-sm ${form.sizes.includes(s) ? 'chip-active' : ''}`}>{s}</button>
                  ))}
                </div>
                {errors.sizes && <p className="mt-2 text-xs font-semibold text-coral-700">{errors.sizes}</p>}
              </div>
              <div data-error={!!errors.colours}>
                <p className="text-sm font-bold">Colours</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.keys(COLOURS).map((c) => (
                    <button key={c} type="button" onClick={() => toggle('colours', c)} aria-pressed={form.colours.includes(c)} className={`chip py-2 ${form.colours.includes(c) ? 'chip-active' : ''}`}>
                      <Swatch colour={c} size="sm" /> {c}
                    </button>
                  ))}
                </div>
                {errors.colours && <p className="mt-2 text-xs font-semibold text-coral-700">{errors.colours}</p>}
              </div>

              {variants.length > 0 && (
                <div className="rounded-2xl border border-line">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
                    <p className="text-sm font-bold">Stock per variant <span className="font-semibold text-muted">({totalUnits} units)</span></p>
                    <div className="flex items-center gap-2">
                      <label htmlFor="bulk-stock" className="text-xs font-semibold text-muted">Set all to</label>
                      <input id="bulk-stock" inputMode="numeric" value={bulkStock} onChange={(e) => setBulkStock(e.target.value.replace(/\D/g, ''))} className="input w-20 py-1.5" />
                      <button type="button" onClick={() => set({ stock: Object.fromEntries(variants.map((v) => [key(v.size, v.colour), bulkStock])) })} className="btn-secondary btn-sm">Apply</button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-cream text-xs text-muted"><tr><th className="px-3 py-2 font-bold">Variant</th><th className="px-3 py-2 font-bold">SKU</th><th className="px-3 py-2 text-right font-bold">Stock</th></tr></thead>
                      <tbody>
                        {variants.map((v) => (
                          <tr key={v.sku} className="border-t border-line">
                            <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><Swatch colour={v.colour} size="sm" /> <b>{v.size}</b> <span className="text-muted">{v.colour}</span></span></td>
                            <td className="px-3 py-2 font-mono text-xs text-muted">{v.sku}</td>
                            <td className="px-3 py-2 text-right">
                              <label className="sr-only" htmlFor={`st-${v.sku}`}>Stock for {v.size} {v.colour}</label>
                              <input id={`st-${v.sku}`} inputMode="numeric" value={v.stock} placeholder="0" onChange={(e) => set({ stock: { ...form.stock, [key(v.size, v.colour)]: e.target.value.replace(/\D/g, '') } })} className="input ml-auto w-20 py-1.5 text-right" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Price">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="MRP (₹)" htmlFor="pf-mrp" error={errors.mrp}>
                <input id="pf-mrp" data-error={!!errors.mrp} inputMode="numeric" value={form.mrp} onChange={(e) => set({ mrp: e.target.value.replace(/\D/g, '') })} className="input" />
              </Field>
              <Field label="Selling price (₹)" htmlFor="pf-price" error={errors.price}>
                <input id="pf-price" data-error={!!errors.price} inputMode="numeric" value={form.price} onChange={(e) => set({ price: e.target.value.replace(/\D/g, '') })} className="input" />
              </Field>
              <div className="flex flex-col justify-end gap-1 rounded-xl bg-cream px-4 py-2.5">
                <span className="text-xs font-bold text-muted">Discount shown</span>
                <span className="text-xl font-extrabold text-mint-700">{discount ? `${discount}% off` : '-'}</span>
              </div>
            </div>
            {gst && <p className="mt-3 text-xs text-muted">GST {gst}% applies at this price (garments up to ₹2,500 are taxed at 5%). Prices on the store include GST.</p>}
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Publishing">
            <div className="flex flex-col gap-2">
              {[['published', 'Publish now', 'Goes live on the store straight away'], ['draft', 'Save as draft', 'Only you can see it'], ['scheduled', 'Schedule', 'Goes live at a date and time you pick']].map(([v, l, d]) => (
                <label key={v} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 ${form.status === v ? 'border-ink bg-cream' : 'border-line'}`}>
                  <input type="radio" name="status" checked={form.status === v} onChange={() => set({ status: v })} className="mt-1 accent-coral-600" />
                  <span className="text-sm"><b>{l}</b><span className="block text-xs text-muted">{d}</span></span>
                </label>
              ))}
              {form.status === 'scheduled' && (
                <Field label="Go live on" htmlFor="pf-when" error={errors.publishAt}>
                  <input id="pf-when" data-error={!!errors.publishAt} type="datetime-local" value={form.publishAt} onChange={(e) => set({ publishAt: e.target.value })} className="input" />
                </Field>
              )}
            </div>
            <button type="button" onClick={save} className="btn-primary mt-4 hidden w-full py-3 lg:flex">{form.status === 'published' ? (editing ? 'Save and publish' : 'Publish product') : 'Save'}</button>
          </Card>

          <Card title="Organise">
            <div className="flex flex-col gap-4">
              <Field label="Category" htmlFor="pf-cat" error={errors.category}>
                <select id="pf-cat" data-error={!!errors.category} value={form.category} onChange={(e) => onCategory(e.target.value)} className="input">
                  <option value="">Choose</option>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Type" htmlFor="pf-sub" error={errors.sub}>
                <select id="pf-sub" data-error={!!errors.sub} value={form.sub} onChange={(e) => onSub(e.target.value)} disabled={!cat} className="input disabled:bg-cream">
                  <option value="">{cat ? 'Choose' : 'Pick a category first'}</option>
                  {cat?.subs.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gender" htmlFor="pf-gender">
                  <select id="pf-gender" value={form.gender} onChange={(e) => set({ gender: e.target.value })} className="input">
                    <option value="boys">Boys</option><option value="girls">Girls</option><option value="unisex">Unisex</option>
                  </select>
                </Field>
                <Field label="Occasion" htmlFor="pf-occ">
                  <select id="pf-occ" value={form.occasion} onChange={(e) => set({ occasion: e.target.value })} className="input">{OCCASIONS.map((o) => <option key={o}>{o}</option>)}</select>
                </Field>
              </div>
              <Field label="Fabric" htmlFor="pf-fabric">
                <select id="pf-fabric" value={form.fabric} onChange={(e) => set({ fabric: e.target.value })} className="input">{FABRICS.map((f) => <option key={f}>{f}</option>)}</select>
              </Field>
              <Field label="Brand" htmlFor="pf-brand">
                <select id="pf-brand" value={form.brand} onChange={(e) => set({ brand: e.target.value })} className="input">{BRANDS.map((b) => <option key={b}>{b}</option>)}</select>
              </Field>
              <div>
                <p className="mb-2 text-sm font-bold">Show in</p>
                <div className="flex flex-wrap gap-2">
                  {[['new', 'New arrivals'], ['bestseller', 'Best sellers'], ['festive', 'Festive Edit']].map(([t, l]) => (
                    <button key={t} type="button" onClick={() => toggle('tags', t)} aria-pressed={form.tags.includes(t)} className={`chip ${form.tags.includes(t) ? 'chip-active' : ''}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Shipping and tax">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Weight (grams)" htmlFor="pf-weight" hint="For courier rates">
                  <input id="pf-weight" inputMode="numeric" value={form.weight} onChange={(e) => set({ weight: e.target.value.replace(/\D/g, '') })} className="input" />
                </Field>
                <Field label="HSN code" htmlFor="pf-hsn" hint="Set by category">
                  <input id="pf-hsn" value={form.hsn} onChange={(e) => { setHsnTouched(true); set({ hsn: e.target.value.replace(/\D/g, '').slice(0, 8) }) }} className="input" />
                </Field>
              </div>
              <Field label="Country of origin" htmlFor="pf-origin">
                <input id="pf-origin" value={form.countryOfOrigin} onChange={(e) => set({ countryOfOrigin: e.target.value })} className="input" />
              </Field>
              <Field label="Manufacturer or packer" htmlFor="pf-mfr" hint="Required on listings under Legal Metrology rules">
                <input id="pf-mfr" value={form.manufacturer} onChange={(e) => set({ manufacturer: e.target.value })} className="input" />
              </Field>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
        <Link to="/admin/products" className="btn-secondary">Cancel</Link>
        <button type="button" onClick={save} className="btn-primary flex-1 py-3">{form.status === 'published' ? 'Publish product' : 'Save'}</button>
      </div>

      <Modal open={!!done} onClose={() => setDone(null)} title={done?.product.status === 'published' ? 'Your product is live' : 'Product saved'}>
        {done && (
          <div className="flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-mint-100 text-mint-600"><CheckCircle size={40} weight="fill" /></span>
            <img src={done.product.images[0]} alt="" className="mt-4 h-40 w-32 rounded-2xl object-cover shadow-soft" />
            <p className="mt-3 font-bold">{done.product.title}</p>
            <p className="text-sm text-muted">{rupees(done.product.price)}, {done.product.variants.length} variants, {done.product.variants.reduce((n, v) => n + v.stock, 0)} units</p>
            {!editing && <p className="mt-3 rounded-full bg-mint-50 px-3 py-1.5 text-sm font-bold text-mint-700">Done in {Math.floor(done.seconds / 60)}m {done.seconds % 60}s</p>}
            {done.product.status === 'draft' && <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><WarningCircle size={14} /> Drafts are hidden from customers until you publish.</p>}
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
              <a href={asset(`p/${done.product.slug}`)} target="_blank" rel="noreferrer" className="btn-primary flex-1">View on store</a>
              {editing ? (
                <Link to="/admin/products" className="btn-secondary flex-1">Back to products</Link>
              ) : (
                <a href={asset('admin/products/new')} className="btn-secondary flex-1">Add another</a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
