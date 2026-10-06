import { COMMERCE } from '../config'
import { ORDER_FLOW, COURIERS } from '../lib/orders'

const CUSTOMERS = {
  priya: { name: 'Priya Sharma', phone: '9876543210', email: 'priya.demo@example.com', line1: 'Flat 302, Sunshine Residency', line2: 'Baner Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  aman: { name: 'Aman Gill', phone: '9815012345', email: 'aman.demo@example.com', line1: '45, Model Town Extension', line2: 'Near Gurudwara', city: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  sneha: { name: 'Sneha Iyer', phone: '9840123456', email: 'sneha.demo@example.com', line1: '12, 2nd Cross Street', line2: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  rohit: { name: 'Rohit Verma', phone: '9910234567', email: 'rohit.demo@example.com', line1: 'Tower B-1104, Palm Heights', line2: 'Sector 54', city: 'Gurugram', state: 'Haryana', pincode: '122001' },
  fatima: { name: 'Fatima Shaikh', phone: '9820345678', email: 'fatima.demo@example.com', line1: '7, Marine View Apartments', line2: 'Colaba', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  karthik: { name: 'Karthik Reddy', phone: '9849456789', email: 'karthik.demo@example.com', line1: 'Plot 88, Jubilee Enclave', line2: 'Road No. 36', city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  ananya: { name: 'Ananya Das', phone: '9830567890', email: 'ananya.demo@example.com', line1: '21B, Lake Gardens', line2: 'Near Rabindra Sarobar', city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  neha: { name: 'Neha Agarwal', phone: '9829678901', email: 'neha.demo@example.com', line1: 'C-14, Malviya Nagar', line2: '', city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  arjun: { name: 'Arjun Nair', phone: '9847789012', email: 'arjun.demo@example.com', line1: 'Kailas, MG Road', line2: 'Ernakulam', city: 'Kochi', state: 'Kerala', pincode: '682001' },
  simran: { name: 'Simran Kaur', phone: '9872890123', email: 'simran.demo@example.com', line1: 'Flat 6, Lakeview Court', line2: 'Fatehpura', city: 'Udaipur', state: 'Rajasthan', pincode: '313001' },
  pooja: { name: 'Pooja Mehta', phone: '9825901234', email: 'pooja.demo@example.com', line1: '5, Shanti Kunj Society', line2: 'Navrangpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
}

// [id, customer, hoursAgo, status, payment, items [productId, size, colour, qty], extras]
const RAW = [
  ['KD260101', 'priya', 9 * 24, 'delivered', 'upi', [['kd1112', '8-10Y', 'Pink', 1], ['kd1105', '8-10Y', 'Black', 1]]],
  ['KD260115', 'priya', 26, 'shipped', 'cod', [['kd1201', '0-3M', 'Multicolour', 1], ['kd1304', '0-3M', 'Pink', 1]]],
  ['KD260108', 'aman', 2, 'placed', 'cod', [['kd1005', '6-8Y', 'Yellow', 1]]],
  ['KD260109', 'sneha', 5, 'placed', 'upi', [['kd1103', '2-3Y', 'Cream', 2], ['kd1121', '3-4Y', 'Yellow', 1]]],
  ['KD260110', 'rohit', 20, 'confirmed', 'card', [['kd1009', '6-8Y', 'Black', 1]]],
  ['KD260111', 'fatima', 30, 'packed', 'upi', [['kd1208', '3-6M', 'White', 2]]],
  ['KD260112', 'karthik', 50, 'shipped', 'netbanking', [['kd1307', '4-5Y', 'Blue', 1], ['kd1001', '5-6Y', 'Grey', 2]]],
  ['KD260113', 'ananya', 74, 'out_for_delivery', 'cod', [['kd1109', '4-5Y', 'Orange', 1]]],
  ['KD260104', 'neha', 5 * 24, 'delivered', 'upi', [['kd1102', '6-8Y', 'Multicolour', 1], ['kd1101', '6-8Y', 'Blush', 1]], { coupon: 'FIRST10' }],
  ['KD260105', 'arjun', 6 * 24, 'delivered', 'wallet', [['kd1014', '4-5Y', 'Grey', 1], ['kd1013', '2-3Y', 'Cream', 1]]],
  ['KD260106', 'simran', 4 * 24, 'return_requested', 'upi', [['kd1110', '2-3Y', 'Orange', 1]], { returnRequest: { type: 'exchange', reason: 'Size too small', exchangeSize: '3-4Y', note: 'Beautiful outfit, just need one size up please.' } }],
  ['KD260107', 'pooja', 7 * 24, 'cancelled', 'cod', [['kd1116', '5-6Y', 'Sky Blue', 1]]],
  ['KD260102', 'rohit', 12 * 24, 'refunded', 'upi', [['kd1306', '4-5Y', 'Silver', 1]], { returnRequest: { type: 'return', reason: 'Size too large', refundMode: 'source', note: '' } }],
]

export function buildSeedOrders(products, now = Date.now()) {
  const byId = Object.fromEntries(products.map((p) => [p.id, p]))
  return RAW.map(([id, cust, hoursAgo, status, method, rawItems, extras = {}], n) => {
    const c = CUSTOMERS[cust]
    const created = now - hoursAgo * 3600 * 1000
    const items = rawItems.map(([pid, size, colour, qty]) => {
      const p = byId[pid]
      const v = p.variants.find((x) => x.size === size && x.colour === colour) || p.variants[0]
      return { productId: pid, title: p.title, image: p.images[0], size: v.size, colour: v.colour, qty, unitPrice: p.price, mrp: p.mrp, hsn: p.hsn, sku: v.sku }
    })
    const selling = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)
    const mrp = items.reduce((s, i) => s + i.mrp * i.qty, 0)
    const couponDiscount = extras.coupon === 'FIRST10' ? Math.min(200, Math.round(selling * 0.1)) : 0
    const after = selling - couponDiscount
    const shipping = after >= COMMERCE.freeShippingThreshold ? 0 : COMMERCE.shippingFee
    const codFee = method === 'cod' ? COMMERCE.codFee : 0

    // Build a believable timeline up to the current status.
    const isReturn = ['return_requested', 'return_approved', 'refunded', 'return_rejected'].includes(status)
    const flowTarget = isReturn ? 'delivered' : status === 'cancelled' ? 'placed' : status
    const steps = ORDER_FLOW.slice(0, ORDER_FLOW.indexOf(flowTarget) + 1)
    const gaps = [0, 1.5, 8, 20, 50, 56]
    const span = Math.max(1, hoursAgo - (isReturn ? 30 : 0))
    const scale = Math.min(1, span / 60)
    const timeline = steps.map((s, i) => ({ status: s, at: new Date(created + gaps[i] * scale * 3600 * 1000).toISOString() }))
    if (status === 'cancelled') timeline.push({ status: 'cancelled', at: new Date(created + 3 * 3600 * 1000).toISOString(), note: 'Cancelled by customer' })
    if (isReturn) {
      timeline.push({ status: 'return_requested', at: new Date(now - 26 * 3600 * 1000).toISOString() })
      if (status === 'refunded') {
        timeline.push({ status: 'return_approved', at: new Date(now - 20 * 3600 * 1000).toISOString() })
        timeline.push({ status: 'refunded', at: new Date(now - 2 * 3600 * 1000).toISOString(), note: 'Refunded to original payment method' })
      }
    }
    const shipped = ORDER_FLOW.indexOf(flowTarget) >= ORDER_FLOW.indexOf('shipped')
    const courier = COURIERS[n % COURIERS.length]
    return {
      id,
      createdAt: new Date(created).toISOString(),
      customer: { name: c.name, phone: c.phone, email: c.email },
      address: { name: c.name, phone: c.phone, line1: c.line1, line2: c.line2, city: c.city, state: c.state, pincode: c.pincode },
      items,
      pricing: { mrp, selling, bundleDiscount: 0, couponDiscount, coupon: extras.coupon || null, shipping, codFee, total: after + shipping + codFee },
      payment: { method, status: status === 'refunded' ? 'refunded' : method === 'cod' ? (status === 'delivered' ? 'collected' : 'pending') : 'paid' },
      status,
      timeline,
      shipment: shipped ? { courier: courier.name, awb: `${77310045000 + n * 7919}` } : null,
      returnRequest: extras.returnRequest ? { ...extras.returnRequest, at: new Date(now - 26 * 3600 * 1000).toISOString(), items: items.map((i) => i.sku) } : null,
      invoiceNo: `INV/26-27/${String(1041 + n).padStart(5, '0')}`,
      gift: null,
    }
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 30 days of demo sales for the dashboard chart (orders placed in the demo are added on top).
export function buildSalesHistory(now = Date.now()) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000)
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 1.35 : 1
    const trend = 1 + (29 - i) * 0.018
    const wobble = 0.8 + ((i * 7919) % 41) / 100
    const orders = Math.round(9 * weekend * trend * wobble)
    days.push({ date: d.toISOString().slice(0, 10), orders, sales: orders * (980 + ((i * 131) % 260)) })
  }
  return days
}
