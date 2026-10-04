export const ORDER_FLOW = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered']

export const STATUS_META = {
  placed: { label: 'Order placed', tone: 'bg-ocean-100 text-ocean-700' },
  confirmed: { label: 'Confirmed', tone: 'bg-ocean-100 text-ocean-700' },
  packed: { label: 'Packed', tone: 'bg-lilac-100 text-lilac-600' },
  shipped: { label: 'Shipped', tone: 'bg-sunny-100 text-sunny-700' },
  out_for_delivery: { label: 'Out for delivery', tone: 'bg-sunny-100 text-sunny-700' },
  delivered: { label: 'Delivered', tone: 'bg-mint-100 text-mint-700' },
  cancelled: { label: 'Cancelled', tone: 'bg-slate-100 text-slate-600' },
  return_requested: { label: 'Return requested', tone: 'bg-coral-100 text-coral-700' },
  return_approved: { label: 'Pickup scheduled', tone: 'bg-coral-100 text-coral-700' },
  refunded: { label: 'Refunded', tone: 'bg-mint-100 text-mint-700' },
  exchanged: { label: 'Exchange shipped', tone: 'bg-mint-100 text-mint-700' },
  return_rejected: { label: 'Return rejected', tone: 'bg-slate-100 text-slate-600' },
}

export const STEP_COPY = {
  placed: 'We have received your order.',
  confirmed: 'The seller has confirmed your order.',
  packed: 'Your items are packed and ready to ship.',
  shipped: 'Handed over to the courier.',
  out_for_delivery: 'Your parcel is out for delivery today.',
  delivered: 'Delivered. Enjoy!',
  cancelled: 'This order was cancelled.',
  return_requested: 'Return request received. We will review it within 24 hours.',
  return_approved: 'Return approved. Reverse pickup scheduled.',
  refunded: 'Refund processed.',
  exchanged: 'Exchange item shipped.',
  return_rejected: 'Return request was not approved.',
}

export const PAYMENT_LABELS = {
  upi: 'UPI', card: 'Credit / Debit card', netbanking: 'Net banking', wallet: 'Wallet', paylater: 'Pay later', cod: 'Cash on delivery',
}

export const COURIERS = [
  { name: 'Xpressbees', rate: 38, eta: '3-5 days', rating: 4.2 },
  { name: 'Ekart', rate: 40, eta: '3-5 days', rating: 4.3 },
  { name: 'Delhivery', rate: 42, eta: '2-4 days', rating: 4.5 },
  { name: 'DTDC', rate: 45, eta: '3-6 days', rating: 4.0 },
  { name: 'Blue Dart', rate: 65, eta: '1-3 days', rating: 4.7 },
]

export const RETURN_REASONS = ['Size too small', 'Size too large', 'Quality not as expected', 'Received wrong item', 'Item damaged', 'Colour different from photo', 'Changed my mind']

export const makeOrderId = () => `KW${Math.floor(260000 + Math.random() * 99999)}`
export const makeAwb = () => `${Math.floor(1e11 + Math.random() * 9e11)}`

export const canCancel = (o) => ['placed', 'confirmed', 'packed'].includes(o.status)
export const canReturn = (o) => o.status === 'delivered'
export const isActive = (o) => ORDER_FLOW.includes(o.status) && o.status !== 'delivered'

// Index of the furthest normal-flow step reached (for the tracking stepper).
export function flowIndex(order) {
  let idx = -1
  for (const t of order.timeline) {
    const i = ORDER_FLOW.indexOf(t.status)
    if (i > idx) idx = i
  }
  return idx
}

// The one next step an admin takes for each status.
export const NEXT_ACTION = {
  placed: { label: 'Confirm', to: 'confirmed' },
  confirmed: { label: 'Mark packed', to: 'packed' },
  packed: { label: 'Ship', to: 'ship' },
  shipped: { label: 'Out for delivery', to: 'out_for_delivery' },
  out_for_delivery: { label: 'Mark delivered', to: 'delivered' },
}
