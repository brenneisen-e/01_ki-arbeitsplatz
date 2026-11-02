import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Offline-Build: packt die komplette App in eine einzige HTML-Datei,
// die der Kunde per Doppelklick offline öffnen kann.
// Ausgabe: dist-offline/index.html
export default defineConfig({
  plugins: [tailwindcss(), react(), viteSingleFile()],
  base: './',
  define: {
    'import.meta.env.VITE_OFFLINE_BUILD': JSON.stringify('true'),
  },
  build: {
    outDir: 'dist-offline',
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000, // alle Bilder/Fonts als Base64 einbetten
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
