import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SEED_PRODUCTS } from '../data/products'
import { SEED_COUPONS } from '../data/coupons'
import { buildSeedOrders, buildSalesHistory } from '../data/seedOrders'
import { makeOrderId, makeAwb } from '../lib/orders'
import { totalStock } from '../lib/pricing'

const cartKey = (productId, size, colour) => `${productId}|${size}|${colour}`

function seed() {
  const products = structuredClone(SEED_PRODUCTS)
  return {
    products,
    coupons: structuredClone(SEED_COUPONS),
    orders: buildSeedOrders(products),
    salesHistory: buildSalesHistory(),
    cart: [],
    saved: [],
    wishlist: [],
    recentlyViewed: [],
    couponCode: null,
    user: null,
    addresses: [],
    pincode: '',
    settings: { autoHideOutOfStock: true },
  }
}

// localStorage can be full or blocked (private mode); the demo keeps working in memory either way.
const safeStorage = createJSONStorage(() => ({
  getItem: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  setItem: (k, v) => {
    try { localStorage.setItem(k, v) } catch { window.dispatchEvent(new CustomEvent('kd-storage-full')) }
  },
  removeItem: (k) => { try { localStorage.removeItem(k) } catch { /* ignore */ } },
}))

const now = () => new Date().toISOString()

export const useStore = create(
  persist(
    (set, get) => ({
      ...seed(),
      consent: null,
      adminAuthed: false,

      // ---------- Cart ----------
      addToCart: ({ productId, size, colour, qty = 1 }) => {
        const key = cartKey(productId, size, colour)
        const p = get().products.find((x) => x.id === productId)
        const stock = p?.variants.find((v) => v.size === size && v.colour === colour)?.stock ?? 0
        set((s) => {
          const existing = s.cart.find((i) => i.key === key)
          if (existing) {
            return { cart: s.cart.map((i) => (i.key === key ? { ...i, qty: Math.min(stock, i.qty + qty) } : i)) }
          }
          return { cart: [...s.cart, { key, productId, size, colour, qty: Math.min(stock, qty) }] }
        })
      },
      updateCartItem: (key, patch) =>
        set((s) => {
          const item = s.cart.find((i) => i.key === key)
          if (!item) return {}
          const next = { ...item, ...patch }
          next.key = cartKey(next.productId, next.size, next.colour)
          const others = s.cart.filter((i) => i.key !== key)
          const clash = others.find((i) => i.key === next.key)
          if (clash) return { cart: others.map((i) => (i.key === next.key ? { ...i, qty: i.qty + next.qty } : i)) }
          return { cart: s.cart.map((i) => (i.key === key ? next : i)) }
        }),
      removeFromCart: (key) => set((s) => ({ cart: s.cart.filter((i) => i.key !== key) })),
      saveForLater: (key) =>
        set((s) => {
          const item = s.cart.find((i) => i.key === key)
          return item ? { cart: s.cart.filter((i) => i.key !== key), saved: [item, ...s.saved.filter((i) => i.key !== key)] } : {}
        }),
      moveToCart: (key) => {
        const item = get().saved.find((i) => i.key === key)
        if (!item) return
        set((s) => ({ saved: s.saved.filter((i) => i.key !== key) }))
        get().addToCart(item)
      },
      removeSaved: (key) => set((s) => ({ saved: s.saved.filter((i) => i.key !== key) })),
      applyCoupon: (code) => set({ couponCode: code.trim().toUpperCase() || null }),
      removeCoupon: () => set({ couponCode: null }),

      // ---------- Browsing ----------
      toggleWishlist: (productId) => {
        const has = get().wishlist.includes(productId)
        set((s) => ({ wishlist: has ? s.wishlist.filter((id) => id !== productId) : [productId, ...s.wishlist] }))
        return !has
      },
      viewProduct: (productId) =>
        set((s) => ({ recentlyViewed: [productId, ...s.recentlyViewed.filter((id) => id !== productId)].slice(0, 12) })),
      setPincode: (pincode) => set({ pincode }),
      setConsent: (consent) => set({ consent }),

      // ---------- Account ----------
      login: ({ phone, name }) =>
        set((s) => {
          const fromOrders = s.orders.find((o) => o.customer.phone === phone)
          const addresses = s.addresses.length
            ? s.addresses
            : fromOrders ? [{ ...fromOrders.address, id: 'a1', label: 'Home', isDefault: true }] : []
          return {
            user: { phone, name: name || fromOrders?.customer.name || '', email: fromOrders?.customer.email || '' },
            addresses,
          }
        }),
      logout: () => set({ user: null }),
      updateProfile: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      addAddress: (addr) => {
        const id = `a${Date.now()}`
        set((s) => ({
          addresses: [
            ...s.addresses.map((a) => (addr.isDefault ? { ...a, isDefault: false } : a)),
            { ...addr, id, isDefault: addr.isDefault || s.addresses.length === 0 },
          ],
        }))
        return id
      },
      removeAddress: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
      deleteAccount: () => set({ user: null, addresses: [], wishlist: [], recentlyViewed: [], saved: [] }),

      // ---------- Orders ----------
      placeOrder: ({ summary, address, customer, paymentMethod, gift }) => {
        const id = makeOrderId()
        const order = {
          id,
          createdAt: now(),
          customer,
          address,
          items: summary.lines.map((l) => ({
            productId: l.productId, title: l.product.title, image: l.product.images[0], size: l.size, colour: l.colour,
            qty: l.qty, unitPrice: l.unitPrice, mrp: l.mrp, hsn: l.product.hsn, sku: l.sku,
          })),
          pricing: {
            mrp: summary.mrpTotal, selling: summary.sellingTotal, bundleDiscount: summary.bundleDiscount,
            couponDiscount: summary.couponDiscount, coupon: summary.coupon?.code || null,
            shipping: summary.shipping, codFee: summary.codFee, total: summary.total,
          },
          payment: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'paid' },
          status: 'placed',
          timeline: [{ status: 'placed', at: now() }],
          shipment: null,
          returnRequest: null,
          invoiceNo: `INV/26-27/${String(1100 + get().orders.length).padStart(5, '0')}`,
          gift: gift || null,
          isNew: true,
          placedInDemo: true,
        }
        set((s) => ({
          orders: [order, ...s.orders],
          cart: [],
          couponCode: null,
          coupons: s.coupons.map((c) => (c.code === order.pricing.coupon ? { ...c, uses: c.uses + 1 } : c)),
          products: s.products.map((p) => {
            const bought = order.items.filter((i) => i.productId === p.id)
            if (!bought.length) return p
            return {
              ...p,
              sold: p.sold + bought.reduce((n, i) => n + i.qty, 0),
              variants: p.variants.map((v) => {
                const b = bought.find((i) => i.size === v.size && i.colour === v.colour)
                return b ? { ...v, stock: Math.max(0, v.stock - b.qty) } : v
              }),
            }
          }),
        }))
        return id
      },
      updateOrder: (id, fn) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? fn(o) : o)) })),
      advanceOrder: (id, status, extra = {}) =>
        get().updateOrder(id, (o) => ({
          ...o,
          ...extra,
          status,
          isNew: false,
          timeline: [...o.timeline, { status, at: now(), note: extra.note }],
          payment: status === 'delivered' && o.payment.method === 'cod' ? { ...o.payment, status: 'collected' } : o.payment,
        })),
      shipOrder: (id, courier) => get().advanceOrder(id, 'shipped', { shipment: { courier: courier.name, awb: makeAwb() }, note: `Shipped via ${courier.name}` }),
      cancelOrder: (id, by = 'customer') => {
        const order = get().orders.find((o) => o.id === id)
        get().advanceOrder(id, 'cancelled', {
          note: by === 'customer' ? 'Cancelled by customer' : 'Cancelled by seller',
          payment: { ...order.payment, status: order.payment.method === 'cod' ? 'void' : 'refunded' },
        })
        // Put the stock back.
        set((s) => ({
          products: s.products.map((p) => {
            const items = order.items.filter((i) => i.productId === p.id)
            if (!items.length) return p
            return { ...p, variants: p.variants.map((v) => { const i = items.find((x) => x.sku === v.sku); return i ? { ...v, stock: v.stock + i.qty } : v }) }
          }),
        }))
      },
      requestReturn: (id, req) =>
        get().updateOrder(id, (o) => ({
          ...o,
          status: 'return_requested',
          returnRequest: { ...req, at: now() },
          timeline: [...o.timeline, { status: 'return_requested', at: now(), note: `${req.type === 'exchange' ? 'Exchange' : 'Return'}: ${req.reason}` }],
        })),
      resolveReturn: (id, approve, refundMode) =>
        get().updateOrder(id, (o) => ({
          ...o,
          status: approve ? 'return_approved' : 'return_rejected',
          returnRequest: { ...o.returnRequest, refundMode: refundMode || o.returnRequest.refundMode },
          timeline: [...o.timeline, { status: approve ? 'return_approved' : 'return_rejected', at: now(), note: approve ? 'Reverse pickup scheduled with courier' : 'Item did not pass the return policy check' }],
        })),
      completeReturn: (id) =>
        get().updateOrder(id, (o) => {
          const exchange = o.returnRequest.type === 'exchange'
          const credit = o.returnRequest.refundMode === 'credit'
          return {
            ...o,
            status: exchange ? 'exchanged' : 'refunded',
            payment: exchange ? o.payment : { ...o.payment, status: credit ? 'store_credit' : 'refunded' },
            timeline: [...o.timeline, { status: exchange ? 'exchanged' : 'refunded', at: now(), note: exchange ? `New size ${o.returnRequest.exchangeSize} shipped` : credit ? 'Added to store credit' : 'Refunded to original payment method' }],
          }
        }),

      // ---------- Catalogue (admin) ----------
      nextProductNumber: () => Math.max(2000, ...get().products.map((p) => Number(p.id.replace('kd', '')) || 0)) + 1,
      upsertProduct: (product) =>
        set((s) => (s.products.some((p) => p.id === product.id)
          ? { products: s.products.map((p) => (p.id === product.id ? product : p)) }
          : { products: [product, ...s.products] })),
      duplicateProduct: (id) => {
        const src = get().products.find((p) => p.id === id)
        const n = get().nextProductNumber()
        const copy = {
          ...structuredClone(src),
          id: `kd${n}`, code: `KD-${n}`, slug: `${src.slug.replace(/-\d+$/, '')}-copy-${n}`,
          title: `${src.title} (Copy)`, status: 'draft', sold: 0, reviewCount: 0, createdDaysAgo: 0,
        }
        copy.variants = copy.variants.map((v) => ({ ...v, sku: v.sku.replace(src.code, copy.code) }))
        set((s) => ({ products: [copy, ...s.products] }))
        return copy.id
      },
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      setProductStatus: (id, status) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, status } : p)) })),
      setVariantStock: (productId, sku, stock) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === productId ? { ...p, variants: p.variants.map((v) => (v.sku === sku ? { ...v, stock: Math.max(0, stock) } : v)) } : p)),
        })),
      importProducts: (list) => set((s) => ({ products: [...list, ...s.products] })),
      addCoupon: (c) => set((s) => ({ coupons: [{ ...c, uses: 0, active: true }, ...s.coupons.filter((x) => x.code !== c.code)] })),
      toggleCoupon: (code) => set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c)) })),
      deleteCoupon: (code) => set((s) => ({ coupons: s.coupons.filter((c) => c.code !== code) })),
      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),

      adminLogin: () => set({ adminAuthed: true }),
      adminLogout: () => set({ adminAuthed: false }),
      resetDemo: () => set({ ...seed() }),
    }),
    { name: 'kidy-demo', version: 1, storage: safeStorage },
  ),
)

// Storefront visibility: published (or scheduled time reached) and in stock when auto-hide is on.
export function isVisible(p, settings) {
  const live = p.status === 'published' || (p.status === 'scheduled' && p.publishAt && new Date(p.publishAt) <= new Date())
  if (!live) return false
  return !(settings?.autoHideOutOfStock && totalStock(p) === 0)
}

export function useVisibleProducts() {
  const products = useStore((s) => s.products)
  const settings = useStore((s) => s.settings)
  return useMemo(() => products.filter((p) => isVisible(p, settings)), [products, settings])
}

// Transient toasts (not persisted).
export const useToast = create((set) => ({
  toasts: [],
  push: (message, tone = 'default', action) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, message, tone, action }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
export const toast = (...args) => useToast.getState().push(...args)
