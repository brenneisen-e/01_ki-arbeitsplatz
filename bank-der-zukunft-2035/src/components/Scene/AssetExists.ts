// Lightweight Asset-Loader: prüft per HEAD ob Bild existiert.
// Cached per URL, damit nicht für jeden Mount neu gefetcht wird.

const cache = new Map<string, Promise<boolean>>()

export function assetExists(src: string): Promise<boolean> {
  if (!src) return Promise.resolve(false)
  const cached = cache.get(src)
  if (cached) return cached
  const p = fetch(src, { method: 'HEAD' })
    .then((r) => r.ok)
    .catch(() => false)
  cache.set(src, p)
  return p
}
