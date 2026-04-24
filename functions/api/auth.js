// Cloudflare Pages Function: POST /api/auth
// Validiert ein vom Client gesendetes Passwort gegen ein Env-Secret.
// Der Scope bestimmt, welches Secret herangezogen wird:
//
//   scope: 'app'      -> env.ACCESS_PASSWORD    (Root-Landing / Plattform)
//   scope: 'workshop' -> env.WORKSHOP_PASSWORD  (Bank der Zukunft Workshop)
//
// Ist kein Scope gesetzt oder unbekannt, wird 'app' verwendet.
//
// Beide Secrets in Cloudflare hinterlegen:
//   Workers & Pages -> kiarbeitsplatz -> Settings -> Variables and Secrets
//   -> Add variable (Type: Secret):
//      Name: ACCESS_PASSWORD
//      Name: WORKSHOP_PASSWORD
//
// Response:
//   200 { ok: true, scope }  -> Passwort korrekt
//   401 { ok: false, scope } -> Passwort falsch
//   500 { error }            -> Secret fuer diesen Scope nicht hinterlegt

function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

const SCOPES = {
  app: { secretName: 'ACCESS_PASSWORD' },
  workshop: { secretName: 'WORKSHOP_PASSWORD' },
};

export async function onRequestPost({ request, env }) {
  const headers = {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungueltiger JSON-Body.' }), { status: 400, headers });
  }

  const rawScope = typeof body?.scope === 'string' ? body.scope.toLowerCase() : 'app';
  const scope = SCOPES[rawScope] ? rawScope : 'app';
  const secretName = SCOPES[scope].secretName;
  const expected = env[secretName];

  if (!expected) {
    return new Response(
      JSON.stringify({
        error: `${secretName}-Secret ist in Cloudflare Pages nicht gesetzt.`,
        scope,
      }),
      { status: 500, headers }
    );
  }

  const password = typeof body?.password === 'string' ? body.password : '';
  const ok = constantTimeEquals(password, expected);

  if (!ok) {
    return new Response(JSON.stringify({ ok: false, scope }), { status: 401, headers });
  }

  return new Response(JSON.stringify({ ok: true, scope }), { status: 200, headers });
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'content-type': 'application/json', 'allow': 'POST' },
  });
}
