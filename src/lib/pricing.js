import { COMMERCE, GST, STORE } from '../config'
import { BUNDLE } from '../data/coupons'
import { DEAL_PRICES } from '../data/products'

export const isDeal = (p) => DEAL_PRICES[p.id] != null && DEAL_PRICES[p.id] < p.price
export const priceOf = (p) => (isDeal(p) ? DEAL_PRICES[p.id] : p.price)
export const totalStock = (p) => p.variants.reduce((s, v) => s + v.stock, 0)

export function gstRateFor(unitPrice, hsn) {
  if (GST.fixedRateByHsn[hsn]) return GST.fixedRateByHsn[hsn]
  return unitPrice <= GST.apparelSlabLimit ? GST.lowRate : GST.highRate
}

export function validateCoupon(coupon, lines, subtotal) {
  if (!coupon || !coupon.active) return { error: 'This coupon is not valid.' }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { error: 'This coupon has expired.' }
  if (subtotal < (coupon.minOrder || 0)) return { error: `Add items worth ₹${coupon.minOrder - subtotal} more to use ${coupon.code}.` }
  let base = subtotal
  if (coupon.onlyTag) {
    base = lines.filter((l) => l.product.tags.includes(coupon.onlyTag)).reduce((s, l) => s + l.lineTotal, 0)
    if (!base) return { error: `${coupon.code} applies to Festive Edit styles only.` }
  }
  let discount = coupon.type === 'percent' ? (base * coupon.value) / 100 : coupon.value
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  return { discount: Math.round(Math.min(discount, base)) }
}

export function computeCart({ items, products, couponCode, coupons = [], paymentMethod }) {
  const byId = Object.fromEntries(products.map((p) => [p.id, p]))
  const lines = items
    .map((it) => {
      const product = byId[it.productId]
      if (!product) return null
      const unitPrice = priceOf(product)
      const variant = product.variants.find((v) => v.size === it.size && v.colour === it.colour)
      return {
        ...it, product, unitPrice, mrp: product.mrp,
        lineTotal: unitPrice * it.qty, lineMrp: product.mrp * it.qty,
        stock: variant ? variant.stock : 0, sku: variant?.sku,
      }
    })
    .filter(Boolean)

  const itemCount = lines.reduce((s, l) => s + l.qty, 0)
  const mrpTotal = lines.reduce((s, l) => s + l.lineMrp, 0)
  const sellingTotal = lines.reduce((s, l) => s + l.lineTotal, 0)

  // Bundle: the most expensive eligible tees are grouped into sets of 3 at ₹999.
  const units = lines.filter((l) => BUNDLE.subs.includes(l.product.sub)).flatMap((l) => Array(l.qty).fill(l.unitPrice)).sort((a, b) => b - a)
  const groups = Math.floor(units.length / BUNDLE.qty)
  const bundleBase = units.slice(0, groups * BUNDLE.qty).reduce((s, n) => s + n, 0)
  const bundleDiscount = Math.max(0, bundleBase - groups * BUNDLE.price)
  const bundleUnitsNeeded = units.length % BUNDLE.qty === 0 ? (units.length ? 0 : BUNDLE.qty) : BUNDLE.qty - (units.length % BUNDLE.qty)

  const subtotal = sellingTotal - bundleDiscount
  let couponDiscount = 0
  let couponError = null
  const coupon = couponCode ? coupons.find((c) => c.code === couponCode) : null
  if (couponCode) {
    const r = validateCoupon(coupon, lines, subtotal)
    if (r.error) couponError = r.error
    else couponDiscount = r.discount
  }

  const afterDiscounts = subtotal - couponDiscount
  const shipping = itemCount === 0 || afterDiscounts >= COMMERCE.freeShippingThreshold ? 0 : COMMERCE.shippingFee
  const beforeCod = afterDiscounts + shipping
  const codAllowed = beforeCod <= COMMERCE.codMaxOrder
  const codFee = paymentMethod === 'cod' ? COMMERCE.codFee : 0

  return {
    lines, itemCount, mrpTotal, sellingTotal,
    mrpDiscount: mrpTotal - sellingTotal,
    bundleDiscount, bundleUnitsNeeded, hasBundleItems: units.length > 0,
    coupon: couponError ? null : coupon, couponCode, couponDiscount, couponError,
    shipping, codFee, codAllowed,
    total: beforeCod + codFee,
    savings: mrpTotal - sellingTotal + bundleDiscount + couponDiscount,
    freeShipRemaining: Math.max(0, COMMERCE.freeShippingThreshold - afterDiscounts),
  }
}

// GST breakdown for the invoice. Discounts are spread across lines in proportion to their value;
// the slab is decided on the net price per piece.
export function invoiceBreakdown(order) {
  const intra = order.address.state === STORE.seller.state
  const discount = (order.pricing.bundleDiscount || 0) + (order.pricing.couponDiscount || 0)
  const gross = order.items.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const rows = order.items.map((i) => {
    const lineGross = i.unitPrice * i.qty
    const alloc = gross ? (discount * lineGross) / gross : 0
    const net = lineGross - alloc
    const rate = gstRateFor(net / i.qty, i.hsn)
    const taxable = net / (1 + rate / 100)
    return { ...i, net, rate, taxable, tax: net - taxable }
  })
  const charges = (order.pricing.shipping || 0) + (order.pricing.codFee || 0)
  if (charges) {
    const taxable = charges / (1 + GST.shippingRate / 100)
    rows.push({ title: 'Shipping & handling', hsn: GST.shippingSac, qty: 1, unitPrice: charges, net: charges, rate: GST.shippingRate, taxable, tax: charges - taxable, isCharge: true })
  }
  const taxableTotal = rows.reduce((s, r) => s + r.taxable, 0)
  const taxTotal = rows.reduce((s, r) => s + r.tax, 0)
  return { rows, intra, taxableTotal, taxTotal, grandTotal: taxableTotal + taxTotal }
}
