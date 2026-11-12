// Cloudflare Pages Middleware: serverseitige Zugriffssperre für die GESAMTE
// Plattform – inklusive aller Sub-Apps und Deeplinks (z. B.
// /22_vertriebsarbeitsplatz/dist/#/...). Läuft vor jeder statischen Datei und
// jeder anderen Function.
//
// Ablauf:
//   1. /api/auth wird immer durchgelassen (sonst ist kein Login möglich).
//   2. Ohne gesetztes ACCESS_PASSWORD-Secret: fail-open (Sperre inaktiv),
//      damit eine Fehlkonfiguration nicht die komplette Plattform aussperrt.
//   3. Gültiges Auth-Cookie -> Request wird normal bedient (next()).
//   4. Sonst -> eigene, in sich geschlossene Login-Seite (HTTP 401).
//      Nach erfolgreichem Login (Cookie via /api/auth gesetzt) lädt die Seite
//      neu und der ursprüngliche Deeplink wird ausgeliefert.
//   5. Ausnahme /11_galerie (alt /galerie, /gallery): die Use-Case-Galerie (Bewerbungsmappe) ist OHNE
//      Passwort erreichbar. Weil ihre Live-Vorschauen und „Open application"
//      die Apps der Plattform laden, bekommt jede Galerie-Antwort das
//      Plattform-Cookie mit — der Galerie-Link ist damit zugleich der Zugang
//      zur Plattform. Bewusst so gewollt.
//   6. /24_regionalbankenstudie (Kurzform /regionalbankenstudie): die
//      Regionalbankenstudie 2026 hat ein eigenes Kennwort (Scope 'rbs'),
//      damit ihr Link ohne das Plattform-Passwort weitergegeben werden kann.
//      Wer an der Plattform angemeldet ist, kommt ohne zweite Abfrage hinein;
//      das Studien-Kennwort oeffnet nur die Studie, nicht die Plattform.

import {
  APP_AUTH_COOKIE,
  deriveToken,
  constantTimeEquals,
  parseCookies,
  buildAuthCookie,
  RBS_AUTH_COOKIE,
  rbsToken,
} from './_lib/authToken.js';

// Regionalbankenstudie 2026 mit eigenem Kennwort (siehe Punkt 6 oben).
const RBS_PREFIXE = ['/24_regionalbankenstudie', '/regionalbankenstudie'];
function isRbsPath(pathname) {
  return RBS_PREFIXE.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

// Ohne Passwort erreichbar (siehe Punkt 5 oben). Die Galerie liegt seit der
// Nummerierung der Ordner unter /11_galerie; /galerie und die Kurzform
// /gallery leiten per _redirects dorthin und muessen dafuer ebenfalls ohne
// Login durchkommen, sonst saehe ein geteilter Galerie-Link die Login-Seite.
const GALERIE_PREFIXE = ['/11_galerie', '/galerie', '/gallery'];
function isGaleriePath(pathname) {
  return GALERIE_PREFIXE.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

// localStorage-Key, den die Root-Landing (index.html) prüft. Wir setzen ihn
// nach erfolgreichem Login zusätzlich, damit dort kein zweiter Prompt erscheint.
const LEGACY_LS_KEY = 'kiarbeitsplatz_auth_v1';

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Login-Endpoint stets erreichbar lassen.
  if (url.pathname === '/api/auth') return next();

  const secret = env.ACCESS_PASSWORD;

  // Regionalbankenstudie: Plattform-Cookie oder Studien-Cookie genuegt. Steht
  // vor dem fail-open, damit die Studie auch ohne ACCESS_PASSWORD gesperrt ist.
  if (isRbsPath(url.pathname)) {
    const c = parseCookies(request.headers.get('Cookie'));
    const rbsCookie = c[RBS_AUTH_COOKIE];
    if (rbsCookie && constantTimeEquals(rbsCookie, await rbsToken(env))) return next();
    const appCookie = c[APP_AUTH_COOKIE];
    if (secret && appCookie && constantTimeEquals(appCookie, await deriveToken(secret))) return next();
    return new Response(loginPage(RBS_LOGIN), {
      status: 401,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  if (!secret) {
    // Sperre deaktiviert, solange kein Secret hinterlegt ist.
    console.warn('[auth] ACCESS_PASSWORD nicht gesetzt – Zugriffssperre inaktiv.');
    return next();
  }

  const expected = await deriveToken(secret);

  // Galerie: durchlassen und das Plattform-Cookie mitgeben, damit die
  // eingebetteten Apps (gleiche Origin) es bei ihren Anfragen tragen.
  if (isGaleriePath(url.pathname)) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.append('Set-Cookie', buildAuthCookie(APP_AUTH_COOKIE, expected));
    return out;
  }

  const cookies = parseCookies(request.headers.get('Cookie'));
  const presented = cookies[APP_AUTH_COOKIE];

  if (presented && constantTimeEquals(presented, expected)) {
    return next();
  }

  return new Response(loginPage(), {
    status: 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

// Texte der Login-Seite: Plattform (Standard) und Regionalbankenstudie.
const APP_LOGIN = {
  scope: 'app',
  titel: 'Zugriff geschützt · Financial Services AI Use Case Platform',
  text: 'Diese Plattform ist passwortgeschützt. Bitte gib dein Zugangspasswort ein.',
  fuss: 'Financial Services AI Use Case Platform &middot; Eike Brenneisen (BCMT)',
  zugangsHinweis: true,
};
const RBS_LOGIN = {
  scope: 'rbs',
  titel: 'Zugriff geschützt · Regionalbankenstudie 2026',
  text: 'Die interaktive Fassung der Deloitte Regionalbankenstudie 2026 ist passwortgeschützt. Bitte geben Sie das Kennwort ein.',
  fuss: 'Deloitte Regionalbankenstudie 2026 &middot; interaktive Fassung',
  zugangsHinweis: false,
};

function loginPage(cfg = APP_LOGIN) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${cfg.titel}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    font-family: "DM Sans", "Segoe UI", system-ui, -apple-system, sans-serif;
    background: radial-gradient(1200px 600px at 50% -10%, #1e293b 0%, #0f172a 60%, #0b1120 100%);
    color: #e2e8f0; padding: 24px;
  }
  .card {
    width: 100%; max-width: 420px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.10); border-radius: 20px; padding: 32px;
    box-shadow: 0 24px 60px -20px rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  }
  .lock {
    width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.10); margin-bottom: 20px; color: #cbd5e1;
  }
  h1 { font-size: 18px; font-weight: 600; margin: 0 0 6px; color: #f8fafc; }
  p.sub { margin: 0 0 22px; font-size: 14px; color: #94a3b8; line-height: 1.5; }
  label { display: block; font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px; letter-spacing: .02em; }
  input[type=password] {
    width: 100%; padding: 12px 14px; border-radius: 12px; font-size: 14px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #f8fafc; outline: none;
    transition: border-color .15s, background .15s;
  }
  input[type=password]:focus { border-color: #5b8def; background: rgba(255,255,255,0.10); }
  button {
    width: 100%; margin-top: 16px; padding: 12px 14px; border-radius: 12px; border: none; cursor: pointer;
    font-size: 14px; font-weight: 600; color: #fff; background: #2d3f6e; transition: background .15s, opacity .15s;
  }
  button:hover { background: #38508c; }
  button:disabled { opacity: .55; cursor: default; }
  .error { display: none; margin-top: 14px; font-size: 13px; color: #fca5a5; }
  .info { margin-top: 22px; font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
  .info a { color: #93b4f0; text-decoration: none; }
  .info a:hover { text-decoration: underline; }
  .footer { margin-top: 18px; font-size: 11px; color: #475569; }
  @keyframes shake { 10%,90%{transform:translateX(-1px)} 20%,80%{transform:translateX(2px)} 30%,50%,70%{transform:translateX(-4px)} 40%,60%{transform:translateX(4px)} }
  .shake { animation: shake .4s; }
</style>
</head>
<body>
  <form class="card" id="auth-form" autocomplete="off">
    <div class="lock" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h1>Zugriff geschützt</h1>
    <p class="sub">${cfg.text}</p>
    <label for="auth-password">Passwort</label>
    <input id="auth-password" type="password" autocomplete="current-password" autofocus />
    <button id="auth-submit" type="submit">Entsperren</button>
    <div class="error" id="auth-error"></div>
${cfg.zugangsHinweis ? `    <div class="info">
      Zugriff kannst du per E-Mail bei
      <a href="mailto:ebrenneisen@deloitte.de?subject=Zugriff%20Financial%20Services%20AI%20Use%20Case%20Platform">ebrenneisen@deloitte.de</a>
      anfragen.
    </div>` : ''}
    <div class="footer">${cfg.fuss}</div>
  </form>
<script>
(function () {
  var form = document.getElementById('auth-form');
  var pw = document.getElementById('auth-password');
  var btn = document.getElementById('auth-submit');
  var err = document.getElementById('auth-error');
  function showError(msg) {
    err.textContent = msg; err.style.display = 'block';
    form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.style.display = 'none';
    var value = pw.value || '';
    if (!value) { showError('Bitte ein Passwort eingeben.'); return; }
    btn.disabled = true; btn.textContent = 'Pruefe...';
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: value, scope: '${cfg.scope}' }),
      credentials: 'same-origin',
    }).then(function (res) {
      if (res.status === 401) throw new Error('Falsches Passwort.');
      if (res.status === 500) throw new Error('ACCESS_PASSWORD-Secret ist noch nicht in Cloudflare hinterlegt.');
      if (!res.ok) throw new Error('Fehler ' + res.status + ' beim Anmelden.');
      return res.json();
    }).then(function (data) {
      if (!data || !data.ok) throw new Error('Falsches Passwort.');
      // Root-Landing (index.html) nutzt localStorage – setzen, damit dort
      // kein zweiter Prompt erscheint.
      ${cfg.scope === 'app' ? `try { localStorage.setItem('${LEGACY_LS_KEY}', 'ok'); } catch (e) {}` : ''}
      // Neu laden: der ursprüngliche Deeplink wird jetzt mit Cookie bedient.
      window.location.reload();
    }).catch(function (e2) {
      btn.disabled = false; btn.textContent = 'Entsperren';
      showError(e2 && e2.message ? e2.message : 'Unbekannter Fehler.');
      pw.select();
    });
  });
})();
</script>
</body>
</html>`;
}
