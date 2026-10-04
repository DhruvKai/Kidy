import { useRef } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import ProductCard from './ProductCard'

export default function ProductRail({ products, label }) {
  const ref = useRef(null)
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  if (!products.length) return null
  return (
    <div className="relative">
      <div
        ref={ref}
        role="list"
        aria-label={label}
        className="no-scrollbar -mx-4 grid snap-x snap-mandatory auto-cols-[46%] grid-flow-col gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:auto-cols-[31%] md:-mx-6 md:scroll-px-6 md:px-6 lg:auto-cols-[23%] lg:gap-5 xl:auto-cols-[18.6%]"
      >
        {products.map((p) => (
          <div key={p.id} role="listitem" className="snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => scroll(-1)} aria-label="Scroll left" className="absolute -left-3 top-[36%] hidden h-11 w-11 place-items-center rounded-full border border-line bg-surface shadow-soft transition hover:shadow-lift lg:grid">
        <CaretLeft size={18} />
      </button>
      <button type="button" onClick={() => scroll(1)} aria-label="Scroll right" className="absolute -right-3 top-[36%] hidden h-11 w-11 place-items-center rounded-full border border-line bg-surface shadow-soft transition hover:shadow-lift lg:grid">
        <CaretRight size={18} />
      </button>
    </div>
  )
}
