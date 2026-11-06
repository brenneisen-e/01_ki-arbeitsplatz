// Vite-Plugin für DEX-Pakete (gemeinsam für alle Vite-Apps).
//
// Normaler Build (`npm run build`): bettet den Download-Knopf
// (download-knopf.js) als Inline-Skript in jede HTML-Seite ein.
//
// Einzeldatei-Build (DEX_SINGLE=1, gesetzt von tools/dex/pack.mjs): statt des
// Knopfs nur der Merker window.__DEX_EINGEBETTET; dazu vite-plugin-singlefile
// und eine Konfiguration, die alles in eine HTML-Datei packt (keine
// Chunks, CSS inline, Bilder und Schriften als data:-URL). Ausgabe nach
// DEX_AUSGABE.
//
// Einbinden in vite.config.js:
//   import dex from '../tools/dex/vite-plugin-dex.mjs'
//   plugins: [..., dex({ ordner: '22_vertriebsarbeitsplatz' })]
//
// ordner = App-Ordner (Webadresse); die DEX-id ist der Ordnername in Kleinbuchstaben.
// oben   = Abstand der Lasche zur Oberkante in px, wenn rechts oben in der Kopfleiste
//          schon Bedienelemente stehen (die Lasche hängt dann unter der Kopfleiste).
// rechts = Abstand zum rechten Rand in px (Standard 16), falls darunter ein Knopf liegt.

import { readFileSync } from 'node:fs'

const KNOPF = readFileSync(new URL('./download-knopf.js', import.meta.url), 'utf8')

export default function dex({ ordner, rel = '../', oben = 0, rechts = 16 } = {}) {
  if (!ordner || !/^[a-z0-9_-]+$/i.test(ordner)) throw new Error(`vite-plugin-dex: ungültiger Ordner „${ordner}“`)
  const id = ordner.toLowerCase()
  const single = process.env.DEX_SINGLE === '1'

  const basis = {
    name: 'dex-download',
    transformIndexHtml: {
      order: 'post',
      handler() {
        if (single) {
          return [{ tag: 'script', children: 'window.__DEX_EINGEBETTET=true;', injectTo: 'head-prepend' }]
        }
        return [{
          tag: 'script',
          children: `window.__DEX_KNOPF=${JSON.stringify({ ordner, id, rel, oben, rechts })};\n${KNOPF}`,
          injectTo: 'body',
        }]
      },
    },
  }
  if (!single) return basis

  const ausgabe = process.env.DEX_AUSGABE
  if (!ausgabe) throw new Error('vite-plugin-dex: DEX_AUSGABE fehlt für den Einzeldatei-Build')

  const einzeldatei = {
    name: 'dex-single-config',
    enforce: 'post',
    config(cfg) {
      cfg.build ??= {}
      const b = cfg.build
      b.outDir = ausgabe
      b.emptyOutDir = true
      b.copyPublicDir = false
      b.assetsInlineLimit = () => true
      b.cssCodeSplit = false
      b.chunkSizeWarningLimit = 1e9
      b.modulePreload = false
      b.rollupOptions ??= {}
      const ro = b.rollupOptions
      // Nur die Hauptseite; weitere Eingänge (z. B. Notizfenster) entfallen.
      if (ro.input && typeof ro.input === 'object') {
        const haupt = Array.isArray(ro.input)
          ? ro.input.find((p) => /index\.html$/.test(p))
          : Object.values(ro.input).find((p) => /index\.html$/.test(String(p)))
        ro.input = haupt ?? ro.input
      }
      const ausgaben = Array.isArray(ro.output) ? ro.output : [ro.output ??= {}]
      for (const o of ausgaben) {
        delete o.manualChunks
        o.inlineDynamicImports = true
      }
    },
  }

  return import('vite-plugin-singlefile').then(({ viteSingleFile }) => [
    basis,
    einzeldatei,
    viteSingleFile({ removeViteModuleLoader: true, useRecommendedBuildConfig: false }),
  ])
}
