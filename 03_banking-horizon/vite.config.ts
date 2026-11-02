import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
    // Zweite Seite: das Notizfenster mit den Speakernotes (speakernotes.html).
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        speakernotes: fileURLToPath(new URL('./speakernotes.html', import.meta.url)),
      },
    },
  },
  server: { port: 5180, host: true },
})
