// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Pages Function — Bild-Upload für den In-Tool-Editor.
//
//   POST /api/upload   (Body = Bilddaten, content-type: image/*)
//   -> speichert in R2 (Bindung CONTENT_R2) und liefert { url } zurück.
//      Die URL zeigt auf /api/asset/<key> (siehe asset/[[path]].js).
//
// Ohne R2-Bindung: 503 — der Editor behält dann das Standardbild. Einrichtung
// des R2-Buckets/Bindung: siehe docs/cloudflare-speichern-einrichten.md.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_BYTES = 8_000_000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function onRequestPost(context) {
  const r2 = context.env && context.env.CONTENT_R2;
  if (!r2) return json({ error: 'CONTENT_R2 not configured' }, 503);

  const ct = context.request.headers.get('content-type') || 'application/octet-stream';
  if (!ct.startsWith('image/')) return json({ error: 'only image/* allowed' }, 415);

  const buf = await context.request.arrayBuffer();
  if (buf.byteLength === 0) return json({ error: 'empty body' }, 400);
  if (buf.byteLength > MAX_BYTES) return json({ error: 'payload too large' }, 413);

  const ext = (ct.split('/')[1] || 'png').split('+')[0].replace(/[^a-z0-9]/gi, '') || 'png';
  const key = `up/${crypto.randomUUID()}.${ext}`;
  await r2.put(key, buf, { httpMetadata: { contentType: ct } });

  const origin = new URL(context.request.url).origin;
  return json({ url: `${origin}/api/asset/${key}` }, 200);
}
