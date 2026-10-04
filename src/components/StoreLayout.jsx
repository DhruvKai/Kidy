import { useEffect, Suspense } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { WhatsappLogo, Cookie } from '@phosphor-icons/react'
import Header, { AnnouncementBar } from './Header'
import Footer from './Footer'
import LoginModal from './LoginModal'
import { Toaster } from './ui'
import { useStore, toast } from '../store/useStore'
import { STORE } from '../config'
import { useStoreTheme } from '../lib/theme'

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function WhatsAppButton() {
  const { pathname } = useLocation()
  const raised = pathname.startsWith('/p/') || pathname === '/cart' || pathname === '/checkout'
  return (
    <a
      href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent('Hi KiDDY WiDDY, I need help with my order.')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`fixed right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#1fa855] text-white shadow-lift transition hover:scale-105 active:scale-95 ${raised ? 'bottom-24 lg:bottom-6' : 'bottom-6'}`}
    >
      <WhatsappLogo size={30} weight="fill" />
    </a>
  )
}

function ConsentBanner() {
  const consent = useStore((s) => s.consent)
  const setConsent = useStore((s) => s.setConsent)
  if (consent) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4" role="region" aria-label="Cookie consent">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lift sm:flex-row sm:items-center">
        <Cookie size={28} className="hidden shrink-0 text-coral-600 sm:block" />
        <p className="flex-1 text-sm text-muted">
          We use cookies to keep your bag, remember your pincode and measure what works. Read our <Link to="/pages/privacy" className="font-bold text-ink underline">privacy notice</Link>.
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary flex-1 sm:flex-none" onClick={() => setConsent('essential')}>Essential only</button>
          <button type="button" className="btn-primary flex-1 sm:flex-none" onClick={() => setConsent('all')}>Accept all</button>
        </div>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="container-x py-8" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-64 rounded-lg" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5] rounded-2xl" />
            <div className="skeleton mt-3 h-4 w-3/4 rounded" />
            <div className="skeleton mt-2 h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StoreLayout() {
  useStoreTheme()
  useEffect(() => {
    const full = () => toast('Browser storage is full, so new changes will not be saved after reload.', 'error')
    window.addEventListener('kw-storage-full', full)
    return () => window.removeEventListener('kw-storage-full', full)
  }, [])
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-surface">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
      <ConsentBanner />
      <LoginModal />
      <Toaster />
    </div>
  )
}
