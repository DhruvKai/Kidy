import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer, ArrowLeft } from '@phosphor-icons/react'
import { useStore } from '../store/useStore'
import { invoiceBreakdown } from '../lib/pricing'
import { rupees, rupees2, fmtDate } from '../lib/format'
import { PAYMENT_LABELS } from '../lib/orders'
import { STORE } from '../config'

const STATE_CODES = {
  'Andhra Pradesh': '37', Assam: '18', Bihar: '10', Chandigarh: '04', Chhattisgarh: '22', Delhi: '07', Goa: '30', Gujarat: '24',
  Haryana: '06', 'Himachal Pradesh': '02', 'Jammu and Kashmir': '01', Jharkhand: '20', Karnataka: '29', Kerala: '32', Ladakh: '38',
  'Madhya Pradesh': '23', Maharashtra: '27', Odisha: '21', Punjab: '03', Rajasthan: '08', 'Tamil Nadu': '33', Telangana: '36',
  'Uttar Pradesh': '09', Uttarakhand: '05', 'West Bengal': '19',
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
function two(n) { return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}` }
function three(n) { return n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${two(n % 100)}` : ''}` : two(n) }
// Indian numbering: crore, lakh, thousand.
function inWords(num) {
  let n = Math.round(num)
  if (n === 0) return 'Zero'
  const parts = []
  const crore = Math.floor(n / 1e7); n %= 1e7
  const lakh = Math.floor(n / 1e5); n %= 1e5
  const thousand = Math.floor(n / 1e3); n %= 1e3
  if (crore) parts.push(`${three(crore)} Crore`)
  if (lakh) parts.push(`${two(lakh)} Lakh`)
  if (thousand) parts.push(`${two(thousand)} Thousand`)
  if (n) parts.push(three(n))
  return parts.join(' ')
}

function Barcode({ value }) {
  const bars = value.split('').flatMap((d, i) => [Number(d) % 3 + 1, ((Number(d) + i) % 2) + 1])
  return (
    <div className="flex h-16 items-stretch gap-px" aria-label={`Barcode ${value}`}>
      {bars.map((w, i) => <span key={i} className={i % 2 ? 'bg-white' : 'bg-black'} style={{ width: w * 2 }} />)}
    </div>
  )
}

function Label({ order }) {
  const s = STORE.seller
  const weight = order.items.reduce((g, i) => g + i.qty * 260, 0)
  const cod = order.payment.method === 'cod'
  return (
    <div className="mx-auto w-[4in] border-2 border-black bg-white text-[12px] text-black">
      <div className="flex items-center justify-between border-b-2 border-black p-2">
        <b className="text-base">{order.shipment?.courier || 'Courier to be assigned'}</b>
        <b className={`px-2 py-0.5 text-sm ${cod ? 'bg-black text-white' : 'border-2 border-black'}`}>{cod ? `COD ${rupees(order.pricing.total)}` : 'PREPAID'}</b>
      </div>
      <div className="flex flex-col items-center gap-1 border-b-2 border-black p-3">
        <Barcode value={order.shipment?.awb || '000000000000'} />
        <span className="font-mono text-sm font-bold tracking-widest">AWB {order.shipment?.awb || 'pending'}</span>
      </div>
      <div className="border-b-2 border-black p-3">
        <p className="font-bold">SHIP TO</p>
        <p className="text-sm font-bold">{order.address.name}</p>
        <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
        <p>{order.address.city}, {order.address.state}</p>
        <p className="text-lg font-black">{order.address.pincode}</p>
        <p>Phone: {order.address.phone}</p>
      </div>
      <div className="grid grid-cols-2 border-b-2 border-black">
        <div className="border-r-2 border-black p-2"><p className="font-bold">Order</p><p>{order.id}</p><p>{fmtDate(order.createdAt)}</p></div>
        <div className="p-2"><p className="font-bold">Weight</p><p>{(weight / 1000).toFixed(2)} kg</p><p>{order.items.reduce((n, i) => n + i.qty, 0)} pcs</p></div>
      </div>
      <div className="p-2">
        <p className="font-bold">RETURN TO</p>
        <p>{s.legalName}, {s.address}</p>
      </div>
    </div>
  )
}

export default function Invoice({ label = false }) {
  const { id } = useParams()
  const order = useStore((s) => s.orders.find((o) => o.id === id))
  useEffect(() => { document.title = `${label ? 'Label' : 'Invoice'} ${id}` }, [id, label])

  if (!order) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted">Order not found. <Link to="/" className="underline">Go home</Link></div>

  const b = invoiceBreakdown(order)
  const s = STORE.seller
  const pos = order.address.state

  return (
    <div className="min-h-[100dvh] bg-cream py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4">
        <button type="button" onClick={() => history.back()} className="btn-ghost btn-sm"><ArrowLeft size={14} /> Back</button>
        <button type="button" onClick={() => window.print()} className="btn-primary btn-sm"><Printer size={14} /> Print or save as PDF</button>
      </div>

      {label ? <Label order={order} /> : (
        <div className="mx-auto max-w-[210mm] bg-white p-6 text-[12px] leading-relaxed text-ink shadow-soft md:p-10 print:p-0 print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-4">
            <div>
              <p className="font-display text-2xl font-extrabold">Kidy</p>
              <p className="font-bold">{s.legalName}</p>
              <p className="max-w-xs text-muted">{s.address}</p>
              <p>GSTIN: <b>{s.gstin}</b>, PAN: {s.pan}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold">TAX INVOICE</p>
              <p>Invoice no: <b>{order.invoiceNo}</b></p>
              <p>Invoice date: {fmtDate(order.createdAt)}</p>
              <p>Order ID: {order.id}</p>
              <p>Place of supply: {pos} ({STATE_CODES[pos] || '--'})</p>
            </div>
          </div>

          <div className="grid gap-4 border-b border-line py-4 sm:grid-cols-2">
            <div>
              <p className="font-extrabold">Bill to</p>
              <p>{order.customer.name}</p>
              <p className="text-muted">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} {order.address.pincode}</p>
              <p className="text-muted">Phone: {order.customer.phone}</p>
            </div>
            <div>
              <p className="font-extrabold">Ship to</p>
              <p>{order.address.name}</p>
              <p className="text-muted">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} {order.address.pincode}</p>
              <p className="text-muted">Payment: {PAYMENT_LABELS[order.payment.method]}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="mt-4 w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b-2 border-ink text-[11px]">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Item</th>
                  <th className="py-2 pr-2">HSN/SAC</th>
                  <th className="py-2 pr-2 text-right">Qty</th>
                  <th className="py-2 pr-2 text-right">Taxable value</th>
                  {b.intra ? (<><th className="py-2 pr-2 text-right">CGST</th><th className="py-2 pr-2 text-right">SGST</th></>) : <th className="py-2 pr-2 text-right">IGST</th>}
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line align-top">
                    <td className="py-2 pr-2">{i + 1}</td>
                    <td className="py-2 pr-2">{r.title}{!r.isCharge && <span className="block text-[11px] text-muted">Size {r.size}, {r.colour}, {r.sku}</span>}</td>
                    <td className="py-2 pr-2">{r.hsn}</td>
                    <td className="py-2 pr-2 text-right">{r.qty}</td>
                    <td className="py-2 pr-2 text-right">{rupees2(r.taxable)}</td>
                    {b.intra ? (
                      <>
                        <td className="py-2 pr-2 text-right">{rupees2(r.tax / 2)}<span className="block text-[10px] text-muted">{r.rate / 2}%</span></td>
                        <td className="py-2 pr-2 text-right">{rupees2(r.tax / 2)}<span className="block text-[10px] text-muted">{r.rate / 2}%</span></td>
                      </>
                    ) : <td className="py-2 pr-2 text-right">{rupees2(r.tax)}<span className="block text-[10px] text-muted">{r.rate}%</span></td>}
                    <td className="py-2 text-right font-bold">{rupees2(r.net)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-extrabold">
                  <td colSpan={4} className="py-3 pr-2 text-right">Total</td>
                  <td className="py-3 pr-2 text-right">{rupees2(b.taxableTotal)}</td>
                  {b.intra ? (<><td className="py-3 pr-2 text-right">{rupees2(b.taxTotal / 2)}</td><td className="py-3 pr-2 text-right">{rupees2(b.taxTotal / 2)}</td></>) : <td className="py-3 pr-2 text-right">{rupees2(b.taxTotal)}</td>}
                  <td className="py-3 text-right text-sm">{rupees2(b.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-2"><b>Amount in words:</b> Rupees {inWords(b.grandTotal)} Only</p>
          {(order.pricing.couponDiscount > 0 || order.pricing.bundleDiscount > 0) && (
            <p className="text-muted">Discounts applied before tax: {order.pricing.coupon ? `coupon ${order.pricing.coupon} ${rupees(order.pricing.couponDiscount)}` : ''}{order.pricing.bundleDiscount ? ` bundle ${rupees(order.pricing.bundleDiscount)}` : ''}</p>
          )}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-line pt-4">
            <p className="max-w-sm text-[11px] text-muted">Tax is not payable on reverse charge basis. Garment GST slab applied per piece on net price. This is a computer-generated invoice from a demo store and is not valid for tax purposes.</p>
            <div className="text-right">
              <p className="font-bold">For {s.legalName}</p>
              <p className="mt-8 text-muted">Authorised signatory</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
