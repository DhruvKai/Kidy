import { useState } from 'react'
import { Ruler } from '@phosphor-icons/react'
import { Modal } from './ui'
import { CLOTHING_CHART, FOOTWEAR_CHART, sizeForAgeMonths } from '../data/sizeCharts'

export default function SizeChartModal({ open, onClose, product, onPick }) {
  const [years, setYears] = useState('')
  const [months, setMonths] = useState('0')
  const footwear = product.category === 'footwear'
  const free = product.sizes.includes('Free Size')
  const rows = (footwear ? FOOTWEAR_CHART : CLOTHING_CHART).filter((r) => product.sizes.includes(r.size))
  const ageMonths = years === '' ? null : Number(years) * 12 + Number(months)
  const rec = ageMonths != null ? sizeForAgeMonths(ageMonths) : null
  const available = rec && product.sizes.includes(rec)

  return (
    <Modal open={open} onClose={onClose} title="Size chart" wide>
      {free ? (
        <p className="text-sm text-muted">This item is free size and fits most children. Adjustable straps make it easy to get the right fit.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-ocean-50 p-4">
            <p className="flex items-center gap-2 font-bold"><Ruler size={18} /> Find my size</p>
            <p className="mt-1 text-sm text-muted">Tell us your child's age and we will suggest a size. Kids grow fast, so if they are between sizes, pick the bigger one.</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm font-bold">
                Years
                <select value={years} onChange={(e) => setYears(e.target.value)} className="input w-28">
                  <option value="">Select</option>
                  {Array.from({ length: 15 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Months
                <select value={months} onChange={(e) => setMonths(e.target.value)} className="input w-28">
                  {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </label>
              {rec && (
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <span className="text-sm">We suggest <b className="text-lg">{rec}</b></span>
                  {available ? (
                    <button type="button" onClick={() => { onPick(rec); onClose() }} className="btn-primary btn-sm">Select {rec}</button>
                  ) : (
                    <span className="text-xs font-semibold text-coral-700">This style is not made in {rec}.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="py-2 pr-3 font-bold">Size (age)</th>
                  {footwear ? (<><th className="py-2 pr-3 font-bold">UK size</th><th className="py-2 font-bold">Foot length (cm)</th></>) : (
                    <><th className="py-2 pr-3 font-bold">Height (cm)</th><th className="py-2 pr-3 font-bold">Chest (cm)</th><th className="py-2 pr-3 font-bold">Waist (cm)</th><th className="py-2 font-bold">Weight</th></>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.size} className={`border-t border-line ${r.size === rec ? 'bg-sunny-50 font-bold' : ''}`}>
                    <td className="py-2.5 pr-3 font-bold">{r.size}</td>
                    {footwear ? (<><td className="py-2.5 pr-3">{r.uk}</td><td className="py-2.5">{r.foot}</td></>) : (
                      <><td className="py-2.5 pr-3">{r.height}</td><td className="py-2.5 pr-3">{r.chest}</td><td className="py-2.5 pr-3">{r.waist}</td><td className="py-2.5">{r.weight}</td></>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">{footwear ? 'Measure from the heel to the longest toe while your child is standing.' : 'Measure over a light vest. Chest: around the fullest part. Waist: around the natural waistline.'}</p>
        </div>
      )}
    </Modal>
  )
}
