import { lazy } from 'react';

// React.lazy-Wrapper, der bei einem Chunk-Ladefehler genau einmal pro
// Browser-Session einen Reload erzwingt (für veraltete deployte HTML-Dateien
// auf Cloudflare Pages, die noch auf alte Chunk-Hashes zeigen). Nach dem
// Reload wird der Reload-Versuch via sessionStorage markiert, damit eine
// weiterhin fehlschlagende Import-Anforderung nicht in eine Endlos-Reload-
// Schleife läuft. Stattdessen rendert React dann das vom Suspense-Boundary
// gesetzte Fallback bzw. wirft einen Error, den die Error-Boundary einer
// übergeordneten Komponente fangen kann.
const FLAG = 'kia_chunk_reloaded_once';

export default function lazyRetry(fn) {
  return lazy(() =>
    fn().catch((err) => {
      const isChunkError =
        err?.name === 'ChunkLoadError' ||
        /Loading (?:CSS )?chunk/.test(err?.message || '') ||
        /Failed to fetch dynamically imported module/.test(err?.message || '') ||
        /Importing a module script failed/.test(err?.message || '') ||
        /MIME type/.test(err?.message || '');

      if (!isChunkError) throw err;

      let alreadyReloaded = false;
      try { alreadyReloaded = sessionStorage.getItem(FLAG) === '1'; } catch {}

      if (!alreadyReloaded) {
        try { sessionStorage.setItem(FLAG, '1'); } catch {}
        window.location.reload();
        return new Promise(() => {});
      }

      // Zweiter Fehlversuch in derselben Session: nicht mehr reloaden,
      // sondern die Promise-Rejection durchlassen, damit eine Error-Boundary
      // oder das Suspense-Fallback greift.
      throw err;
    })
  );
}
