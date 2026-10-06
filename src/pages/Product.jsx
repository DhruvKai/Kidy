import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, Ruler, ShoppingBag, Lightning, ArrowUUpLeft, HandCoins, SealCheck, Tag, CaretDown, X, Copy, ShareNetwork, Eye } from '@phosphor-icons/react'
import { useStore, useVisibleProducts, toast } from '../store/useStore'
import { priceOf, isDeal, totalStock } from '../lib/pricing'
import { rupees } from '../lib/format'
import { CATEGORIES, SIZE_ORDER } from '../data/catalog'
import { BUNDLE } from '../data/coupons'
import { COMMERCE, STORE } from '../config'
import { reviewsFor, ratingBreakdown } from '../data/reviews'
import { Breadcrumbs, Price, Rating, Stars, Swatch } from '../components/ui'
import SizeChartModal from '../components/SizeChartModal'
import PincodeChecker from '../components/PincodeChecker'
import CountdownTimer from '../components/CountdownTimer'
import ProductRail from '../components/ProductRail'
import NotFound from './NotFound'

function Gallery({ images, title }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const zoomRef = useRef(null)
  const scroller = useRef(null)

  // Hover zoom writes straight to the DOM so mouse moves don't re-render React.
  const onMove = (e) => {
    const el = zoomRef.current
    if (!el) return
    const r = e.currentTarget.getBoundingClientRect()
    el.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
    el.style.transform = 'scale(2)'
  }
  const onLeave = () => { if (zoomRef.current) zoomRef.current.style.transform = 'scale(1)' }
  const onScroll = (e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))

  return (
    <div>
      {/* Mobile: swipe gallery */}
      <div className="relative -mx-4 md:hidden">
        <div ref={scroller} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
          {images.map((src, i) => (
            <button key={src + i} type="button" onClick={() => setLightbox(true)} className="aspect-[4/5] w-full shrink-0 snap-center" aria-label={`Open image ${i + 1} full screen`}>
              <img src={src} alt={i === 0 ? title : ''} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-night' : 'w-1.5 bg-night/30'}`} />)}
          </div>
        )}
      </div>

      {/* Desktop: thumbnails + hover zoom */}
      <div className="hidden gap-4 md:flex">
        {images.length > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-3">
            {images.map((src, i) => (
              <button key={src + i} type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} className={`aspect-[4/5] overflow-hidden rounded-xl border-2 transition ${i === active ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="relative flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-surface" onMouseMove={onMove} onMouseLeave={onLeave} onClick={() => setLightbox(true)}>
          <img ref={zoomRef} src={images[active]} alt={title} className="aspect-[4/5] w-full object-cover transition-transform duration-200 ease-out" />
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold">Hover to zoom</span>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-surface" role="dialog" aria-modal="true" aria-label="Image viewer">
          <div className="flex items-center justify-between p-3">
            <span className="text-sm font-bold">{active + 1} / {images.length}</span>
            <button type="button" onClick={() => setLightbox(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5" aria-label="Close"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-auto" style={{ touchAction: 'pinch-zoom' }}>
            <img src={images[active]} alt={title} className="mx-auto max-h-full w-auto max-w-full object-contain" />
          </div>
          {images.length > 1 && (
            <div className="flex justify-center gap-2 p-3">
              {images.map((src, i) => (
                <button key={i} type="button" onClick={() => setActive(i)} className={`h-16 w-12 overflow-hidden rounded-lg border-2 ${i === active ? 'border-ink' : 'border-transparent'}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Accordion({ title, children, open = false }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-extrabold">
        {title}
        <CaretDown size={16} className="transition group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  )
}

function Reviews({ product }) {
  const reviews = useMemo(() => reviewsFor(product), [product])
  const bars = useMemo(() => ratingBreakdown(product), [product])
  const max = Math.max(...bars)
  return (
    <section id="reviews" className="scroll-mt-28 py-10">
      <h2 className="section-title">Ratings and reviews</h2>
      <div className="mt-6 grid gap-8 md:grid-cols-[280px_1fr]">
        <div>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-extrabold">{product.rating.toFixed(1)}</span>
            <span className="pb-2"><Stars value={product.rating} size={18} /><span className="block text-xs text-muted">{product.reviewCount} ratings (sample data)</span></span>
          </div>
          <ul className="mt-4 flex flex-col gap-1.5">
            {bars.map((n, i) => (
              <li key={i} className="flex items-center gap-2 text-xs font-bold">
                <span className="w-3">{5 - i}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-go" style={{ width: `${max ? (n / max) * 100 : 0}%` }} /></span>
                <span className="w-8 text-right text-muted">{n}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => toast('Reviews open once your order is delivered.', 'default')} className="btn-secondary mt-5 w-full">Write a review</button>
        </div>
        <ul className="flex flex-col gap-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <Stars value={r.stars} />
                <span className="font-extrabold">{r.title}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/85">{r.body}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span className="font-bold text-ink">{r.name}, {r.city}</span>
                <span>Size bought: {r.size}</span>
                {r.verified && <span className="inline-flex items-center gap-1 font-bold text-mint-700"><SealCheck size={14} weight="fill" /> Verified buyer</span>}
                <span>{r.daysAgo} days ago</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function Product() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const allProducts = useStore((s) => s.products)
  const visible = useVisibleProducts()
  const product = allProducts.find((p) => p.slug === slug)
  const addToCart = useStore((s) => s.addToCart)
  const viewProduct = useStore((s) => s.viewProduct)
  const wished = useStore((s) => (product ? s.wishlist.includes(product.id) : false))
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const coupons = useStore((s) => s.coupons)
  const recentIds = useStore((s) => s.recentlyViewed)

  const firstInStock = product?.colours.find((c) => product.variants.some((v) => v.colour === c && v.stock > 0)) || product?.colours[0]
  const [colour, setColour] = useState(firstInStock)
  const [size, setSize] = useState(product?.sizes.length === 1 ? product.sizes[0] : null)
  const [sizeError, setSizeError] = useState(false)
  const [chartOpen, setChartOpen] = useState(false)
  const sizeRef = useRef(null)

  useEffect(() => {
    if (!product) return
    viewProduct(product.id)
    document.title = `${product.title} | Kidy`
    setColour(firstInStock)
    setSize(product.sizes.length === 1 ? product.sizes[0] : null)
    setSizeError(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  const similar = useMemo(() => {
    if (!product) return []
    return visible
      .filter((p) => p.id !== product.id && (p.sub === product.sub || (p.category === product.category && p.gender === product.gender)))
      .sort((a, b) => (b.sub === product.sub) - (a.sub === product.sub) || b.sold - a.sold)
      .slice(0, 10)
  }, [visible, product])

  if (!product) return <NotFound />

  const cat = CATEGORIES.find((c) => c.slug === product.category)
  const price = priceOf(product)
  const stockOf = (s) => product.variants.find((v) => v.size === s && v.colour === colour)?.stock ?? 0
  const selectedStock = size ? stockOf(size) : null
  const allOut = totalStock(product) === 0
  const sizes = [...product.sizes].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
  const inBundle = BUNDLE.subs.includes(product.sub)
  const offers = coupons.filter((c) => c.active && (!c.onlyTag || product.tags.includes(c.onlyTag)))
  const recent = recentIds.filter((id) => id !== product.id).map((id) => visible.find((p) => p.id === id)).filter(Boolean)
  const isLive = product.status === 'published'

  const requireSize = () => {
    if (size && selectedStock > 0) return true
    setSizeError(true)
    sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }
  const add = () => {
    if (!requireSize()) return
    addToCart({ productId: product.id, size, colour })
    toast('Added to your bag', 'success', { label: 'View bag', to: '/cart' })
  }
  const buyNow = () => {
    if (!requireSize()) return
    addToCart({ productId: product.id, size, colour })
    navigate('/checkout')
  }
  const wish = () => {
    const added = toggleWishlist(product.id)
    toast(added ? 'Saved to your wishlist' : 'Removed from wishlist', added ? 'success' : 'default')
  }
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.title, url })
      else { await navigator.clipboard.writeText(url); toast('Link copied', 'success') }
    } catch { /* dismissed */ }
  }

  return (
    <div className="container-x pb-28 pt-4 lg:pb-10">
      {!isLive && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-sunny-100 px-4 py-3 text-sm font-bold text-sunny-700">
          <Eye size={18} /> Preview: this product is {product.status} and not visible to customers yet.
        </div>
      )}
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: cat.name, to: `/c/${cat.slug}` }, { label: product.sub, to: `/c/${cat.slug}?sub=${encodeURIComponent(product.sub)}` }, { label: product.title }]} />

      <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="md:sticky md:top-24 md:self-start">
          <Gallery images={product.images} title={product.title} />
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link to={`/search?q=${encodeURIComponent(product.brand)}`} className="text-sm font-bold text-coral-700">{product.brand}</Link>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-3xl">{product.title}</h1>
            </div>
            <button type="button" onClick={share} aria-label="Share" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line hover:bg-ink/5"><ShareNetwork size={18} /></button>
          </div>
          {product.reviewCount > 0 ? <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm"><Rating value={product.rating} /> <span className="font-semibold text-muted underline-offset-2 hover:underline">{product.reviewCount} reviews</span></a> : <p className="mt-2 text-sm font-bold text-ocean-600">Just launched</p>}

          <div className="mt-4">
            <Price price={price} mrp={product.mrp} size="lg" />
            <p className="mt-1 text-xs text-muted">MRP inclusive of all taxes</p>
          </div>

          {isDeal(product) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-sunny-50 p-3">
              <Lightning size={20} weight="fill" className="text-sunny-500" />
              <span className="text-sm font-bold">Deal price ends tonight</span>
              <CountdownTimer className="scale-90" />
            </div>
          )}
          {inBundle && (
            <p className="mt-4 flex items-center gap-2 rounded-2xl bg-coral-50 px-4 py-3 text-sm font-bold text-coral-700"><Tag size={18} /> {BUNDLE.name}. Add any 3 and the price drops in your bag.</p>
          )}

          {/* Colour */}
          {product.colours.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-extrabold">Colour: <span className="font-semibold text-muted">{colour}</span></p>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.colours.map((c) => <Swatch key={c} colour={c} size="lg" selected={c === colour} onClick={() => setColour(c)} />)}
              </div>
            </div>
          )}

          {/* Size */}
          <div ref={sizeRef} className="mt-6 scroll-mt-32">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold">Size (by age)</p>
              <button type="button" onClick={() => setChartOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-bold text-coral-700"><Ruler size={16} /> Size chart</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => {
                const st = stockOf(s)
                const on = size === s
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={st === 0}
                    onClick={() => { setSize(s); setSizeError(false) }}
                    aria-pressed={on}
                    className={`relative min-w-[4.5rem] rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold transition ${on ? 'border-ink bg-ink text-surface' : 'border-line bg-surface hover:border-ink/50'} disabled:cursor-not-allowed disabled:border-dashed disabled:text-muted/60 disabled:line-through`}
                  >
                    {s}
                    {st > 0 && st <= COMMERCE.lowStockThreshold && <span className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 text-[10px] ${on ? 'bg-brand text-white' : 'bg-coral-100 text-coral-700'}`}>{st} left</span>}
                  </button>
                )
              })}
            </div>
            {sizeError && <p className="mt-2 text-sm font-bold text-coral-700">{size && selectedStock === 0 ? 'This size is sold out in this colour.' : 'Please pick a size first.'}</p>}
            {selectedStock > 0 && selectedStock <= COMMERCE.lowStockThreshold && <p className="mt-2 text-sm font-bold text-coral-700">Only {selectedStock} left in {size}.</p>}
          </div>

          {/* Actions */}
          <div className="mt-6 hidden gap-3 lg:flex">
            {allOut ? (
              <button type="button" onClick={() => toast('We will WhatsApp you when it is back in stock.', 'success')} className="btn-dark flex-1 py-3.5 text-base">Notify me when back</button>
            ) : (
              <>
                <button type="button" onClick={add} className="btn-primary flex-1 py-3.5 text-base"><ShoppingBag size={20} /> Add to bag</button>
                <button type="button" onClick={buyNow} className="btn-dark flex-1 py-3.5 text-base">Buy now</button>
              </>
            )}
            <button type="button" onClick={wish} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wished} className="grid w-14 shrink-0 place-items-center rounded-full border border-line bg-surface hover:border-ink/40">
              <Heart size={22} weight={wished ? 'fill' : 'bold'} className={wished ? 'text-coral-600' : ''} />
            </button>
          </div>

          <div className="mt-6"><PincodeChecker /></div>

          {offers.length > 0 && (
            <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold"><Tag size={18} /> Offers for you</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {offers.map((c) => (
                  <li key={c.code} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted">{c.description}</span>
                    <button type="button" onClick={() => { navigator.clipboard?.writeText(c.code); toast(`Code ${c.code} copied`, 'success') }} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-coral-400 px-2 py-1 text-xs font-extrabold text-coral-700">
                      {c.code} <Copy size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-3"><ArrowUUpLeft size={22} className="text-coral-600" /> {COMMERCE.returnDays}-day easy returns</span>
            <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-3"><HandCoins size={22} className="text-coral-600" /> Cash on delivery</span>
            <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-3"><SealCheck size={22} className="text-coral-600" /> Quality checked</span>
          </div>

          <div className="mt-6">
            <Accordion title="Product details" open>
              <p>{product.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {[['Fabric', product.fabric], ['Occasion', product.occasion], ['Gender', product.gender[0].toUpperCase() + product.gender.slice(1)], ['Product code', product.code]].map(([k, v]) => (
                  <div key={k}><dt className="text-xs">{k}</dt><dd className="font-bold text-ink">{v}</dd></div>
                ))}
              </dl>
            </Accordion>
            <Accordion title="Fabric and care">
              <ul className="list-disc space-y-1 pl-5">{product.care.map((c) => <li key={c}>{c}</li>)}</ul>
            </Accordion>
            <Accordion title="Returns and exchanges">
              <p>Free returns or size exchanges within {COMMERCE.returnDays} days of delivery. Items must be unused with tags attached. We pick up from your door, and refunds go to your original payment method or store credit.</p>
            </Accordion>
            <Accordion title="Legal information">
              <dl className="grid gap-2">
                {[
                  ['MRP', `${rupees(product.mrp)} inclusive of all taxes`],
                  ['Net quantity', product.title.toLowerCase().includes('pack of 3') ? '3 N' : '1 N'],
                  ['Country of origin', product.countryOfOrigin],
                  ['Manufactured and packed by', product.manufacturer],
                  ['Sold by', `${STORE.seller.legalName}, ${STORE.seller.address}`],
                  ['Customer care', `${STORE.supportPhone}, ${STORE.email}`],
                ].map(([k, v]) => <div key={k}><dt className="text-xs">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>)}
              </dl>
            </Accordion>
          </div>
        </div>
      </div>

      {product.reviewCount > 0 && <Reviews product={product} />}

      {similar.length > 0 && (
        <section className="py-8">
          <h2 className="section-title mb-6">You may also like</h2>
          <ProductRail products={similar} label="Similar products" />
        </section>
      )}
      {recent.length > 0 && (
        <section className="py-8">
          <h2 className="section-title mb-6">Recently viewed</h2>
          <ProductRail products={recent} label="Recently viewed" />
        </section>
      )}

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <button type="button" onClick={wish} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line">
            <Heart size={22} weight={wished ? 'fill' : 'bold'} className={wished ? 'text-coral-600' : ''} />
          </button>
          {allOut ? (
            <button type="button" onClick={() => toast('We will WhatsApp you when it is back in stock.', 'success')} className="btn-dark h-12 flex-1">Notify me</button>
          ) : (
            <>
              <button type="button" onClick={add} className="btn-primary h-12 flex-1">Add to bag</button>
              <button type="button" onClick={buyNow} className="btn-dark h-12 flex-1">Buy now</button>
            </>
          )}
        </div>
      </div>

      <SizeChartModal open={chartOpen} onClose={() => setChartOpen(false)} product={product} onPick={(s) => { if (stockOf(s) > 0) { setSize(s); setSizeError(false) } else toast(`${s} is sold out in ${colour}`, 'error') }} />
    </div>
  )
}
