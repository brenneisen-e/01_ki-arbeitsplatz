// Cloudflare Pages Function: POST /api/auth
// Validiert ein vom Client gesendetes Passwort gegen das
// ACCESS_PASSWORD-Secret der Pages-Umgebung.
//
// Secret in Cloudflare hinterlegen:
//   Workers & Pages → kiarbeitsplatz → Settings → Variables and Secrets
//   → Add variable → Type: Secret → Name: ACCESS_PASSWORD
//
// Response:
//   200 { ok: true }  -> Passwort korrekt
//   401 { ok: false } -> Passwort falsch
//   500 { error }     -> Secret nicht konfiguriert / sonstiger Fehler

function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function onRequestPost({ request, env }) {
  const headers = {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  };

  if (!env.ACCESS_PASSWORD) {
    return new Response(
      JSON.stringify({ error: 'ACCESS_PASSWORD-Secret ist in Cloudflare Pages nicht gesetzt.' }),
      { status: 500, headers }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungueltiger JSON-Body.' }), { status: 400, headers });
  }

  const password = typeof body?.password === 'string' ? body.password : '';
  const ok = constantTimeEquals(password, env.ACCESS_PASSWORD);

  if (!ok) {
    return new Response(JSON.stringify({ ok: false }), { status: 401, headers });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'content-type': 'application/json', 'allow': 'POST' },
  });
}
