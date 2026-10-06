// Public files are served under the deploy base ('/' or '/Kidy/' on GitHub Pages).
export const asset = (path) => import.meta.env.BASE_URL + path.replace(/^\//, '')
export const img = (id) => asset(`images/products/${id}.webp`)
export const banner = (id) => asset(`images/banners/${id}.webp`)
export const bannerSet = (id) => `${banner(`${id}-800`)} 800w, ${banner(id)} 1600w`

export const CATEGORIES = [
  {
    slug: 'boys', name: 'Boys', image: img('5560015'), tint: 'bg-ocean-100',
    subs: ['T-Shirts', 'Shirts', 'Sets', 'Ethnic Wear', 'Party Wear', 'Jackets & Hoodies', 'Winterwear', 'Nightwear'],
  },
  {
    slug: 'girls', name: 'Girls', image: img('18476125'), tint: 'bg-coral-100',
    subs: ['Frocks & Dresses', 'Tops & Tees', 'Co-ord Sets', 'Ethnic Wear', 'Party Wear', 'Nightwear'],
  },
  {
    slug: 'newborn', name: 'Newborn', image: img('7973642'), tint: 'bg-mint-100',
    subs: ['Rompers & Onesies', 'Baby Sets', 'Sleepsuits'],
  },
  {
    slug: 'footwear', name: 'Footwear', image: img('39256094'), tint: 'bg-sunny-100',
    subs: ['Sneakers', 'Ballerinas', 'Party Shoes', 'Pre-walkers', 'Booties'],
  },
  {
    slug: 'accessories', name: 'Accessories', image: img('4887244'), tint: 'bg-lilac-100',
    subs: ['Bags', 'Sunglasses', 'Socks'],
  },
]

export const COLLECTIONS = {
  all: { name: 'All Products', blurb: 'Everything in store, newborn to 14 years.' },
  new: { name: 'New Arrivals', blurb: 'Fresh drops for the new season.' },
  bestsellers: { name: 'Best Sellers', blurb: 'What parents are loving right now.' },
  festive: { name: 'Festive Edit', blurb: 'Navratri & Diwali outfits they will remember.' },
  sale: { name: 'Big Savings', blurb: 'Styles at 40% off or more.' },
  ethnic: { name: 'Ethnic Wear', blurb: 'Kurtas, lehengas and sherwanis for every celebration.' },
  party: { name: 'Party Wear', blurb: 'Birthday dresses, gowns and tuxedos.' },
  nightwear: { name: 'Nightwear', blurb: 'Soft, breathable pyjamas for sweet dreams.' },
}

// Sizes are by age, the way Indian parents shop.
export const SIZE_ORDER = ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-8Y', '8-10Y', '10-12Y', '12-14Y', 'Free Size']

export const AGE_GROUPS = [
  { id: '0-6M', label: '0-6 Months', short: '0-6M', sizes: ['0-3M', '3-6M'], image: img('7973642'), tint: 'bg-mint-100' },
  { id: '6-24M', label: '6-24 Months', short: '6-24M', sizes: ['6-12M', '12-18M', '18-24M'], image: img('37529058'), tint: 'bg-sunny-100' },
  { id: '2-4Y', label: '2-4 Years', short: '2-4Y', sizes: ['2-3Y', '3-4Y'], image: img('4715320'), tint: 'bg-ocean-100' },
  { id: '4-8Y', label: '4-8 Years', short: '4-8Y', sizes: ['4-5Y', '5-6Y', '6-8Y'], image: img('9554842'), tint: 'bg-coral-100' },
  { id: '8-14Y', label: '8-14 Years', short: '8-14Y', sizes: ['8-10Y', '10-12Y', '12-14Y'], image: img('31685109'), tint: 'bg-lilac-100' },
]

export const COLOURS = {
  Red: '#e53935', Pink: '#f48fb1', Blush: '#f6c9c4', Peach: '#ffb38a', Orange: '#fb8c00',
  Mustard: '#e1ad01', Yellow: '#fdd835', Cream: '#fff3d6', Mint: '#a8e6cf', Green: '#2e9d4f',
  Olive: '#708238', 'Sky Blue': '#81d4fa', Blue: '#1e88e5', Navy: '#1f2a6b', Denim: '#4a6fa5',
  Purple: '#7e57c2', Grey: '#9e9e9e', Black: '#212121', White: '#ffffff', Beige: '#d7c4a3',
  Tan: '#c68e5a', Brown: '#7b4a2e', Silver: '#c0c4cc', Multicolour: 'conic-gradient(#e53935, #fdd835, #43a047, #1e88e5, #7e57c2, #e53935)',
}

export const FABRICS = ['Cotton', 'Organic Cotton', 'Cotton Knit', 'Cotton Silk', 'Cotton Blend', 'Fleece', 'Denim', 'Linen Blend', 'Rayon', 'Silk Blend', 'Art Silk', 'Banarasi Silk', 'Jacquard', 'Tulle', 'Satin', 'Poly Viscose', 'Polyester', 'Swim Lycra', 'Genuine Leather', 'PU Leather', 'Patent PU', 'Soft PU', 'Canvas', 'Mesh', 'Wool Blend', 'Polycarbonate']
export const OCCASIONS = ['Casual', 'Festive', 'Party', 'Wedding', 'Birthday', 'Sleepwear', 'Sports', 'School', 'Beach', 'Dance', 'Gifting']
export const BRANDS = ['Kidy Basics', 'Little Lotus', 'Playday', 'Party Pixie', 'Tiny Toes']

// HSN codes per sub-category (set once per category, as the spec asks).
export const HSN_BY_SUB = {
  'T-Shirts': '6109', 'Tops & Tees': '6109', Shirts: '6205', Sets: '6203', 'Co-ord Sets': '6204',
  'Ethnic Wear': '6211', 'Party Wear': '6204', 'Jackets & Hoodies': '6110', Winterwear: '6110',
  'Frocks & Dresses': '6204', Nightwear: '6108', 'Rompers & Onesies': '6111', 'Baby Sets': '6111',
  Sleepsuits: '6111', Sneakers: '6404', Ballerinas: '6402', 'Party Shoes': '6402', 'Pre-walkers': '6404',
  Booties: '6403', Bags: '4202', Sunglasses: '9004', Socks: '6115',
}
