import { hash } from './products'

const NAMES = ['Ananya R.', 'Rahul M.', 'Sneha P.', 'Farah K.', 'Vikram S.', 'Meera J.', 'Arjun T.', 'Kavya N.', 'Harpreet G.', 'Divya L.', 'Rohan B.', 'Ishita D.', 'Neha V.', 'Sameer A.', 'Lakshmi I.']
const CITIES = ['Pune', 'Bengaluru', 'Delhi', 'Ludhiana', 'Chennai', 'Jaipur', 'Kochi', 'Mumbai', 'Hyderabad', 'Lucknow', 'Indore', 'Kolkata']
const TEXT = [
  [5, 'Lovely quality!', 'Fabric is really soft and the stitching is neat. My daughter did not want to take it off.'],
  [5, 'Perfect fit', 'Ordered as per the size chart and it fit perfectly. Colour is exactly like the photo.'],
  [4, 'Good value for money', 'Nice material for the price. Slightly loose but they will grow into it.'],
  [5, 'Fast delivery', 'Got it in 3 days with COD. Packing was neat and it came with a thank-you note.'],
  [4, 'Cute design', 'Very cute and comfortable. Colour faded a tiny bit after first wash but still good.'],
  [5, 'Got so many compliments', 'Wore it for a family function and everyone asked where we bought it.'],
  [3, 'Size runs small', 'Quality is fine but go one size up. Exchange was easy though.'],
  [5, 'Soft on baby skin', 'No rashes at all, my baby is very sensitive so this matters a lot to us.'],
  [4, 'Nice but delivery took time', 'Product is good. Delivery took 6 days to our town.'],
]

// Sample reviews for the demo, generated deterministically per product.
export function reviewsFor(product) {
  const h = hash(product.id + 'rv')
  return [0, 1, 2].map((i) => {
    const [stars, title, body] = TEXT[(h + i * 4) % TEXT.length]
    return {
      id: `${product.id}-r${i}`,
      name: NAMES[(h + i * 5) % NAMES.length],
      city: CITIES[(h + i * 7) % CITIES.length],
      stars, title, body,
      daysAgo: 3 + ((h >> (i + 2)) % 60),
      size: product.sizes[(h + i) % product.sizes.length],
      verified: (h + i) % 5 !== 0,
      helpful: (h >> i) % 40,
    }
  })
}

export function ratingBreakdown(product) {
  const h = hash(product.id + 'rb')
  const total = product.reviewCount
  const five = Math.round(total * (0.5 + (h % 20) / 100))
  const four = Math.round(total * (0.22 + (h % 7) / 100))
  const three = Math.round(total * 0.08)
  const two = Math.round(total * 0.03)
  const one = Math.max(0, total - five - four - three - two)
  return [five, four, three, two, one]
}
