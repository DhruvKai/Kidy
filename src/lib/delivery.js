import { lookupPincode } from '../data/pincodes'

// Orders placed before 2pm ship the same day; couriers don't deliver on Sundays.
export function estimateDelivery(info, from = new Date()) {
  if (!info || info.unserviceable) return null
  const d = new Date(from)
  let days = info.days + (d.getHours() >= 14 ? 1 : 0)
  while (days > 0) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0) days--
  }
  return d
}

export function checkPincode(pin) {
  const info = lookupPincode(pin)
  if (!info) return { ok: false, error: 'Please enter a valid 6-digit pincode.' }
  if (info.unserviceable) return { ok: false, info, error: `Sorry, we don't deliver to ${info.city} yet.` }
  return { ok: true, info, date: estimateDelivery(info) }
}
