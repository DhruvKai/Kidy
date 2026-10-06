import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CheckCircle, User, MapPin, CreditCard, QrCode, Bank, Wallet, Clock, HandCoins, Gift, Lock, CaretDown, WarningCircle, ShieldCheck, SpinnerGap } from '@phosphor-icons/react'
import { useStore, toast } from '../store/useStore'
import { useUI } from '../store/ui'
import { computeCart } from '../lib/pricing'
import { checkPincode } from '../lib/delivery'
import { rupees, fmtDay } from '../lib/format'
import { COMMERCE, DEMO } from '../config'
import { STATES } from '../data/pincodes'
import PriceSummary from '../components/PriceSummary'
import { Field, Modal } from '../components/ui'

const METHODS = [
  { id: 'upi', label: 'UPI', note: 'Google Pay, PhonePe, Paytm, BHIM or any UPI app', icon: QrCode },
  { id: 'card', label: 'Credit or debit card', note: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'netbanking', label: 'Net banking', note: 'All major Indian banks', icon: Bank },
  { id: 'wallet', label: 'Wallets', note: 'Paytm, Amazon Pay, Mobikwik', icon: Wallet },
  { id: 'paylater', label: 'Pay later', note: 'Simpl, LazyPay, ZestMoney', icon: Clock },
  { id: 'cod', label: 'Cash on delivery', note: `₹${COMMERCE.codFee} handling fee. Pay in cash or UPI at your door.`, icon: HandCoins },
]

const EMPTY_ADDR = { name: '', phone: '', pincode: '', line1: '', line2: '', city: '', state: '', label: 'Home' }

function Section({ title, icon: Icon, done, children, aside }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-xl font-bold">
          {done ? <CheckCircle size={24} weight="fill" className="text-mint-600" /> : <Icon size={22} className="text-coral-600" />}
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const cart = useStore((s) => s.cart)
  const products = useStore((s) => s.products)
  const coupons = useStore((s) => s.coupons)
  const couponCode = useStore((s) => s.couponCode)
  const user = useStore((s) => s.user)
  const addresses = useStore((s) => s.addresses)
  const addAddress = useStore((s) => s.addAddress)
  const placeOrder = useStore((s) => s.placeOrder)
  const savedPin = useStore((s) => s.pincode)
  const openLogin = useUI((s) => s.openLogin)

  const [guest, setGuest] = useState({ phone: '', email: '' })
  const [addrId, setAddrId] = useState(null)
  const [addr, setAddr] = useState({ ...EMPTY_ADDR, pincode: savedPin })
  const [saveAddr, setSaveAddr] = useState(true)
  const [method, setMethod] = useState('upi')
  const [gift, setGift] = useState({ on: false, message: '', hidePrice: true })
  const [errors, setErrors] = useState({})
  const [payOpen, setPayOpen] = useState(false)
  const [codOpen, setCodOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const placed = useRef(false)

  useEffect(() => { document.title = 'Checkout | Kidy' }, [])
  useEffect(() => {
    if (addresses.length && !addrId) setAddrId((addresses.find((a) => a.isDefault) || addresses[0]).id)
  }, [addresses, addrId])
  useEffect(() => { if (user && !addr.phone) setAddr((a) => ({ ...a, phone: user.phone, name: a.name || user.name || '' })) }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const summary = useMemo(() => computeCart({ items: cart, products, couponCode, coupons, paymentMethod: method }), [cart, products, couponCode, coupons, method])
  const selectedAddr = addrId ? addresses.find((a) => a.id === addrId) : null
  const shipTo = selectedAddr || addr
  const pin = useMemo(() => (shipTo.pincode?.length === 6 ? checkPincode(shipTo.pincode) : null), [shipTo.pincode])
  const codBlocked = !summary.codAllowed ? `Not available on orders above ₹${COMMERCE.codMaxOrder.toLocaleString('en-IN')}.` : pin?.ok && !pin.info.cod ? 'Not available for this pincode.' : null

  useEffect(() => { if (method === 'cod' && codBlocked) setMethod('upi') }, [codBlocked, method])

  if (!cart.length && !placed.current) return <Navigate to="/cart" replace />

  const onPin = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 6)
    const next = { ...addr, pincode: v }
    if (v.length === 6) {
      const r = checkPincode(v)
      if (r.info) { next.state = r.info.state; if (r.info.city) next.city = r.info.city }
    }
    setAddr(next)
  }

  const validate = () => {
    const e = {}
    if (!user) {
      if (!/^[6-9]\d{9}$/.test(guest.phone)) e.phone = 'Enter a valid 10-digit mobile number.'
      if (guest.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guest.email)) e.email = 'Enter a valid email or leave it empty.'
    }
    if (!selectedAddr) {
      if (!addr.name.trim()) e.name = 'Enter the receiver\'s name.'
      if (!/^[6-9]\d{9}$/.test(addr.phone)) e.addrPhone = 'Enter a valid 10-digit mobile number.'
      if (!addr.line1.trim()) e.line1 = 'Enter your house or flat number and building.'
      if (!addr.city.trim()) e.city = 'Enter your city.'
      if (!addr.state) e.state = 'Select your state.'
    }
    if (!pin || !pin.ok) e.pincode = pin?.error || 'Enter a valid 6-digit pincode.'
    setErrors(e)
    if (Object.keys(e).length) {
      toast('Please check the highlighted details.', 'error')
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    return true
  }

  const finish = () => {
    let address = selectedAddr
    if (!address) {
      address = { ...addr }
      if (user && saveAddr) addAddress({ ...addr, isDefault: !addresses.length })
    }
    const customer = user
      ? { name: user.name || address.name, phone: user.phone, email: user.email || '' }
      : { name: address.name, phone: guest.phone, email: guest.email }
    placed.current = true
    const id = placeOrder({ summary, address, customer, paymentMethod: method, gift: gift.on ? gift : null })
    navigate(`/order-success/${id}`, { replace: true })
  }

  const onPlace = () => {
    if (!validate()) return
    if (method === 'cod') setCodOpen(true)
    else setPayOpen(true)
  }

  return (
    <div className="container-x pb-32 pt-6 lg:pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold md:text-4xl">Checkout</h1>
        <span className="flex items-center gap-1.5 text-xs font-bold text-muted"><Lock size={14} /> Secure checkout</span>
      </div>

      {/* Mobile order summary toggle */}
      <button type="button" onClick={() => setSummaryOpen((v) => !v)} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3 text-sm font-bold shadow-soft lg:hidden" aria-expanded={summaryOpen}>
        <span>Order summary ({summary.itemCount} items)</span>
        <span className="flex items-center gap-2">{rupees(summary.total)} <CaretDown size={14} className={summaryOpen ? 'rotate-180' : ''} /></span>
      </button>
      {summaryOpen && <div className="mt-2 rounded-2xl bg-surface p-4 shadow-soft lg:hidden"><OrderSummary summary={summary} /></div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Section title="Contact" icon={User} done={!!user}>
            {user ? (
              <p className="text-sm">Logged in as <b>{user.name || 'Customer'}</b>, +91 {user.phone}</p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-xl bg-coral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm">Have an account? Log in to use saved addresses and track orders.</p>
                  <button type="button" onClick={() => openLogin()} className="btn-primary btn-sm shrink-0">Login with OTP</button>
                </div>
                <p className="text-sm font-bold text-muted">Or continue as a guest</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mobile number" htmlFor="g-phone" error={errors.phone} hint="For delivery updates on WhatsApp and SMS">
                    <input id="g-phone" data-error={!!errors.phone} inputMode="numeric" maxLength={10} value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value.replace(/\D/g, '') })} className="input" />
                  </Field>
                  <Field label="Email (optional)" htmlFor="g-email" error={errors.email} hint="For your GST invoice">
                    <input id="g-email" data-error={!!errors.email} type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} className="input" />
                  </Field>
                </div>
              </div>
            )}
          </Section>

          <Section title="Delivery address" icon={MapPin} done={!!selectedAddr}>
            {addresses.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {addresses.map((a) => (
                  <label key={a.id} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition ${addrId === a.id ? 'border-ink bg-cream' : 'border-line'}`}>
                    <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} className="mt-1 accent-brand" />
                    <span className="text-sm">
                      <b>{a.name}</b> <span className="ml-1 rounded bg-ink/5 px-1.5 py-0.5 text-[11px] font-bold">{a.label || 'Home'}</span>
                      <span className="mt-1 block text-muted">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}</span>
                      <span className="block text-muted">Mobile: {a.phone}</span>
                    </span>
                  </label>
                ))}
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-sm font-bold ${!addrId ? 'border-ink bg-cream' : 'border-line'}`}>
                  <input type="radio" name="addr" checked={!addrId} onChange={() => setAddrId(null)} className="accent-brand" /> Add a new address
                </label>
              </div>
            )}
            {!selectedAddr && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="a-name" error={errors.name}>
                  <input id="a-name" data-error={!!errors.name} autoComplete="name" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} className="input" />
                </Field>
                <Field label="Mobile number" htmlFor="a-phone" error={errors.addrPhone}>
                  <input id="a-phone" data-error={!!errors.addrPhone} inputMode="numeric" maxLength={10} autoComplete="tel-national" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value.replace(/\D/g, '') })} className="input" />
                </Field>
                <Field label="Pincode" htmlFor="a-pin" error={errors.pincode} hint="City and state fill in automatically">
                  <input id="a-pin" data-error={!!errors.pincode} inputMode="numeric" autoComplete="postal-code" value={addr.pincode} onChange={(e) => onPin(e.target.value)} className="input" />
                </Field>
                <Field label="City" htmlFor="a-city" error={errors.city}>
                  <input id="a-city" data-error={!!errors.city} autoComplete="address-level2" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} className="input" />
                </Field>
                <Field label="House, flat, building" htmlFor="a-l1" error={errors.line1} className="sm:col-span-2">
                  <input id="a-l1" data-error={!!errors.line1} autoComplete="address-line1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} className="input" />
                </Field>
                <Field label="Area, street, landmark (optional)" htmlFor="a-l2">
                  <input id="a-l2" autoComplete="address-line2" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} className="input" />
                </Field>
                <Field label="State" htmlFor="a-state" error={errors.state}>
                  <select id="a-state" data-error={!!errors.state} value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} className="input">
                    <option value="">Select state</option>
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                  {['Home', 'Work', 'Other'].map((l) => (
                    <button key={l} type="button" onClick={() => setAddr({ ...addr, label: l })} className={`chip ${addr.label === l ? 'chip-active' : ''}`}>{l}</button>
                  ))}
                  {user && (
                    <label className="ml-auto flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} className="h-4 w-4 accent-brand" /> Save this address
                    </label>
                  )}
                </div>
              </div>
            )}
            {pin && (
              pin.ok ? (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-mint-50 px-3 py-2.5 text-sm font-semibold text-mint-700"><CheckCircle size={18} weight="fill" /> Delivery by {fmtDay(pin.date)}{pin.info.cod ? '' : '. Cash on delivery is not available here.'}</p>
              ) : (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-coral-50 px-3 py-2.5 text-sm font-semibold text-coral-700"><WarningCircle size={18} /> {pin.error}</p>
              )
            )}
          </Section>

          <Section title="Payment" icon={CreditCard}>
            <div className="flex flex-col gap-2">
              {METHODS.map((m) => {
                const disabled = m.id === 'cod' && !!codBlocked
                return (
                  <label key={m.id} className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${method === m.id ? 'border-ink bg-cream' : 'border-line'}`}>
                    <input type="radio" name="pay" disabled={disabled} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-brand" />
                    <m.icon size={22} className="shrink-0 text-ink" />
                    <span className="flex-1 text-sm">
                      <b>{m.label}</b>
                      <span className="block text-xs text-muted">{disabled ? codBlocked : m.note}</span>
                    </span>
                  </label>
                )
              })}
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-bold">
              <input type="checkbox" checked={gift.on} onChange={(e) => setGift({ ...gift, on: e.target.checked })} className="h-4 w-4 accent-brand" />
              <Gift size={20} className="text-coral-600" /> This is a gift
            </label>
            {gift.on && (
              <div className="mt-3 flex flex-col gap-3 rounded-xl bg-coral-50 p-4">
                <Field label="Gift message" htmlFor="gift-msg" hint={`${gift.message.length}/150`}>
                  <textarea id="gift-msg" maxLength={150} rows={2} value={gift.message} onChange={(e) => setGift({ ...gift, message: e.target.value })} className="input resize-none" />
                </Field>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={gift.hidePrice} onChange={(e) => setGift({ ...gift, hidePrice: e.target.checked })} className="h-4 w-4 accent-brand" /> Hide prices on the packing slip
                </label>
              </div>
            )}
          </Section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="rounded-2xl bg-surface p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Order summary</h2>
                <Link to="/cart" className="text-sm font-bold text-coral-700">Edit bag</Link>
              </div>
              <OrderSummary summary={summary} />
              <button type="button" onClick={onPlace} className="btn-primary mt-5 w-full py-3.5 text-base">
                {method === 'cod' ? 'Place order' : `Pay ${rupees(summary.total)}`}
              </button>
              <p className="mt-3 text-center text-xs text-muted">Demo store. No money is charged.</p>
            </div>
            <p className="flex items-center justify-center gap-2 text-xs font-semibold text-muted"><ShieldCheck size={16} /> 100% secure payments via a PCI-DSS gateway</p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="pl-1">
          <p className="text-lg font-extrabold leading-none">{rupees(summary.total)}</p>
          <p className="text-xs text-muted">Demo, no charge</p>
        </div>
        <button type="button" onClick={onPlace} className="btn-primary h-12 flex-1">{method === 'cod' ? 'Place order' : 'Pay now'}</button>
      </div>

      <PaymentSheet open={payOpen} onClose={() => setPayOpen(false)} amount={summary.total} method={METHODS.find((m) => m.id === method)} onSuccess={finish} />
      <CodConfirm open={codOpen} onClose={() => setCodOpen(false)} phone={user?.phone || guest.phone} amount={summary.total} onConfirm={finish} />
    </div>
  )
}

function OrderSummary({ summary }) {
  return (
    <>
      <ul className="mb-4 flex max-h-64 flex-col gap-3 overflow-y-auto">
        {summary.lines.map((l) => (
          <li key={l.key} className="flex gap-3">
            <img src={l.product.images[0]} alt="" className="h-16 w-12 rounded-lg object-cover" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-bold">{l.product.title}</p>
              <p className="text-xs text-muted">Size {l.size}, {l.colour}, Qty {l.qty}</p>
            </div>
            <span className="text-sm font-bold">{rupees(l.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <PriceSummary summary={summary} showCod />
    </>
  )
}

function PaymentSheet({ open, onClose, amount, method, onSuccess }) {
  const [state, setState] = useState('idle')
  useEffect(() => { if (open) setState('idle') }, [open])
  const pay = (ok) => {
    setState('processing')
    setTimeout(() => {
      if (ok) onSuccess()
      else setState('failed')
    }, 1400)
  }
  return (
    <Modal open={open} onClose={state === 'processing' ? () => {} : onClose} title="Complete payment">
      <div className="flex flex-col items-center text-center">
        <span className="rounded-full bg-sunny-100 px-3 py-1 text-xs font-extrabold text-sunny-700">Demo payment gateway</span>
        <p className="mt-4 text-sm text-muted">Paying with {method?.label}</p>
        <p className="font-display text-4xl font-extrabold">{rupees(amount)}</p>
        {state === 'processing' && (
          <p className="mt-6 flex items-center gap-2 text-sm font-bold"><SpinnerGap size={20} className="animate-spin" /> Confirming with your bank...</p>
        )}
        {state === 'failed' && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-coral-50 px-4 py-3 text-left text-sm font-semibold text-coral-700"><WarningCircle size={18} className="mt-0.5 shrink-0" /> Payment failed. No money was deducted. Try again or choose another method.</p>
        )}
        {state !== 'processing' && (
          <div className="mt-6 flex w-full flex-col gap-2">
            <button type="button" onClick={() => pay(true)} className="btn-primary w-full py-3">Simulate successful payment</button>
            <button type="button" onClick={() => pay(false)} className="btn-secondary w-full py-3">Simulate failed payment</button>
          </div>
        )}
        <p className="mt-5 text-xs text-muted">In the live store this step opens Razorpay or Cashfree. Nothing is charged in this demo.</p>
      </div>
    </Modal>
  )
}

function CodConfirm({ open, onClose, phone, amount, onConfirm }) {
  const [otp, setOtp] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => { if (open) { setOtp(''); setErr('') } }, [open])
  const submit = (e) => {
    e.preventDefault()
    if (otp !== DEMO.otp) return setErr(`Incorrect code. For this demo, use ${DEMO.otp}.`)
    onConfirm()
  }
  return (
    <Modal open={open} onClose={onClose} title="Confirm cash on delivery">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-muted">To keep COD available for everyone, we confirm each COD order with a one-time code sent to +91 {phone}. You will pay <b className="text-ink">{rupees(amount)}</b> at delivery.</p>
        <Field label="6-digit code" htmlFor="cod-otp" error={err}>
          <input id="cod-otp" autoFocus inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="input text-center text-xl font-extrabold tracking-[0.5em]" />
        </Field>
        <p className="rounded-xl bg-sunny-50 px-3 py-2.5 text-sm text-sunny-700">Demo mode: the code is <b>{DEMO.otp}</b></p>
        <button className="btn-primary w-full py-3">Confirm order</button>
      </form>
    </Modal>
  )
}
