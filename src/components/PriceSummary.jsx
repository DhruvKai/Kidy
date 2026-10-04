import { rupees } from '../lib/format'

export default function PriceSummary({ summary, showCod = false }) {
  const rows = [
    ['Total MRP', rupees(summary.mrpTotal)],
    summary.mrpDiscount > 0 && ['Discount on MRP', `- ${rupees(summary.mrpDiscount)}`, 'text-mint-700'],
    summary.bundleDiscount > 0 && ['Any 3 tees for ₹999', `- ${rupees(summary.bundleDiscount)}`, 'text-mint-700'],
    summary.couponDiscount > 0 && [`Coupon ${summary.coupon.code}`, `- ${rupees(summary.couponDiscount)}`, 'text-mint-700'],
    ['Shipping', summary.shipping ? rupees(summary.shipping) : 'FREE', summary.shipping ? '' : 'text-mint-700'],
    showCod && summary.codFee > 0 && ['Cash on delivery fee', rupees(summary.codFee)],
  ].filter(Boolean)
  return (
    <div>
      <dl className="flex flex-col gap-2.5 text-sm">
        {rows.map(([k, v, cls]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted">{k}</dt>
            <dd className={`font-bold ${cls || ''}`}>{v}</dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between gap-4 border-t border-line pt-3 text-base">
          <dt className="font-extrabold">Total amount</dt>
          <dd className="font-extrabold">{rupees(summary.total)}</dd>
        </div>
      </dl>
      {summary.savings > 0 && (
        <p className="mt-4 rounded-xl bg-mint-50 px-3 py-2.5 text-center text-sm font-bold text-mint-700">You save {rupees(summary.savings)} on this order</p>
      )}
    </div>
  )
}
