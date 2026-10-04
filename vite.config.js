import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// BASE_PATH lets the same code run at a domain root (Netlify, Vercel) or in a subfolder
// such as GitHub Pages (/Kidy/). The GitHub Pages workflow sets it.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 600 },
})
