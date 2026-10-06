export const SEED_COUPONS = [
  { code: 'FIRST10', type: 'percent', value: 10, maxDiscount: 200, minOrder: 0, description: '10% off your first order (up to ₹200)', active: true, uses: 184 },
  { code: 'KIDY100', type: 'flat', value: 100, minOrder: 999, description: '₹100 off on orders above ₹999', active: true, uses: 412 },
  { code: 'FESTIVE15', type: 'percent', value: 15, maxDiscount: 500, minOrder: 1499, onlyTag: 'festive', description: '15% off Festive Edit styles above ₹1,499 (up to ₹500)', active: true, uses: 96 },
]

// Automatic bundle: any 3 tees for ₹999.
export const BUNDLE = {
  name: 'Any 3 Tees for ₹999',
  subs: ['T-Shirts', 'Tops & Tees'],
  qty: 3,
  price: 999,
}
