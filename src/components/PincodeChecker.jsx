import { useState } from 'react'
import { MapPin, Truck, HandCoins, WarningCircle } from '@phosphor-icons/react'
import { useStore } from '../store/useStore'
import { checkPincode } from '../lib/delivery'
import { fmtDay } from '../lib/format'
import { COMMERCE } from '../config'

export default function PincodeChecker() {
  const saved = useStore((s) => s.pincode)
  const setPincode = useStore((s) => s.setPincode)
  const [pin, setPin] = useState(saved)
  const [result, setResult] = useState(() => (saved ? checkPincode(saved) : null))

  const check = (e) => {
    e.preventDefault()
    const r = checkPincode(pin)
    setResult(r)
    if (r.info) setPincode(pin)
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-extrabold"><MapPin size={18} /> Check delivery</p>
      <form onSubmit={check} className="mt-3 flex gap-2">
        <label htmlFor="pdp-pin" className="sr-only">Pincode</label>
        <input id="pdp-pin" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="Enter 6-digit pincode" className="input" />
        <button className="btn-secondary shrink-0 px-5">Check</button>
      </form>
      {result && (
        result.ok ? (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li className="flex items-start gap-2">
              <Truck size={18} className="mt-0.5 shrink-0 text-mint-600" />
              <span>Delivery by <b>{fmtDay(result.date)}</b>{result.info.city ? ` to ${result.info.city}` : ''}. Free above ₹{COMMERCE.freeShippingThreshold}.</span>
            </li>
            <li className="flex items-start gap-2">
              <HandCoins size={18} className={`mt-0.5 shrink-0 ${result.info.cod ? 'text-mint-600' : 'text-muted'}`} />
              <span>{result.info.cod ? 'Cash on delivery available' : 'Cash on delivery not available here. Pay online with UPI or card.'}</span>
            </li>
          </ul>
        ) : (
          <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-coral-700"><WarningCircle size={18} className="mt-0.5 shrink-0" /> {result.error}</p>
        )
      )}
    </div>
  )
}
