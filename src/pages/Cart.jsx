import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Truck, Tag, Trash, BookmarkSimple, WarningCircle, CheckCircle, ShieldCheck } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { computeCart, priceOf } from '../lib/pricing'
import { rupees } from '../lib/format'
import { COMMERCE } from '../config'
import { BUNDLE } from '../data/coupons'
import { SIZE_ORDER } from '../data/catalog'
import { Price, QuantityStepper, EmptyState } from '../components/ui'
import PriceSummary from '../components/PriceSummary'
import ProductRail from '../components/ProductRail'

function CouponBox({ summary }) {
  const coupons = useStore((s) => s.coupons)
  const applyCoupon = useStore((s) => s.applyCoupon)
  const removeCoupon = useStore((s) => s.removeCoupon)
  const [code, setCode] = useState('')
  const active = coupons.filter((c) => c.active)

  if (summary.coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-mint-400 bg-mint-50 p-4">
        <span className="flex items-center gap-2 text-sm"><CheckCircle size={20} weight="fill" className="text-mint-600" /><span><b>{summary.coupon.code}</b> applied. You save {rupees(summary.couponDiscount)}.</span></span>
        <button type="button" onClick={removeCoupon} className="text-sm font-bold text-coral-700">Remove</button>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-extrabold"><Tag size={18} /> Apply coupon</p>
      <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) applyCoupon(code) }} className="mt-3 flex gap-2">
        <label htmlFor="coupon" className="sr-only">Coupon code</label>
        <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" className="input uppercase" />
        <button className="btn-secondary shrink-0 px-5">Apply</button>
      </form>
      {summary.couponError && <p className="mt-2 text-xs font-bold text-coral-700">{summary.couponError}</p>}
      <ul className="mt-3 flex flex-col gap-2">
        {active.map((c) => (
          <li key={c.code} className="flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2.5">
            <span className="min-w-0">
              <span className="block text-xs font-extrabold">{c.code}</span>
              <span className="block text-xs text-muted">{c.description}</span>
            </span>
            <button type="button" onClick={() => applyCoupon(c.code)} className="shrink-0 text-xs font-extrabold text-coral-700">Apply</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CartLine({ line }) {
  const updateCartItem = useStore((s) => s.updateCartItem)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const saveForLater = useStore((s) => s.saveForLater)
  const p = line.product
  const sizes = [...p.sizes].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
  const stockFor = (size, colour) => p.variants.find((v) => v.size === size && v.colour === colour)?.stock ?? 0

  return (
    <li className="flex gap-4 border-b border-line py-5 last:border-0">
      <Link to={`/p/${p.slug}`} className="shrink-0">
        <img src={p.images[0]} alt={p.title} className="h-32 w-24 rounded-xl object-cover md:h-36 md:w-28" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted">{p.brand}</p>
            <Link to={`/p/${p.slug}`} className="line-clamp-2 font-bold leading-snug hover:text-coral-700">{p.title}</Link>
          </div>
          <button type="button" onClick={() => removeFromCart(line.key)} aria-label={`Remove ${p.title}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"><Trash size={18} /></button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`size-${line.key}`}>Size</label>
          <select id={`size-${line.key}`} value={line.size} onChange={(e) => updateCartItem(line.key, { size: e.target.value, qty: Math.min(line.qty, stockFor(e.target.value, line.colour)) || 1 })} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs font-bold">
            {sizes.map((s) => <option key={s} value={s} disabled={stockFor(s, line.colour) === 0}>Size {s}{stockFor(s, line.colour) === 0 ? ' (sold out)' : ''}</option>)}
          </select>
          {p.colours.length > 1 && (
            <>
              <label className="sr-only" htmlFor={`col-${line.key}`}>Colour</label>
              <select id={`col-${line.key}`} value={line.colour} onChange={(e) => updateCartItem(line.key, { colour: e.target.value })} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs font-bold">
                {p.colours.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <QuantityStepper small value={line.qty} max={Math.max(1, line.stock)} onChange={(qty) => updateCartItem(line.key, { qty })} />
          <div className="text-right">
            <Price price={line.lineTotal} mrp={line.lineMrp} />
          </div>
        </div>
        {line.stock === 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-coral-700"><WarningCircle size={14} /> Sold out in this size. Pick another size or remove it.</p>
        ) : line.qty > line.stock ? (
          <p className="mt-2 text-xs font-bold text-coral-700">Only {line.stock} left. Quantity will be reduced at checkout.</p>
        ) : line.stock <= COMMERCE.lowStockThreshold ? (
          <p className="mt-2 text-xs font-bold text-coral-700">Only {line.stock} left in {line.size}</p>
        ) : null}
        <button type="button" onClick={() => { saveForLater(line.key); toast('Moved to saved for later') }} className="mt-2 inline-flex items-center gap-1 self-start text-xs font-bold text-muted hover:text-ink"><BookmarkSimple size={14} /> Save for later</button>
      </div>
    </li>
  )
}

export default function Cart() {
  const navigate = useNavigate()
  const cart = useStore((s) => s.cart)
  const saved = useStore((s) => s.saved)
  const products = useStore((s) => s.products)
  const coupons = useStore((s) => s.coupons)
  const couponCode = useStore((s) => s.couponCode)
  const moveToCart = useStore((s) => s.moveToCart)
  const removeSaved = useStore((s) => s.removeSaved)
  const wishlist = useStore((s) => s.wishlist)

  useEffect(() => { document.title = 'Your bag | Kidy' }, [])
  const summary = useMemo(() => computeCart({ items: cart, products, couponCode, coupons }), [cart, products, couponCode, coupons])
  const blocked = summary.lines.some((l) => l.stock === 0)
  const savedLines = saved.map((s) => ({ ...s, product: products.find((p) => p.id === s.productId) })).filter((s) => s.product)
  const wishProducts = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean)
  const shipPct = Math.min(100, ((COMMERCE.freeShippingThreshold - summary.freeShipRemaining) / COMMERCE.freeShippingThreshold) * 100)

  if (!cart.length) {
    return (
      <div className="container-x pb-10">
        <EmptyState icon={ShoppingBag} title="Your bag is empty" body="Fill it with something little and lovely." action={<Link to="/" className="btn-primary px-8 py-3">Start shopping</Link>} />
        {savedLines.length > 0 && <SavedList lines={savedLines} moveToCart={moveToCart} removeSaved={removeSaved} />}
        {wishProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="section-title mb-5">From your wishlist</h2>
            <ProductRail products={wishProducts} label="Wishlist" />
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="container-x pb-32 pt-6 lg:pb-12">
      <h1 className="text-3xl font-extrabold md:text-4xl">Your bag <span className="text-lg font-bold text-muted">({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})</span></h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="rounded-2xl bg-surface p-4 shadow-soft">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Truck size={20} className={summary.freeShipRemaining ? 'text-ocean-500' : 'text-mint-600'} />
              {summary.freeShipRemaining > 0 ? <>Add <b>{rupees(summary.freeShipRemaining)}</b> more for free shipping</> : <>Yay, your order ships free!</>}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(shipPct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
              <div className={`h-full rounded-full transition-all duration-500 ${summary.freeShipRemaining ? 'bg-ocean-400' : 'bg-mint-400'}`} style={{ width: `${shipPct}%` }} />
            </div>
          </div>

          {summary.hasBundleItems && (
            <p className={`mt-3 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${summary.bundleDiscount ? 'bg-mint-50 text-mint-700' : 'bg-coral-50 text-coral-700'}`}>
              <Tag size={18} />
              {summary.bundleDiscount > 0
                ? <>{BUNDLE.name} applied. You save {rupees(summary.bundleDiscount)}.</>
                : <>Add {summary.bundleUnitsNeeded} more {summary.bundleUnitsNeeded === 1 ? 'tee' : 'tees'} to unlock {BUNDLE.name.toLowerCase()}. <Link to="/search?q=tshirt" className="underline">Shop tees</Link></>}
            </p>
          )}

          <ul className="mt-3 rounded-2xl bg-surface px-4 shadow-soft md:px-5">
            {summary.lines.map((l) => <CartLine key={l.key} line={l} />)}
          </ul>

          {savedLines.length > 0 && <SavedList lines={savedLines} moveToCart={moveToCart} removeSaved={removeSaved} />}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <CouponBox summary={summary} />
          <div className="rounded-2xl bg-surface p-5 shadow-soft">
            <h2 className="mb-4 text-lg font-bold">Price details</h2>
            <PriceSummary summary={summary} />
            <button type="button" disabled={blocked} onClick={() => navigate('/checkout')} className="btn-primary mt-5 hidden w-full py-3.5 text-base lg:flex">Proceed to checkout</button>
            {blocked && <p className="mt-2 text-center text-xs font-bold text-coral-700">Remove sold-out items to continue.</p>}
          </div>
          <p className="flex items-center justify-center gap-2 text-xs font-semibold text-muted"><ShieldCheck size={16} /> Safe and secure payments. Easy returns.</p>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="pl-1">
          <p className="text-lg font-extrabold leading-none">{rupees(summary.total)}</p>
          <a href="#main" className="text-xs font-bold text-coral-700" onClick={(e) => { e.preventDefault(); document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth' }) }}>View details</a>
        </div>
        <button type="button" disabled={blocked} onClick={() => navigate('/checkout')} className="btn-primary h-12 flex-1">Checkout</button>
      </div>
    </div>
  )
}

function SavedList({ lines, moveToCart, removeSaved }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold">Saved for later ({lines.length})</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {lines.map((s) => (
          <li key={s.key} className="flex gap-3 rounded-2xl bg-surface p-3 shadow-soft">
            <img src={s.product.images[0]} alt="" className="h-24 w-20 rounded-xl object-cover" />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="line-clamp-2 text-sm font-bold">{s.product.title}</p>
              <p className="text-xs text-muted">Size {s.size}, {s.colour}</p>
              <p className="mt-1 text-sm font-extrabold">{rupees(priceOf(s.product))}</p>
              <div className="mt-auto flex gap-3 pt-1 text-xs font-extrabold">
                <button type="button" onClick={() => moveToCart(s.key)} className="text-coral-700">Move to bag</button>
                <button type="button" onClick={() => removeSaved(s.key)} className="text-muted">Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
