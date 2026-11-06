import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dex from '../tools/dex/vite-plugin-dex.mjs'

export default defineConfig({
  plugins: [tailwindcss(), react(), dex({ ordner: '02_BankenKPI' })],
  base: './',
})
