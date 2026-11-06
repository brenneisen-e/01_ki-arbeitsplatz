import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dex from '../tools/dex/vite-plugin-dex.mjs'

export default defineConfig({
  plugins: [tailwindcss(), react(), dex({ ordner: '13_HRPipeline' })],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
})
