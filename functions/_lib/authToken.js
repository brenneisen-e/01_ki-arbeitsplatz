// Gemeinsame Helfer für die serverseitige Zugriffssperre (siehe
// functions/_middleware.js und functions/api/auth.js).
//
// Der Cookie-Wert ist ein HMAC-SHA256 über eine feste Nachricht mit dem
// jeweiligen Passwort als Schlüssel. Dadurch kann die Middleware den
// erwarteten Cookie-Wert jederzeit allein aus dem Secret neu berechnen –
// ohne KV/Session-Storage. Ändert sich das Passwort in Cloudflare, werden
// alle bestehenden Cookies automatisch ungültig.
//
// Dateien/Ordner mit führendem Unterstrich werden von Cloudflare Pages NICHT
// als Route veröffentlicht – dieser Helfer ist daher nicht von außen aufrufbar.

// Cookie-Name je Scope. Die Middleware schützt die gesamte Plattform mit dem
// 'app'-Scope (Secret ACCESS_PASSWORD).
export function cookieNameForScope(scope) {
  if (scope === 'workshop') return 'kia_auth_workshop';
  if (scope === 'rbs') return RBS_AUTH_COOKIE;
  return 'kia_auth_app';
}

// Regionalbankenstudie 2026 (/24_regionalbankenstudie): eigenes Kennwort,
// damit der Link ohne das Plattform-Passwort weitergegeben werden kann.
// Im Code steht nur der SHA-256 des Kennworts (neu: printf '%s' 'neu' |
// sha256sum); ein Secret RBS_PASSWORD in Cloudflare hat Vorrang. Die Studie
// ist veroeffentlicht und enthaelt keine Mandantendaten – das Kennwort ist
// eine Schwelle, kein Datenschutz.
export const RBS_AUTH_COOKIE = 'kia_auth_rbs';
const RBS_KENNWORT_SHA256 = '3f98fec8c8655153d233b2946d6e67c078eb02fa7113863105b22ed22823841b';

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Prueft das eingegebene Kennwort der Studie.
export async function pruefeRbsKennwort(password, env) {
  if (typeof password !== 'string') return false;
  if (env && env.RBS_PASSWORD) return constantTimeEquals(password, env.RBS_PASSWORD);
  return constantTimeEquals(await sha256Hex(password), RBS_KENNWORT_SHA256);
}

// Erwarteter Cookie-Wert der Studie (aendert sich mit dem Kennwort).
export function rbsToken(env) {
  return deriveToken((env && env.RBS_PASSWORD) || RBS_KENNWORT_SHA256);
}

export const APP_AUTH_COOKIE = 'kia_auth_app';

const TOKEN_MESSAGE = 'kia-auth-v1';

function base64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Leitet den deterministischen Cookie-Token aus dem Passwort ab.
export async function deriveToken(secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(TOKEN_MESSAGE));
  return base64url(sig);
}

// Zeitkonstanter String-Vergleich gegen Timing-Angriffe.
export function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (!k) continue;
    out[k] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

// Cookie-Header-Wert für eine erfolgreiche Anmeldung. 30 Tage gültig,
// HttpOnly + Secure + SameSite=Lax, plattformweit (Path=/).
export function buildAuthCookie(name, token) {
  return `${name}=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
}
