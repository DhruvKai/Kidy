import { create } from 'zustand'

// Transient UI state shared across the storefront (never persisted).
export const useUI = create((set) => ({
  loginOpen: false,
  onLogin: null,
  openLogin: (onLogin = null) => set({ loginOpen: true, onLogin }),
  closeLogin: () => set({ loginOpen: false, onLogin: null }),
}))
