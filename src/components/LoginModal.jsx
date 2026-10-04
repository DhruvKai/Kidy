import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DeviceMobile, ShieldCheck } from '@phosphor-icons/react'
import { Modal, Field } from './ui'
import { useUI } from '../store/ui'
import { useStore, toast } from '../store/useStore'
import { DEMO } from '../config'

export default function LoginModal() {
  const { loginOpen, closeLogin, onLogin } = useUI()
  const login = useStore((s) => s.login)
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState(DEMO.phone)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => { if (loginOpen) { setStep('phone'); setOtp(''); setError('') } }, [loginOpen])

  const sendOtp = (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a valid 10-digit mobile number.')
    setError('')
    setSending(true)
    setTimeout(() => { setSending(false); setStep('otp') }, 700)
  }
  const verify = (e) => {
    e.preventDefault()
    if (otp !== DEMO.otp) return setError(`That code is not right. For this demo, use ${DEMO.otp}.`)
    login({ phone })
    const name = useStore.getState().user?.name
    toast(name ? `Welcome back, ${name.split(' ')[0]}` : 'You are logged in', 'success')
    onLogin?.()
    closeLogin()
  }

  return (
    <Modal open={loginOpen} onClose={closeLogin} title={step === 'phone' ? 'Login or sign up' : 'Verify your number'}>
      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="flex flex-col gap-4">
          <p className="text-sm text-muted">No passwords. We send a one-time code to your mobile.</p>
          <Field label="Mobile number" htmlFor="login-phone" error={error}>
            <div className="flex">
              <span className="grid place-items-center rounded-l-xl border border-r-0 border-line bg-cream px-3 text-sm font-bold">+91</span>
              <input id="login-phone" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="input rounded-l-none" />
            </div>
          </Field>
          <button className="btn-primary w-full py-3" disabled={sending}>{sending ? 'Sending code...' : 'Send OTP'}</button>
          <p className="text-xs text-muted">By continuing you agree to our <Link to="/pages/terms" onClick={closeLogin} className="font-bold underline">Terms</Link> and <Link to="/pages/privacy" onClick={closeLogin} className="font-bold underline">Privacy notice</Link>.</p>
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-sm text-muted"><DeviceMobile size={18} /> Code sent to +91 {phone}. <button type="button" className="font-bold text-coral-700" onClick={() => setStep('phone')}>Change</button></p>
          <Field label="6-digit code" htmlFor="login-otp" error={error}>
            <input id="login-otp" autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="input text-center text-xl font-extrabold tracking-[0.5em]" />
          </Field>
          <div className="flex items-center gap-2 rounded-xl bg-sunny-50 px-3 py-2.5 text-sm text-sunny-700">
            <ShieldCheck size={18} /> Demo mode: the code is <b>{DEMO.otp}</b>
          </div>
          <button className="btn-primary w-full py-3">Verify and continue</button>
        </form>
      )}
    </Modal>
  )
}
