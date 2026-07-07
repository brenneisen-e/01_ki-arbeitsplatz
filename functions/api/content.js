// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Pages Function — geteilter Content-Override-Store (In-Tool-Editor
// der Bank-der-Zukunft-App / Änderungsbereich).
//
//   GET  /api/content  -> gespeicherte Overrides (JSON) oder {}
//   PUT  /api/content  -> Overrides speichern (JSON-Body)
//
// Persistenz über die KV-Namespace-Bindung `CONTENT_KV`. Ist die Bindung nicht
// gesetzt, antwortet GET mit {} und PUT mit 503 — die App fällt dann sauber auf
// localStorage zurück und bricht nie.
//
// Diese Function liegt im DEPLOYTEN Root-`functions/`-Verzeichnis (das Pages-
// Projekt deployt das Repo-Root). Die App ruft sie unter dem absoluten Pfad
// /api/content auf. Der Login-Gate (_middleware.js) schützt sie mit; die
// eingeloggte Browser-Session sendet das Auth-Cookie automatisch mit.
// Einrichtung der KV-Bindung: siehe docs/cloudflare-speichern-einrichten.md.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'overrides';
const MAX_BYTES = 2_000_000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function onRequestGet(context) {
  const kv = context.env && context.env.CONTENT_KV;
  if (!kv) return json({}, 200);
  const raw = await kv.get(KEY);
  if (!raw) return json({}, 200);
  try {
    return json(JSON.parse(raw), 200);
  } catch {
    return json({}, 200);
  }
}

export async function onRequestPut(context) {
  const kv = context.env && context.env.CONTENT_KV;
  if (!kv) return json({ error: 'CONTENT_KV not configured' }, 503);
  const body = await context.request.text();
  if (body.length > MAX_BYTES) return json({ error: 'payload too large' }, 413);
  try {
    JSON.parse(body);
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  await kv.put(KEY, body);
  return json({ ok: true }, 200);
}
