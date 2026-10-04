import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { IconContext } from '@phosphor-icons/react'
import StoreLayout, { ScrollToTop } from './components/StoreLayout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Home ships in the first bundle; every other page loads when it is first visited.
const Listing = lazy(() => import('./pages/Listing'))
const Product = lazy(() => import('./pages/Product'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Account = lazy(() => import('./pages/Account'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Track = lazy(() => import('./pages/Track'))
const StaticPage = lazy(() => import('./pages/StaticPage'))

// Admin (and its chart library) only loads when someone opens /admin.
const AdminApp = lazy(() => import('./admin/AdminApp'))
const Invoice = lazy(() => import('./pages/Invoice'))

function Loading() {
  return <div className="grid min-h-[60dvh] place-items-center text-sm font-semibold text-muted">Loading...</div>
}

export default function App() {
  return (
    <IconContext.Provider value={{ size: 20, weight: 'bold' }}>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="c/:slug" element={<Listing />} />
            <Route path="search" element={<Listing />} />
            <Route path="p/:slug" element={<Product />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-success/:id" element={<OrderSuccess />} />
            <Route path="account" element={<Account />} />
            <Route path="account/orders/:id" element={<OrderDetail />} />
            <Route path="track" element={<Track />} />
            <Route path="pages/:slug" element={<StaticPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="invoice/:id" element={<Invoice />} />
          <Route path="label/:id" element={<Invoice label />} />
          <Route path="admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </IconContext.Provider>
  )
}
