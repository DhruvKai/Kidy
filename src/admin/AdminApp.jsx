import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import AdminLayout from './AdminLayout'
import AdminLogin from './AdminLogin'
import Dashboard from './Dashboard'
import Orders from './Orders'
import AdminOrderDetail from './AdminOrderDetail'
import ProductList from './ProductList'
import ProductForm from './ProductForm'
import BulkUpload from './BulkUpload'
import Inventory from './Inventory'
import Discounts from './Discounts'
import Returns from './Returns'
import Customers from './Customers'

function Guard({ children }) {
  const authed = useStore((s) => s.adminAuthed)
  return authed ? children : <Navigate to="/admin/login" replace />
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<Guard><AdminLayout /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/bulk" element={<BulkUpload />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="returns" element={<Returns />} />
        <Route path="customers" element={<Customers />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
