import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // base relativa: o build funciona em qualquer subpasta (GitHub Pages, Netlify, servidor estático)
  base: './',
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
})
