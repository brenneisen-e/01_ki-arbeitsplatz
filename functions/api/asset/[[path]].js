// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Pages Function — liefert hochgeladene Bilder aus R2 aus.
//
//   GET /api/asset/<key>   -> streamt das Objekt aus dem R2-Bucket CONTENT_R2.
//
// Catch-all-Route ([[path]]), da der Key einen Slash enthält (z. B. up/<uuid>.png).
// Ohne R2-Bindung: 404. Lange, unveränderliche Cache-Header (Keys sind eindeutig).
// ─────────────────────────────────────────────────────────────────────────────

export async function onRequestGet(context) {
  const r2 = context.env && context.env.CONTENT_R2;
  if (!r2) return new Response('not found', { status: 404 });

  const parts = context.params && context.params.path;
  const key = Array.isArray(parts) ? parts.join('/') : String(parts || '');
  if (!key) return new Response('not found', { status: 404 });

  const obj = await r2.get(key);
  if (!obj) return new Response('not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
}
