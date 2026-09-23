import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      // Backend-generated static files (e.g. item audio from
      // generateItemAudio.ts) — served by Express's `express.static("uploads")`.
      // A production deployment's reverse proxy needs the same route.
      '/uploads': 'http://localhost:4000',
    },
  },
})
