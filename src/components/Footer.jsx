import { Link } from 'react-router-dom'
import { Truck, ArrowUUpLeft, HandCoins, ShieldCheck, Phone, EnvelopeSimple, ArrowsClockwise } from '@phosphor-icons/react'
import { Logo } from './ui'
import ThemeSwitch from './ThemeSwitch'
import { STORE, COMMERCE } from '../config'
import { useStore, toast } from '../store/useStore'

const TRUST = [
  { icon: Truck, title: 'Free shipping', body: `On orders above ₹${COMMERCE.freeShippingThreshold}` },
  { icon: ArrowUUpLeft, title: `${COMMERCE.returnDays}-day returns`, body: 'Free pickup from your door' },
  { icon: HandCoins, title: 'Cash on delivery', body: `On orders up to ₹${COMMERCE.codMaxOrder.toLocaleString('en-IN')}` },
  { icon: ShieldCheck, title: 'Secure payments', body: 'UPI, cards, net banking, wallets' },
]

const COLS = [
  { title: 'Shop', links: [['Boys', '/c/boys'], ['Girls', '/c/girls'], ['Newborn', '/c/newborn'], ['Footwear', '/c/footwear'], ['Accessories', '/c/accessories'], ['Festive Edit', '/c/festive']] },
  { title: 'Help', links: [['Track your order', '/track'], ['Returns and exchanges', '/pages/returns'], ['Shipping and delivery', '/pages/shipping'], ['Size guide', '/pages/size-guide'], ['FAQs', '/pages/faq'], ['Contact us', '/pages/contact']] },
  { title: 'Policies', links: [['Privacy notice', '/pages/privacy'], ['Terms of use', '/pages/terms'], ['Cancellation policy', '/pages/cancellation'], ['Return and refund policy', '/pages/returns']] },
]

export default function Footer() {
  const resetDemo = useStore((s) => s.resetDemo)
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-x grid grid-cols-2 gap-x-4 gap-y-6 border-b border-line py-8 lg:grid-cols-4">
        {TRUST.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-coral-50 text-coral-600"><Icon size={22} /></span>
            <span>
              <span className="block text-sm font-extrabold">{title}</span>
              <span className="block text-xs text-muted">{body}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="container-x grid gap-10 py-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">Comfortable, colourful clothes for kids from newborn to 14 years. Made for Indian weather and Indian celebrations.</p>
          <div className="mt-5 flex flex-col gap-2 text-sm">
            <a href={`tel:${STORE.supportPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 font-semibold hover:text-coral-700"><Phone size={16} /> {STORE.supportPhone}</a>
            <a href={`mailto:${STORE.email}`} className="flex items-center gap-2 font-semibold hover:text-coral-700"><EnvelopeSimple size={16} /> {STORE.email}</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-extrabold">{c.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {c.links.map(([l, to]) => <li key={l}><Link to={to} className="text-sm text-muted hover:text-coral-700">{l}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-x grid gap-6 border-t border-line py-6 text-xs text-muted md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <p><b className="text-ink">Seller:</b> {STORE.seller.legalName}, {STORE.seller.address}</p>
          <p><b className="text-ink">GSTIN:</b> {STORE.seller.gstin}</p>
          <p><b className="text-ink">Grievance officer:</b> {STORE.grievanceOfficer.name}, {STORE.grievanceOfficer.email}, {STORE.grievanceOfficer.hours}</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap gap-1.5">
            {['UPI', 'RuPay', 'Visa', 'Mastercard', 'Net banking', 'Wallets', 'COD'].map((p) => (
              <span key={p} className="rounded-md border border-line px-2 py-1 text-[11px] font-bold text-ink">{p}</span>
            ))}
          </div>
          <ThemeSwitch />
          <p>Demo prototype. No real orders or payments are processed.</p>
          <button
            type="button"
            onClick={() => { resetDemo(); toast('Demo data restored', 'success') }}
            className="inline-flex items-center gap-1.5 font-bold text-ink hover:text-coral-700"
          >
            <ArrowsClockwise size={14} /> Reset demo data
          </button>
        </div>
      </div>
    </footer>
  )
}
