import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Zweiter Build für das Notizfenster mit den Speakernotes (speakernotes.html,
// src/notizen/). Er läuft nach dem Hauptbuild (`npm run build`) und legt seine
// Dateien dazu, ohne dist/ zu leeren:
//
//   dist/speakernotes.html
//   dist/assets/speakernotes-<hash>.js   (mit eigenem React, ohne den Arbeitsplatz)
//   dist/assets/speakernotes-<hash>.css
//
// Eigener Build statt eines zweiten Eingangs im Hauptbuild: Mit zwei Eingängen
// verteilt der Bündler die geteilten Module neu, das Notizfenster lüde dann
// auch die Diagramm-Bibliothek, und die Bausteine des Arbeitsplatzes hießen
// anders. So bleibt der Hauptbuild, wie er ist, und das Notizfenster ist ein
// abgeschlossenes Bündel, das sich aus dem DEX-Paket heraushalten lässt
// (`ohne` in tools/dex/apps.mjs). Ohne DEX-Plugin: das Notizfenster trägt
// keine Download-Lasche.
export default defineConfig({
  plugins: [react()],
  base: './',
  // public/ kopiert schon der Hauptbuild
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: { speakernotes: fileURLToPath(new URL('./speakernotes.html', import.meta.url)) },
    },
  },
})
