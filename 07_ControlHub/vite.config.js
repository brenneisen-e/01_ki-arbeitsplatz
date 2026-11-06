import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dex from '../tools/dex/vite-plugin-dex.mjs'

export default defineConfig({
  plugins: [tailwindcss(), react(), dex({ ordner: '07_ControlHub' })],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-lucide': ['lucide-react'],
          'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
        },
      },
    },
  },
})
