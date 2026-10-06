import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, ArrowLeft } from '@phosphor-icons/react'
import { useStore } from '../store/useStore'
import { Logo, Field } from '../components/ui'
import { DEMO } from '../config'

export default function AdminLogin() {
  const navigate = useNavigate()
  const adminLogin = useStore((s) => s.adminLogin)
  const [email, setEmail] = useState(DEMO.adminEmail)
  const [password, setPassword] = useState(DEMO.adminPassword)
  const [error, setError] = useState('')
  useEffect(() => { document.title = 'Store admin | Kidy' }, [])

  const submit = (e) => {
    e.preventDefault()
    if (email !== DEMO.adminEmail || password !== DEMO.adminPassword) return setError('Wrong email or password. The demo login is already filled in.')
    adminLogin()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-cream p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} /> Back to store</Link>
        <form onSubmit={submit} className="rounded-3xl bg-white p-7 shadow-lift">
          <Logo />
          <h1 className="mt-4 text-2xl font-bold">Store admin</h1>
          <p className="mt-1 text-sm text-muted">Manage products, orders and offers.</p>
          <div className="mt-6 flex flex-col gap-4">
            <Field label="Email" htmlFor="ad-email"><input id="ad-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></Field>
            <Field label="Password" htmlFor="ad-pass" error={error}><input id="ad-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" /></Field>
            <button className="btn-primary w-full py-3"><Lock size={16} /> Log in</button>
          </div>
          <p className="mt-4 rounded-xl bg-sunny-50 px-3 py-2.5 text-xs text-sunny-700">Demo login is pre-filled. In the live store, staff get their own logins with permissions.</p>
        </form>
      </div>
    </div>
  )
}
