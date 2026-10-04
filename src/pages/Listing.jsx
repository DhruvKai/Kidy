import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Funnel, ArrowsDownUp, X, MagnifyingGlass, CaretDown, Check } from '@phosphor-icons/react'
import { useVisibleProducts } from '../store/useStore'
import { CATEGORIES, COLLECTIONS } from '../data/catalog'
import { searchProducts } from '../lib/search'
import { priceOf } from '../lib/pricing'
import { discountPct } from '../lib/format'
import { readFilters, applyFilters, sortProducts, buildFacets, labelFor, SORTS, FILTER_KEYS } from '../lib/filters'
import ProductCard from '../components/ProductCard'
import FilterPanel from '../components/FilterPanel'
import { Breadcrumbs, Drawer, EmptyState } from '../components/ui'
import NotFound from './NotFound'

const PAGE = 24

function baseFor(slug, products) {
  const cat = CATEGORIES.find((c) => c.slug === slug)
  if (cat) {
    return products.filter((p) => p.category === slug || (p.gender === 'unisex' && ['boys', 'girls'].includes(slug) && ['boys', 'girls'].includes(p.category)))
  }
  switch (slug) {
    case 'all': return products
    case 'new': return products.filter((p) => p.tags.includes('new'))
    case 'bestsellers': return products.filter((p) => p.tags.includes('bestseller'))
    case 'festive': return products.filter((p) => p.tags.includes('festive'))
    case 'sale': return products.filter((p) => discountPct(p.mrp, priceOf(p)) >= 40)
    case 'ethnic': return products.filter((p) => p.sub === 'Ethnic Wear')
    case 'party': return products.filter((p) => p.sub === 'Party Wear' || p.occasion === 'Party')
    case 'nightwear': return products.filter((p) => p.sub === 'Nightwear')
    default: return null
  }
}

export default function Listing() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const products = useVisibleProducts()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [limit, setLimit] = useState(PAGE)

  const isSearch = pathname === '/search'
  const q = params.get('q') || ''
  const sub = params.get('sub') || ''
  const sort = params.get('sort') || (isSearch ? 'relevance' : 'popular')
  const filters = useMemo(() => readFilters(params), [params])
  const cat = CATEGORIES.find((c) => c.slug === slug)
  const collection = COLLECTIONS[slug]

  const base = useMemo(() => {
    const list = isSearch ? searchProducts(products, q) : baseFor(slug, products)
    if (!list) return null
    return sub ? list.filter((p) => p.sub === sub) : list
  }, [isSearch, q, slug, products, sub])

  const facets = useMemo(() => (base ? buildFacets(base, filters) : []), [base, filters])
  const results = useMemo(() => {
    if (!base) return []
    const filtered = applyFilters(base, filters)
    return sort === 'relevance' ? filtered : sortProducts(filtered, sort)
  }, [base, filters, sort])

  const title = isSearch ? (q ? `Results for "${q}"` : 'Search') : sub ? `${cat?.name || collection?.name} ${sub}` : cat ? `${cat.name} clothing` : collection?.name
  useEffect(() => { document.title = `${title} | KiDDY WiDDY` }, [title])
  useEffect(() => { setLimit(PAGE) }, [pathname, params])

  if (!base) return <NotFound />

  const update = (fn) => {
    const next = new URLSearchParams(params)
    fn(next)
    setParams(next, { replace: true })
  }
  const toggle = (key, id, single) =>
    update((next) => {
      const cur = (next.get(key) || '').split(',').filter(Boolean)
      const vals = cur.includes(id) ? cur.filter((v) => v !== id) : single ? [id] : [...cur, id]
      vals.length ? next.set(key, vals.join(',')) : next.delete(key)
    })
  const clearAll = () => update((next) => FILTER_KEYS.forEach((k) => next.delete(k)))
  const setSort = (id) => update((next) => (id === 'popular' && !isSearch ? next.delete('sort') : next.set('sort', id)))
  const setSub = (s) => update((next) => (s ? next.set('sub', s) : next.delete('sub')))
  const activeCount = Object.values(filters).reduce((n, v) => n + v.length, 0)
  const sorts = isSearch ? [{ id: 'relevance', label: 'Best match' }, ...SORTS] : SORTS

  const crumbs = [{ label: 'Home', to: '/' }]
  if (isSearch) crumbs.push({ label: 'Search' })
  else if (cat) { crumbs.push(sub ? { label: cat.name, to: `/c/${cat.slug}` } : { label: cat.name }); if (sub) crumbs.push({ label: sub }) }
  else crumbs.push({ label: collection.name })

  return (
    <div className="container-x pb-10 pt-5">
      <Breadcrumbs items={crumbs} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {results.length} {results.length === 1 ? 'style' : 'styles'}
            {!isSearch && collection?.blurb && !sub ? `. ${collection.blurb}` : ''}
          </p>
        </div>
        <label className="hidden items-center gap-2 text-sm lg:flex">
          <span className="font-semibold text-muted">Sort by</span>
          <span className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none rounded-full border border-line bg-surface py-2 pl-4 pr-9 text-sm font-bold outline-none focus:border-ocean-400">
              {sorts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <CaretDown size={12} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
          </span>
        </label>
      </div>

      {cat && (
        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          <button type="button" onClick={() => setSub('')} className={`chip shrink-0 px-4 py-2 text-sm ${!sub ? 'chip-active' : ''}`}>All {cat.name}</button>
          {cat.subs.map((s) => (
            <button key={s} type="button" onClick={() => setSub(s)} className={`chip shrink-0 px-4 py-2 text-sm ${sub === s ? 'chip-active' : ''}`}>{s}</button>
          ))}
        </div>
      )}

      {/* Mobile filter / sort bar */}
      <div className="sticky top-[120px] z-20 -mx-4 mt-4 flex border-y border-line bg-surface/95 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setFilterOpen(true)} className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold">
          <Funnel size={16} /> Filter {activeCount > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] text-white">{activeCount}</span>}
        </button>
        <span className="w-px bg-line" />
        <button type="button" onClick={() => setSortOpen(true)} className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold">
          <ArrowsDownUp size={16} /> {sorts.find((s) => s.id === sort)?.label}
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
            <div className="flex items-center justify-between pb-1">
              <span className="font-display text-lg font-bold">Filters</span>
              {activeCount > 0 && <button type="button" onClick={clearAll} className="text-xs font-bold text-coral-700">Clear all</button>}
            </div>
            <FilterPanel facets={facets} filters={filters} onToggle={toggle} />
          </div>
        </aside>

        <div className="min-w-0">
          {activeCount > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {Object.entries(filters).flatMap(([k, vals]) => vals.map((v) => (
                <button key={k + v} type="button" onClick={() => toggle(k, v)} className="chip bg-coral-50 border-coral-200">
                  {labelFor(k, v)} <X size={12} />
                </button>
              )))}
              <button type="button" onClick={clearAll} className="text-xs font-bold text-coral-700 underline-offset-2 hover:underline">Clear all</button>
            </div>
          )}

          {results.length === 0 ? (
            isSearch && base.length === 0 ? (
              <EmptyState
                icon={MagnifyingGlass}
                title={q ? `Nothing found for "${q}"` : 'What are you looking for?'}
                body="Check the spelling or try a broader word like frock, kurta, romper or shoes."
                action={<div className="flex flex-wrap justify-center gap-2">{['Frock', 'Kurta', 'Romper', 'Sneakers'].map((t) => <Link key={t} to={`/search?q=${t}`} className="chip">{t}</Link>)}</div>}
              />
            ) : (
              <EmptyState icon={Funnel} title="No styles match these filters" body="Try removing a filter or two to see more options." action={<button type="button" onClick={clearAll} className="btn-primary">Clear all filters</button>} />
            )
          ) : (
            <>
              <h2 className="sr-only">Products</h2>
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:gap-x-5 xl:grid-cols-4">
                {results.slice(0, limit).map((p, i) => <ProductCard key={p.id} product={p} eager={i < 4} />)}
              </div>
              {results.length > limit && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <p className="text-sm text-muted">Showing {limit} of {results.length}</p>
                  <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn-secondary px-8 py-3">Load more</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters" side="bottom"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={clearAll} className="btn-secondary flex-1" disabled={!activeCount}>Clear all</button>
            <button type="button" onClick={() => setFilterOpen(false)} className="btn-primary flex-[2]">Show {results.length} styles</button>
          </div>
        }
      >
        <FilterPanel facets={facets} filters={filters} onToggle={toggle} />
      </Drawer>
      <Drawer open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by" side="bottom">
        <div className="flex flex-col pb-4">
          {sorts.map((s) => (
            <button key={s.id} type="button" onClick={() => { setSort(s.id); setSortOpen(false) }} className={`flex items-center justify-between rounded-xl px-3 py-3.5 text-left text-sm ${sort === s.id ? 'bg-coral-50 font-extrabold text-coral-700' : 'font-semibold'}`}>
              {s.label}
              {sort === s.id && <Check size={18} weight="bold" />}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  )
}
