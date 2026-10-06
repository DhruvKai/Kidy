import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Star, X, Minus, Plus, CaretRight, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react'
import { rupees, discountPct } from '../lib/format'
import { COLOURS } from '../data/catalog'
import { useToast } from '../store/useStore'

// Every letter colour clears 3:1 on white at logo size (large text).
const LOGO_COLOURS = ['text-coral-600', 'text-[#e2620b]', 'text-ocean-600', 'text-mint-600', 'text-coral-600', 'text-lilac-600', 'text-[#e2620b]', 'text-ocean-600', 'text-mint-600', 'text-coral-600']
const word = (w, offset) => w.split('').map((ch, i) => <span key={i} className={LOGO_COLOURS[i + offset]}>{ch}</span>)

export function Logo({ className = '', small = false }) {
  return (
    <Link to="/" aria-label="Kidy home" className={`inline-block whitespace-nowrap font-display font-extrabold leading-none tracking-tight ${small ? 'text-xl' : 'text-2xl md:text-[1.7rem]'} ${className}`}>
      {word('Kidy', 0)}
    </Link>
  )
}

export function Price({ price, mrp, size = 'md', className = '' }) {
  const off = discountPct(mrp, price)
  const big = size === 'lg'
  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className={`font-extrabold text-ink ${big ? 'text-2xl md:text-3xl' : 'text-base'}`}>{rupees(price)}</span>
      {off > 0 && (
        <>
          <span className={`text-muted line-through ${big ? 'text-base' : 'text-xs'}`}>{rupees(mrp)}</span>
          <span className={`font-extrabold text-mint-700 ${big ? 'text-base' : 'text-xs'}`}>{off}% off</span>
        </>
      )}
    </div>
  )
}

export function Rating({ value, count, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${className}`}>
      <span className="inline-flex items-center gap-0.5 rounded-md bg-go px-1.5 py-0.5 text-white">
        {value.toFixed(1)} <Star weight="fill" size={11} />
      </span>
      {count != null && <span className="text-muted font-semibold">({count.toLocaleString('en-IN')})</span>}
    </span>
  )
}

export function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex text-sunny-500" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} weight={i <= Math.round(value) ? 'fill' : 'regular'} />)}
    </span>
  )
}

export function Swatch({ colour, size = 'md', selected, onClick, title }) {
  const bg = COLOURS[colour] || '#ccc'
  const dim = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-9 w-9' : 'h-6 w-6'
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title || colour}
      aria-label={onClick ? `Colour ${colour}` : undefined}
      aria-pressed={onClick ? !!selected : undefined}
      className={`inline-block shrink-0 rounded-full border ${dim} ${selected ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''} ${colour === 'White' || colour === 'Cream' ? 'border-ink/20' : 'border-ink/10'} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ background: bg }}
    />
  )
}

export function QuantityStepper({ value, min = 1, max = 99, onChange, small }) {
  const btn = `grid place-items-center text-ink transition hover:bg-ink/5 disabled:opacity-30 ${small ? 'h-8 w-8' : 'h-10 w-10'}`
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface">
      <button type="button" className={`${btn} rounded-l-full`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity"><Minus size={14} /></button>
      <span className="min-w-8 text-center text-sm font-extrabold" aria-live="polite">{value}</span>
      <button type="button" className={`${btn} rounded-r-full`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity"><Plus size={14} /></button>
    </div>
  )
}

function useLockBody(open) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])
}

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
}

export function Modal({ open, onClose, title, children, wide, footer }) {
  const ref = useRef(null)
  useLockBody(open)
  useEscape(open, onClose)
  useEffect(() => { if (open) ref.current?.focus() }, [open])
  if (!open) return null
  // Portal to body: a parent with backdrop-filter or transform would otherwise trap position:fixed.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-night/60 animate-[fade_.2s_ease-out]" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-surface shadow-lift outline-none sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} animate-[rise_.25s_cubic-bezier(.16,1,.3,1)]`}>
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, side = 'left', children, footer }) {
  useLockBody(open)
  useEscape(open, onClose)
  if (!open) return null
  const pos = side === 'left' ? 'left-0 animate-[slideL_.25s_cubic-bezier(.16,1,.3,1)]' : side === 'right' ? 'right-0 animate-[slideR_.25s_cubic-bezier(.16,1,.3,1)]' : ''
  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-night/60" onClick={onClose} />
      {side === 'bottom' ? (
        <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-surface shadow-lift animate-[rise_.25s_cubic-bezier(.16,1,.3,1)]">
          <DrawerHead title={title} onClose={onClose} />
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
        </div>
      ) : (
        <div className={`absolute top-0 bottom-0 flex w-[86vw] max-w-sm flex-col bg-surface shadow-lift ${pos}`}>
          <DrawerHead title={title} onClose={onClose} />
          <div className="flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
        </div>
      )}
    </div>,
    document.body,
  )
}

function DrawerHead({ title, onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
      <span className="font-display text-lg font-bold">{title}</span>
      <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Close"><X size={18} /></button>
    </div>
  )
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap text-xs font-semibold text-muted">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <CaretRight size={11} />}
          {it.to ? <Link to={it.to} className="hover:text-ink">{it.label}</Link> : <span className="text-ink">{it.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function EmptyState({ image, icon: Icon, title, body, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center">
      {image ? (
        <img src={image} alt="" className="mb-5 h-36 w-36 rounded-full object-cover" />
      ) : Icon ? (
        <span className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-coral-50 text-coral-600"><Icon size={36} /></span>
      ) : null}
      <h2 className="text-2xl font-bold">{title}</h2>
      {body && <p className="mt-2 text-sm text-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function Toaster() {
  const toasts = useToast((s) => s.toasts)
  const dismiss = useToast((s) => s.dismiss)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle : t.tone === 'error' ? WarningCircle : Info
        return (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-night px-4 py-3 text-sm font-semibold text-white shadow-lift animate-[rise_.25s_cubic-bezier(.16,1,.3,1)]">
            <Icon size={20} weight="fill" className={t.tone === 'success' ? 'text-mint-400' : t.tone === 'error' ? 'text-coral-300' : 'text-ocean-300'} />
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <Link to={t.action.to} onClick={() => dismiss(t.id)} className="font-extrabold text-sunny-300 underline-offset-2 hover:underline">{t.action.label}</Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function StatusPill({ tone, children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{children}</span>
}

export function Field({ label, htmlFor, error, hint, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-bold text-ink">{label}</label>
      {children}
      {error ? <p className="text-xs font-semibold text-coral-700">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}
