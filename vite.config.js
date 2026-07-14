import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  optimizeDeps: {
    exclude: ['harper.js'],
  },
  assetsInclude: ['**/*.wasm'],
  worker: {
    format: 'es',
  },
  build: {
    assetsInlineLimit: 0,
  },
})
