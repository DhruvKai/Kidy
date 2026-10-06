import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Package, Heart, MapPin, User, SignOut, Trash, Truck, ShieldCheck, ArrowRight } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { useUI } from '../store/ui'
import { rupees, fmtDate } from '../lib/format'
import { STATUS_META, isActive } from '../lib/orders'
import ProductCard from '../components/ProductCard'
import { EmptyState, StatusPill, Modal, Field } from '../components/ui'

const TABS = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile', icon: User },
]

function Orders({ phone }) {
  const all = useStore((s) => s.orders)
  const [filter, setFilter] = useState('all')
  const mine = all.filter((o) => o.customer.phone === phone)
  const list = mine.filter((o) => filter === 'all' || (filter === 'active' ? isActive(o) : filter === 'delivered' ? o.status === 'delivered' : !isActive(o) && o.status !== 'delivered'))
  if (!mine.length) return <EmptyState icon={Package} title="No orders yet" body="When you place an order, you can track it here." action={<Link to="/" className="btn-primary">Start shopping</Link>} />
  return (
    <div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {[['all', 'All'], ['active', 'In progress'], ['delivered', 'Delivered'], ['other', 'Cancelled and returns']].map(([id, l]) => (
          <button key={id} type="button" onClick={() => setFilter(id)} className={`chip shrink-0 px-4 py-2 ${filter === id ? 'chip-active' : ''}`}>{l}</button>
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {list.map((o) => (
          <li key={o.id}>
            <Link to={`/account/orders/${o.id}`} className="flex flex-col gap-4 rounded-2xl bg-surface p-4 shadow-soft transition hover:shadow-lift sm:flex-row sm:items-center">
              <div className="flex -space-x-4">
                {o.items.slice(0, 3).map((i) => <img key={i.sku + i.size} src={i.image} alt="" className="h-20 w-16 rounded-xl border-2 border-surface object-cover" />)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</StatusPill>
                  <span className="text-xs text-muted">{o.id}, {fmtDate(o.createdAt)}</span>
                </div>
                <p className="mt-1.5 truncate text-sm font-bold">{o.items.map((i) => i.title).join(', ')}</p>
                <p className="text-sm text-muted">{o.items.reduce((n, i) => n + i.qty, 0)} items, {rupees(o.pricing.total)}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-coral-700">{isActive(o) ? 'Track' : 'View'} <ArrowRight size={14} /></span>
            </Link>
          </li>
        ))}
        {!list.length && <p className="py-8 text-center text-sm text-muted">Nothing here.</p>}
      </ul>
    </div>
  )
}

function Wishlist() {
  const wishlist = useStore((s) => s.wishlist)
  const products = useStore((s) => s.products)
  const list = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean)
  if (!list.length) return <EmptyState icon={Heart} title="Your wishlist is empty" body="Tap the heart on any product to save it for later." action={<Link to="/" className="btn-primary">Browse styles</Link>} />
  return <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
}

function Addresses() {
  const addresses = useStore((s) => s.addresses)
  const removeAddress = useStore((s) => s.removeAddress)
  if (!addresses.length) return <EmptyState icon={MapPin} title="No saved addresses" body="Addresses you use at checkout are saved here." />
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {addresses.map((a) => (
        <li key={a.id} className="rounded-2xl bg-surface p-5 text-sm shadow-soft">
          <p className="font-bold">{a.name} <span className="ml-1 rounded bg-ink/5 px-1.5 py-0.5 text-[11px]">{a.label || 'Home'}</span> {a.isDefault && <span className="ml-1 text-xs font-bold text-mint-700">Default</span>}</p>
          <p className="mt-1 text-muted">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}</p>
          <p className="text-muted">Mobile: {a.phone}</p>
          <button type="button" onClick={() => removeAddress(a.id)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-coral-700"><Trash size={14} /> Remove</button>
        </li>
      ))}
    </ul>
  )
}

function Profile() {
  const user = useStore((s) => s.user)
  const updateProfile = useStore((s) => s.updateProfile)
  const logout = useStore((s) => s.logout)
  const deleteAccount = useStore((s) => s.deleteAccount)
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '' })
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); updateProfile(form); toast('Profile saved', 'success') }} className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-soft">
        <Field label="Full name" htmlFor="p-name"><input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
        <Field label="Email" htmlFor="p-email"><input id="p-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
        <Field label="Mobile number" htmlFor="p-phone" hint="Your login number cannot be changed here."><input id="p-phone" value={`+91 ${user.phone}`} disabled className="input bg-cream" /></Field>
        <button className="btn-primary self-start">Save changes</button>
      </form>
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line p-5">
        <p className="flex items-center gap-2 font-bold"><ShieldCheck size={18} /> Your data</p>
        <p className="text-sm text-muted">Under India's DPDP Act you can ask us to delete your account and personal data at any time. Orders already placed are kept for GST records.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={logout} className="btn-secondary"><SignOut size={16} /> Logout</button>
          <button type="button" onClick={() => setConfirm(true)} className="btn-ghost text-coral-700"><Trash size={16} /> Delete my account</button>
        </div>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Delete your account?"
        footer={<div className="flex gap-3"><button type="button" onClick={() => setConfirm(false)} className="btn-secondary flex-1">Cancel</button><button type="button" onClick={() => { deleteAccount(); toast('Your account and saved data were deleted', 'success') }} className="btn-primary flex-1">Delete</button></div>}>
        <p className="text-sm text-muted">This removes your profile, saved addresses, wishlist and browsing history from this store.</p>
      </Modal>
    </div>
  )
}

export default function Account() {
  const [params, setParams] = useSearchParams()
  const user = useStore((s) => s.user)
  const openLogin = useUI((s) => s.openLogin)
  const tab = params.get('tab') || 'orders'
  useEffect(() => { document.title = 'My account | Kidy' }, [])
  const needsLogin = !user && tab !== 'wishlist'

  return (
    <div className="container-x pb-12 pt-6">
      <h1 className="text-3xl font-extrabold md:text-4xl">{user ? `Hi, ${user.name?.split(' ')[0] || 'there'}` : 'My account'}</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
        <nav aria-label="Account" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setParams({ tab: t.id })} aria-current={tab === t.id} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === t.id ? 'bg-ink text-surface' : 'bg-surface text-ink hover:bg-ink/5'}`}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
          <Link to="/track" className="flex shrink-0 items-center gap-2.5 rounded-xl bg-surface px-4 py-2.5 text-sm font-bold hover:bg-ink/5"><Truck size={18} /> Track an order</Link>
        </nav>
        <div className="min-w-0">
          {needsLogin ? (
            <div className="rounded-2xl bg-surface p-8 text-center shadow-soft">
              <h2 className="text-2xl font-bold">Log in to see your orders</h2>
              <p className="mt-2 text-sm text-muted">Track deliveries, request returns and download invoices in one place.</p>
              <button type="button" onClick={() => openLogin()} className="btn-primary mt-6">Login with OTP</button>
              <p className="mt-3 text-xs text-muted">Demo tip: the number 98765 43210 already has two orders.</p>
            </div>
          ) : tab === 'orders' ? <Orders phone={user.phone} /> : tab === 'wishlist' ? <Wishlist /> : tab === 'addresses' ? <Addresses /> : <Profile />}
        </div>
      </div>
    </div>
  )
}
