// Build-Variante für das SPFx-Paket (banking-horizon-spfx/):
// Erzeugt ein klassisches IIFE-Bundle statt ES-Modulen. Grund: In SharePoint
// werden die ClientSideAssets häufig vom Office-365-CDN (fremder Origin ohne
// CORS-Header) ausgeliefert — <script type="module"> wird dann vom Browser
// blockiert, ein klassisches <script> nicht. Ausgabe nach dist-spfx/ mit
// festem Entry-Namen; der normale Web-Build (dist/) bleibt unverändert.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist-spfx',
    sourcemap: false,
    target: 'es2019',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
