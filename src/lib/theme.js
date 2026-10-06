import { useEffect } from 'react'
import { create } from 'zustand'

// Per-viewer colour theme: 'light', 'dark' or 'system' (follow the device, the default).
// index.html applies the same rule before first paint, so keep the key and logic in sync.
const KEY = 'kd-theme'
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function readPref() {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export const resolveTheme = (pref) => (pref === 'system' ? (darkQuery().matches ? 'dark' : 'light') : pref)

const applyTheme = (theme) => { document.documentElement.dataset.theme = theme }

export const useTheme = create((set) => ({
  pref: readPref(),
  setPref: (pref) => {
    try { pref === 'system' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, pref) } catch { /* private mode */ }
    set({ pref })
  },
}))

// Storefront only. The admin, invoice and label always render light, so hand back light on the way out.
export function useStoreTheme() {
  const pref = useTheme((s) => s.pref)
  useEffect(() => {
    const sync = () => applyTheme(resolveTheme(pref))
    sync()
    if (pref !== 'system') return
    const mq = darkQuery()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [pref])
  useEffect(() => () => applyTheme('light'), [])
}
