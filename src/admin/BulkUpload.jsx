import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { ArrowLeft, DownloadSimple, FileCsv, CheckCircle, WarningCircle, UploadSimple, Lightning } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { CATEGORIES, COLOURS, SIZE_ORDER, HSN_BY_SUB, asset } from '../data/catalog'
import { rupees } from '../lib/format'
import { downloadCsv } from './ProductList'

const HEADERS = ['title', 'category', 'subcategory', 'gender', 'brand', 'mrp', 'price', 'sizes', 'colours', 'stock_per_variant', 'fabric', 'occasion', 'description', 'image']

function validateRow(r) {
  const errs = []
  const cat = CATEGORIES.find((c) => c.slug === (r.category || '').trim().toLowerCase())
  if (!r.title?.trim()) errs.push('Missing title')
  if (!cat) errs.push('Unknown category')
  else if (!cat.subs.includes((r.subcategory || '').trim())) errs.push(`Type must be one of: ${cat.subs.join(', ')}`)
  const mrp = Number(r.mrp), price = Number(r.price)
  if (!mrp || !price) errs.push('MRP and price must be numbers')
  else if (price > mrp) errs.push('Price is above MRP')
  const sizes = (r.sizes || '').split('|').map((s) => s.trim()).filter(Boolean)
  if (!sizes.length || sizes.some((s) => !SIZE_ORDER.includes(s))) errs.push('Check sizes (use 2-3Y|3-4Y)')
  const colours = (r.colours || '').split('|').map((s) => s.trim()).filter(Boolean)
  if (!colours.length || colours.some((c) => !COLOURS[c])) errs.push('Check colours')
  return { errs, cat, sizes, colours, mrp, price }
}

export default function BulkUpload() {
  const navigate = useNavigate()
  const importProducts = useStore((s) => s.importProducts)
  const nextProductNumber = useStore((s) => s.nextProductNumber)
  const [rows, setRows] = useState(null)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)
  useEffect(() => { document.title = 'Bulk upload | KiDDY WiDDY admin' }, [])

  const parse = (text, name) => {
    const res = Papa.parse(text.trim(), { header: true, skipEmptyLines: true })
    setFileName(name)
    setRows(res.data.map((r, i) => ({ i: i + 2, raw: r, ...validateRow(r) })))
  }
  const onFile = (f) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => parse(reader.result, f.name)
    reader.readAsText(f)
  }
  const useSample = async () => {
    const text = await fetch(asset('sample-products.csv')).then((r) => r.text())
    parse(text, 'sample-products.csv')
  }
  const template = () => downloadCsv('kiddy-widdy-product-template.csv', [
    { title: 'Rocket Print Cotton T-Shirt', category: 'boys', subcategory: 'T-Shirts', gender: 'boys', brand: 'KiDDY WiDDY Basics', mrp: 599, price: 379, sizes: '4-5Y|5-6Y|6-8Y', colours: 'Navy|Grey', stock_per_variant: 12, fabric: 'Cotton', occasion: 'Casual', description: 'Soft cotton tee with a rocket print.', image: '' },
  ])

  const valid = rows?.filter((r) => !r.errs.length) || []
  const doImport = () => {
    let n = nextProductNumber()
    const list = valid.map((r) => {
      const num = n++
      const code = `KW-${num}`
      const stock = Number(r.raw.stock_per_variant) || 0
      return {
        id: `kw${num}`, code,
        slug: `${r.raw.title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${num}`,
        title: r.raw.title.trim(), brand: r.raw.brand || 'KiDDY WiDDY Basics', category: r.cat.slug, sub: r.raw.subcategory.trim(),
        gender: ['boys', 'girls', 'unisex'].includes(r.raw.gender) ? r.raw.gender : 'unisex',
        sizes: r.sizes, colours: r.colours, fabric: r.raw.fabric || 'Cotton', occasion: r.raw.occasion || 'Casual', tags: ['new'],
        mrp: r.mrp, price: r.price, images: [r.raw.image ? (r.raw.image.startsWith('/') ? asset(r.raw.image) : r.raw.image) : r.cat.image],
        variants: r.colours.flatMap((c) => r.sizes.map((s) => ({ sku: `${code}-${s.replace(/[^0-9A-Z]/gi, '')}-${c.slice(0, 3).toUpperCase()}`, size: s, colour: c, stock }))),
        hsn: HSN_BY_SUB[r.raw.subcategory.trim()] || '6209', weight: 260, rating: 0, reviewCount: 0, sold: 0, createdDaysAgo: 0,
        countryOfOrigin: 'India', manufacturer: 'KiDDY WiDDY Retail, Tiruppur, Tamil Nadu (demo)',
        description: r.raw.description || r.raw.title, care: ['Machine wash cold, gentle cycle', 'Line dry in shade'], status: 'published',
      }
    })
    importProducts(list)
    toast(`${list.length} products imported and live`, 'success')
    navigate('/admin/products')
  }

  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} /> Products</Link>
      <h1 className="mt-2 text-3xl font-extrabold">Bulk upload</h1>
      <p className="mt-1 text-sm text-muted">Add hundreds of products at once from an Excel or CSV file.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          [DownloadSimple, 'Download the template', 'Open it in Excel or Google Sheets. One row per product.', <button key="t" type="button" onClick={template} className="btn-secondary btn-sm mt-3">Download template</button>],
          [FileCsv, 'Fill in your products', 'Sizes and colours go in one cell, separated by a | sign.', null],
          [UploadSimple, 'Upload and check', 'We check every row before anything goes live.', null],
        ].map(([Icon, t, d, action]) => (
          <div key={t} className="rounded-2xl bg-white p-5 shadow-soft">
            <Icon size={24} className="text-coral-600" />
            <p className="mt-2 font-bold">{t}</p>
            <p className="text-sm text-muted">{d}</p>
            {action}
          </div>
        ))}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
        className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-white px-4 py-10 text-center"
      >
        <FileCsv size={36} className="text-coral-600" />
        <p className="font-bold">{fileName ? `Loaded ${fileName}` : 'Drop your CSV file here'}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">Choose file</button>
          <button type="button" onClick={useSample} className="btn-dark"><Lightning size={16} weight="fill" /> Try the sample file</button>
        </div>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { onFile(e.target.files[0]); e.target.value = '' }} />
      </div>

      {rows && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold">{rows.length} rows checked: <span className="text-mint-700">{valid.length} ready</span>{rows.length - valid.length > 0 && <span className="text-coral-700">, {rows.length - valid.length} need fixing</span>}</p>
            <button type="button" disabled={!valid.length} onClick={doImport} className="btn-primary">Import {valid.length} products</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream text-xs text-muted"><tr><th className="px-3 py-2 font-bold">Row</th><th className="px-3 py-2 font-bold">Product</th><th className="px-3 py-2 font-bold">Category</th><th className="px-3 py-2 font-bold">Price</th><th className="px-3 py-2 font-bold">Variants</th><th className="px-3 py-2 font-bold">Check</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.i} className="border-t border-line align-top">
                    <td className="px-3 py-2.5 text-muted">{r.i}</td>
                    <td className="px-3 py-2.5 font-bold">{r.raw.title || '-'}</td>
                    <td className="px-3 py-2.5 text-muted">{r.raw.category}, {r.raw.subcategory}</td>
                    <td className="px-3 py-2.5">{r.price ? rupees(r.price) : '-'}</td>
                    <td className="px-3 py-2.5">{r.sizes.length * r.colours.length}</td>
                    <td className="px-3 py-2.5">
                      {r.errs.length ? (
                        <span className="flex items-start gap-1.5 text-xs font-semibold text-coral-700"><WarningCircle size={16} className="shrink-0" /> {r.errs.join('. ')}</span>
                      ) : <span className="flex items-center gap-1.5 text-xs font-bold text-mint-700"><CheckCircle size={16} weight="fill" /> Ready</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">Allowed headers: {HEADERS.join(', ')}.</p>
        </section>
      )}
    </div>
  )
}
