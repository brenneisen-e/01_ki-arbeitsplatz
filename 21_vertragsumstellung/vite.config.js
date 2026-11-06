import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dex from '../tools/dex/vite-plugin-dex.mjs'

export default defineConfig({
  plugins: [tailwindcss(), react(), dex({ ordner: '21_vertragsumstellung', oben: 52 })],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // Diagrammbibliothek getrennt laden; React und alles Übrige
          // bleiben in einem Bündel, damit die Initialisierungs-
          // reihenfolge nicht auseinanderfällt.
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory-vendor')) {
            return 'vendor-charts'
          }
          return 'vendor'
        },
      },
    },
  },
})
