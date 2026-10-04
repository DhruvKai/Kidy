import { AGE_GROUPS, SIZE_ORDER } from '../data/catalog'
import { priceOf } from './pricing'
import { discountPct } from './format'

export const PRICE_RANGES = [
  { id: 'u500', label: 'Under ₹500', min: 0, max: 499 },
  { id: '500-999', label: '₹500 to ₹999', min: 500, max: 999 },
  { id: '1000-1999', label: '₹1,000 to ₹1,999', min: 1000, max: 1999 },
  { id: '2000+', label: '₹2,000 and above', min: 2000, max: Infinity },
]
export const DISCOUNTS = [
  { id: '10', label: '10% off or more' }, { id: '25', label: '25% off or more' },
  { id: '40', label: '40% off or more' }, { id: '50', label: '50% off or more' },
]
export const GENDERS = [{ id: 'boys', label: 'Boys' }, { id: 'girls', label: 'Girls' }, { id: 'unisex', label: 'Unisex' }]

export const SORTS = [
  { id: 'popular', label: 'Popularity' },
  { id: 'new', label: 'Newest first' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'discount', label: 'Biggest discount' },
  { id: 'rating', label: 'Customer rating' },
]

export const FILTER_KEYS = ['age', 'size', 'gender', 'price', 'colour', 'fabric', 'brand', 'occasion', 'discount']

const matchers = {
  age: (p, vals) => vals.some((v) => AGE_GROUPS.find((a) => a.id === v)?.sizes.some((s) => p.sizes.includes(s))),
  size: (p, vals) => vals.some((v) => p.sizes.includes(v)),
  gender: (p, vals) => vals.includes(p.gender),
  price: (p, vals) => vals.some((v) => { const r = PRICE_RANGES.find((x) => x.id === v); const pr = priceOf(p); return r && pr >= r.min && pr <= r.max }),
  colour: (p, vals) => vals.some((v) => p.colours.includes(v)),
  fabric: (p, vals) => vals.includes(p.fabric),
  brand: (p, vals) => vals.includes(p.brand),
  occasion: (p, vals) => vals.includes(p.occasion),
  discount: (p, vals) => discountPct(p.mrp, priceOf(p)) >= Math.min(...vals.map(Number)),
}

export function readFilters(params) {
  const f = {}
  for (const k of FILTER_KEYS) {
    const v = params.get(k)
    if (v) f[k] = v.split(',').filter(Boolean)
  }
  return f
}

export function applyFilters(list, filters, skip) {
  return list.filter((p) => Object.entries(filters).every(([k, vals]) => k === skip || !vals.length || matchers[k](p, vals)))
}

export function sortProducts(list, sort) {
  const l = [...list]
  switch (sort) {
    case 'new': return l.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo)
    case 'price-asc': return l.sort((a, b) => priceOf(a) - priceOf(b))
    case 'price-desc': return l.sort((a, b) => priceOf(b) - priceOf(a))
    case 'discount': return l.sort((a, b) => discountPct(b.mrp, priceOf(b)) - discountPct(a.mrp, priceOf(a)))
    case 'rating': return l.sort((a, b) => b.rating - a.rating)
    default: return l.sort((a, b) => b.sold - a.sold)
  }
}

// Options and counts for each filter group, given the other active filters.
export function buildFacets(base, filters) {
  const count = (key, test) => applyFilters(base, filters, key).filter(test).length
  const distinct = (fn) => [...new Set(base.flatMap(fn))]
  const sizes = distinct((p) => p.sizes).sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
  return [
    { key: 'age', label: 'Age group', options: AGE_GROUPS.map((a) => ({ id: a.id, label: a.label, count: count('age', (p) => a.sizes.some((s) => p.sizes.includes(s))) })) },
    { key: 'size', label: 'Size', chips: true, options: sizes.map((s) => ({ id: s, label: s, count: count('size', (p) => p.sizes.includes(s)) })) },
    { key: 'gender', label: 'Gender', options: GENDERS.map((g) => ({ ...g, count: count('gender', (p) => p.gender === g.id) })) },
    { key: 'price', label: 'Price', options: PRICE_RANGES.map((r) => ({ id: r.id, label: r.label, count: count('price', (p) => priceOf(p) >= r.min && priceOf(p) <= r.max) })) },
    { key: 'colour', label: 'Colour', swatches: true, options: distinct((p) => p.colours).sort().map((c) => ({ id: c, label: c, count: count('colour', (p) => p.colours.includes(c)) })) },
    { key: 'fabric', label: 'Fabric', options: distinct((p) => [p.fabric]).sort().map((f) => ({ id: f, label: f, count: count('fabric', (p) => p.fabric === f) })) },
    { key: 'brand', label: 'Brand', options: distinct((p) => [p.brand]).sort().map((b) => ({ id: b, label: b, count: count('brand', (p) => p.brand === b) })) },
    { key: 'occasion', label: 'Occasion', options: distinct((p) => [p.occasion]).sort().map((o) => ({ id: o, label: o, count: count('occasion', (p) => p.occasion === o) })) },
    { key: 'discount', label: 'Discount', single: true, options: DISCOUNTS.map((d) => ({ ...d, count: count('discount', (p) => discountPct(p.mrp, priceOf(p)) >= Number(d.id)) })) },
  ].map((g) => ({ ...g, options: g.options.filter((o) => o.count > 0 || (filters[g.key] || []).includes(o.id)) }))
    .filter((g) => g.options.length > 0)
}

export function labelFor(key, id) {
  if (key === 'age') return AGE_GROUPS.find((a) => a.id === id)?.label || id
  if (key === 'price') return PRICE_RANGES.find((r) => r.id === id)?.label || id
  if (key === 'discount') return DISCOUNTS.find((d) => d.id === id)?.label || id
  if (key === 'gender') return GENDERS.find((g) => g.id === id)?.label || id
  return id
}
