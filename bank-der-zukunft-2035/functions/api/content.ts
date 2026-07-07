// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Pages Function — geteilter Content-Override-Store.
//
//   GET  /api/content  -> gespeicherte Overrides (JSON) oder {}
//   PUT  /api/content  -> Overrides speichern (JSON-Body)
//
// Persistenz über die KV-Namespace-Bindung `CONTENT_KV`. Ist die Bindung nicht
// gesetzt (KV noch nicht angelegt), antwortet GET mit {} und PUT mit 503 —
// die App fällt dann sauber auf localStorage zurück und bricht nie.
//
// Einrichtung (einmalig, Cloudflare-Account nötig):
//   1) KV-Namespace anlegen:  npx wrangler kv namespace create CONTENT_KV
//   2) Bindung setzen: in wrangler.toml den [[kv_namespaces]]-Block mit der
//      zurückgegebenen id aktivieren ODER im Pages-Dashboard unter
//      Settings → Functions → KV namespace bindings: Variable CONTENT_KV.
// Diese Datei ist NICHT Teil des Vite-Builds (tsconfig include = "src"); sie
// wird von Cloudflare Pages separat gebaut.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'overrides'
const MAX_BYTES = 2_000_000

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export async function onRequestGet(context: any): Promise<Response> {
  const kv = context.env && context.env.CONTENT_KV
  if (!kv) return json({}, 200)
  const raw = await kv.get(KEY)
  if (!raw) return json({}, 200)
  try {
    return json(JSON.parse(raw), 200)
  } catch {
    return json({}, 200)
  }
}

export async function onRequestPut(context: any): Promise<Response> {
  const kv = context.env && context.env.CONTENT_KV
  if (!kv) return json({ error: 'CONTENT_KV not configured' }, 503)
  const body = await context.request.text()
  if (body.length > MAX_BYTES) return json({ error: 'payload too large' }, 413)
  try {
    JSON.parse(body)
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  await kv.put(KEY, body)
  return json({ ok: true }, 200)
}
