import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GetDigitals Topper — CBSE Class 10 Maths
// Offline-first PWA config. No backend, no external API calls at runtime.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
