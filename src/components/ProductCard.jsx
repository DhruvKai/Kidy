import { Link } from 'react-router-dom'
import { Heart } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { priceOf, isDeal, totalStock } from '../lib/pricing'
import { COMMERCE } from '../config'
import { Price, Rating, Swatch } from './ui'

export default function ProductCard({ product, eager = false }) {
  const wished = useStore((s) => s.wishlist.includes(product.id))
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const price = priceOf(product)
  const stock = totalStock(product)

  const onWish = () => {
    const added = toggleWishlist(product.id)
    toast(added ? 'Saved to your wishlist' : 'Removed from wishlist', added ? 'success' : 'default', added ? { label: 'View', to: '/account?tab=wishlist' } : undefined)
  }

  return (
    <article className="group relative flex min-w-0 flex-col">
      <Link to={`/p/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
        <img
          src={product.images[0]}
          alt={product.title}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
        />
        {product.images[1] && (
          <img src={product.images[1]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {isDeal(product) && <span className="rounded-full bg-sunny-400 px-2 py-0.5 text-[11px] font-extrabold text-night">Deal of the day</span>}
          {product.tags.includes('new') && !isDeal(product) && <span className="rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-extrabold text-ink">New</span>}
          {product.tags.includes('bestseller') && !isDeal(product) && !product.tags.includes('new') && <span className="rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-extrabold text-ink">Bestseller</span>}
        </div>
        {stock === 0 ? (
          <span className="absolute inset-x-0 bottom-0 bg-night/75 py-1.5 text-center text-xs font-bold text-white">Out of stock</span>
        ) : stock <= COMMERCE.lowStockThreshold ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-bold text-coral-700">Only {stock} left</span>
        ) : null}
      </Link>
      <button
        type="button"
        onClick={onWish}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={wished}
        className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-surface/95 text-ink shadow-soft transition hover:scale-105 active:scale-95"
      >
        <Heart size={18} weight={wished ? 'fill' : 'bold'} className={wished ? 'text-coral-600 animate-[pop_.3s_ease-out]' : ''} />
      </button>
      <div className="flex flex-1 flex-col px-0.5 pt-2.5">
        <p className="text-xs font-semibold text-muted">{product.brand}</p>
        <Link to={`/p/${product.slug}`} className="mt-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-coral-700">{product.title}</h3>
        </Link>
        <Price price={price} mrp={product.mrp} className="mt-1.5" />
        <div className="mt-2 flex items-center justify-between gap-2">
          {product.reviewCount > 0 ? <Rating value={product.rating} count={product.reviewCount} /> : <span className="text-xs font-bold text-ocean-600">Just launched</span>}
          {product.colours.length > 1 && (
            <span className="flex items-center gap-1" role="img" aria-label={`${product.colours.length} colours`}>
              {product.colours.slice(0, 3).map((c) => <Swatch key={c} colour={c} size="sm" />)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="skeleton aspect-[4/5] rounded-2xl" />
      <div className="skeleton mt-3 h-3 w-1/3 rounded" />
      <div className="skeleton mt-2 h-4 w-4/5 rounded" />
      <div className="skeleton mt-2 h-4 w-1/2 rounded" />
    </div>
  )
}
