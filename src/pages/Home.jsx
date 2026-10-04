import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CaretLeft, CaretRight, ArrowRight, Lightning, Star } from '@phosphor-icons/react'
import { useStore, useVisibleProducts, toast } from '../store/useStore'
import { CATEGORIES, AGE_GROUPS, banner, bannerSet, img } from '../data/catalog'
import { DEAL_PRICES } from '../data/products'
import ProductRail from '../components/ProductRail'
import ProductCard from '../components/ProductCard'
import CountdownTimer from '../components/CountdownTimer'

const SLIDES = [
  {
    title: 'The Diwali Edit is here',
    body: 'Lehengas, kurta sets and sherwanis for every puja and party, newborn to 14 years.',
    cta: ['Shop festive', '/c/festive'],
    alt: ['Kurta sets', '/c/boys?sub=Ethnic%20Wear'],
    image: '8819219',
    tint: 'bg-sunny-100',
    pos: 'object-[30%_center]',
  },
  {
    title: 'Fresh drops for little explorers',
    body: 'Hoodies, co-ords and everyday tees in soft, breathable cotton.',
    cta: ['Shop new arrivals', '/c/new'],
    alt: ['Boys', '/c/boys'],
    image: '5560083',
    tint: 'bg-ocean-100',
    pos: 'object-center',
  },
  {
    title: 'Any 3 tees for ₹999',
    body: 'Mix sizes and colours. The discount applies on its own in your bag.',
    cta: ['Shop tees', '/search?q=tshirt'],
    alt: ['Girls', '/c/girls'],
    image: '9532753',
    tint: 'bg-coral-100',
    pos: 'object-center',
  },
]

function HeroSlider() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [paused])
  const go = (d) => setI((n) => (n + d + SLIDES.length) % SLIDES.length)

  return (
    <section aria-roledescription="carousel" aria-label="Featured collections" className="container-x pt-4 md:pt-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative overflow-hidden rounded-3xl">
        <div className="flex transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s, n) => (
            <div key={s.title} className={`grid w-full shrink-0 md:grid-cols-[1fr_1.15fr] ${s.tint}`} aria-hidden={n !== i} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${SLIDES.length}`}>
              <div className="order-2 flex flex-col justify-center px-6 pb-10 pt-6 md:order-1 md:px-12 md:py-14 lg:px-16">
                <h1 className="max-w-md text-[2.1rem] font-extrabold leading-[1.05] text-ink md:text-5xl lg:text-[3.4rem]">{s.title}</h1>
                <p className="mt-3 max-w-sm text-base text-ink/75 md:mt-4 md:text-lg">{s.body}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to={s.cta[1]} tabIndex={n === i ? 0 : -1} className="btn-primary px-6 py-3 text-base">{s.cta[0]}</Link>
                  <Link to={s.alt[1]} tabIndex={n === i ? 0 : -1} className="btn-secondary px-6 py-3 text-base">{s.alt[0]}</Link>
                </div>
              </div>
              <div className="order-1 aspect-[16/10] md:order-2 md:aspect-auto md:min-h-[420px] lg:min-h-[460px]">
                <img
                  src={banner(s.image)}
                  srcSet={bannerSet(s.image)}
                  sizes="(min-width: 768px) 55vw, 100vw"
                  alt=""
                  className={`h-full w-full object-cover ${s.pos}`}
                  fetchPriority={n === 0 ? 'high' : 'low'}
                  loading={n === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-1 left-4 flex items-center md:left-10 lg:left-14">
          {SLIDES.map((s, n) => (
            <button key={s.title} type="button" onClick={() => setI(n)} aria-label={`Show slide ${n + 1}`} aria-current={n === i} className="grid h-8 min-w-6 place-items-center px-1">
              <span className={`block h-2 rounded-full transition-all ${n === i ? 'w-8 bg-ink' : 'w-2 bg-ink/30 hover:bg-night/60'}`} />
            </button>
          ))}
        </div>
        <div className="absolute bottom-3 right-4 hidden gap-2 md:flex">
          <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="grid h-10 w-10 place-items-center rounded-full bg-surface/90 shadow-soft hover:bg-surface"><CaretLeft size={18} /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next slide" className="grid h-10 w-10 place-items-center rounded-full bg-surface/90 shadow-soft hover:bg-surface"><CaretRight size={18} /></button>
        </div>
      </div>
    </section>
  )
}

function SectionHead({ title, to, linkLabel = 'View all' }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
      <h2 className="section-title">{title}</h2>
      {to && <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-coral-700 hover:gap-2 transition-all">{linkLabel} <ArrowRight size={16} /></Link>}
    </div>
  )
}

function ShopByAge() {
  return (
    <section className="container-x py-10 md:py-14">
      <SectionHead title="Shop by age" />
      <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-5 md:gap-6 md:px-0">
        {AGE_GROUPS.map((a) => (
          <Link key={a.id} to={`/c/all?age=${a.id}`} className="group flex w-28 shrink-0 snap-start flex-col items-center md:w-auto">
            <span className={`aspect-square w-full overflow-hidden rounded-full ${a.tint} ring-4 ring-transparent transition group-hover:ring-coral-200`}>
              <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </span>
            <span className="mt-3 text-center font-display text-lg font-bold leading-tight md:text-xl">{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

const BENTO = [
  { slug: 'boys', image: img('3771680'), cls: 'col-span-2 md:col-span-3 md:row-span-2', big: true },
  { slug: 'girls', image: img('18476125'), cls: 'col-span-2 md:col-span-3', pos: 'object-[center_25%]' },
  { slug: 'newborn', image: img('7973642'), cls: 'col-span-1' },
  { slug: 'footwear', image: img('39256094'), cls: 'col-span-1' },
  { slug: 'accessories', image: img('4887244'), cls: 'col-span-2 md:col-span-1' },
]

function CategoryBento() {
  return (
    <section className="container-x pb-10 md:pb-14">
      <SectionHead title="Shop by category" />
      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[230px] md:grid-cols-6 md:gap-4">
        {BENTO.map((b) => {
          const cat = CATEGORIES.find((c) => c.slug === b.slug)
          return (
            <Link key={b.slug} to={`/c/${b.slug}`} className={`group relative overflow-hidden rounded-2xl ${cat.tint} ${b.cls}`}>
              <img src={b.image} alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${b.pos || 'object-center'}`} />
              <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night/70 via-night/20 to-transparent" />
              <span className="absolute bottom-0 left-0 p-4 md:p-5">
                <span className={`block font-display font-extrabold text-white ${b.big ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`}>{cat.name}</span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-bold text-white/90 transition-all group-hover:gap-2">Shop now <ArrowRight size={14} /></span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function Deals({ products }) {
  const deals = products.filter((p) => DEAL_PRICES[p.id])
  if (!deals.length) return null
  return (
    <section className="bg-sunny-50 py-10 md:py-14">
      <div className="container-x grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        <div className="flex flex-col justify-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sunny-400 text-night"><Lightning size={26} weight="fill" /></span>
          <h2 className="section-title mt-4">Deals of the day</h2>
          <p className="mt-2 text-sm text-muted">Extra savings on six favourites. Prices go back to normal at midnight.</p>
          <CountdownTimer className="mt-5" />
        </div>
        <div className="min-w-0">
          <ProductRail products={deals} label="Deals of the day" />
        </div>
      </div>
    </section>
  )
}

function FestiveFeature({ products }) {
  const festive = products.filter((p) => p.tags.includes('festive')).sort((a, b) => b.sold - a.sold).slice(0, 4)
  return (
    <section className="container-x py-10 md:py-16">
      <div className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-10">
        <Link to="/c/festive" className="group relative block min-h-[280px] overflow-hidden rounded-3xl lg:col-span-5 lg:min-h-0">
          <img src={banner('26316187')} srcSet={bannerSet('26316187')} sizes="(min-width: 1024px) 40vw, 100vw" alt="Three children in traditional outfits holding hands" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </Link>
        <div className="flex flex-col lg:col-span-7">
          <h2 className="section-title">Navratri to Diwali, sorted</h2>
          <p className="mt-2 max-w-lg text-muted">Soft linings, easy fastenings and twirl-ready silhouettes, so the outfit lasts as long as the celebration.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
            {festive.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <Link to="/c/festive" className="btn-dark mt-6 self-start px-6 py-3">Shop festive</Link>
        </div>
      </div>
    </section>
  )
}

const TABS = [['all', 'All'], ['boys', 'Boys'], ['girls', 'Girls'], ['newborn', 'Newborn'], ['footwear', 'Footwear']]

function BestSellers({ products }) {
  const [tab, setTab] = useState('all')
  const list = useMemo(
    () => products.filter((p) => tab === 'all' || p.category === tab).sort((a, b) => b.sold - a.sold).slice(0, 8),
    [products, tab],
  )
  return (
    <section className="container-x py-10 md:py-14">
      <SectionHead title="Best sellers" to={tab === 'all' ? '/c/bestsellers' : `/c/${tab}?sort=popular`} />
      <div role="tablist" aria-label="Best sellers by category" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)} className={`chip shrink-0 px-4 py-2 text-sm ${tab === id ? 'chip-active' : ''}`}>{label}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}

const QUOTES = [
  { body: 'The organic romper pack is so soft. No rashes at all, and it survived 20 washes without losing shape.', name: 'Ritika Bansal', meta: 'Mother of a 4-month-old, Ludhiana' },
  { body: 'Ordered the yellow kurta set on Tuesday and it arrived by Thursday with COD. My son wore it for Ganesh Chaturthi.', name: 'Suresh Pillai', meta: 'Father of a 6-year-old, Kochi' },
  { body: 'The size chart by age is spot on. Exchange for a bigger size was picked up from home the next day.', name: 'Mehak Arora', meta: 'Mother of twins, Gurugram' },
  { body: 'Bought the lehenga for my niece as a Diwali gift. Gift wrap was neat and the price was hidden on the invoice.', name: 'Anjali Deshpande', meta: 'Aunt and repeat customer, Pune' },
]

function Reviews() {
  return (
    <section className="py-10 md:py-14">
      <div className="container-x">
        <SectionHead title="Parents say it best" />
      </div>
      <div role="region" aria-label="Customer reviews" tabIndex={0} className="no-scrollbar container-x flex snap-x scroll-px-4 gap-4 overflow-x-auto pb-2 md:scroll-px-6">
        {QUOTES.map((q) => (
          <figure key={q.name} className="flex w-[85%] shrink-0 snap-start flex-col justify-between rounded-2xl bg-surface p-6 shadow-soft sm:w-[46%] lg:w-[31%]">
            <div>
              <span className="flex text-sunny-500">{[0, 1, 2, 3, 4].map((n) => <Star key={n} size={16} weight="fill" />)}</span>
              <blockquote className="mt-3 line-clamp-3 text-[15px] font-semibold leading-relaxed text-ink">“{q.body}”</blockquote>
            </div>
            <figcaption className="mt-5 text-sm">
              <span className="block font-extrabold">{q.name}</span>
              <span className="text-muted">{q.meta}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Newsletter() {
  const [value, setValue] = useState('')
  const [done, setDone] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (!/^([6-9]\d{9}|[^@\s]+@[^@\s]+\.[^@\s]+)$/.test(value.trim())) return toast('Enter a valid email or 10-digit mobile number.', 'error')
    setDone(true)
    toast('Subscribed. Use code FIRST10 at checkout.', 'success')
  }
  return (
    <section className="container-x py-6 md:py-10">
      <div className="grid overflow-hidden rounded-3xl bg-coral-50 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-center p-7 md:p-12">
          <h2 className="section-title">10% off your first order</h2>
          <p className="mt-2 max-w-md text-muted">New arrivals, size restocks and festive sale alerts. No spam, unsubscribe any time.</p>
          {done ? (
            <p className="mt-6 rounded-2xl bg-surface px-4 py-3 text-sm font-bold">You are in. Your code is <span className="text-coral-700">FIRST10</span>.</p>
          ) : (
            <form onSubmit={submit} className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="nl" className="sr-only">Email or mobile number</label>
              <input id="nl" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Email or mobile number" className="input h-12 flex-1 rounded-full px-5" />
              <button className="btn-primary h-12 px-6">Subscribe</button>
            </form>
          )}
        </div>
        <img src={banner('4714950')} alt="" loading="lazy" className="hidden h-full max-h-80 w-full object-cover md:block" />
      </div>
    </section>
  )
}

export default function Home() {
  const products = useVisibleProducts()
  const recentIds = useStore((s) => s.recentlyViewed)
  const newArrivals = useMemo(() => products.filter((p) => p.tags.includes('new')).sort((a, b) => a.createdDaysAgo - b.createdDaysAgo), [products])
  const recent = recentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean)

  useEffect(() => { document.title = 'KiDDY WiDDY | Kids clothing from newborn to 14 years' }, [])

  return (
    <>
      <HeroSlider />
      <ShopByAge />
      <CategoryBento />
      <Deals products={products} />
      <FestiveFeature products={products} />
      <section className="container-x py-10 md:py-14">
        <SectionHead title="New arrivals" to="/c/new" />
        <ProductRail products={newArrivals} label="New arrivals" />
      </section>
      <BestSellers products={products} />
      <Reviews />
      {recent.length > 0 && (
        <section className="container-x py-10">
          <SectionHead title="Recently viewed" />
          <ProductRail products={recent} label="Recently viewed" />
        </section>
      )}
      <Newsletter />
    </>
  )
}
