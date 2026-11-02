// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Pages Function — geteilter Review-Store fuer „Ein Tag in Banking
// Operations 2030" (Kommentare des Teams je Station).
//
//   GET  /api/review  -> gespeicherte Notizen (JSON) oder { notizen: [] }
//   PUT  /api/review  -> Notizen speichern (JSON-Body)
//
// Persistenz ueber dieselbe KV-Bindung wie der Content-Editor (CONTENT_KV),
// aber unter eigenem Schluessel. Ohne Bindung antwortet GET mit einer leeren
// Liste und PUT mit 503 — die App faellt dann sauber auf localStorage zurueck
// und zeigt im Panel an, dass die Notizen nur lokal liegen.
//
// Einrichtung der KV-Bindung: 09_docs/cloudflare-speichern-einrichten.md
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'ops-review';
const MAX_BYTES = 2_000_000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function onRequestGet(context) {
  const kv = context.env && context.env.CONTENT_KV;
  if (!kv) return json({ notizen: [], texte: {}, geteilt: false });
  const roh = await kv.get(KEY);
  if (!roh) return json({ notizen: [], texte: {}, geteilt: true });
  try {
    const daten = JSON.parse(roh);
    return json({
      notizen: Array.isArray(daten.notizen) ? daten.notizen : [],
      texte: daten.texte && typeof daten.texte === 'object' ? daten.texte : {},
      geteilt: true,
    });
  } catch {
    return json({ notizen: [], texte: {}, geteilt: true });
  }
}

export async function onRequestPut(context) {
  const kv = context.env && context.env.CONTENT_KV;
  if (!kv) return json({ error: 'CONTENT_KV not configured' }, 503);

  const text = await context.request.text();
  if (text.length > MAX_BYTES) return json({ error: 'too large' }, 413);
  let daten;
  try {
    daten = JSON.parse(text);
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  if (!daten || !Array.isArray(daten.notizen)) return json({ error: 'invalid shape' }, 400);

  await kv.put(KEY, JSON.stringify({
    notizen: daten.notizen,
    texte: daten.texte && typeof daten.texte === 'object' ? daten.texte : {},
  }));
  return json({ ok: true, anzahl: daten.notizen.length });
}
