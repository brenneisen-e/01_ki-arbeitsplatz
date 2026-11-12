// Cloudflare Pages Function: POST /api/auth
// Validiert ein vom Client gesendetes Passwort gegen ein Env-Secret und setzt
// bei Erfolg ein HttpOnly-Cookie, das die serverseitige Zugriffssperre
// (functions/_middleware.js) auf jeder Route auswertet.
//
// Der Scope bestimmt, welches Secret herangezogen wird:
//
//   scope: 'app'      -> env.ACCESS_PASSWORD    (Root-Landing / Plattform)
//   scope: 'workshop' -> env.WORKSHOP_PASSWORD  (Bank der Zukunft Workshop)
//   scope: 'rbs'      -> Kennwort der Regionalbankenstudie 2026 (Hash in
//                        _lib/authToken.js, optional env.RBS_PASSWORD)
//
// Ist kein Scope gesetzt oder unbekannt, wird 'app' verwendet. Die
// plattformweite Sperre in _middleware.js prüft den 'app'-Scope.
//
// Beide Secrets in Cloudflare hinterlegen:
//   Workers & Pages -> kiarbeitsplatz -> Settings -> Variables and Secrets
//   -> Add variable (Type: Secret):
//      Name: ACCESS_PASSWORD
//      Name: WORKSHOP_PASSWORD
//
// Response:
//   200 { ok: true, scope }  -> Passwort korrekt (+ Set-Cookie)
//   401 { ok: false, scope } -> Passwort falsch
//   500 { error }            -> Secret fuer diesen Scope nicht hinterlegt

import {
  cookieNameForScope,
  deriveToken,
  constantTimeEquals,
  buildAuthCookie,
  pruefeRbsKennwort,
  rbsToken,
} from '../_lib/authToken.js';

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

  // Regionalbankenstudie: eigenes Kennwort, braucht kein Secret.
  if (rawScope === 'rbs') {
    const rbsOk = await pruefeRbsKennwort(body?.password, env);
    if (!rbsOk) {
      return new Response(JSON.stringify({ ok: false, scope: 'rbs' }), { status: 401, headers });
    }
    return new Response(JSON.stringify({ ok: true, scope: 'rbs' }), {
      status: 200,
      headers: { ...headers, 'Set-Cookie': buildAuthCookie(cookieNameForScope('rbs'), await rbsToken(env)) },
    });
  }
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

  // Erfolg: deterministisches Token ableiten und als HttpOnly-Cookie setzen,
  // damit die Middleware nachfolgende Requests serverseitig durchlassen kann.
  const token = await deriveToken(expected);
  const cookie = buildAuthCookie(cookieNameForScope(scope), token);

  return new Response(JSON.stringify({ ok: true, scope }), {
    status: 200,
    headers: { ...headers, 'Set-Cookie': cookie },
  });
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'content-type': 'application/json', 'allow': 'POST' },
  });
}
