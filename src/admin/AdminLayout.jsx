import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { SquaresFour, Package, TShirt, Warehouse, Percent, ArrowUUpLeft, Users, ChartLine, IdentificationCard, Layout, Storefront, ArrowsClockwise, SignOut, List } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { Logo, Toaster, Drawer } from '../components/ui'
import { COMMERCE } from '../config'

function useCounts() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  return {
    orders: orders.filter((o) => o.status === 'placed').length,
    returns: orders.filter((o) => o.status === 'return_requested').length,
    inventory: products.reduce((n, p) => n + p.variants.filter((v) => v.stock <= COMMERCE.lowStockThreshold).length, 0),
  }
}

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: SquaresFour, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Package, count: 'orders' },
  { to: '/admin/products', label: 'Products', icon: TShirt },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse, count: 'inventory', soft: true },
  { to: '/admin/discounts', label: 'Discounts', icon: Percent },
  { to: '/admin/returns', label: 'Returns', icon: ArrowUUpLeft, count: 'returns' },
  { to: '/admin/customers', label: 'Customers', icon: Users },
]
const LATER = [
  { label: 'Reports and GST', icon: ChartLine },
  { label: 'Home page editor', icon: Layout },
  { label: 'Staff and permissions', icon: IdentificationCard },
]

function Sidebar({ onNavigate }) {
  const counts = useCounts()
  const navigate = useNavigate()
  const resetDemo = useStore((s) => s.resetDemo)
  const adminLogout = useStore((s) => s.adminLogout)
  return (
    <div className="flex h-full flex-col gap-1 p-4" onClick={(e) => e.target.closest('a') && onNavigate?.()}>
      <div className="mb-5 flex items-center gap-2 px-2 pt-1">
        <Logo small />
        <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-extrabold text-white">ADMIN</span>
      </div>
      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isActive ? 'bg-ink text-white' : 'text-ink hover:bg-ink/5'}`}>
          <n.icon size={20} />
          <span className="flex-1">{n.label}</span>
          {n.count && counts[n.count] > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${n.soft ? 'bg-sunny-200 text-sunny-700' : 'bg-coral-600 text-white'}`}>{counts[n.count]}</span>
          )}
        </NavLink>
      ))}
      <p className="mt-5 px-3 text-xs font-bold text-muted">In the full build</p>
      {LATER.map((n) => (
        <span key={n.label} className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted/80" title="Included in the full Shopify build">
          <n.icon size={20} /> {n.label}
        </span>
      ))}
      <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3">
        <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-ink/5"><Storefront size={20} /> View store</Link>
        <button type="button" onClick={() => { resetDemo(); toast('Demo data restored', 'success') }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-ink/5"><ArrowsClockwise size={20} /> Reset demo data</button>
        <button type="button" onClick={() => { adminLogout(); navigate('/admin/login') }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-ink/5"><SignOut size={20} /> Log out</button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-[100dvh] bg-cream lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-[100dvh] border-r border-line bg-white lg:block">
        <Sidebar />
      </aside>
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-white px-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"><List size={22} /></button>
        <Logo small />
        <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-extrabold text-white">ADMIN</span>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Admin">
        <Sidebar onNavigate={() => setOpen(false)} />
      </Drawer>
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
