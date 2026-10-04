import { img, HSN_BY_SUB } from './catalog'

const NB = ['0-3M', '3-6M', '6-12M']
const INF = ['6-12M', '12-18M', '18-24M']
const TOD = ['2-3Y', '3-4Y', '4-5Y']
const KID = ['4-5Y', '5-6Y', '6-8Y']
const BIG = ['8-10Y', '10-12Y', '12-14Y']
const uniq = (...lists) => [...new Set(lists.flat())]

// Small deterministic hash so stock, ratings and reviews look varied but never change between reloads.
export function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const SUB_COPY = {
  'T-Shirts': 'Pre-washed for a soft hand-feel, with a tag-free neck so it never itches. Pairs with shorts, joggers or jeans.',
  'Tops & Tees': 'Pre-washed for a soft hand-feel, with a tag-free neck so it never itches. Easy to style for school days and weekends.',
  Shirts: 'Easy button front, a relaxed fit for playtime and a smart look for family outings.',
  Sets: 'A ready-to-wear outfit, no matching needed. Elasticated waist for easy on, easy off.',
  'Co-ord Sets': 'A ready-to-wear matching set. Elasticated waist and a relaxed fit for all-day comfort.',
  'Ethnic Wear': 'Soft inner lining so delicate skin stays comfortable through long celebrations. Perfect for pujas, weddings and family functions.',
  'Party Wear': 'Made to twirl and pose, with comfortable lining inside and show-stopping details outside.',
  'Jackets & Hoodies': 'Warm without being bulky, with roomy pockets for little treasures.',
  Winterwear: 'Brushed fleece inside keeps them cosy on chilly mornings.',
  'Frocks & Dresses': 'Flowy, breathable and easy to wear, with a back opening that makes dressing quick.',
  Nightwear: 'Breathable fabric and a gentle elastic waist for comfortable, sound sleep.',
  'Rompers & Onesies': 'Nickel-free snap buttons for quick diaper changes. Gentle on newborn skin.',
  'Baby Sets': 'Soft, skin-friendly fabric with easy openings for quick changes.',
  Sleepsuits: 'Full-length comfort with envelope neck and snap buttons for easy night changes.',
  Sneakers: 'Velcro straps so they can put them on themselves. Cushioned insole and anti-skid sole.',
  Ballerinas: 'Padded insole and a flexible, anti-skid sole for little feet.',
  'Party Shoes': 'Cushioned insole and a soft back so the party lasts longer than the shoes hurt.',
  'Pre-walkers': 'Soft, flexible sole that lets tiny feet feel the ground while they learn to walk.',
  Booties: 'Soft and warm, designed to stay on wriggly little feet.',
  Bags: 'Lightweight with padded straps, a front zip pocket and a water-resistant finish.',
  Sunglasses: 'UV400 protection with a flexible, child-safe frame.',
  Socks: 'Soft stretch cuff that stays up without leaving marks.',
}

const CARE = {
  default: ['Machine wash cold, gentle cycle', 'Wash dark colours separately', 'Do not bleach', 'Tumble dry low or line dry in shade', 'Warm iron if needed'],
  ethnic: ['Dry clean recommended for the first wash', 'Hand wash cold separately after that', 'Do not wring', 'Dry in shade', 'Iron on reverse side'],
  footwear: ['Wipe clean with a damp cloth', 'Air dry away from direct sunlight', 'Do not machine wash'],
  accessory: ['Wipe clean with a soft damp cloth', 'Store away from direct heat'],
}

function mk(n, o) {
  const id = `kw${n}`
  const code = `KW-${n}`
  const slug = `${o.title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${n}`
  const h = hash(id)
  const variants = []
  for (const colour of o.colours) {
    for (const size of o.sizes) {
      const vh = hash(`${id}-${size}-${colour}`)
      const r = vh % 100
      const stock = r < 7 ? 0 : r < 22 ? 1 + (vh % 5) : 6 + (vh % 22)
      variants.push({
        sku: `${code}-${size.replace(/[^0-9A-Z]/gi, '')}-${colour.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase()}`,
        size, colour, stock,
      })
    }
  }
  const isFootwear = o.category === 'footwear'
  const isAccessory = o.category === 'accessories'
  return {
    id, code, slug,
    brand: 'KiDDY WiDDY Basics',
    fabric: 'Cotton',
    occasion: 'Casual',
    tags: [],
    ...o,
    images: o.images.map(img),
    variants,
    hsn: HSN_BY_SUB[o.sub] || '6209',
    weight: isFootwear ? 350 : isAccessory ? 300 : o.category === 'newborn' ? 180 : 260,
    rating: Math.round((3.9 + (h % 10) / 11) * 10) / 10,
    reviewCount: 12 + (h % 470),
    sold: 40 + (h % 900),
    createdDaysAgo: o.tags?.includes('new') ? h % 12 : 20 + (h % 120),
    countryOfOrigin: 'India',
    manufacturer: 'KiDDY WiDDY Retail, Tiruppur, Tamil Nadu (demo)',
    description: `${o.hl}. ${SUB_COPY[o.sub] || ''}`.trim(),
    care: isFootwear ? CARE.footwear : isAccessory ? CARE.accessory : o.sub === 'Ethnic Wear' ? CARE.ethnic : CARE.default,
    status: 'published',
  }
}

export const SEED_PRODUCTS = [
  // ---------- Boys ----------
  mk(1001, { title: 'Colour-Block Cotton T-Shirt', category: 'boys', sub: 'T-Shirts', gender: 'boys', sizes: uniq(KID, ['8-10Y']), colours: ['Grey', 'Navy', 'Olive'], mrp: 699, price: 449, images: ['9554842'], tags: ['bestseller'], hl: 'Breathable 100% cotton jersey with a two-tone colour-block body' }),
  mk(1002, { title: 'Sunshine Shirt & Shorts Set', brand: 'Playday', category: 'boys', sub: 'Sets', gender: 'boys', sizes: uniq(TOD, KID), colours: ['Yellow', 'White'], mrp: 1299, price: 749, images: ['3771680'], tags: ['new'], hl: 'A breezy half-sleeve shirt in sunshine yellow with matching chino shorts' }),
  mk(1003, { title: 'Checked Flannel Shirt', brand: 'Playday', category: 'boys', sub: 'Shirts', gender: 'boys', sizes: uniq(KID, ['8-10Y', '10-12Y']), colours: ['Red', 'Blue'], mrp: 1199, price: 699, images: ['8421895'], hl: 'Brushed cotton flannel in a classic check. Wear it buttoned up or open over a tee' }),
  mk(1004, { title: 'Brooklyn Crew Sweatshirt', category: 'boys', sub: 'Winterwear', gender: 'boys', sizes: uniq(TOD, KID), colours: ['Grey', 'Navy'], fabric: 'Fleece', mrp: 999, price: 649, images: ['5560015'], tags: ['new'], hl: 'A varsity-style crew-neck sweatshirt with ribbed cuffs and hem' }),
  mk(1005, { title: 'Mandarin Collar Kurta Pyjama Set', brand: 'Little Lotus', category: 'boys', sub: 'Ethnic Wear', gender: 'boys', sizes: uniq(KID, BIG), colours: ['Yellow', 'White'], fabric: 'Cotton Silk', occasion: 'Festive', mrp: 2199, price: 1299, images: ['17015459', '17015449'], tags: ['festive', 'bestseller'], hl: 'A sunshine-yellow cotton silk kurta with a printed nehru-style jacket and churidar pyjama' }),
  mk(1006, { title: 'Mint Pathani Kurta', brand: 'Little Lotus', category: 'boys', sub: 'Ethnic Wear', gender: 'boys', sizes: BIG, colours: ['Mint', 'White'], occasion: 'Festive', mrp: 1499, price: 899, images: ['12095442'], tags: ['festive'], hl: 'A clean, long-line pathani kurta in a cool mint cotton' }),
  mk(1007, { title: 'Rust Cotton Kurta', brand: 'Little Lotus', category: 'boys', sub: 'Ethnic Wear', gender: 'boys', sizes: uniq(KID, BIG), colours: ['Brown', 'Mustard'], occasion: 'Festive', mrp: 1299, price: 799, images: ['8789412'], tags: ['festive'], hl: 'An earthy rust kurta with a band collar and side pockets' }),
  mk(1008, { title: 'Little Prince Sherwani Set', brand: 'Little Lotus', category: 'boys', sub: 'Ethnic Wear', gender: 'boys', sizes: ['12-18M', '18-24M', '2-3Y', '3-4Y'], colours: ['Cream'], fabric: 'Jacquard', occasion: 'Wedding', mrp: 3999, price: 2499, images: ['12303643'], tags: ['festive'], hl: 'A regal cream jacquard sherwani with churidar and a matching safa' }),
  mk(1009, { title: 'Tuxedo Party Suit with Bow Tie', brand: 'Party Pixie', category: 'boys', sub: 'Party Wear', gender: 'boys', sizes: uniq(KID, ['8-10Y']), colours: ['Black'], fabric: 'Poly Viscose', occasion: 'Party', mrp: 4499, price: 2799, images: ['36909815'], tags: ['new'], hl: 'A sharp four-piece tuxedo: blazer, shirt, trousers and a satin bow tie' }),
  mk(1010, { title: 'Classic Denim Jacket', brand: 'Playday', category: 'boys', sub: 'Jackets & Hoodies', gender: 'unisex', sizes: TOD, colours: ['Denim'], fabric: 'Denim', mrp: 1699, price: 999, images: ['15704149'], hl: 'A light-wash denim jacket with soft-washed cotton that is comfy from day one' }),
  mk(1011, { title: 'Denim Jacket & Jeans Combo', brand: 'Playday', category: 'boys', sub: 'Sets', gender: 'boys', sizes: uniq(['18-24M'], TOD), colours: ['Denim'], fabric: 'Denim', mrp: 2299, price: 1399, images: ['16396430'], hl: 'A double-denim combo with a stretch-waist jean and a printed tee underneath' }),
  mk(1012, { title: 'Retro Stripe Track Suit', brand: 'Playday', category: 'boys', sub: 'Sets', gender: 'boys', sizes: uniq(TOD, KID), colours: ['Orange', 'Navy'], fabric: 'Polyester', occasion: 'Sports', mrp: 1799, price: 1099, images: ['31637479'], tags: ['new'], hl: 'A zip-up track jacket and joggers with retro side stripes' }),
  mk(1013, { title: 'Colour-Block Zip Hoodie', category: 'boys', sub: 'Jackets & Hoodies', gender: 'unisex', sizes: uniq(['18-24M'], TOD), colours: ['Cream', 'Grey'], fabric: 'Fleece', mrp: 1399, price: 849, images: ['18631856'], hl: 'A zip-through hoodie with contrast sleeves and a snug hood' }),
  mk(1014, { title: 'Shark Fin Hoodie', brand: 'Playday', category: 'boys', sub: 'Jackets & Hoodies', gender: 'unisex', sizes: uniq(TOD, KID), colours: ['Grey'], fabric: 'Fleece', mrp: 1499, price: 899, images: ['1907001'], tags: ['bestseller'], hl: 'A playful pullover hoodie with shark teeth around the hood' }),
  mk(1015, { title: 'Smart Casual Co-ord Set', brand: 'Party Pixie', category: 'boys', sub: 'Sets', gender: 'boys', sizes: uniq(TOD, KID), colours: ['Grey'], occasion: 'Party', mrp: 1999, price: 1199, images: ['18493896'], hl: 'A tonal grey shirt and trouser set for birthday parties and family dinners' }),
  mk(1016, { title: 'Monochrome Print Co-ord Set', brand: 'Playday', category: 'boys', sub: 'Sets', gender: 'boys', sizes: uniq(KID, ['8-10Y']), colours: ['Black', 'White'], mrp: 1899, price: 1149, images: ['15227232'], hl: 'An all-over printed sweatshirt and jogger set with street-style attitude' }),
  mk(1017, { title: 'Striped Tee & Dungaree Set', brand: 'Playday', category: 'boys', sub: 'Sets', gender: 'unisex', sizes: ['18-24M', '2-3Y', '3-4Y'], colours: ['Navy'], fabric: 'Cotton', mrp: 1599, price: 899, images: ['4715320', '4715315'], tags: ['bestseller'], hl: 'A Breton-stripe tee with adjustable cotton twill dungarees' }),
  mk(1124, { title: 'Matching Sibling Pyjamas', category: 'boys', sub: 'Nightwear', gender: 'unisex', sizes: uniq(TOD, KID, ['8-10Y']), colours: ['Grey'], occasion: 'Sleepwear', mrp: 999, price: 599, images: ['18820123'], hl: 'Soft printed pyjama sets, sized for every sibling so they can match' }),

  // ---------- Girls ----------
  mk(1101, { title: 'Off-Shoulder Tulle Party Dress', brand: 'Party Pixie', category: 'girls', sub: 'Party Wear', gender: 'girls', sizes: uniq(KID, ['8-10Y']), colours: ['Silver', 'Blush'], fabric: 'Tulle', occasion: 'Party', mrp: 2999, price: 1899, images: ['12159459'], tags: ['new'], hl: 'Layers of soft tulle with an off-shoulder neckline and a floral waist trim' }),
  mk(1102, { title: 'Rainbow Stripe Tiered Dress', brand: 'Playday', category: 'girls', sub: 'Frocks & Dresses', gender: 'girls', sizes: uniq(KID, ['8-10Y', '10-12Y']), colours: ['Multicolour'], mrp: 1699, price: 999, images: ['18476125'], tags: ['bestseller'], hl: 'A tiered cotton dress in happy rainbow stripes' }),
  mk(1103, { title: 'Floral Smock Frock', category: 'girls', sub: 'Frocks & Dresses', gender: 'girls', sizes: uniq(['18-24M'], TOD), colours: ['Cream', 'Pink'], fabric: 'Organic Cotton', mrp: 1199, price: 699, images: ['8421969'], tags: ['bestseller'], hl: 'A puff-sleeve organic cotton frock with a sweet ditsy floral print' }),
  mk(1104, { title: 'Pink Floral Maxi Dress', brand: 'Playday', category: 'girls', sub: 'Frocks & Dresses', gender: 'girls', sizes: BIG, colours: ['Pink'], fabric: 'Rayon', mrp: 1799, price: 1099, images: ['31685109'], hl: 'A floaty rayon maxi in bold fuchsia florals' }),
  mk(1105, { title: 'Everyday Black Cotton Tee', category: 'girls', sub: 'Tops & Tees', gender: 'girls', sizes: uniq(KID, BIG), colours: ['Black', 'White', 'Pink'], mrp: 599, price: 399, images: ['32071161'], tags: ['bestseller'], hl: 'The perfect everyday crew-neck tee in soft combed cotton' }),
  mk(1106, { title: 'Oversized Grey Tee', category: 'girls', sub: 'Tops & Tees', gender: 'girls', sizes: BIG, colours: ['Grey'], mrp: 699, price: 449, images: ['30683087'], tags: ['new'], hl: 'A relaxed, drop-shoulder tee in heather grey' }),
  mk(1107, { title: 'Smiley Graphic Crop Top', brand: 'Playday', category: 'girls', sub: 'Tops & Tees', gender: 'girls', sizes: uniq(TOD, KID), colours: ['White'], mrp: 599, price: 399, images: ['15298313'], tags: ['new'], hl: 'A cheerful smiley-face graphic top with a cropped hem' }),
  mk(1108, { title: 'Leopard Print Joggers & Top Set', brand: 'Playday', category: 'girls', sub: 'Co-ord Sets', gender: 'girls', sizes: uniq(KID, ['8-10Y']), colours: ['Beige'], mrp: 1599, price: 949, images: ['6673270'], hl: 'Leopard-print joggers with a cold-shoulder white top' }),
  mk(1109, { title: 'Festive Lehenga Choli Set', brand: 'Little Lotus', category: 'girls', sub: 'Ethnic Wear', gender: 'girls', sizes: uniq(TOD, KID), colours: ['Orange', 'Green'], fabric: 'Silk Blend', occasion: 'Festive', mrp: 2799, price: 1699, images: ['12100636'], tags: ['festive', 'bestseller'], hl: 'A twirl-ready lehenga with a zari-embroidered choli and a soft net dupatta' }),
  mk(1110, { title: 'Navratri Chaniya Choli', brand: 'Little Lotus', category: 'girls', sub: 'Ethnic Wear', gender: 'girls', sizes: uniq(['18-24M'], TOD), colours: ['Orange'], occasion: 'Festive', mrp: 2499, price: 1499, images: ['18983042'], tags: ['festive', 'new'], hl: 'A mirror-work chaniya choli made for garba nights' }),
  mk(1111, { title: 'Silk Lehenga with Dupatta', brand: 'Little Lotus', category: 'girls', sub: 'Ethnic Wear', gender: 'girls', sizes: BIG, colours: ['Orange'], fabric: 'Art Silk', occasion: 'Wedding', mrp: 4999, price: 2999, images: ['32718419'], tags: ['festive'], hl: 'An art-silk lehenga with a contrast blouse and gota-trim dupatta for weddings' }),
  mk(1112, { title: 'Pink Banarasi Lehenga Set', brand: 'Little Lotus', category: 'girls', sub: 'Ethnic Wear', gender: 'girls', sizes: uniq(KID, BIG), colours: ['Pink'], fabric: 'Banarasi Silk', occasion: 'Festive', mrp: 3499, price: 2199, images: ['8819112', '8819142'], tags: ['festive', 'bestseller'], hl: 'A rani-pink Banarasi lehenga with gold zari weave, made for Diwali' }),
  mk(1113, { title: 'Indo-Western Navy Gown', brand: 'Party Pixie', category: 'girls', sub: 'Party Wear', gender: 'girls', sizes: uniq(TOD, KID), colours: ['Navy'], fabric: 'Satin', occasion: 'Party', mrp: 2999, price: 1799, images: ['15730103'], tags: ['festive'], hl: 'A navy satin gown with embroidered yoke and a flared skirt' }),
  mk(1114, { title: 'Green Floral Anarkali', brand: 'Little Lotus', category: 'girls', sub: 'Ethnic Wear', gender: 'girls', sizes: uniq(TOD, KID), colours: ['Green'], occasion: 'Festive', mrp: 1999, price: 1299, images: ['11392710'], tags: ['festive'], hl: 'A floor-length cotton anarkali with a bold floral print' }),
  mk(1115, { title: 'Emerald Tiered Cotton Dress', category: 'girls', sub: 'Frocks & Dresses', gender: 'girls', sizes: BIG, colours: ['Green'], mrp: 1499, price: 899, images: ['5593961'], hl: 'An emerald cotton dress with schiffli tiers and a smocked bodice' }),
  mk(1116, { title: 'Ice Blue Princess Gown', brand: 'Party Pixie', category: 'girls', sub: 'Party Wear', gender: 'girls', sizes: uniq(KID, ['8-10Y']), colours: ['Sky Blue'], fabric: 'Tulle', occasion: 'Party', mrp: 3799, price: 2299, images: ['38411100'], tags: ['new'], hl: 'A frothy ice-blue tulle gown with puff sleeves and a satin bow' }),
  mk(1117, { title: 'Blush Birthday Dress', brand: 'Party Pixie', category: 'girls', sub: 'Party Wear', gender: 'girls', sizes: uniq(TOD, KID), colours: ['Pink'], fabric: 'Cotton Blend', occasion: 'Birthday', mrp: 1999, price: 1199, images: ['8101660'], hl: 'A soft blush dress with flutter sleeves, made for cake-cutting photos' }),
  mk(1118, { title: 'Denim Jacket & Skirt Set', brand: 'Playday', category: 'girls', sub: 'Co-ord Sets', gender: 'girls', sizes: ['12-18M', '18-24M', '2-3Y'], colours: ['Denim'], fabric: 'Denim', mrp: 1799, price: 1099, images: ['18862066'], hl: 'A cropped denim jacket and matching skirt with a printed tee' }),
  mk(1119, { title: 'Knit Cardigan & Jeans Set', category: 'girls', sub: 'Co-ord Sets', gender: 'girls', sizes: TOD, colours: ['Pink'], fabric: 'Cotton Knit', mrp: 1599, price: 999, images: ['5560013'], hl: 'A chunky knit cardigan layered over a striped tee, with stretch jeans' }),
  mk(1120, { title: 'Blush Top & Leggings Set', category: 'girls', sub: 'Co-ord Sets', gender: 'girls', sizes: uniq(TOD, KID), colours: ['Blush'], mrp: 1199, price: 749, images: ['37101826'], hl: 'A boxy blush tunic top with opaque cotton leggings' }),
  mk(1121, { title: 'Lemon Sundress', brand: 'Playday', category: 'girls', sub: 'Frocks & Dresses', gender: 'girls', sizes: uniq(TOD, KID), colours: ['Yellow'], fabric: 'Organic Cotton', mrp: 1299, price: 799, images: ['4711728'], tags: ['new'], hl: 'A buttoned organic cotton sundress in lemon yellow' }),
  mk(1122, { title: 'Lemon Print Pyjama Set', category: 'girls', sub: 'Nightwear', gender: 'unisex', sizes: uniq(TOD, KID), colours: ['Cream'], fabric: 'Organic Cotton', occasion: 'Sleepwear', mrp: 999, price: 599, images: ['18820105'], hl: 'Organic cotton pyjamas covered in a cheerful citrus print' }),
  mk(1123, { title: 'Animal Print Night Suit', category: 'girls', sub: 'Nightwear', gender: 'unisex', sizes: uniq(TOD, KID), colours: ['White'], occasion: 'Sleepwear', mrp: 1099, price: 649, images: ['18863554'], tags: ['bestseller'], hl: 'A full-sleeve night suit with a friendly animal print' }),

  // ---------- Newborn ----------
  mk(1201, { title: 'Pack of 3 Animal Sleeveless Rompers', brand: 'Tiny Toes', category: 'newborn', sub: 'Rompers & Onesies', gender: 'unisex', sizes: NB, colours: ['Multicolour'], fabric: 'Organic Cotton', mrp: 1499, price: 899, images: ['34121886'], tags: ['bestseller'], hl: 'Three organic cotton rompers with panda, daisy and teddy appliqués' }),
  mk(1202, { title: 'Striped Tee, Shorts & Cap Set', brand: 'Tiny Toes', category: 'newborn', sub: 'Baby Sets', gender: 'unisex', sizes: INF, colours: ['Black', 'White'], mrp: 1199, price: 749, images: ['34121887'], tags: ['new'], hl: 'A three-piece monochrome stripe set with a matching cap' }),
  mk(1203, { title: 'Power Sweatshirt & Jogger Set', brand: 'Tiny Toes', category: 'newborn', sub: 'Baby Sets', gender: 'boys', sizes: INF, colours: ['Navy'], fabric: 'Fleece', mrp: 1299, price: 799, images: ['32233564'], hl: 'A tiger-badge sweatshirt with tipped collar and matching joggers' }),
  mk(1204, { title: 'Striped Knit Sweater & Pants', brand: 'Tiny Toes', category: 'newborn', sub: 'Baby Sets', gender: 'unisex', sizes: ['3-6M', '6-12M', '12-18M'], colours: ['Olive'], fabric: 'Cotton Knit', mrp: 1599, price: 999, images: ['28259749'], hl: 'A collared knit sweater with animal-print pull-on pants' }),
  mk(1205, { title: 'Peach Bow Romper', brand: 'Tiny Toes', category: 'newborn', sub: 'Rompers & Onesies', gender: 'girls', sizes: NB, colours: ['Peach'], mrp: 999, price: 649, images: ['29015877'], hl: 'A full-length peach romper with lace yoke and tiny bows' }),
  mk(1206, { title: 'Little Gentleman Romper with Bow Tie', brand: 'Tiny Toes', category: 'newborn', sub: 'Rompers & Onesies', gender: 'boys', sizes: ['6-12M', '12-18M'], colours: ['White'], fabric: 'Linen Blend', occasion: 'Party', mrp: 1499, price: 899, images: ['32771041'], tags: ['festive'], hl: 'A linen-blend romper with a button placket and clip-on bow tie' }),
  mk(1207, { title: 'Gingham Off-Shoulder Set', brand: 'Tiny Toes', category: 'newborn', sub: 'Baby Sets', gender: 'girls', sizes: INF, colours: ['Red'], mrp: 1099, price: 699, images: ['37529058'], hl: 'A red gingham ruffle top with leggings and a matching headband' }),
  mk(1208, { title: 'Bear Hood Romper', brand: 'Tiny Toes', category: 'newborn', sub: 'Sleepsuits', gender: 'unisex', sizes: NB, colours: ['White', 'Grey'], fabric: 'Organic Cotton', occasion: 'Sleepwear', mrp: 1299, price: 799, images: ['7973642'], tags: ['bestseller'], hl: 'A snuggly romper with a teddy-ear hood and checked shorts' }),
  mk(1209, { title: 'Sailor Stripe Swim Romper & Hat', brand: 'Tiny Toes', category: 'newborn', sub: 'Rompers & Onesies', gender: 'unisex', sizes: INF, colours: ['Navy', 'White'], fabric: 'Swim Lycra', occasion: 'Beach', mrp: 999, price: 599, images: ['17048717'], hl: 'A UPF 50 sailor-stripe swim romper with a life-buoy sun hat' }),
  mk(1210, { title: 'Duck Embroidered Dungaree Romper', brand: 'Tiny Toes', category: 'newborn', sub: 'Rompers & Onesies', gender: 'unisex', sizes: NB, colours: ['Sky Blue'], mrp: 899, price: 549, images: ['36709406'], hl: 'A striped dungaree romper with embroidered ducklings' }),
  mk(1211, { title: 'Knit Cardigan & Mary Jane Gift Set', brand: 'Tiny Toes', category: 'newborn', sub: 'Baby Sets', gender: 'girls', sizes: ['3-6M', '6-12M'], colours: ['Pink'], fabric: 'Cotton Knit', occasion: 'Gifting', mrp: 1899, price: 1199, images: ['30791355'], tags: ['festive'], hl: 'A popcorn-knit cardigan with matching glitter Mary Janes, gift-boxed' }),

  // ---------- Footwear ----------
  mk(1301, { title: 'Bow Ballerina Flats', brand: 'Tiny Toes', category: 'footwear', sub: 'Ballerinas', gender: 'girls', sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y'], colours: ['Black'], fabric: 'PU Leather', occasion: 'Party', mrp: 1199, price: 699, images: ['39256094'], hl: 'Classic black ballerinas with an oversized bow' }),
  mk(1302, { title: 'Tan Leather Lace-Up Booties', brand: 'Tiny Toes', category: 'footwear', sub: 'Booties', gender: 'unisex', sizes: ['12-18M', '18-24M', '2-3Y'], colours: ['Tan'], fabric: 'Genuine Leather', mrp: 1299, price: 799, images: ['13822967'], hl: 'Soft genuine-leather lace-ups for first steps and beyond' }),
  mk(1303, { title: 'Pink Ballet Shoes', brand: 'Tiny Toes', category: 'footwear', sub: 'Ballerinas', gender: 'girls', sizes: ['3-4Y', '4-5Y', '5-6Y', '6-8Y'], colours: ['Pink'], fabric: 'Canvas', occasion: 'Dance', mrp: 899, price: 549, images: ['31241090'], hl: 'Split-sole canvas ballet shoes with elastic straps' }),
  mk(1304, { title: 'Heart Pre-Walker Shoes', brand: 'Tiny Toes', category: 'footwear', sub: 'Pre-walkers', gender: 'girls', sizes: NB, colours: ['Pink'], mrp: 699, price: 449, images: ['792797'], tags: ['bestseller'], hl: 'Soft-sole pre-walkers with a little heart on each toe' }),
  mk(1305, { title: 'Bunny Pre-Walker Shoes', brand: 'Tiny Toes', category: 'footwear', sub: 'Pre-walkers', gender: 'unisex', sizes: ['3-6M', '6-12M', '12-18M'], colours: ['Yellow'], fabric: 'Soft PU', mrp: 799, price: 499, images: ['35753260'], tags: ['new'], hl: 'Sunny yellow pre-walkers with a bunny face and squeak-free sole' }),
  mk(1306, { title: 'Glitter Bow Party Shoes', brand: 'Party Pixie', category: 'footwear', sub: 'Party Shoes', gender: 'girls', sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y'], colours: ['Black', 'Silver'], fabric: 'Patent PU', occasion: 'Party', mrp: 1499, price: 849, images: ['29737094'], tags: ['festive'], hl: 'Shiny patent party shoes with a glitter bow' }),
  mk(1307, { title: 'Flower Velcro Sneakers', brand: 'Playday', category: 'footwear', sub: 'Sneakers', gender: 'unisex', sizes: uniq(TOD, KID), colours: ['White', 'Pink'], fabric: 'PU Leather', occasion: 'Casual', mrp: 1699, price: 999, images: ['17895637'], tags: ['bestseller'], hl: 'Clean white sneakers with tiny flower prints and easy triple velcro straps' }),
  mk(1308, { title: 'Hand-Knit Baby Booties', brand: 'Tiny Toes', category: 'footwear', sub: 'Booties', gender: 'unisex', sizes: NB, colours: ['White'], fabric: 'Wool Blend', mrp: 599, price: 349, images: ['39462003'], tags: ['new'], hl: 'Hand-knitted wool-blend booties, soft as a cloud' }),

  // ---------- Accessories ----------
  mk(1401, { title: 'Unicorn School Backpack', brand: 'Playday', category: 'accessories', sub: 'Bags', gender: 'girls', sizes: ['Free Size'], colours: ['Purple'], fabric: 'Polyester', occasion: 'School', mrp: 1999, price: 1199, images: ['4887244'], tags: ['bestseller'], hl: 'A roomy unicorn backpack with a padded back and reflective trim' }),
  mk(1402, { title: 'Flower Sunglasses & Bear Sling Bag', brand: 'Playday', category: 'accessories', sub: 'Sunglasses', gender: 'girls', sizes: ['Free Size'], colours: ['Pink'], fabric: 'Polycarbonate', mrp: 999, price: 599, images: ['8084049'], tags: ['new'], hl: 'Flower-frame UV400 sunglasses with a matching teddy sling bag' }),
  mk(1403, { title: 'Bunny Ankle Socks, Pack of 3', brand: 'Tiny Toes', category: 'accessories', sub: 'Socks', gender: 'unisex', sizes: NB, colours: ['White', 'Grey'], mrp: 499, price: 299, images: ['14195487'], hl: 'Three pairs of combed-cotton ankle socks with bunny faces' }),
]

// Today's deals (extra discount while the daily timer runs).
export const DEAL_PRICES = { kw1014: 749, kw1103: 599, kw1201: 749, kw1307: 849, kw1109: 1499, kw1402: 499 }
