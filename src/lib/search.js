import Fuse from 'fuse.js'

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '')
const STOPWORDS = new Set(['for', 'kids', 'kid', 'children', 'child', 'the', 'and', 'with', 'of', 'in', 'a', 'to'])

const SYNONYMS = {
  'T-Shirts': 'tshirt tee tees top', 'Tops & Tees': 'tshirt tee tees top', Shirts: 'shirt',
  'Frocks & Dresses': 'frock dress gown', 'Party Wear': 'party dress gown suit',
  'Ethnic Wear': 'ethnic kurta lehenga traditional indian festive diwali', Nightwear: 'pyjama pajama nightsuit nightwear sleepwear',
  'Rompers & Onesies': 'romper onesie bodysuit jumpsuit', 'Baby Sets': 'baby set', Sleepsuits: 'sleepsuit romper',
  'Jackets & Hoodies': 'jacket hoodie sweatshirt', Winterwear: 'winter sweater sweatshirt', Sets: 'set combo outfit',
  'Co-ord Sets': 'coord set combo outfit', Sneakers: 'shoes sneaker', Ballerinas: 'shoes flats', 'Party Shoes': 'shoes',
  'Pre-walkers': 'shoes baby', Booties: 'shoes booties', Bags: 'bag backpack school', Sunglasses: 'sunglasses goggles', Socks: 'socks',
}

let cache = { products: null, fuse: null }

function getFuse(products) {
  if (cache.products === products) return cache.fuse
  const docs = products.map((p) => ({
    id: p.id,
    code: p.code.toLowerCase(),
    t: norm(p.title),
    k: norm([p.sub, p.category, p.gender, p.brand, p.fabric, p.occasion, p.colours.join(' '), p.tags.join(' '), SYNONYMS[p.sub] || ''].join(' ')),
  }))
  const fuse = new Fuse(docs, {
    keys: [{ name: 't', weight: 0.55 }, { name: 'k', weight: 0.35 }, { name: 'code', weight: 0.1 }],
    threshold: 0.34, ignoreLocation: true, includeScore: true, minMatchCharLength: 2,
  })
  cache = { products, fuse }
  return fuse
}

// Each word must match (typos allowed); results are ranked by combined score.
export function searchProducts(products, query) {
  const q = query.trim()
  if (!q) return []
  const code = q.match(/^kw-?(\d{3,5})$/i)
  if (code) return products.filter((p) => p.code === `KW-${code[1]}`)
  const tokens = norm(q).split(/\s+/).filter((t) => t.length > 1 && !STOPWORDS.has(t))
  if (!tokens.length) return []
  const fuse = getFuse(products)
  let scores = null
  for (const t of tokens) {
    const map = new Map(fuse.search(t).map((r) => [r.item.id, r.score]))
    if (!scores) scores = map
    else {
      for (const id of [...scores.keys()]) {
        if (!map.has(id)) scores.delete(id)
        else scores.set(id, scores.get(id) + map.get(id))
      }
    }
  }
  const byId = Object.fromEntries(products.map((p) => [p.id, p]))
  // Boost results where a whole word is a near match ("tshrt" -> "tshirt"), so a
  // T-shirt outranks a "sweatshirt" that merely contains the letters.
  const docs = Object.fromEntries(fuse.getIndex().docs.map((d) => [d.id, `${d.t} ${d.k}`.split(/\s+/)]))
  for (const [id, s] of scores) {
    const words = docs[id] || []
    const hits = tokens.filter((t) => words.some((w) => w.startsWith(t) || editDistance(t, w) <= 1)).length
    scores.set(id, s - hits * 0.6)
  }
  return [...scores.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => byId[id])
}

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = tmp
    }
  }
  return prev[b.length]
}
