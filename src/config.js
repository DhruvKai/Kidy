// Everything a salesperson might tweak before a client demo lives here.
export const STORE = {
  name: 'Kidy',
  tagline: 'Little clothes, big smiles',
  supportPhone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'hello@kidy.in',
  // Sample address for the demo. GSTIN and PAN are placeholders too.
  // `state` decides CGST+SGST (same state) vs IGST on invoices.
  seller: {
    legalName: 'Kidy Retail',
    address: 'Shop 14, Rang Bazaar Complex, Malviya Nagar, Jaipur, Rajasthan 302017',
    state: 'Rajasthan',
    stateCode: '08',
    gstin: '08ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
  },
  grievanceOfficer: {
    name: 'Grievance Officer (name to be added)',
    email: 'grievance@kidy.in',
    phone: '+91 98765 43210',
    hours: 'Mon-Sat, 10am-6pm',
  },
}

export const COMMERCE = {
  freeShippingThreshold: 499,
  shippingFee: 49,
  codFee: 40,
  codMaxOrder: 3000,
  returnDays: 15,
  lowStockThreshold: 5,
}

// Garment & footwear GST in India depends on the sale price per piece.
// Rates below follow the Sept 2025 slabs (≤ ₹2,500 → 5%, above → 18%). Confirm with the client's CA.
export const GST = {
  apparelSlabLimit: 2500,
  lowRate: 5,
  highRate: 18,
  fixedRateByHsn: { '4202': 18, '9004': 18 },
  shippingSac: '9965',
  shippingRate: 18,
}

// "Deal of the day" ends at local midnight, every day. A real timer, never a fake one.
export function flashSaleEndsAt(now = new Date()) {
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return end
}

export const DEMO = {
  otp: '123456',
  phone: '9876543210',
  adminEmail: 'owner@kidy.in',
  adminPassword: 'demo1234',
}
