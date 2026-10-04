import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { List, MagnifyingGlass, User, Heart, ShoppingBag, CaretDown, Truck, Question, Storefront, SignOut } from '@phosphor-icons/react'
import { Logo, Drawer } from './ui'
import SearchBox from './SearchBox'
import ThemeSwitch, { ThemeToggle } from './ThemeSwitch'
import { useStore } from '../store/useStore'
import { useUI } from '../store/ui'
import { CATEGORIES, AGE_GROUPS } from '../data/catalog'
import { COMMERCE } from '../config'

const blurActive = () => document.activeElement instanceof HTMLElement && document.activeElement.blur()

export function AnnouncementBar() {
  return (
    <div className="bg-brand text-white">
      <div className="container-x flex h-9 items-center justify-center gap-6 text-xs font-bold">
        <span>Free shipping on orders above ₹{COMMERCE.freeShippingThreshold}</span>
        <span className="hidden md:inline">Easy {COMMERCE.returnDays}-day returns and exchanges</span>
        <span className="hidden lg:inline">Cash on delivery across India</span>
      </div>
    </div>
  )
}

function MegaItem({ cat }) {
  return (
    <div className="group flex h-full items-center">
      <NavLink
        to={`/c/${cat.slug}`}
        className={({ isActive }) => `relative flex h-full items-center gap-1 px-3 text-sm font-bold transition hover:text-coral-700 ${isActive ? 'text-coral-700' : 'text-ink'}`}
      >
        {cat.name}
        <CaretDown size={12} className="transition group-hover:rotate-180" />
        <span className="absolute inset-x-3 bottom-0 h-[3px] origin-left scale-x-0 rounded-full bg-brand transition group-hover:scale-x-100" />
      </NavLink>
      <div className="invisible absolute left-0 right-0 top-full border-t border-line bg-surface opacity-0 shadow-lift transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="container-x grid grid-cols-12 gap-8 py-7">
          <div className="col-span-5">
            <p className="mb-3 text-sm font-extrabold text-ink">Shop {cat.name}</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              {cat.subs.map((s) => (
                <li key={s}>
                  <Link onClick={blurActive} to={`/c/${cat.slug}?sub=${encodeURIComponent(s)}`} className="block rounded-lg py-1.5 text-sm text-muted transition hover:text-coral-700">{s}</Link>
                </li>
              ))}
              <li><Link onClick={blurActive} to={`/c/${cat.slug}`} className="block py-1.5 text-sm font-bold text-coral-700">View all {cat.name}</Link></li>
            </ul>
          </div>
          <div className="col-span-3">
            <p className="mb-3 text-sm font-extrabold text-ink">Shop by age</p>
            <ul className="flex flex-col gap-1">
              {AGE_GROUPS.map((a) => (
                <li key={a.id}><Link onClick={blurActive} to={`/c/${cat.slug}?age=${a.id}`} className="block py-1.5 text-sm text-muted hover:text-coral-700">{a.label}</Link></li>
              ))}
            </ul>
          </div>
          <Link onClick={blurActive} to={`/c/${cat.slug}`} className={`col-span-4 flex overflow-hidden rounded-2xl ${cat.tint}`}>
            <img src={cat.image} alt="" className="h-48 w-40 object-cover" />
            <span className="flex flex-col justify-center p-5">
              <span className="font-display text-2xl font-bold leading-tight">New in {cat.name}</span>
              <span className="mt-1 text-sm text-muted">Fresh styles added this week</span>
              <span className="mt-3 text-sm font-extrabold text-coral-700">Shop now</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function IconButton({ to, onClick, label, count, children }) {
  const cls = 'relative grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-ink/5'
  const badge = count > 0 && (
    <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-extrabold text-white">{count}</span>
  )
  return to ? (
    <Link to={to} aria-label={label} className={cls}>{children}{badge}</Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>{children}{badge}</button>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const cartCount = useStore((s) => s.cart.reduce((n, i) => n + i.qty, 0))
  const wishCount = useStore((s) => s.wishlist.length)
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const openLogin = useUI((s) => s.openLogin)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="container-x relative flex h-16 items-center gap-2 lg:h-[72px]">
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5 lg:hidden">
          <List size={22} />
        </button>
        <Logo />
        <nav aria-label="Main" className="ml-5 hidden h-full items-center lg:flex">
          {CATEGORIES.slice(0, 4).map((c) => <MegaItem key={c.slug} cat={c} />)}
          <NavLink to="/c/accessories" className="flex h-full items-center px-3 text-sm font-bold hover:text-coral-700">Accessories</NavLink>
          <NavLink to="/c/festive" className="ml-1 rounded-full bg-sunny-100 px-3 py-1.5 text-sm font-extrabold text-sunny-700 transition hover:bg-sunny-200">Festive Edit</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-0.5">
          <div className="mr-2 hidden w-72 xl:block"><SearchBox /></div>
          <span className="hidden lg:block xl:hidden">
            <IconButton label="Search" onClick={() => setSearchOpen((v) => !v)}><MagnifyingGlass size={22} /></IconButton>
          </span>
          <ThemeToggle className="hidden lg:grid" />
          <Link to="/track" className="mr-1 hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold hover:bg-ink/5 2xl:flex"><Truck size={18} /> Track order</Link>
          {user ? (
            <IconButton to="/account" label="My account"><User size={22} /></IconButton>
          ) : (
            <IconButton label="Login" onClick={() => openLogin()}><User size={22} /></IconButton>
          )}
          <span className="hidden sm:block"><IconButton to="/account?tab=wishlist" label={`Wishlist, ${wishCount} items`} count={wishCount}><Heart size={22} /></IconButton></span>
          <IconButton to="/cart" label={`Bag, ${cartCount} items`} count={cartCount}><ShoppingBag size={22} /></IconButton>
        </div>
      </div>
      <div className="container-x pb-3 lg:hidden"><SearchBox /></div>
      {searchOpen && <div className="container-x hidden pb-3 lg:block xl:hidden"><SearchBox autoFocus onDone={() => setSearchOpen(false)} /></div>}

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <div className="flex flex-col pb-6" onClick={(e) => e.target.closest('a') && setMenuOpen(false)}>
          <div className="m-4 rounded-2xl bg-coral-50 p-4">
            {user ? (
              <div className="flex items-center justify-between">
                <Link to="/account" className="font-bold">Hi, {user.name?.split(' ')[0] || 'there'}</Link>
                <button type="button" onClick={() => { logout(); setMenuOpen(false) }} className="flex items-center gap-1 text-sm font-bold text-coral-700"><SignOut size={16} /> Logout</button>
              </div>
            ) : (
              <button type="button" onClick={() => { setMenuOpen(false); openLogin() }} className="btn-primary w-full">Login or sign up</button>
            )}
          </div>
          {CATEGORIES.map((c) => (
            <details key={c.slug} className="group border-b border-line px-5">
              <summary className="flex cursor-pointer list-none items-center gap-3 py-3 font-bold">
                <img src={c.image} alt="" className="h-9 w-9 rounded-full object-cover" />
                <span className="flex-1">{c.name}</span>
                <CaretDown size={14} className="transition group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-2 gap-1 pb-3 pl-12">
                {c.subs.map((s) => <Link key={s} to={`/c/${c.slug}?sub=${encodeURIComponent(s)}`} className="py-1.5 text-sm text-muted">{s}</Link>)}
                <Link to={`/c/${c.slug}`} className="py-1.5 text-sm font-bold text-coral-700">View all</Link>
              </div>
            </details>
          ))}
          <div className="flex flex-col px-5 pt-3">
            {[['Festive Edit', '/c/festive'], ['New Arrivals', '/c/new'], ['Best Sellers', '/c/bestsellers'], ['Big Savings', '/c/sale']].map(([l, to]) => (
              <Link key={to} to={to} className="py-2.5 font-bold">{l}</Link>
            ))}
            <Link to="/track" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-muted"><Truck size={18} /> Track your order</Link>
            <Link to="/pages/faq" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-muted"><Question size={18} /> Help and FAQs</Link>
            <Link to="/admin" className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-3 text-sm font-bold"><Storefront size={18} /> Store owner? Open the admin demo</Link>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-muted">Theme</span>
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </Drawer>
    </header>
  )
}
