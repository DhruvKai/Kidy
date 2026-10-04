import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MagnifyingGlass, ArrowRight, X } from '@phosphor-icons/react'
import { useVisibleProducts } from '../store/useStore'
import { priceOf } from '../lib/pricing'
import { rupees } from '../lib/format'
import { CATEGORIES } from '../data/catalog'

const POPULAR = ['Kurta', 'Lehenga', 'Party dress', 'Romper', 'Tshirt', 'Pyjamas', 'Sneakers']
const ALL_SUBS = CATEGORIES.flatMap((c) => c.subs.map((sub) => ({ cat: c, sub })))
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

export default function SearchBox({ autoFocus = false, onDone }) {
  const products = useVisibleProducts()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  // The search index (Fuse.js) loads on first focus so it stays out of the first page load.
  const [searchFn, setSearchFn] = useState(null)
  const loadSearch = () => { if (!searchFn) import('../lib/search').then((m) => setSearchFn(() => m.searchProducts)) }

  useEffect(() => {
    const close = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const results = useMemo(() => (q.trim().length >= 2 && searchFn ? searchFn(products, q).slice(0, 5) : []), [q, products, searchFn])
  const subs = useMemo(() => (q.trim().length >= 2 ? ALL_SUBS.filter((x) => norm(x.sub).includes(norm(q)) || norm(x.cat.name).startsWith(norm(q))).slice(0, 3) : []), [q])

  const go = (term) => {
    const t = (term ?? q).trim()
    if (!t) return
    navigate(`/search?q=${encodeURIComponent(t)}`)
    setOpen(false)
    setQ('')
    onDone?.()
  }
  const finish = () => { setOpen(false); setQ(''); onDone?.() }

  return (
    <div ref={wrap} className="relative w-full">
      <form role="search" onSubmit={(e) => { e.preventDefault(); go() }} className="relative">
        <MagnifyingGlass size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => { setOpen(true); loadSearch() }}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder="Search kurtas, frocks, rompers..."
          aria-label="Search products"
          className="h-11 w-full rounded-full border border-line bg-cream pl-10 pr-10 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-muted focus:border-ocean-400 focus:bg-surface focus:ring-2 focus:ring-ocean-100"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-ink/5">
            <X size={14} />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift animate-[fade_.15s_ease-out]">
          {q.trim().length < 2 ? (
            <div className="p-4">
              <p className="text-xs font-bold text-muted">Popular searches</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {POPULAR.map((t) => <button key={t} type="button" onClick={() => go(t)} className="chip">{t}</button>)}
              </div>
            </div>
          ) : (
            <div className="max-h-[70dvh] overflow-y-auto py-2">
              {subs.map(({ cat, sub }) => (
                <Link key={cat.slug + sub} to={`/c/${cat.slug}?sub=${encodeURIComponent(sub)}`} onClick={finish} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-cream">
                  <MagnifyingGlass size={14} className="text-muted" />
                  <span><b>{sub}</b> <span className="text-muted">in {cat.name}</span></span>
                </Link>
              ))}
              {results.map((p) => (
                <Link key={p.id} to={`/p/${p.slug}`} onClick={finish} className="flex items-center gap-3 px-4 py-2 hover:bg-cream">
                  <img src={p.images[0]} alt="" className="h-12 w-10 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.title}</span>
                    <span className="text-xs text-muted">{p.code}</span>
                  </span>
                  <span className="text-sm font-extrabold">{rupees(priceOf(p))}</span>
                </Link>
              ))}
              {!results.length && !subs.length && <p className="px-4 py-3 text-sm text-muted">No matches yet. Try "frock", "kurta" or a product code.</p>}
              <button type="button" onClick={() => go()} className="mt-1 flex w-full items-center justify-between border-t border-line px-4 py-3 text-sm font-bold text-coral-700 hover:bg-coral-50">
                See all results for "{q.trim()}" <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
